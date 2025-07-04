import dotenv from "dotenv";
import {
  type GelatoSmartWalletClient,
  native,
  sponsored,
  erc20,
} from "@gelatonetwork/smartwallet";
import { Chain, Transport, Call } from "viem";
import { GelatoSmartAccount } from "@gelatonetwork/smartwallet/accounts";

dotenv.config();
// Sponsor API Key for configured chain
const sponsorApiKey = process.env.NEXT_PUBLIC_GELATO_API_KEY;
if (!sponsorApiKey) {
  throw new Error("SPONSOR_API_KEY is not set");
}

export async function estimateGas(
  swc: GelatoSmartWalletClient<Transport, Chain, GelatoSmartAccount>,
  method: string,
  tokenAddress?: `0x${string}`,
  calls?: Call[]
) {
  let gasResults;
  if (method === "native") {
    gasResults = await swc.estimate({
      payment: native(),
      calls: calls ?? [],
    });
  } else if (method === "erc20") {
    gasResults = await swc.estimate({
      payment: erc20(tokenAddress as `0x${string}`),
      calls: calls ?? [],
    });
  } else if (method === "sponsored") {
    gasResults = await swc.estimate({
      payment: sponsored(sponsorApiKey as string),
      calls: calls ?? [],
    });
  }

  return gasResults;
}
