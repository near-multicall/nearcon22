import { Box, Typography, Button, Card } from "@mui/material";
import { useWalletSelector } from "../../contexts/walletSelectorContext";

export default function NoData() {
  const { modal } = useWalletSelector();

  const handleSignIn = () => {
    modal.show();
  };

  return (
    <Box
      display="flex"
      // justifyItems={{ xs: 'flex-start', md: 'center' }}
      flexDirection="column"
      alignItems="center"
      width="100%"
      height="500px"
      // alignContent="flex-start"
      marginBottom="auto"
      padding="50px 50px 10px"
    >
      <Card sx={{ width: "100%", borderRadius: "12px", height: "500px" }}>
        <Box
          display="flex"
          flexDirection="column"
          gap="20px"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <Typography align="center" variant="inherit" sx={{ fontWeight: 700 }}>
            Please connect your wallet 🤨
          </Typography>
          <Button
            color="secondary"
            variant="outlined"
            onClick={() => handleSignIn()}
          >
            Connect Wallet
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
