import { Box, Card, Grid, Typography, TextField, Button } from "@mui/material";
import { useState } from "react";
import { tx } from "../../utils/wallet";

export default function Deposit() {

  const defaultValues = {
    token: "",
    amount: ""
  };
  const [formValues, setFormValues] = useState(defaultValues);

  const handleSubmit = () => {
    tx(
      formValues.token,
      "ft_transfer_call",
      {
        receiver_id: AIRDROP_CONTRACT_ADDRESS,
        amount: formValues.amount,
        msg: ""
      },
      "300000000000000", // 300 Tgas
      "1"
    )
  };

  const handleInputChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

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
            Deposit funds on the Airdrop contract!
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
                        onChange={handleInputChange}
                        size="small"
                        sx={{ marginBottom: "10px" }}
                      />
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
                    Deposit
                  </Button>
                </Box>
              </Box>
            </form>
          </Box>
        </Box>
      </Card>
    </Box>
  )
}
