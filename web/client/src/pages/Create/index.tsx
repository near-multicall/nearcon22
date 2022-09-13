import { useTheme } from "@emotion/react";
import {
  Box,
  Button,
  Card,
  FormLabel,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { MouseEvent, useState } from "react";
import { Web3Storage } from "web3.storage";
import init, { parse_balance_map } from "drop-merkle";
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
  const jsons = files.map(async f => JSON.parse(await f.text()));
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

export default function Create() {
  const defaultValues = {
    token: "",
    list: 0,
    expiry: "",
  };
  const [formValues, setFormValues] = useState(defaultValues);
  const [file, setFile] = useState();
  const [array, setArray] = useState([{}]);
  const [loaded, setLoaded] = useState(false);
  const fileReader = new FileReader();

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

  const handleSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    console.log(formValues);
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
    console.log(makeFile(array));
    storeFiles(makeFile(array));
    console.log(array);
    console.log(array);
    setLoaded(true);
  };

  const headerKeys = ["Receivers", "Amount", "Memo"];

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
      padding="50px 50px 10px"
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
            Follow these simple steps to create a custom airdrop
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
                      <FormLabel>Token Address</FormLabel>
                      <TextField
                        id="token-input"
                        name="token"
                        type="string"
                        value={formValues.token}
                        onChange={handleInputChange}
                        size="small"
                        sx={{ marginBottom: "10px" }}
                      />
                      <FormLabel>Expiry Date</FormLabel>
                      <TextField
                        id="expiry-input"
                        name="expiry"
                        type="string"
                        value={formValues.expiry}
                        onChange={handleInputChange}
                        size="small"
                        sx={{ marginBottom: "50px" }}
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
                    </Box>
                  </Grid>
                  <Grid item xs={8}>
                    <Box
                      display="flex"
                      flexDirection="column"
                      width="100%"
                      height={loaded ? "100%" : "100%"}
                      justifyContent="center"
                      padding="20px"
                      sx={{
                        border: "3px solid",
                        borderColor: loaded ? "primary.main" : "secondary.main",
                        borderRadius: "12px",
                      }}
                    >
                      {loaded ? (
                        <table>
                          <thead>
                            <tr key={"header"}>
                              {headerKeys.map((key) => (
                                <th>{key}</th>
                              ))}
                            </tr>
                          </thead>

                          <tbody>
                            {array.map((item, idx) => (
                              <tr key={idx}>
                                {Object.values(item).map((val) => (
                                  <td>{val as string}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <a
                          href={"/template.csv"}
                          download="template.csv"
                          style={{ textDecoration: "none" }}
                        >
                          <Button variant="text" sx={{ textTransform: "none" }}>
                            Download .csv template
                          </Button>
                        </a>
                      )}
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
                    color="primary"
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
