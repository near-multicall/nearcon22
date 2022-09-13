import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material";
import { useWalletSelector } from "../../contexts/walletSelectorContext";
import { useContext } from "react";

export default function Header() {
  const theme = useTheme();

  const { selector, modal, accountId } = useWalletSelector();

  const handleSignIn = () => {
    modal.show();
  };

  const handleSignOut = async () => {
    const wallet = await selector.wallet();

    wallet.signOut().catch((err) => {
      console.log("Failed to sign out");
      console.error(err);
    });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar color="primary" position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          ></IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Drop
          </Typography>
          {!selector.isSignedIn() ? (
            <Button
              color="secondary"
              variant="outlined"
              onClick={() => handleSignIn()}
            >
              Connect Wallet
            </Button>
          ) : (
            <Button
              variant="text"
              color="secondary"
              style={{ textTransform: "none" }}
              onClick={() => handleSignOut()}
            >
              {accountId}
            </Button>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
