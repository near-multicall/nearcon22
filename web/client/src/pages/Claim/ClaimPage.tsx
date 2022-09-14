import { Box, Button, Card, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NoData from "../../components/NoData";
import { AIRDROP_CONTRACT_ADDRESS } from "../../constants/addresses";
import { useWalletSelector } from "../../contexts/walletSelectorContext";
import { useLoadFiles } from "../../hooks/useLoadFiles";
import { tx } from "../../utils/wallet";

export default function ClaimPage() {
  const { id } = useParams<{ id: string }>();
  const { accountId } = useWalletSelector();
  const [valid, setValid] = useState<boolean>();
  const navigate = useNavigate();

  const file = useLoadFiles(id);

  const checkEligibility = async (accountId: string | null) =>
    (await file)[0].claims[accountId!] !== undefined;

  checkEligibility(accountId).then((res) => setValid(res));

  const onClaim = async (file: Promise<{ claims: any }[]>) => {
    const { amount, memo, proof } = (await file)[0].claims[accountId!];
    console.log(amount, memo, proof);

    tx(
      AIRDROP_CONTRACT_ADDRESS,
      "claim",
      {
        airdrop_id: parseInt(id!),
        amt: amount,
        memo: memo,
        proof: proof,
      },
      "300000000000000",
      "1"
    );

    // claim(id, amt, memo, proof);
  };

  if (!accountId) return <NoData />;

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
          <Typography
            sx={{ fontSize: "24px", fontWeight: "700", paddingBottom: "20px" }}
          >
            Claiming Airdrop #{id}
          </Typography>
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: "500",
              opacity: "0.75",
              paddingBottom: "50px",
            }}
          >
            {accountId} is{" "}
            {valid ? "" : <span style={{ fontWeight: 700 }}> not </span>}
            eligible for the airdrop {valid ? "🎉" : "😭"}
          </Typography>
          {valid ? (
            <Button
              variant="contained"
              sx={{ textTransform: "none", width: 1 }}
              onClick={() => onClaim(file)}
            >
              Claim
            </Button>
          ) : (
            <Button
              variant="contained"
              sx={{ textTransform: "none", width: 1 }}
              onClick={() => {
                navigate("/claim");
              }}
            >
              Go back
            </Button>
          )}
        </Box>
      </Card>
    </Box>
  );
}
