"use client";

import { useState, useEffect } from "react";
import {
  Copy,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Send,
  Coins,
  DollarSign,
  Wallet,
} from "lucide-react";
import { createSmartAccount } from "../smartwallet-examples/create-smart-account";
import { sponsoredTxn } from "@/smartwallet-examples/sponsored-txn";
import { erc20GasTxn } from "@/smartwallet-examples/erc20-gas-txn";
import { nativeGasTxn } from "@/smartwallet-examples/native-gas-txn";
import { estimateGas } from "@/smartwallet-examples/estimate-gas";
import {
  createPublicClient,
  http,
  formatEther,
  formatUnits,
  Transport,
  Chain,
} from "viem";
import { baseSepolia } from "viem/chains";
import Image from "next/image";
import { GelatoSmartWalletClient } from "@gelatonetwork/smartwallet";
import { GelatoSmartAccount } from "@gelatonetwork/smartwallet/accounts";
import {
  useGelatoSmartWalletProviderContext,
  GelatoSmartWalletConnectButton,
} from "@gelatonetwork/smartwallet-react-sdk";

type SmartAccountType = "gelato" | "kernel" | "safe";

const gelatoCode = `import { createGelatoSmartWalletClient } from "@gelatonetwork/smartwallet";
import { http, type Hex, createWalletClient, createPublicClient } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { gelato } from "@gelatonetwork/smartwallet/accounts";
import { baseSepolia } from "viem/chains";

const privateKey = (process.env.PRIVATE_KEY ?? generatePrivateKey()) as Hex;
const owner = privateKeyToAccount(privateKey);

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

const account = await gelato({
  owner,
  client: publicClient,
});

const client = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http(),
});

const smartWalletClient = await createGelatoSmartWalletClient(client);
`;

const kernelCode = (
  eip7702: boolean = false
) => `import { createGelatoSmartWalletClient } from "@gelatonetwork/smartwallet";
import { http, type Hex, createWalletClient, createPublicClient } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { kernel } from "@gelatonetwork/smartwallet/accounts";
import { baseSepolia } from "viem/chains";

const privateKey = (process.env.PRIVATE_KEY ?? generatePrivateKey()) as Hex;
const owner = privateKeyToAccount(privateKey);

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

const account = await kernel({
  owner,
  client: publicClient,
  eip7702: ${eip7702},
});

const client = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http(),
});

const smartWalletClient = await createGelatoSmartWalletClient(client);
`;

const safeCode = `import { createGelatoSmartWalletClient } from "@gelatonetwork/smartwallet";
import { http, type Hex, createWalletClient, createPublicClient } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { safe } from "@gelatonetwork/smartwallet/accounts";
import { baseSepolia } from "viem/chains";

const privateKey = (process.env.PRIVATE_KEY ?? generatePrivateKey()) as Hex;
const owner = privateKeyToAccount(privateKey);

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

const account = await safe({
  client: publicClient,
  owners: [owner],
  version: "1.4.1",
});

const client = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http(),
});

const smartWalletClient = await createGelatoSmartWalletClient(client);
`;

const sponsoredTxnCode = `import { type GelatoSmartWalletClient, sponsored } from "@gelatonetwork/smartwallet";

export async function sponsoredTxn(
  smartWalletClient: GelatoSmartWalletClient
) {
  console.log("Executing transaction...");

  const response = await smartWalletClient.execute({
    payment: sponsored(sponsorApiKey),
    calls: [
      {
        to: zeroAddress,
        data: "0x",
        value: BigInt(0),
      },
    ],
  });

  console.log(\`Your Gelato id is: \${response.id}\`);
  console.log(
    \`Check the status of your request here: https://api.gelato.digital/tasks/status/\${response.id}\`
  );

  const txHash = await response.wait();
  return { userOpHash: response.id, txHash };
}`;

const erc20GasTxnCode = `import { type GelatoSmartWalletClient, erc20 } from "@gelatonetwork/smartwallet";

export async function erc20GasTxn(
  smartWalletClient: GelatoSmartWalletClient,
  tokenAddress: \`0x\${string}\`
) {
  console.log("Executing transaction...");

  const response = await smartWalletClient.execute({
    payment: erc20(tokenAddress),
    calls: [
      {
        to: zeroAddress,
        data: "0x",
        value: BigInt(0),
      },
    ],
  });

  console.log(\`Your Gelato id is: \${response.id}\`);
  console.log(
    \`Check the status of your request here: https://api.gelato.digital/tasks/status/\${response.id}\`
  );

  const txHash = await response.wait();
  return { userOpHash: response.id, txHash };
}`;

const nativeGasTxnCode = `import { type GelatoSmartWalletClient, native } from "@gelatonetwork/smartwallet";

export async function nativeGasTxn(
  smartWalletClient: GelatoSmartWalletClient
) {
  console.log("Executing transaction...");

  const response = await smartWalletClient.execute({
    payment: native(),
    calls: [
      {
        to: zeroAddress,
        data: "0x",
        value: BigInt(0),
      },
    ],
  });

  console.log(\`Your Gelato id is: \${response.id}\`);
  console.log(
    \`Check the status of your request here: https://api.gelato.digital/tasks/status/\${response.id}\`
  );

  const txHash = await response.wait();
  return { userOpHash: response.id, txHash };
}`;

const estimateGasCode = `import { type GelatoSmartWalletClient, native, sponsored, erc20 } from "@gelatonetwork/smartwallet";
import { type Call } from "viem";

export async function estimateGas(
  smartWalletClient: GelatoSmartWalletClient,
  method: string,
  tokenAddress?: \`0x\${string}\`,
  calls?: Call[]
) {
  
    const gasResults = await smartWalletClient.estimate({
      payment: method === "native" ? native() : method === "erc20" ? erc20(tokenAddress) : sponsored(sponsorApiKey),
      calls: calls ?? [],
    });

  return gasResults;
}`;

const reactSdkCode = `import { GelatoSmartWalletProvider } from "@gelatonetwork/smartwallet-react-sdk";
import { baseSepolia } from "viem/chains";

export function App() {
  return (
    <GelatoSmartWalletContextProvider
      settings={{
        scw: {
          type: "gelato", // or "kernel" or "safe"
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
    <QueryClientProvider client={queryClient}>
      <YourComponent />
    </QueryClientProvider>
    </GelatoSmartWalletContextProvider>
  );
}`;

const reactSdkUsageCode = `import { useGelatoSmartWalletProviderContext } from "@gelatonetwork/smartwallet-react-sdk";

export function YourComponent() {
  const { gelato: { client }, logout } = useGelatoSmartWalletProviderContext();
  
  // Access the smart wallet client
  const smartWalletClient = client;
  
  // Access the account address
  const accountAddress = client?.account?.address;
  
  return (
    <div>
      <p>Account: {accountAddress}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}`;

export default function Home() {
  interface Quote {
    fee: {
      amount: string;
      rate: number;
      decimals: number;
    };
    gas: {
      amount: string;
      l1: string;
    };
  }

  const {
    gelato: { client },
    logout,
  } = useGelatoSmartWalletProviderContext();

  const [selectedAccountType, setSelectedAccountType] = useState<SmartAccountType>("gelato");
  const [selectedPackageManager, setSelectedPackageManager] =
    useState<string>("npm");
  const [eip7702Enabled, setEip7702Enabled] = useState<boolean>(false);
  const [selectedCodeTab, setSelectedCodeTab] = useState<"core" | "react">("core");

  // Main tab selection (Home vs Wallet Provider) - REMOVED

  // Separate account states for each type
  const [gelatoAccount, setGelatoAccount] = useState<{
    address: string;
    swc: GelatoSmartWalletClient<Transport, Chain, GelatoSmartAccount>;
    userOpHash?: string;
    txHash?: string;
  } | null>(null);
  const [kernelAccount, setKernelAccount] = useState<{
    address: string;
    swc: GelatoSmartWalletClient<Transport, Chain, GelatoSmartAccount>;
    userOpHash?: string;
    txHash?: string;
  } | null>(null);
  const [safeAccount, setSafeAccount] = useState<{
    address: string;
    swc: GelatoSmartWalletClient<Transport, Chain, GelatoSmartAccount>;
    userOpHash?: string;
    txHash?: string;
  } | null>(null);

  // Current account based on selected account type
  const currentAccount =
    selectedAccountType === "gelato"
      ? gelatoAccount
      : selectedAccountType === "kernel"
      ? kernelAccount
      : selectedAccountType === "safe"
      ? safeAccount
      : null;

  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>("");
  const [codeCopied, setCodeCopied] = useState(false);

  // Separate transaction states for each account type
  const [gelatoTxnLoading, setGelatoTxnLoading] = useState(false);
  const [gelatoTxnResult, setGelatoTxnResult] = useState<{
    userOpHash: string;
    txHash: string;
  } | null>(null);
  const [gelatoTxnError, setGelatoTxnError] = useState<string>("");

  const [kernelTxnLoading, setKernelTxnLoading] = useState(false);
  const [kernelTxnResult, setKernelTxnResult] = useState<{
    userOpHash: string;
    txHash: string;
  } | null>(null);
  const [kernelTxnError, setKernelTxnError] = useState<string>("");

  const [safeTxnLoading, setSafeTxnLoading] = useState(false);
  const [safeTxnResult, setSafeTxnResult] = useState<{
    userOpHash: string;
    txHash: string;
  } | null>(null);
  const [safeTxnError, setSafeTxnError] = useState<string>("");

  const [txnCodeCopied, setTxnCodeCopied] = useState(false);

  // Current transaction states based on selected account type
  const currentTxnLoading =
    selectedAccountType === "gelato"
      ? gelatoTxnLoading
      : selectedAccountType === "kernel"
      ? kernelTxnLoading
      : selectedAccountType === "safe"
      ? safeTxnLoading
      : false;

  const currentTxnResult =
    selectedAccountType === "gelato"
      ? gelatoTxnResult
      : selectedAccountType === "kernel"
      ? kernelTxnResult
      : selectedAccountType === "safe"
      ? safeTxnResult
      : null;

  const currentTxnError =
    selectedAccountType === "gelato"
      ? gelatoTxnError
      : selectedAccountType === "kernel"
      ? kernelTxnError
      : selectedAccountType === "safe"
      ? safeTxnError
      : "";

  // ERC20 transaction states
  const [erc20TxnLoading, setErc20TxnLoading] = useState(false);
  const [erc20TxnResult, setErc20TxnResult] = useState<{
    userOpHash: string;
    txHash: string;
  } | null>(null);
  const [erc20TxnError, setErc20TxnError] = useState<string>("");
  const [erc20TxnCodeCopied, setErc20TxnCodeCopied] = useState(false);
  const [selectedToken, setSelectedToken] = useState<string>("usdc"); // Default to USDC

  // Native transaction states
  const [nativeTxnLoading, setNativeTxnLoading] = useState(false);
  const [nativeTxnResult, setNativeTxnResult] = useState<{
    userOpHash: string;
    txHash: string;
  } | null>(null);
  const [nativeTxnError, setNativeTxnError] = useState<string>("");
  const [nativeTxnCodeCopied, setNativeTxnCodeCopied] = useState(false);

  // Gas estimation states
  const [gasEstimationMethod, setGasEstimationMethod] =
    useState<string>("sponsored");
  const [gasEstimationCalls, setGasEstimationCalls] = useState<
    Array<{ to: string; value: string; data: string }>
  >([
    {
      to: "0x0000000000000000000000000000000000000000",
      value: "0",
      data: "0x",
    },
  ]);
  const [gasEstimationLoading, setGasEstimationLoading] = useState(false);
  const [gasEstimationResult, setGasEstimationResult] = useState<Quote | null>(null);
  const [gasEstimationError, setGasEstimationError] = useState<string>("");
  const [gasEstimationCodeCopied, setGasEstimationCodeCopied] = useState(false);

  // Check if any transaction is currently loading
  const isAnyTransactionLoading = 
    currentTxnLoading || 
    erc20TxnLoading || 
    nativeTxnLoading || 
    gasEstimationLoading;

  // Balance states
  const [balances, setBalances] = useState<{
    eth: string;
    weth: string;
    usdc: string;
  }>({ eth: "0", weth: "0", usdc: "0" });
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Token addresses for Base Sepolia
  const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

  // Token mapping for dropdown
  const tokens = {
    weth: {
      name: "WETH",
      address: WETH_ADDRESS,
      symbol: "WETH",
      decimals: 18,
    },
    usdc: {
      name: "USD Coin",
      address: USDC_ADDRESS,
      symbol: "USDC",
      decimals: 6,
    },
  };

  // ERC20 ABI for balanceOf
  const erc20Abi = [
    {
      constant: true,
      inputs: [{ name: "_owner", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "balance", type: "uint256" }],
      type: "function",
    },
  ];

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  // Get install command based on package manager
  const getInstallCommand = (manager: string) => {
    switch (manager) {
      case "npm":
        return "npm install @gelatonetwork/smartwallet-react-sdk";
      case "pnpm":
        return "pnpm add @gelatonetwork/smartwallet-react-sdk";
      case "yarn":
        return "yarn add @gelatonetwork/smartwallet-react-sdk";
      default:
        return "npm install @gelatonetwork/smartwallet-react-sdk";
    }
  };

  // Fetch balances
  const fetchBalances = async (address: string) => {
    if (!address) return;

    setBalanceLoading(true);
    try {
      // Fetch ETH balance
      const ethBalance = await publicClient.getBalance({
        address: address as `0x${string}`,
      });

      // Fetch WETH balance
      const wethBalance = await publicClient.readContract({
        address: WETH_ADDRESS as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      });

      // Fetch USDC balance
      const usdcBalance = await publicClient.readContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      });

      setBalances({
        eth: formatEther(ethBalance),
        weth: formatEther(wethBalance as bigint),
        usdc: formatUnits(usdcBalance as bigint, 6), // USDC has 6 decimals
      });
    } catch (error) {
      console.error("Error fetching balances:", error);
      // Set default values on error
      setBalances({ eth: "0", weth: "0", usdc: "0" });
    } finally {
      setBalanceLoading(false);
    }
  };

  // Fetch balances when account address changes
  useEffect(() => {
    if (currentAccount?.address) {
      fetchBalances(currentAccount.address);
    }
  }, [currentAccount?.address]);

  const getCodeForAccountType = (accountType: SmartAccountType) => {
    switch (accountType) {
      case "gelato":
        return gelatoCode;
      case "kernel":
        return kernelCode(eip7702Enabled);
      case "safe":
        return safeCode;
      default:
        return gelatoCode;
    }
  };

  useEffect(() => {
    if (!client) return;
    const accountData = {
      address: client?.account?.address ?? "",
      swc: client as GelatoSmartWalletClient<
        Transport,
        Chain,
        GelatoSmartAccount
      >,
    };

    if (selectedAccountType === "gelato") {
      setGelatoAccount(accountData);
    } else if (selectedAccountType === "kernel") {
      setKernelAccount(accountData);
    } else if (selectedAccountType === "safe") {
      setSafeAccount(accountData);
    }
  }, [client?.account]);

  const handleCreateAccount = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await createSmartAccount(selectedAccountType, eip7702Enabled);
      const accountData = {
        address: result.account?.address ?? "",
        swc: result.swc as GelatoSmartWalletClient<
          Transport,
          Chain,
          GelatoSmartAccount
        >,
      };

      if (selectedAccountType === "gelato") {
        setGelatoAccount(accountData);
      } else if (selectedAccountType === "kernel") {
        setKernelAccount(accountData);
      } else if (selectedAccountType === "safe") {
        setSafeAccount(accountData);
      }
    } catch (error) {
      console.error("Error creating smart account:", error);
      setError(
        "Failed to create smart account. Please check your API key and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setGelatoTxnResult(null);
    setKernelTxnResult(null);
    setSafeTxnResult(null);
    setGasEstimationResult(null);
    setGelatoAccount(null);
    setKernelAccount(null);
    setSafeAccount(null);
  };

  const handleSendSponsoredTransaction = async () => {
    if (!currentAccount?.swc) {
      if (selectedAccountType === "gelato") {
        setGelatoTxnError("Please create a smart account first");
      } else if (selectedAccountType === "kernel") {
        setKernelTxnError("Please create a smart account first");
      } else if (selectedAccountType === "safe") {
        setSafeTxnError("Please create a smart account first");
      }
      return;
    }

    // Set loading state based on selected account type
    if (selectedAccountType === "gelato") {
      setGelatoTxnLoading(true);
      setGelatoTxnError("");
      setGelatoTxnResult(null);
    } else if (selectedAccountType === "kernel") {
      setKernelTxnLoading(true);
      setKernelTxnError("");
      setKernelTxnResult(null);
    } else if (selectedAccountType === "safe") {
      setSafeTxnLoading(true);
      setSafeTxnError("");
      setSafeTxnResult(null);
    }

    try {
      const result = await sponsoredTxn(currentAccount.swc);

      // Set result based on selected account type
      if (selectedAccountType === "gelato") {
        setGelatoTxnResult(result);
      } else if (selectedAccountType === "kernel") {
        setKernelTxnResult(result);
      } else if (selectedAccountType === "safe") {
        setSafeTxnResult(result);
      }
    } catch (error) {
      console.error("Error sending sponsored transaction:", error);
      const errorMessage =
        "Failed to send sponsored transaction. Please try again.";

      if (selectedAccountType === "gelato") {
        setGelatoTxnError(errorMessage);
      } else if (selectedAccountType === "kernel") {
        setKernelTxnError(errorMessage);
      } else if (selectedAccountType === "safe") {
        setSafeTxnError(errorMessage);
      }
    } finally {
      // Clear loading state based on selected account type
      if (selectedAccountType === "gelato") {
        setGelatoTxnLoading(false);
      } else if (selectedAccountType === "kernel") {
        setKernelTxnLoading(false);
      } else if (selectedAccountType === "safe") {
        setSafeTxnLoading(false);
      }
    }
  };

  const handleSendErc20Transaction = async () => {
    if (!currentAccount?.swc) {
      setErc20TxnError("Please create a smart account first");
      return;
    }

    setErc20TxnLoading(true);
    setErc20TxnError("");
    setErc20TxnResult(null);

    try {
      const tokenAddress = tokens[selectedToken as keyof typeof tokens].address;
      const result = await erc20GasTxn(
        currentAccount.swc,
        tokenAddress as `0x${string}`
      );
      setErc20TxnResult(result);
    } catch (error) {
      console.error("Error sending ERC20 transaction:", error);
      setErc20TxnError("Failed to send ERC20 transaction. Please try again.");
    } finally {
      setErc20TxnLoading(false);
    }
  };

  const handleSendNativeTransaction = async () => {
    if (!currentAccount?.swc) {
      setNativeTxnError("Please create a smart account first");
      return;
    }

    setNativeTxnLoading(true);
    setNativeTxnError("");
    setNativeTxnResult(null);

    try {
      const result = await nativeGasTxn(currentAccount.swc);
      setNativeTxnResult(result);
    } catch (error) {
      console.error("Error sending native transaction:", error);
      setNativeTxnError("Failed to send native transaction. Please try again.");
    } finally {
      setNativeTxnLoading(false);
    }
  };

  const handleEstimateGas = async () => {
    if (!currentAccount?.swc) {
      setGasEstimationError("Please create a smart account first");
      return;
    }

    setGasEstimationLoading(true);
    setGasEstimationError("");
    setGasEstimationResult(null);

    try {
      // Convert calls to the format expected by the estimateGas function
      const calls = gasEstimationCalls.map((call) => ({
        to: call.to as `0x${string}`,
        value: BigInt(call.value || "0"),
        data: call.data as `0x${string}`,
      }));

      const result = await estimateGas(
        currentAccount.swc,
        gasEstimationMethod,
        gasEstimationMethod === "erc20"
          ? (tokens[selectedToken as keyof typeof tokens]
              .address as `0x${string}`)
          : undefined,
        calls
      );

      setGasEstimationResult(result as Quote);
    } catch (error) {
      console.error("Error estimating gas:", error);
      setGasEstimationError(
        "Failed to estimate gas. Please check your parameters and try again."
      );
    } finally {
      setGasEstimationLoading(false);
    }
  };

  const addCallObject = () => {
    setGasEstimationCalls([
      ...gasEstimationCalls,
      {
        to: "0x0000000000000000000000000000000000000000",
        value: "0",
        data: "0x",
      },
    ]);
  };

  const removeCallObject = (index: number) => {
    if (gasEstimationCalls.length > 1) {
      setGasEstimationCalls(gasEstimationCalls.filter((_, i) => i !== index));
    }
  };

  const updateCallObject = (
    index: number,
    field: "to" | "value" | "data",
    value: string
  ) => {
    const updatedCalls = [...gasEstimationCalls];
    updatedCalls[index] = { ...updatedCalls[index], [field]: value };
    setGasEstimationCalls(updatedCalls);
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const handleCopyAddress = async () => {
    if (currentAccount?.address) {
      try {
        await navigator.clipboard.writeText(currentAccount.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        console.error("Failed to copy address");
      }
    }
  };

  const handleExplorerLink = () => {
    if (currentAccount?.address) {
      window.open(
        `https://sepolia.basescan.org/address/${currentAccount.address}`,
        "_blank"
      );
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-black text-gray-400">
      {/* Header */}
      <div className="border-b border-gray-950 bg-black">
        <div className="max-w-6xl mx-auto px-8 py-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded overflow-hidden ring-1 ring-[#FF3B57]/30">
              <Image
                src="/gelato-logo.jpg"
                alt="Gelato Logo"
                width={28}
                height={28}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-xl font-medium text-gray-300">Gelato</h1>
            <div className="ml-auto w-1 h-1 bg-[#FF3B57]/15 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Overview */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-medium text-gray-200">
              Smart Account Dev Demo
            </h2>
            <div className="w-1 h-4 bg-[#FF3B57]/10 rounded-full"></div>
          </div>
          <p className="text-gray-500 leading-relaxed mb-12 text-lg">
            Experience the power of Gelato Smart Wallet with different account
            types and transaction methods. Create accounts, view balances, and
            execute gasless transactions with ease.
          </p>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-975 border border-gray-950 border-l-[#FF3B57]/20 p-6">
              <h3 className="text-gray-300 font-medium mb-2">
                Account Creation
              </h3>
              <p className="text-gray-600 text-sm">
                Create Gelato, Kernel, or Safe smart accounts
              </p>
            </div>
            <div className="bg-gray-975 border border-gray-950 border-l-[#FF3B57]/20 p-6">
              <h3 className="text-gray-300 font-medium mb-2">
                Gas Sponsorship
              </h3>
              <p className="text-gray-600 text-sm">
                Execute gasless transactions with Gelato paymaster
              </p>
            </div>
            <div className="bg-gray-975 border border-gray-950 border-l-[#FF3B57]/20 p-6">
              <h3 className="text-gray-300 font-medium mb-2">
                ERC20 Gas Payments
              </h3>
              <p className="text-gray-600 text-sm">
                Execute transactions with ERC20 tokens
              </p>
            </div>
            <div className="bg-gray-975 border border-gray-950 border-l-[#FF3B57]/20 p-6">
              <h3 className="text-gray-300 font-medium mb-2">
                Gas Estimations
              </h3>
              <p className="text-gray-600 text-sm">
                Estimate gas for transactions
              </p>
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gray-950"></div>
          <div className="w-1.5 h-1.5 bg-[#FF3B57]/10 rounded-full"></div>
          <div className="flex-1 h-px bg-gray-950"></div>
        </div>

        {/* Installation */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-medium text-gray-200">Installation</h2>
            <div className="w-1 h-4 bg-[#FF3B57]/10 rounded-full"></div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-300 mb-4">
              Package Installation
            </h3>

            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-4 bg-gray-950 p-1 rounded-lg">
              {["npm", "pnpm", "yarn"].map((manager) => (
                <button
                  key={manager}
                  onClick={() => setSelectedPackageManager(manager)}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                    selectedPackageManager === manager
                      ? "bg-gray-900 text-[#FF3B57] shadow-sm"
                      : "text-gray-600 hover:text-[#FF3B57]"
                  }`}
                >
                  {manager}
                </button>
              ))}
            </div>

            {/* Code Display */}
            <div className="bg-black border-2 border-gray-800 border-l-4 border-l-[#FF3B57] p-6 relative rounded-lg shadow-lg">
              <button
                onClick={() => {
                  copyToClipboard(getInstallCommand(selectedPackageManager));
                  setCodeCopied(true);
                  setTimeout(() => setCodeCopied(false), 2000);
                }}
                className="absolute right-4 top-4 text-gray-700 hover:text-[#FF3B57] transition-colors"
              >
                {codeCopied ? (
                  <CheckCircle size={16} className="text-green-400" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
              <code className="text-gray-400 text-md font-mono">
                {getInstallCommand(selectedPackageManager)}
              </code>
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gray-950"></div>
          <div className="w-1.5 h-1.5 bg-[#FF3B57]/10 rounded-full"></div>
          <div className="flex-1 h-px bg-gray-950"></div>
        </div>

        {/* Smart Account Creation */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-medium text-gray-200">
              Smart Account Creation
            </h2>
            <div className="w-1 h-4 bg-[#FF3B57]/10 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Code Display */}
            <div>
              <h3 className="text-lg font-medium text-gray-300 mb-4">
                Implementation Code
              </h3>

              {/* Code Tab Navigation */}
              <div className="flex space-x-1 mb-4 bg-gray-950 p-1 rounded-lg">
                {(["core", "react"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedCodeTab(tab)}
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                      selectedCodeTab === tab
                        ? "bg-gray-900 text-[#FF3B57] shadow-sm"
                        : "text-gray-600 hover:text-[#FF3B57]"
                    }`}
                  >
                    {tab === "core" ? "Core SDK" : "React SDK"}
                  </button>
                ))}
              </div>

              {/* Code Display */}
              <div className="bg-black border-2 border-gray-800 border-l-4 border-l-[#FF3B57] p-6 relative rounded-lg shadow-lg">
                <button
                  onClick={() => {
                    const codeToCopy =
                      selectedCodeTab === "core"
                        ? getCodeForAccountType(selectedAccountType)
                        : selectedCodeTab === "react"
                        ? reactSdkCode + "\n\n" + reactSdkUsageCode
                        : "";
                    copyToClipboard(codeToCopy);
                    setCodeCopied(true);
                    setTimeout(() => setCodeCopied(false), 2000);
                  }}
                  className="absolute right-4 top-4 text-gray-700 hover:text-[#FF3B57] transition-colors"
                >
                  {codeCopied ? (
                    <CheckCircle size={16} className="text-green-400" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
                <pre className="text-gray-400 text-sm font-mono overflow-x-auto">
                  <code>
                    {selectedCodeTab === "core"
                      ? getCodeForAccountType(selectedAccountType)
                      : selectedCodeTab === "react"
                      ? reactSdkCode + "\n\n" + reactSdkUsageCode
                      : ""}
                  </code>
                </pre>
              </div>
            </div>

            {/* Right Side - Interactive Creation */}
            <div>
              <h3 className="text-lg font-medium text-gray-300 mb-4">
                Create Account
              </h3>

              <div className="space-y-6">
                {/* Account Type Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Select Smart Account Type
                  </label>
                  <select
                    value={selectedAccountType}
                    onChange={(e) =>
                      setSelectedAccountType(e.target.value as SmartAccountType)
                    }
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-900 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF3B57]/30 focus:border-[#FF3B57]/30 transition-all duration-200"
                  >
                    <option value="gelato">Gelato Smart Account</option>
                    <option value="kernel">Kernel Smart Account</option>
                    <option value="safe">Safe Smart Account</option>
                  </select>
                </div>

                {/* EIP-7702 Toggle for Kernel */}
                {selectedAccountType === "kernel" && (
                  <div className="p-4 bg-gray-975 border border-gray-950 border-l-[#FF3B57]/20 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-gray-300 font-medium">
                          EIP-7702 Mode
                        </h4>
                        <p className="text-gray-500 text-sm">
                          Enable EIP-7702 Standard for Kernel
                        </p>
                      </div>
                      <button
                        onClick={() => setEip7702Enabled(!eip7702Enabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF3B57]/30 focus:ring-offset-2 focus:ring-offset-gray-975 ${
                          eip7702Enabled ? "bg-[#FF3B57]" : "bg-gray-700"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            eip7702Enabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                    <div className="text-xs text-gray-500">
                      <strong>Current setting:</strong>{" "}
                      {eip7702Enabled ? "Enabled" : "Disabled"} (default:
                      disabled)
                    </div>
                  </div>
                )}

                {/* Create Button */}
                <button
                  onClick={handleCreateAccount}
                  disabled={
                    isLoading || client?.account
                      ? true
                      : false || currentAccount
                      ? true
                      : false
                  }
                  className="w-full bg-gradient-to-r from-[#FF3B57] to-[#FF3B57]/80 text-white py-4 px-6 rounded-lg font-medium hover:from-[#FF3B57]/90 hover:to-[#FF3B57]/70 focus:outline-none focus:ring-2 focus:ring-[#FF3B57]/30 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-3"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating Account...</span>
                    </>
                  ) : currentAccount ? (
                    <>
                      <span>Account Already Created</span>
                    </>
                  ) : (
                    <>
                      <span>Create Smart Account</span>
                    </>
                  )}
                </button>

                {/* Dynamic Login/Logout Section */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gray-950"></div>
                  <span className="text-gray-600 text-sm">or</span>
                  <div className="flex-1 h-px bg-gray-950"></div>
                </div>

                {!client?.account && (
                  <div className="flex justify-center items-center">
                    <GelatoSmartWalletConnectButton>
                      <div className="w-full flex justify-center items-center space-x-2 bg-[#2970FF] text-white py-4 px-6 rounded-lg font-medium hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                        <span>Login with</span>
                        <img
                          src="https://mintlify.s3.us-west-1.amazonaws.com/dynamic-docs-testing/logo/dark.svg"
                          alt="Dynamic Logo"
                          width="110"
                          height="110"
                        />
                      </div>
                    </GelatoSmartWalletConnectButton>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="flex items-center space-x-3 p-4 bg-[#FF3B57]/10 border border-[#FF3B57]/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-[#FF3B57] flex-shrink-0" />
                    <span className="text-[#FF3B57] text-sm">{error}</span>
                  </div>
                )}

                {/* Account Address Display */}
                {currentAccount && (
                  <div className="space-y-4">
                    <div className="p-6 bg-gray-975 border border-gray-950 border-l-[#FF3B57]/20 rounded-lg">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-[#FF3B57]/10 rounded-full">
                          <CheckCircle className="h-5 w-5 text-[#FF3B57]" />
                        </div>
                        <div>
                          <h4 className="text-gray-200 font-medium text-lg">
                            Smart Account Created Successfully!
                          </h4>
                          <p className="text-gray-500 text-sm">
                            Your smart account is ready to use
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Account Address
                          </label>
                          <div className="flex items-center space-x-2">
                            <code className="flex-1 bg-gray-950 px-4 py-3 rounded-lg text-sm font-mono text-gray-300 border border-gray-900">
                              {currentAccount.address}
                            </code>
                            <button
                              onClick={handleCopyAddress}
                              className="p-3 text-gray-500 hover:text-[#FF3B57] hover:bg-gray-950 rounded-lg transition-colors"
                              title="Copy address"
                            >
                              {copied ? (
                                <CheckCircle className="h-4 w-4 text-[#FF3B57]" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={handleExplorerLink}
                            className={`flex items-center space-x-2 px-4 py-2 bg-gray-950 text-gray-300 rounded-lg hover:bg-gray-900 transition-colors border border-gray-900 ${
                              !client?.account ? "flex-1" : ""
                            }`}
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>View on Explorer</span>
                          </button>
                          <button
                            onClick={() =>
                              fetchBalances(currentAccount.address)
                            }
                            disabled={balanceLoading}
                            className={`flex items-center space-x-2 px-4 py-2 bg-gray-950 text-gray-300 rounded-lg hover:bg-gray-900 transition-colors border border-gray-900 disabled:opacity-50 ${
                              !client?.account ? "flex-1" : ""
                            }`}
                          >
                            {balanceLoading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FF3B57]"></div>
                            ) : (
                              <Wallet className="h-4 w-4" />
                            )}
                            <span>Refresh Balances</span>
                          </button>
                          {client?.account && (
                            <button
                              onClick={handleLogout}
                              className="flex items-center space-x-2 px-4 py-2 bg-[#FF3B57]/20 text-[#FF3B57] rounded-lg hover:bg-[#FF3B57]/30 transition-colors border border-[#FF3B57]/30"
                            >
                              <span>Logout</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Balance Display */}
                    <div className="bg-gray-975 border border-gray-950 border-l-[#FF3B57]/20 p-6 rounded-lg">
                      <h4 className="text-lg font-medium text-gray-300 mb-4 flex items-center">
                        <Wallet className="h-5 w-5 mr-2 text-[#FF3B57]" />
                        Account Balances
                      </h4>

                      {balanceLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF3B57]"></div>
                          <span className="ml-3 text-gray-500">
                            Loading balances...
                          </span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* ETH Balance */}
                          <div className="p-4 bg-gray-950 border border-gray-900 border-l-[#FF3B57]/20 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-[#FF3B57] rounded-full"></div>
                                <span className="font-medium text-gray-200">
                                  ETH
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded-full">
                                Native
                              </span>
                            </div>
                            <div className="text-2xl font-bold text-gray-200">
                              {parseFloat(balances.eth) > 0
                                ? parseFloat(balances.eth).toFixed(4)
                                : "0.0000"}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Native ETH
                            </p>
                          </div>

                          {/* WETH Balance */}
                          <div className="p-4 bg-gray-950 border border-gray-900 border-l-[#FF3B57]/20 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-[#FF3B57] rounded-full"></div>
                                <span className="font-medium text-gray-200">
                                  WETH
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded-full">
                                ERC20
                              </span>
                            </div>
                            <div className="text-2xl font-bold text-gray-200">
                              {parseFloat(balances.weth) > 0
                                ? parseFloat(balances.weth).toFixed(4)
                                : "0.0000"}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Wrapped ETH
                            </p>
                          </div>

                          {/* USDC Balance */}
                          <div className="p-4 bg-gray-950 border border-gray-900 border-l-[#FF3B57]/20 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-[#FF3B57] rounded-full"></div>
                                <span className="font-medium text-gray-200">
                                  USDC
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded-full">
                                ERC20
                              </span>
                            </div>
                            <div className="text-2xl font-bold text-gray-200">
                              {parseFloat(balances.usdc) > 0
                                ? parseFloat(balances.usdc).toFixed(2)
                                : "0.00"}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              USD Coin
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-gray-950"></div>
          <div className="w-1.5 h-1.5 bg-[#FF3B57]/10 rounded-full"></div>
          <div className="flex-1 h-px bg-gray-950"></div>
        </div>

        {/* Transaction Types */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-medium text-gray-200">
              Transaction Types
            </h2>
            <div className="w-1 h-4 bg-[#FF3B57]/10 rounded-full"></div>
          </div>

          <div className="space-y-12">
            {/* Sponsored Transactions */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-xl font-medium text-gray-300">
                  1. Sponsored Transactions
                </h3>
                <div className="w-1 h-3 bg-[#FF3B57]/10 rounded-full"></div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() =>
                    window.open(
                      "https://docs.gelato.cloud/Smart-Wallets/How-To-Guides/Sponsor-Gas",
                      "_blank"
                    )
                  }
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-950 text-gray-300 rounded-lg hover:bg-gray-900 transition-colors border border-gray-900"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Docs</span>
                </button>
                <button
                  onClick={() =>
                    window.open(
                      "https://github.com/gelatodigital/how-tos-1-smartwallet-sdk-examples/blob/master/sponsored/src/index.ts",
                      "_blank"
                    )
                  }
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-950 text-gray-300 rounded-lg hover:bg-gray-900 transition-colors border border-gray-900"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Code</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Code Display */}
                <div>
                  <h4 className="text-lg font-medium text-gray-300 mb-4">
                    Implementation Code
                  </h4>
                  <div className="bg-black border-2 border-gray-800 border-l-4 border-l-[#FF3B57] p-6 relative rounded-lg shadow-lg">
                    <button
                      onClick={() => {
                        copyToClipboard(sponsoredTxnCode);
                        setTxnCodeCopied(true);
                        setTimeout(() => setTxnCodeCopied(false), 2000);
                      }}
                      className="absolute right-4 top-4 text-gray-700 hover:text-[#FF3B57] transition-colors"
                    >
                      {txnCodeCopied ? (
                        <CheckCircle size={16} className="text-green-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                    <pre className="text-gray-400 text-sm font-mono overflow-x-auto">
                      <code>{sponsoredTxnCode}</code>
                    </pre>
                  </div>
                </div>

                {/* Interactive Section */}
                <div>
                  <h4 className="text-lg font-medium text-gray-300 mb-4">
                    Execute Transaction
                  </h4>

                  <div className="space-y-6">
                    {!currentAccount?.swc ? (
                      <div className="p-4 bg-yellow-950/20 border border-yellow-950/40 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="h-5 w-5 text-yellow-400" />
                          <span className="text-yellow-300 font-medium">
                            Create Account First
                          </span>
                        </div>
                        <p className="text-yellow-400 text-sm">
                          You need to create a smart account before executing
                          sponsored transactions.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-975 border border-gray-950 border-l-[#FF3B57]/20 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-red-400" />
                          <span className="text-gray-300 font-medium">
                            Smart Account Ready
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm">
                          Your smart account is ready to execute sponsored
                          transactions.
                        </p>
                      </div>
                    )}

                    <button
                      onClick={handleSendSponsoredTransaction}
                      disabled={isAnyTransactionLoading || !currentAccount?.swc}
                      className="w-full bg-gradient-to-r from-[#FF3B57] to-[#FF3B57]/80 text-white py-4 px-6 rounded-lg font-medium hover:from-[#FF3B57]/90 hover:to-[#FF3B57]/70 focus:outline-none focus:ring-2 focus:ring-[#FF3B57]/30 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-3"
                    >
                      {currentTxnLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Executing Transaction...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          <span>Send Sponsored Transaction</span>
                        </>
                      )}
                    </button>

                    {currentTxnError && (
                      <div className="flex items-center space-x-3 p-4 bg-[#FF3B57]/10 border border-[#FF3B57]/20 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-[#FF3B57] flex-shrink-0" />
                        <span className="text-[#FF3B57] text-sm">
                          {currentTxnError}
                        </span>
                      </div>
                    )}

                    {currentTxnResult && (
                      <div className="p-6 bg-gray-975 border border-gray-950 border-l-[#FF3B57]/20 rounded-lg">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-2 bg-[#FF3B57]/10 rounded-full">
                            <CheckCircle className="h-5 w-5 text-[#FF3B57]" />
                          </div>
                          <div>
                            <h4 className="text-gray-200 font-medium text-lg">
                              Transaction Successful!
                            </h4>
                            <p className="text-gray-500 text-sm">
                              Your sponsored transaction has been executed
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                              User Operation Hash
                            </label>
                            <div className="flex items-center space-x-2">
                              <code className="flex-1 bg-gray-950 px-4 py-3 rounded-lg text-sm font-mono text-gray-300 border border-gray-900">
                                {truncateHash(currentTxnResult.userOpHash)}
                              </code>
                              <button
                                onClick={() =>
                                  copyToClipboard(currentTxnResult.userOpHash)
                                }
                                className="p-3 text-gray-500 hover:text-[#FF3B57] hover:bg-gray-950 rounded-lg transition-colors"
                                title="Copy user op hash"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  window.open(
                                    `https://api.gelato.digital/tasks/status/${currentTxnResult.userOpHash}`,
                                    "_blank"
                                  )
                                }
                                className="p-3 text-gray-500 hover:text-[#FF3B57] hover:bg-gray-950 rounded-lg transition-colors"
                                title="View on Gelato"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                              Transaction Hash
                            </label>
                            <div className="flex items-center space-x-2">
                              <code className="flex-1 bg-gray-950 px-4 py-3 rounded-lg text-sm font-mono text-gray-300 border border-gray-900">
                                {truncateHash(currentTxnResult.txHash)}
                              </code>
                              <button
                                onClick={() =>
                                  copyToClipboard(currentTxnResult.txHash)
                                }
                                className="p-3 text-gray-500 hover:text-[#FF3B57] hover:bg-gray-950 rounded-lg transition-colors"
                                title="Copy transaction hash"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  window.open(
                                    `https://sepolia.basescan.org/tx/${currentTxnResult.txHash}`,
                                    "_blank"
                                  )
                                }
                                className="p-3 text-gray-500 hover:text-[#FF3B57] hover:bg-gray-950 rounded-lg transition-colors"
                                title="View on Explorer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ERC20 Gas Transactions */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-xl font-medium text-gray-300">
                  2. ERC20 Gas Transactions
                </h3>
                <div className="w-1 h-3 bg-[#FF3B57]/10 rounded-full"></div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() =>
                    window.open(
                      "https://docs.gelato.cloud/Smart-Wallets/How-To-Guides/Allow-user-to-pay-with-erc20",
                      "_blank"
                    )
                  }
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-950 text-gray-300 rounded-lg hover:bg-gray-900 transition-colors border border-gray-900"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Docs</span>
                </button>
                <button
                  onClick={() =>
                    window.open(
                      "https://github.com/gelatodigital/how-tos-1-smartwallet-sdk-examples/blob/master/erc20/src/index.ts",
                      "_blank"
                    )
                  }
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-950 text-gray-300 rounded-lg hover:bg-gray-900 transition-colors border border-gray-900"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Code</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Code Display */}
                <div>
                  <h4 className="text-lg font-medium text-gray-300 mb-4">
                    Implementation Code
                  </h4>
                  <div className="bg-black border-2 border-gray-800 border-l-4 border-l-[#FF3B57] p-6 relative rounded-lg shadow-lg">
                    <button
                      onClick={() => {
                        copyToClipboard(erc20GasTxnCode);
                        setErc20TxnCodeCopied(true);
                        setTimeout(() => setErc20TxnCodeCopied(false), 2000);
                      }}
                      className="absolute right-4 top-4 text-gray-700 hover:text-[#FF3B57] transition-colors"
                    >
                      {erc20TxnCodeCopied ? (
                        <CheckCircle size={16} className="text-green-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                    <pre className="text-gray-400 text-sm font-mono overflow-x-auto">
                      <code>{erc20GasTxnCode}</code>
                    </pre>
                  </div>
                </div>

                {/* Interactive Section */}
                <div>
                  <h4 className="text-lg font-medium text-gray-300 mb-4">
                    Execute Transaction
                  </h4>

                  <div className="space-y-6">
                    {!currentAccount?.swc ? (
                      <div className="p-4 bg-yellow-950/20 border border-yellow-950/40 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="h-5 w-5 text-yellow-400" />
                          <span className="text-yellow-300 font-medium">
                            Create Account First
                          </span>
                        </div>
                        <p className="text-yellow-400 text-sm">
                          You need to create a smart account before executing
                          ERC20 transactions.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-975 border border-gray-950 border-l-[#FF3B57]/20 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-red-400" />
                          <span className="text-gray-300 font-medium">
                            Smart Account Ready
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm">
                          Your smart account is ready to execute ERC20 gas
                          transactions.
                        </p>
                      </div>
                    )}

                    {/* Token Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-3">
                        ERC20 Token
                      </label>
                      <select
                        value={selectedToken}
                        onChange={(e) => setSelectedToken(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-950 border border-gray-900 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF3B57]/30 focus:border-[#FF3B57]/30 transition-all duration-200"
                      >
                        <option value="usdc">USD Coin (USDC)</option>
                        <option value="weth">Wrapped ETH (WETH)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Selected:{" "}
                        {tokens[selectedToken as keyof typeof tokens].name} (
                        {tokens[selectedToken as keyof typeof tokens].address})
                      </p>
                    </div>

                    <button
                      onClick={handleSendErc20Transaction}
                      disabled={isAnyTransactionLoading || !currentAccount?.swc}
                      className="w-full bg-gradient-to-r from-[#FF3B57] to-[#FF3B57]/80 text-white py-4 px-6 rounded-lg font-medium hover:from-[#FF3B57]/90 hover:to-[#FF3B57]/70 focus:outline-none focus:ring-2 focus:ring-[#FF3B57]/30 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-3"
                    >
                      {erc20TxnLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Executing ERC20 Transaction...</span>
                        </>
                      ) : (
                        <>
                          <Coins className="h-5 w-5" />
                          <span>Send ERC20 Gas Transaction</span>
                        </>
                      )}
                    </button>

                    {erc20TxnError && (
                      <div className="flex items-center space-x-3 p-4 bg-[#FF3B57]/10 border border-[#FF3B57]/20 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-[#FF3B57] flex-shrink-0" />
                        <span className="text-[#FF3B57] text-sm">
                          {erc20TxnError}
                        </span>
                      </div>
                    )}

                    {erc20TxnResult && (
                      <div className="p-6 bg-gray-975 border border-gray-950 border-l-[#FF3B57]/20 rounded-lg">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-2 bg-[#FF3B57]/10 rounded-full">
                            <CheckCircle className="h-5 w-5 text-[#FF3B57]" />
                          </div>
                          <div>
                            <h4 className="text-gray-200 font-medium text-lg">
                              ERC20 Transaction Successful!
                            </h4>
                            <p className="text-gray-500 text-sm">
                              Your ERC20 gas transaction has been executed
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                              User Operation Hash
                            </label>
                            <div className="flex items-center space-x-2">
                              <code className="flex-1 bg-gray-950 px-4 py-3 rounded-lg text-sm font-mono text-gray-300 border border-gray-900">
                                {truncateHash(erc20TxnResult.userOpHash)}
                              </code>
                              <button
                                onClick={() =>
                                  copyToClipboard(erc20TxnResult.userOpHash)
                                }
                                className="p-3 text-gray-500 hover:text-[#FF3B57] hover:bg-gray-950 rounded-lg transition-colors"
                                title="Copy user op hash"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  window.open(
                                    `https://api.gelato.digital/tasks/status/${erc20TxnResult.userOpHash}`,
                                    "_blank"
                                  )
                                }
                                className="p-3 text-gray-500 hover:text-[#FF3B57] hover:bg-gray-950 rounded-lg transition-colors"
                                title="View on Gelato"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                              Transaction Hash
                            </label>
                            <div className="flex items-center space-x-2">
                              <code className="flex-1 bg-gray-950 px-4 py-3 rounded-lg text-sm font-mono text-gray-300 border border-gray-900">
                                {truncateHash(erc20TxnResult.txHash)}
                              </code>
                              <button
                                onClick={() =>
                                  copyToClipboard(erc20TxnResult.txHash)
                                }
                                className="p-3 text-gray-500 hover:text-[#FF3B57] hover:bg-gray-950 rounded-lg transition-colors"
                                title="Copy transaction hash"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  window.open(
                                    `https://sepolia.basescan.org/tx/${erc20TxnResult.txHash}`,
                                    "_blank"
                                  )
                                }
                                className="p-3 text-gray-500 hover:text-[#FF3B57] hover:bg-gray-950 rounded-lg transition-colors"
                                title="View on Explorer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Native Gas Transactions */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-xl font-medium text-gray-300">
                  3. Native Gas Transactions
                </h3>
                <div className="w-1 h-3 bg-[#FF3B57]/10 rounded-full"></div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() =>
                    window.open(
                      "https://docs.gelato.cloud/Smart-Wallets/How-To-Guides/Allow-user-to-pay-with-native",
                      "_blank"
                    )
                  }
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-950 text-gray-300 rounded-lg hover:bg-gray-900 transition-colors border border-gray-900"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Docs</span>
                </button>
                <button
                  onClick={() =>
                    window.open(
                      "https://github.com/gelatodigital/how-tos-1-smartwallet-sdk-examples/blob/master/native/src/index.ts",
                      "_blank"
                    )
                  }
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-950 text-gray-300 rounded-lg hover:bg-gray-900 transition-colors border border-gray-900"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Code</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Code Display */}
                <div>
                  <h4 className="text-lg font-medium text-gray-300 mb-4">
                    Implementation Code
                  </h4>
                  <div className="bg-black border-2 border-gray-800 border-l-4 border-l-[#FF3B57] p-6 relative rounded-lg shadow-lg">
                    <button
                      onClick={() => {
                        copyToClipboard(nativeGasTxnCode);
                        setNativeTxnCodeCopied(true);
                        setTimeout(() => setNativeTxnCodeCopied(false), 2000);
                      }}
                      className="absolute right-4 top-4 text-gray-700 hover:text-[#FF3B57] transition-colors"
                    >
                      {nativeTxnCodeCopied ? (
                        <CheckCircle size={16} className="text-green-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                    <pre className="text-gray-400 text-sm font-mono overflow-x-auto">
                      <code>{nativeGasTxnCode}</code>
                    </pre>
                  </div>
                </div>

                {/* Interactive Section */}
                <div>
                  <h4 className="text-lg font-medium text-gray-300 mb-4">
                    Execute Transaction
                  </h4>

                  <div className="space-y-6">
                    {!currentAccount?.swc ? (
                      <div className="p-4 bg-yellow-950/20 border border-yellow-950/40 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="h-5 w-5 text-yellow-400" />
                          <span className="text-yellow-300 font-medium">
                            Create Account First
                          </span>
                        </div>
                        <p className="text-yellow-400 text-sm">
                          You need to create a smart account before executing
                          native transactions.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-975 border border-gray-950 border-l-[#FF3B57]/20 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-red-400" />
                          <span className="text-gray-300 font-medium">
                            Smart Account Ready
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm">
                          Your smart account is ready to execute native gas
                          transactions.
                        </p>
                      </div>
                    )}

                    <button
                      onClick={handleSendNativeTransaction}
                      disabled={isAnyTransactionLoading || !currentAccount?.swc}
                      className="w-full bg-gradient-to-r from-[#FF3B57] to-[#FF3B57]/80 text-white py-4 px-6 rounded-lg font-medium hover:from-[#FF3B57]/90 hover:to-[#FF3B57]/70 focus:outline-none focus:ring-2 focus:ring-[#FF3B57]/30 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-3"
                    >
                      {nativeTxnLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Executing Native Transaction...</span>
                        </>
                      ) : (
                        <>
                          <DollarSign className="h-5 w-5" />
                          <span>Send Native Gas Transaction</span>
                        </>
                      )}
                    </button>

                    {nativeTxnError && (
                      <div className="flex items-center space-x-3 p-4 bg-[#FF3B57]/10 border border-[#FF3B57]/20 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-[#FF3B57] flex-shrink-0" />
                        <span className="text-[#FF3B57] text-sm">
                          {nativeTxnError}
                        </span>
                      </div>
                    )}

                    {nativeTxnResult && (
                      <div className="p-6 bg-gray-975 border border-gray-950 border-l-[#FF3B57]/20 rounded-lg">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-2 bg-[#FF3B57]/10 rounded-full">
                            <CheckCircle className="h-5 w-5 text-[#FF3B57]" />
                          </div>
                          <div>
                            <h4 className="text-gray-200 font-medium text-lg">
                              Native Transaction Successful!
                            </h4>
                            <p className="text-gray-500 text-sm">
                              Your native gas transaction has been executed
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                              User Operation Hash
                            </label>
                            <div className="flex items-center space-x-2">
                              <code className="flex-1 bg-gray-950 px-4 py-3 rounded-lg text-sm font-mono text-gray-300 border border-gray-900">
                                {truncateHash(nativeTxnResult.userOpHash)}
                              </code>
                              <button
                                onClick={() =>
                                  copyToClipboard(nativeTxnResult.userOpHash)
                                }
                                className="p-3 text-gray-500 hover:text-[#FF3B57] hover:bg-gray-950 rounded-lg transition-colors"
                                title="Copy user op hash"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  window.open(
                                    `https://api.gelato.digital/tasks/status/${nativeTxnResult.userOpHash}`,
                                    "_blank"
                                  )
                                }
                                className="p-3 text-gray-500 hover:text-[#FF3B57] hover:bg-gray-950 rounded-lg transition-colors"
                                title="View on Gelato"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                              Transaction Hash
                            </label>
                            <div className="flex items-center space-x-2">
                              <code className="flex-1 bg-gray-950 px-4 py-3 rounded-lg text-sm font-mono text-gray-300 border border-gray-900">
                                {truncateHash(nativeTxnResult.txHash)}
                              </code>
                              <button
                                onClick={() =>
                                  copyToClipboard(nativeTxnResult.txHash)
                                }
                                className="p-3 text-gray-500 hover:text-[#FF3B57] hover:bg-gray-950 rounded-lg transition-colors"
                                title="Copy transaction hash"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  window.open(
                                    `https://sepolia.basescan.org/tx/${nativeTxnResult.txHash}`,
                                    "_blank"
                                  )
                                }
                                className="p-3 text-gray-500 hover:text-[#FF3B57] hover:bg-gray-950 rounded-lg transition-colors"
                                title="View on Explorer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Gas Estimation */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-xl font-medium text-gray-300">
                  Gas Estimation
                </h3>
                <div className="w-1 h-3 bg-[#FF3B57]/10 rounded-full"></div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() =>
                    window.open(
                      "https://docs.gelato.cloud/Smart-Wallets/How-To-Guides/Estimate-gas",
                      "_blank"
                    )
                  }
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-950 text-gray-300 rounded-lg hover:bg-gray-900 transition-colors border border-gray-900"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Docs</span>
                </button>
                <button
                  onClick={() =>
                    window.open(
                      "https://github.com/gelatodigital/how-tos-1-smartwallet-sdk-examples/blob/master/estimates/src/index.ts",
                      "_blank"
                    )
                  }
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-950 text-gray-300 rounded-lg hover:bg-gray-900 transition-colors border border-gray-900"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Code</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Code Display */}
                <div>
                  <h4 className="text-lg font-medium text-gray-300 mb-4">
                    Implementation Code
                  </h4>
                  <div className="bg-black border-2 border-gray-800 border-l-4 border-l-[#FF3B57] p-6 relative rounded-lg shadow-lg">
                    <button
                      onClick={() => {
                        copyToClipboard(estimateGasCode);
                        setGasEstimationCodeCopied(true);
                        setTimeout(
                          () => setGasEstimationCodeCopied(false),
                          2000
                        );
                      }}
                      className="absolute right-4 top-4 text-gray-700 hover:text-[#FF3B57] transition-colors"
                    >
                      {gasEstimationCodeCopied ? (
                        <CheckCircle size={16} className="text-green-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                    <pre className="text-gray-400 text-sm font-mono overflow-x-auto">
                      <code>{estimateGasCode}</code>
                    </pre>
                  </div>
                </div>

                {/* Interactive Section */}
                <div>
                  <h4 className="text-lg font-medium text-gray-300 mb-4">
                    Estimate Gas
                  </h4>

                  <div className="space-y-6">
                    {!currentAccount?.swc ? (
                      <div className="p-4 bg-yellow-950/20 border border-yellow-950/40 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="h-5 w-5 text-yellow-400" />
                          <span className="text-yellow-300 font-medium">
                            Create Account First
                          </span>
                        </div>
                        <p className="text-yellow-400 text-sm">
                          You need to create a smart account before estimating
                          gas.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-975 border border-gray-950 border-l-[#FF3B57]/20 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-[#FF3B57]" />
                          <span className="text-gray-300 font-medium">
                            Smart Account Ready
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm">
                          Your smart account is ready to estimate gas costs.
                        </p>
                      </div>
                    )}

                    {/* Payment Method Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-3">
                        Payment Method
                      </label>
                      <select
                        value={gasEstimationMethod}
                        onChange={(e) => setGasEstimationMethod(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-950 border border-gray-900 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF3B57]/30 focus:border-[#FF3B57]/30 transition-all duration-200"
                      >
                        <option value="sponsored">Sponsored (Gasless)</option>
                        <option value="native">Native (ETH)</option>
                        <option value="erc20">ERC20 Token</option>
                      </select>
                    </div>

                    {/* Token Selection for ERC20 */}
                    {gasEstimationMethod === "erc20" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-3">
                          ERC20 Token
                        </label>
                        <select
                          value={
                            gasEstimationMethod === "erc20"
                              ? selectedToken
                              : "usdc"
                          }
                          onChange={(e) => setSelectedToken(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-950 border border-gray-900 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF3B57]/30 focus:border-[#FF3B57]/30 transition-all duration-200"
                        >
                          <option value="usdc">USD Coin (USDC)</option>
                          <option value="weth">Wrapped ETH (WETH)</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Selected:{" "}
                          {tokens[selectedToken as keyof typeof tokens].name} (
                          {tokens[selectedToken as keyof typeof tokens].address}
                          )
                        </p>
                      </div>
                    )}

                    {/* Call Objects */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-400">
                          Call Objects
                        </label>
                        <button
                          onClick={addCallObject}
                          className="px-3 py-1 bg-[#FF3B57]/20 text-[#FF3B57] rounded-md text-sm hover:bg-[#FF3B57]/30 transition-colors"
                        >
                          + Add Call
                        </button>
                      </div>

                      <div className="space-y-4">
                        {gasEstimationCalls.map((call, index) => (
                          <div
                            key={index}
                            className="p-4 bg-gray-950 border border-gray-900 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-gray-300">
                                Call #{index + 1}
                              </span>
                              {gasEstimationCalls.length > 1 && (
                                <button
                                  onClick={() => removeCallObject(index)}
                                  className="text-[#FF3B57] hover:text-[#FF3B57]/80 text-sm"
                                >
                                  Remove
                                </button>
                              )}
                            </div>

                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  To Address
                                </label>
                                <input
                                  type="text"
                                  value={call.to}
                                  onChange={(e) =>
                                    updateCallObject(
                                      index,
                                      "to",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0x..."
                                  className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#FF3B57]/30"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Value (wei)
                                </label>
                                <input
                                  type="text"
                                  value={call.value}
                                  onChange={(e) =>
                                    updateCallObject(
                                      index,
                                      "value",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0"
                                  className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#FF3B57]/30"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Data (hex)
                                </label>
                                <input
                                  type="text"
                                  value={call.data}
                                  onChange={(e) =>
                                    updateCallObject(
                                      index,
                                      "data",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0x"
                                  className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#FF3B57]/30"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleEstimateGas}
                      disabled={isAnyTransactionLoading || !currentAccount?.swc}
                      className="w-full bg-gradient-to-r from-[#FF3B57] to-[#FF3B57]/80 text-white py-4 px-6 rounded-lg font-medium hover:from-[#FF3B57]/90 hover:to-[#FF3B57]/70 focus:outline-none focus:ring-2 focus:ring-[#FF3B57]/30 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-3"
                    >
                      {gasEstimationLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Estimating Gas...</span>
                        </>
                      ) : (
                        <>
                          <Coins className="h-5 w-5" />
                          <span>Estimate Gas</span>
                        </>
                      )}
                    </button>

                    {gasEstimationError && (
                      <div className="flex items-center space-x-3 p-4 bg-[#FF3B57]/10 border border-[#FF3B57]/20 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-[#FF3B57] flex-shrink-0" />
                        <span className="text-[#FF3B57] text-sm">
                          {gasEstimationError}
                        </span>
                      </div>
                    )}

                    {gasEstimationResult && (
                      <div className="p-6 bg-gray-975 border border-gray-950 border-l-[#FF3B57]/20 rounded-lg">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-2 bg-[#FF3B57]/10 rounded-full">
                            <CheckCircle className="h-5 w-5 text-[#FF3B57]" />
                          </div>
                          <div>
                            <h4 className="text-gray-200 font-medium text-lg">
                              Gas Estimation Complete!
                            </h4>
                            <p className="text-gray-500 text-sm">
                              Gas costs have been estimated successfully
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                              Gas Estimation Result
                            </label>
                            <div className="bg-gray-950 p-4 rounded-lg border border-gray-900">
                              <pre className="text-sm text-gray-300 font-mono overflow-x-auto">
                                {gasEstimationResult
                                  ? String(
                                      JSON.stringify(
                                        gasEstimationResult,
                                        null,
                                        2
                                      )
                                    )
                                  : ""}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-950 bg-black">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-5 h-5 rounded overflow-hidden ring-1 ring-red-950/30">
              <Image
                src="/gelato-logo.jpg"
                alt="Gelato Logo"
                width={20}
                height={20}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-gray-500 text-sm">
              Gelato Smart Wallet Dev Demo
            </span>
            <div className="ml-auto w-1 h-1 bg-[#FF3B57]/15 rounded-full"></div>
          </div>
          <p className="text-gray-700 text-sm">
            &copy; 2025 Gelato Network. Smart wallet demo for educational
            purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
