import {
  Box,
  Button,
  Card,
  FormLabel,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../constants/routes";

export default function Claim() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({ airdropId: "" });

  const handleInputChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSubmit = useCallback(
    (id: string) => (event: { preventDefault: () => void }) => {
      event.preventDefault();
      navigate(routes.airdropClaim.replace(":id", id + ""));
    },
    [navigate]
  );

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
            Claim your Airdrop!
          </Typography>
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: "500",
              opacity: "0.75",
              paddingBottom: "20px",
            }}
          >
            Just a few steps
          </Typography>
          <form style={{width: "100%"}} onSubmit={handleSubmit(formValues.airdropId)}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="start"
              width="100%"
              gap="10px"
            >
              <TextField
                id="id"
                name="airdropId"
                type="string"
                label="Airdrop ID"
                value={formValues.airdropId}
                onChange={handleInputChange}
                size="small"
                sx={{ marginBottom: "50px" }}
              />
            </Box>
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
                Check Eligibility
              </Button>
            </Box>
          </form>
        </Box>
      </Card>
    </Box>
  );
}
