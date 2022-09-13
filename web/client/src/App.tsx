import { theme } from "./theme";
import { ThemeProvider, CssBaseline} from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";
import Create from "./pages/Create";
import Claim from "./pages/Claim";
import Home from "./pages/Home";
import Header from "./components/Header";
import "./utils/wallet";
import { routes } from "./constants/routes";
import ClaimPage from "./pages/Claim/ClaimPage";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <>
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path={routes.app} element={<Home />} />
          <Route path={routes.create} element={<Create />} />
          <Route path={routes.claim}element={<Claim />} />
          <Route path={routes.airdropClaim} element={<ClaimPage />} />
        </Routes>
      </>
    </ThemeProvider>
  );
}

export default App;
