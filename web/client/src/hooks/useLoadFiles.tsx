import { useClient } from "./useClient";
import { useGetCid } from "./useGetCid";

export async function useLoadFiles(id: string | undefined) {
  const client = useClient();
  const cid = useGetCid(id);

  const res = await client.get(await cid); // Web3Response
  if (res == null) console.error("something went wrong while fetching data");
  const files = await res!.files(); // Web3File[]
  const jsons = await Promise.all(
    files.map(async (f) => JSON.parse(await f.text()))
  );
  return jsons;
}
