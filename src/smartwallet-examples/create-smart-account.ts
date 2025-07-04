import "dotenv/config";
import { createGelatoSmartWalletClient } from "@gelatonetwork/smartwallet";
import { http, type Hex, createWalletClient, createPublicClient } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { gelato, kernel, safe } from "@gelatonetwork/smartwallet/accounts";
import { baseSepolia } from "viem/chains";


const privateKey = (process.env.PRIVATE_KEY ?? generatePrivateKey()) as Hex;
const owner = privateKeyToAccount(privateKey);

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

export async function createSmartAccount(
  smartAccountType: "gelato" | "kernel" | "custom" | "safe",
  eip7702: boolean = false
) {
  let account;
  if (smartAccountType === "gelato") {
    account = await gelato({
      owner,
      client: publicClient,
    });
  } else if (smartAccountType === "kernel") {
    account = await kernel({
      owner,
      client: publicClient,
      eip7702,
    });
  } else if (smartAccountType === "safe") {
    account = await safe({
      client: publicClient,
      owners: [owner],
      version: "1.4.1",
    });
  }

  const client = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(),
  });

  const swc = await createGelatoSmartWalletClient(client);

  return { swc, account };
}
