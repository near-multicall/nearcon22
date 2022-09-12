import { useTheme } from "@emotion/react";
import { Button } from "@mui/material";

export default function Create() {
  const theme = useTheme();
  return (
    <Button color="primary" variant="contained">
      Create
    </Button>
  );
}
