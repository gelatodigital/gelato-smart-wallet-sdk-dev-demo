"use client";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
const queryClient = new QueryClient();
import {
  GelatoSmartWalletContextProvider,
  dynamic,
  wagmi,
} from "@gelatonetwork/smartwallet-react-sdk";
import { baseSepolia } from "viem/chains";
import { http } from "wagmi";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GelatoSmartWalletContextProvider
      settings={{
        scw: {
          type: "gelato",
        },
        apiKey: process.env.NEXT_PUBLIC_GELATO_API_KEY as string,
        waas: dynamic(process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID as string),
        wagmi: wagmi({
          chains: [baseSepolia],
          transports: {
            [baseSepolia.id]: http(),
          },
        }),
      }}
    >
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </GelatoSmartWalletContextProvider>
  );
}
