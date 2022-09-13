import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "./theme";
import { WalletSelectorContextProvider } from "./contexts/walletSelectorContext";
import "@near-wallet-selector/modal-ui/styles.css";
import * as buffer from "buffer";

// issue of near-api-js
// https://github.com/near/near-api-js/issues/757
(window as any).Buffer = buffer.Buffer;


ReactDOM.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <WalletSelectorContextProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </WalletSelectorContextProvider>
  </ThemeProvider>,
  document.querySelector("#root")
);
