import { theme } from "./theme";
import { ThemeProvider, CssBaseline, Button } from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";
import Create from "./pages/Create";
import Claim from "./pages/Claim";
import Home from "./pages/Home";
import Header from "./components/Header";
import "./utils/wallet";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <>
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="/app" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/claim" element={<Claim />} />
        </Routes>
      </>
    </ThemeProvider>
  );
}

export default App;
