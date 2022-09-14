// chluff goes here
import { view } from "../../src/utils/wallet";

const FACTORY_ADDRESS_SELECTOR: Record<string, string> = {
    mainnet: "TODO",
    testnet: "dev-1663082207724-65204983285265",
};

class NoCapDrop {
    static CONTRACT_ADDRESS: string = FACTORY_ADDRESS_SELECTOR[window.NEAR_ENV];


    static async getNumberAirdrops(): Promise<number> {
        return view(
            NoCapDrop.CONTRACT_ADDRESS,
            "get_number_airdrops",
            {}
        );
    }

    static async getAirdropInfo(airdropId: number): Promise<AirdropInfo> {
        return view(
            NoCapDrop.CONTRACT_ADDRESS,
            "get_airdrop_info",
            { airdrop_id: airdropId }
        ); 
    }



    static async getBalance(AccountId: string): Promise<[]>


}


type AirdropInfo = {
    description: string,
    creator: string,
    token_id: string,
    ipfs_cid: string,
    root_hash: string,
    expiry_date: number,
    claimed_users: HashSet<AccountId>,
    amount: string // u128 encoded as string
}

export { NoCapDrop };
