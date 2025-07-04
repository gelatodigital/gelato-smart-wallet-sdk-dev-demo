import dotenv from "dotenv";
import {
  erc20,
  type GelatoSmartWalletClient,
} from "@gelatonetwork/smartwallet";
import { zeroAddress, Chain, Transport } from "viem";
import { GelatoSmartAccount } from "@gelatonetwork/smartwallet/accounts";

dotenv.config();

export async function erc20GasTxn(
  swc: GelatoSmartWalletClient<Transport, Chain, GelatoSmartAccount>, tokenAddress: `0x${string}`
) {
  console.log("Preparing transaction...");
  const preparedCalls = await swc.prepare({
    payment: erc20(tokenAddress),
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
