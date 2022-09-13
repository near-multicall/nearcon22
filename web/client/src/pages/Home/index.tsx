import { useTheme } from "@emotion/react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  Grid,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import Create from "../Create";

export default function Home() {
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
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Link to={"/create"} style={{ textDecoration: "none" }}>
            <Card sx={{ width: "100%", height: "100%", borderRadius: "12px", padding: "8px" }}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Typography sx={{ fontSize: "24px", fontWeight: "700" }}>
                  Create your own Airdrop
                </Typography>
              </Box>
            </Card>
          </Link>
        </Grid>
        <Grid item xs={6}>
          <Link to={"/claim"} style={{ textDecoration: "none" }}>
            <Card sx={{ width: "100%", height: "300px", borderRadius: "12px", padding: "8px" }}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Typography sx={{ fontSize: "24px", fontWeight: "700" }}>
                  Claim an Airdrop
                </Typography>
              </Box>
            </Card>
          </Link>
        </Grid>
      </Grid>
    </Box>
  );
}
