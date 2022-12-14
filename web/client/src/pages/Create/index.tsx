import {
  Box,
  Button,
  Card,
  FormLabel,
  Grid,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { MouseEvent, useState } from "react";
import { Web3Storage } from "web3.storage";
import init, { parse_balance_map } from "drop-merkle";
import { silentTx, tx, view } from "../../utils/wallet";
import { AIRDROP_CONTRACT_ADDRESS } from "../../constants/addresses";
import { useWalletSelector } from "../../contexts/walletSelectorContext";
import NoData from "../../components/NoData";
import { API_URL } from "../../constants/urls";

/* const rust = import("../../pkg/drop_merkle");

rust
  .then((m) => {
    window.parse_balance_map = m.parse_balance_map;
    console.log("our function was loaded successfully");
  })
  .catch(console.error); */

function getAccessToken() {
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDNiOGEyMEY0QTEzMTUyQ2IyNDBFY0ZBY2ZGMUI0NjBhMkYzNkE3MDAiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjMwNzI1OTM1NDUsIm5hbWUiOiJub19jYXBfZHJvcCJ9.VQZq11WZb4Ck6ieEyQbXODWY_Xj-TJ4S53nK2k-ilo4";
}

function makeStorageClient() {
  return new Web3Storage({ token: getAccessToken() });
}

const client = makeStorageClient();

const balanceMap = (array: object[]) => {
  const file = window.parse_balance_map(array);
  console.log(file);
  return file;
};

async function loadFiles(cid: string): Promise<object[]> {
  const res = await client.get(cid); // Web3Response
  if (res == null) console.error("something went wrong while fetching data");
  const files = await res!.files(); // Web3File[]
  const jsons = files.map(async (f) => JSON.parse(await f.text()));
  return jsons;
}

async function storeFiles(files: File[]) {
  const cid = await client.put(files);
  console.log("stored files with cid:", cid);
  return cid;
}

function makeFile(array: object[]) {
  const blob = new Blob([JSON.stringify(balanceMap(array))], {
    type: "application/json",
  });

  const files = [new File([blob], "merkle.json")];
  return files;
}

window.debug = { loadFiles, storeFiles, makeFile };

// Example POST method implementation:
async function postData(url = '', data = {}) {
  console.log("data: " + JSON.stringify(data));
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  console.log(response);
  return response.text(); // parses JSON response into native JavaScript objects
}

export default function Create() {
  const defaultValues = {
    token: "",
    amount: "",
    expiry: "",
    description: "",
  };
  const theme = useTheme();
  const [formValues, setFormValues] = useState(defaultValues);
  const [file, setFile] = useState();
  const [array, setArray] = useState([{}]);
  const [loaded, setLoaded] = useState(false);
  const [tokenBalance, setTokenBalance] = useState("...");
  const fileReader = new FileReader();
  const { accountId } = useWalletSelector();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  init().then((res) => {
    window.parse_balance_map = parse_balance_map;
  });

  const handleInputChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const cid = await storeFiles(makeFile(array));
    postData(API_URL, {data: array})
    .then((data: string) => 
      silentTx(
        accountId!,
        AIRDROP_CONTRACT_ADDRESS,
        "create_new_airdrop",
        {
          token_id: formValues.token,
          ipfs_cid: cid,
          expiry_date: 0,
          description: formValues.description,
          receipt_str: data
        },
        "300000000000000", // 300 Tgas
        "0"
      )
    );
  };

  const handleFileChange = (e: any) => {
    setFile(e.target.files[0]);
  };

  const handleFileSubmit = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (file) {
      fileReader.onload = function (event) {
        const text = event.target?.result;
        csvFileToArray(text as string);
      };

      fileReader.readAsText(file);
    }
  };

  const csvFileToArray = (string: string) => {
    const csvRows = string.slice(string.indexOf("\n") + 1).split("\n");

    const array: object[] = csvRows.map((i) => {
      const values = i.split(",");
      return {
        addr: values[0],
        amt: values[1],
        memo: values[2],
      };
    });

    setArray(array);
    setLoaded(true);
  };

  async function getTokenBalance(
    tokenId: string,
    accountId: string | undefined | null
  ) {
    const tokenBalance = await view(AIRDROP_CONTRACT_ADDRESS, "get_balance", {
      account_id: accountId,
    });
    return Object.fromEntries(tokenBalance);
  }

  const headerKeys = ["Receivers", "Amount", "Memo"];

  if (!accountId) return <NoData />;

  return (
    <Box
      display="flex"
      // justifyItems={{ xs: 'flex-start', md: 'center' }}
      flexDirection="column"
      alignItems="center"
      width="100%"
      // alignContent="flex-start"
      marginBottom="auto"
      gap={{ xs: 36, md: 48 }}
      padding="50px"
    >
      <Card sx={{ width: "100%", borderRadius: "12px" }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="start"
          width="100%"
          padding="20px"
        >
          <Typography
            sx={{ fontSize: "24px", fontWeight: "700", paddingBottom: "20px" }}
          >
            Create your own Airdrop!
          </Typography>
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: "500",
              opacity: "0.75",
              marginBottom: "30px",
            }}
          >
            Fill this simple form to create a custom airdrop
          </Typography>
          <Box width="100%">
            <form onSubmit={handleSubmit}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="start"
                width="100%"
                gap="10px"
              >
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box display="flex" flexDirection="column" width="100%">
                      <TextField
                        label="Token Address"
                        id="token-input"
                        name="token"
                        type="string"
                        value={formValues.token}
                        onChange={(e) => {
                          handleInputChange(e);
                          getTokenBalance(e.target.value, accountId).then(
                            (res) => {
                              console.log(res);
                              setTokenBalance(res[e.target.value]);
                            }
                          );
                        }}
                        size="small"
                        sx={{ marginBottom: "10px" }}
                      />
                      <Typography>Current balances:</Typography>
                      <Typography
                        sx={{ paddingBottom: "10px", opacity: "0.75" }}
                      >
                        {formValues.token}: {tokenBalance ?? 0}
                      </Typography>
                      <TextField
                        label="Token Amount"
                        id="token-amount"
                        name="amount"
                        type="string"
                        value={formValues.amount}
                        onChange={handleInputChange}
                        size="small"
                        sx={{ marginBottom: "10px" }}
                      />
                      <TextField
                        label="Expiry Date"
                        id="expiry-input"
                        name="expiry"
                        type="string"
                        value={formValues.expiry}
                        onChange={handleInputChange}
                        size="small"
                        sx={{ marginBottom: "10px" }}
                      />
                      <TextField
                        label="Description"
                        id="description-input"
                        name="description"
                        type="string"
                        value={formValues.description}
                        onChange={handleInputChange}
                        sx={{ marginBottom: "50px" }}
                        multiline
                        rows={3}
                      />
                      <input
                        type={"file"}
                        accept={".csv"}
                        id={"csvFileInput"}
                        onChange={handleFileChange}
                        style={{ marginBottom: "10px" }}
                      />

                      <Button
                        onClick={(e) => {
                          handleFileSubmit(e);
                        }}
                        variant="outlined"
                        style={{ textTransform: "none" }}
                      >
                        Import .csv
                      </Button>
                      <Typography sx={{ fontSize: "12px" }}>
                        No CSV yet? Get an emtpy template here:{" "}
                        <a
                          href={"/template.csv"}
                          download="template.csv"
                          style={{ textDecoration: "none" }}
                        >
                          Download .csv template
                        </a>
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={8}>
                    <Box
                      display="flex"
                      flexDirection="column"
                      width="100%"
                      height={loaded ? "100%" : "100%"}
                      justifyContent="flex-start"
                      padding="18px"
                      sx={{
                        border: "3px solid",
                        borderColor: loaded ? "primary.main" : "secondary.main",
                        borderRadius: "12px",
                      }}
                    >
                      {loaded ? (
                        <>
                          <TableContainer
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              flexDirection: "column",
                              height: 1,
                            }}
                          >
                            <Table
                              stickyHeader
                              sx={{ minWidth: 650 }}
                              size="small"
                            >
                              <TableHead>
                                <TableRow key={"header"}>
                                  {headerKeys.map((key) => (
                                    <TableCell
                                      sx={{
                                        fontWeight: "bold",
                                        padding: "3px",
                                        backgroundColor:
                                          theme.palette.background.paper,
                                      }}
                                      padding="none"
                                    >
                                      {key}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {array
                                  .slice(
                                    page * rowsPerPage,
                                    page * rowsPerPage + rowsPerPage
                                  )
                                  .map((item, idx) => (
                                    <TableRow
                                      key={idx}
                                      sx={{
                                        "&:last-child td, &:last-child th": {
                                          border: 0,
                                        },
                                      }}
                                    >
                                      {Object.values(item).map((val) => (
                                        <TableCell
                                          sx={{ paddingLeft: "3px" }}
                                          padding="none"
                                        >
                                          {val as string}
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                            <TablePagination
                              rowsPerPageOptions={[10, 25, 100]}
                              component="div"
                              count={array.length}
                              rowsPerPage={rowsPerPage}
                              page={page}
                              onPageChange={handleChangePage}
                              onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                          </TableContainer>
                        </>
                      ) : null}
                    </Box>
                  </Grid>
                </Grid>
                <Box
                  sx={{ width: 1 }}
                  display="flex"
                  justifyContent="flex-end"
                  alignItems="flex-end"
                >
                  <Button
                    variant="contained"
                    color="secondary"
                    type="submit"
                    style={{ textTransform: "none" }}
                  >
                    Submit
                  </Button>
                </Box>
              </Box>
            </form>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
