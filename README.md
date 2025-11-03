# Soroban Escrow Frontend

A clean, modern React frontend for interacting with a Soroban escrow smart contract on Stellar testnet.

## Features

- 🔐 **Freighter Wallet Integration** - Connect and sign transactions with Freighter
- 📝 **Create Escrows** - Lock XLM in smart contract escrows
- 🔍 **View Escrows** - Query escrow details from the contract
- ✅ **Release & Refund** - Manage escrow completions with proper authorization
- 🎨 **Beautiful UI** - Modern, responsive design with smooth animations

## Prerequisites

1. **Freighter Wallet**: Install the [Freighter browser extension](https://www.freighter.app/)
2. **Testnet XLM**: Fund your testnet account using [Stellar Friendbot](https://laboratory.stellar.org/#account-creator?network=test)
3. **Contract ID**: You need a deployed Soroban escrow contract on testnet

## Setup

### 1. Clone and Install

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SOROBAN_RPC=https://soroban-testnet.stellar.org
VITE_CONTRACT_ID=YOUR_DEPLOYED_CONTRACT_ID_HERE
VITE_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

**Important**: Replace `YOUR_DEPLOYED_CONTRACT_ID_HERE` with your actual contract ID.

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:8080` to see the app.

## Usage Guide

### Connect Wallet

1. Click "Connect Freighter" button
2. Approve the connection in Freighter popup
3. Your public key and XLM balance will display

### Create an Escrow

1. Enter a unique Escrow ID (e.g., `escrow-001`)
2. Enter the receiver's Stellar public key (56 characters, starts with `G`)
3. Enter the amount in XLM
4. Click "Create Escrow"
5. Sign the transaction in Freighter
6. Wait for confirmation and view the transaction on Stellar Expert

### View an Escrow

1. Enter the Escrow ID in the "View Escrow" section
2. Click "Search Escrow"
3. View escrow details including sender, receiver, amount, and status

### Release or Refund

1. Search for an escrow you created
2. Click "Release" to complete the escrow (receiver gets funds)
3. Or click "Refund" to return funds to sender
4. Sign the transaction in Freighter

**Note**: Only the sender can release or refund an escrow.

## Contract Functions

The frontend interacts with these contract functions:

- `create(id, sender, receiver, amount)` - Create a new escrow
- `get(id)` - Read escrow details
- `release(id, caller)` - Mark escrow as released (sender only)
- `refund(id, caller)` - Refund the escrow (sender only)

## Error Handling

The app handles these contract errors gracefully:

- **NotFound**: Escrow doesn't exist
- **AlreadyExists**: Escrow ID already in use
- **AlreadyCompleted**: Escrow already finalized
- **NotSender**: Only the sender can perform this action

## Testing Checklist

- [ ] Connect Freighter wallet successfully
- [ ] View account balance correctly
- [ ] Create escrow with valid inputs
- [ ] Search and view escrow details
- [ ] Release escrow as sender
- [ ] Refund escrow as sender
- [ ] Verify "NotSender" error when non-sender tries to release/refund
- [ ] Verify "AlreadyCompleted" error on completed escrows
- [ ] Check transaction links open Stellar Expert correctly

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Stellar SDK** - Blockchain interaction
- **Freighter API** - Wallet integration
- **React Query** - Data fetching
- **Sonner** - Toast notifications

## Project Structure

```
src/
├── components/
│   ├── WalletConnectButton.tsx  # Wallet connection UI
│   ├── EscrowForm.tsx           # Create escrow form
│   ├── EscrowCard.tsx           # Display escrow details
│   └── EscrowList.tsx           # Search and view escrows
├── lib/
│   └── soroban.ts               # Contract interaction helpers
└── pages/
    └── Index.tsx                # Main page
```

## Troubleshooting

### Freighter Not Detected
- Ensure Freighter extension is installed and unlocked
- Refresh the page after installing Freighter

### Transaction Failures
- Check you have sufficient XLM for fees
- Verify the contract ID is correct in `.env`
- Check console for detailed error messages

### Escrow Not Found
- Verify the escrow ID is correct
- Ensure the escrow was successfully created (check transaction)

### Signature Errors
- Make sure you're signing with the correct account
- Check that your account has funded the testnet account

## Development

Built with Lovable at [https://lovable.dev](https://lovable.dev)

## License

MIT
