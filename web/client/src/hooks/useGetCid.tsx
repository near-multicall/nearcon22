import { AIRDROP_CONTRACT_ADDRESS } from "../constants/addresses";
import { view } from "../utils/wallet";

export async function useGetCid(id: string | undefined) {
  const airdropInfo = await view(AIRDROP_CONTRACT_ADDRESS, "get_airdrop_info", {
    airdrop_id: id,
  });
  return airdropInfo.ipfs_cid;
}
