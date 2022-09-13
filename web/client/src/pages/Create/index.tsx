import { useTheme } from "@emotion/react";
import {
  Box,
  Button,
  Card,
  FormControl,
  FormLabel,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { MouseEvent, SetStateAction, useState } from "react";

export default function Create() {
  const theme = useTheme();

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
    const csvHeader = string.slice(0, string.indexOf("\n")).split(",");
    const csvRows = string.slice(string.indexOf("\n") + 1).split("\n");

    const array: {}[] = csvRows.map((i) => {
      const values = i.split(",");
      const obj = csvHeader.reduce((object, header, index) => {
        (object as any)[header] = values[index];
        return object;
      }, {});
      return obj;
    });

    setArray(array);
    setLoaded(true);
  };

  const headerKeys = Object.keys(Object.assign({}, ...array));

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
