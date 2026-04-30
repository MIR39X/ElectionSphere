# ElectionSphere Sepolia Deployment Guide (Demo Run)

## 1) Prerequisites
- Node.js and npm installed.
- MetaMask wallet with Sepolia ETH in admin and voter test wallets.
- Sepolia RPC URL (Alchemy/Infura/etc).

## 2) Environment Setup
1. Copy `.env.example` to `.env`.
2. Set required values:

```env
PRIVATE_KEY=your_admin_wallet_private_key
SEPOLIA_RPC_URL=https://sepolia-provider-url
ETHERSCAN_API_KEY=optional_for_verify
VITE_CONTRACT_ADDRESS=
VITE_CHAIN_ID=11155111
VITE_CHAIN_NAME=Sepolia
VITE_BLOCK_EXPLORER=https://sepolia.etherscan.io
```

Required for deploy script:
- `PRIVATE_KEY`
- `SEPOLIA_RPC_URL`

## 3) Install and Verify
```bash
npm install
npm run compile
npm test
```

## 4) Deploy to Sepolia
```bash
npm run deploy:sepolia
```

After deploy, copy printed contract address and set:
- `VITE_CONTRACT_ADDRESS=<deployed_address>`

Then restart dev server:
```bash
npm run dev
```

## 5) Demo Rehearsal Script (Small-Scale)
1. Connect admin wallet.
2. Add 2-3 candidates.
3. Grant registrar role to registrar wallet.
4. Registrar registers 2 voter wallets.
5. Admin advances state to `RegistrationClosed`, then `VotingOpen`.
6. Each voter casts one vote.
7. Attempt duplicate vote from one voter (expect failure).
8. Admin advances to `VotingClosed`, then `ResultsPublished`.
9. Verify results page shows totals and leading candidate.

## 6) Demo-Day Fallback
- Keep one backup pre-funded admin wallet.
- Keep one backup Sepolia RPC URL.
- If deployment fails:
  1. Confirm `.env` values.
  2. Confirm wallet has Sepolia ETH.
  3. Retry `npm run deploy:sepolia`.
- If frontend reads old contract:
  1. Recheck `VITE_CONTRACT_ADDRESS`.
  2. Restart `npm run dev`.
