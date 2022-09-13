import { Box, Button, Card, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { useWalletSelector } from "../../contexts/walletSelectorContext";
import { useLoadFiles } from "../../hooks/useLoadFiles";


export default function ClaimPage() {
  const { id } = useParams<{ id: string }>();
  const { accountId } = useWalletSelector();

  const file = useLoadFiles(id);

  const checkEligibility = (accountId: string | null) => {
    if (accountId! in file) {
      return true;
    } else {
      return false;
    }
  };

  const valid = checkEligibility(accountId);

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
            Claiming Airdrop #{id}
          </Typography>
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: "500",
              opacity: "0.75",
              paddingBottom: "50px",
            }}
          >
            {accountId} is {valid ? "" : "not"} eligible for the airdrop
          </Typography>
          <Button variant="contained" sx={{ textTransform: "none", width: 1 }}>
            Claim
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
