import dotenv from "dotenv";
import { type GelatoSmartWalletClient, sponsored } from "@gelatonetwork/smartwallet";
import { zeroAddress, Chain, Transport } from "viem";
import { GelatoSmartAccount } from "@gelatonetwork/smartwallet/accounts";

dotenv.config();


export async function sponsoredTxn(
  swc: GelatoSmartWalletClient<Transport, Chain, GelatoSmartAccount>
) {
  const sponsorApiKey = process.env.NEXT_PUBLIC_GELATO_API_KEY;
  if (!sponsorApiKey) {
    throw new Error("SPONSOR_API_KEY is not set");
  }

  console.log("Preparing transaction...");
  const preparedCalls = await swc.prepare({
    payment: sponsored(sponsorApiKey as string),
    calls: [
      {
        to: zeroAddress,
        data: "0x",
        value: BigInt(0),
      },
    ],
  });

  const response = await swc.send({
    preparedCalls,
  });

  console.log(`Your Gelato id is: ${response.id}`);
  console.log(
    `Check the status of your request here: https://api.gelato.digital/tasks/status/${response.id}`
  );

  const txHash = await response.wait();

  return { userOpHash: response.id, txHash };
}
