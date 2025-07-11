# Smart Wallet Demo

A Next.js application demonstrating Gelato's Smart Wallet SDK capabilities. This demo showcases how to create and interact with different types of smart accounts and execute various transaction types.

## Features

- **Smart Account Creation**: Support for Gelato, Kernel, and Safe smart accounts
- **Transaction Types**: Sponsored, ERC20 gas, and native gas transactions
- **Gas Estimation**: Built-in gas estimation functionality
- **Interactive UI**: Web interface for testing smart wallet operations

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Smart Wallet**: Gelato Smart Wallet SDK
- **Blockchain**: Viem for Ethereum interactions
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Create .env.local file
NEXT_PUBLIC_GELATO_API_KEY=your_gelato_api_key
PRIVATE_KEY=your_private_key
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) to view the demo.

## Smart Account Types

- **Gelato**: Standard Gelato smart account
- **Kernel**: Kernel smart account with EIP-7702 support
- **Safe**: Safe smart account (version 1.4.1)

## Transaction Types

- **Sponsored**: Gasless transactions sponsored by Gelato
- **ERC20 Gas**: Transactions paid with ERC20 tokens
- **Native Gas**: Standard gas-paid transactions

## Examples

The project includes example implementations in `src/smartwallet-examples/`:
- `create-smart-account.ts` - Smart account creation
- `sponsored-txn.ts` - Sponsored transactions
- `erc20-gas-txn.ts` - ERC20 gas transactions
- `native-gas-txn.ts` - Native gas transactions
- `estimate-gas.ts` - Gas estimation

## Learn More

- [Gelato Smart Wallet Documentation](https://docs.gelato.cloud/Smart-Wallets)
- [Next.js Documentation](https://nextjs.org/docs)
