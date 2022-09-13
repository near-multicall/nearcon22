import { AIRDROP_CONTRACT_ADDRESS } from "../constants/addresses";
import { view } from "../utils/wallet";

export async function useTokenBalance(
  tokenId: string,
  accountId: string | undefined | null
) {
  const tokenBalance = await view(AIRDROP_CONTRACT_ADDRESS, "get_balance", {
    account_id: accountId,
  });
  return Object.fromEntries(tokenBalance);
}
