import { useTheme } from "@emotion/react";
import { Button } from "@mui/material";

export default function Claim() {
  const theme = useTheme();
  return (
    <Button color="primary" variant="contained">
      Claim
    </Button>
  );
}
