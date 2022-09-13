import { useTheme } from "@emotion/react";
import { Box, Button, Card, Typography } from "@mui/material";

export default function Claim() {
  const theme = useTheme();
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
          <Typography sx={{ fontSize: "24px", fontWeight: "700", paddingBottom: "20px" }}>
            Claim your Airdrop!
          </Typography>
          <Typography
            sx={{ fontSize: "16px", fontWeight: "500", opacity: "0.75" }}
          >
            Give us the Airdrop ID
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}
