import { createTheme } from "@mui/material/styles";
import "../main.css";

export const theme = createTheme({
  typography: {
    fontFamily: `'Inter', sans-serif`,
  },
  palette: {
    mode: "light",
    primary: {
      main: "#323a3c",
    },
    secondary: {
      main: "#d8beda",
    },
    background: {
      default: "#ffdf82",
    },
    info: {
      main: "#ffdf82",
    },
    success: {
      main: "#93c99e"
    },
    divider: "rgba(0,0,0,0.1)",
  },
  

});

