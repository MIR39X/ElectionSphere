# ElectionSphere

> A modern blockchain voting dApp for transparent campus elections.

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=111)
![Solidity](https://img.shields.io/badge/Solidity-0.8.28-363636?style=for-the-badge&logo=solidity)
![Hardhat](https://img.shields.io/badge/Hardhat-2.28-F7DF1E?style=for-the-badge)
![Sepolia](https://img.shields.io/badge/Network-Sepolia-627EEA?style=for-the-badge&logo=ethereum)

ElectionSphere combines a polished React dashboard with a Solidity smart contract that manages candidates, voter registration, election phases, and one-wallet-one-vote enforcement.

## Course Project

This repository contains our project proposal implementation for the **Blockchain and Cryptocurrency** course.

| Student | ID |
| --- | --- |
| Arsalan Mir | 23K2085 |
| Ahmed Raza | 22K4780 |

Project proposal title: **Blockchain-based Secure Voting System**

## Features

- **Wallet voting**: MetaMask-based voter access with Sepolia support
- **Role control**: Admin and registrar permissions using OpenZeppelin AccessControl
- **Election lifecycle**: Setup, registration close, voting open, voting close, and results publish phases
- **Candidate management**: Add nominees and track active candidates
- **Voter registry**: Register approved wallet addresses before voting opens
- **Live dashboard**: Election status, turnout, vote totals, activity feed, and results chart
- **Smart contract tests**: Hardhat test coverage for core voting rules

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | React, Vite, React Router, Recharts |
| Blockchain | Solidity, Hardhat, Ethers.js |
| Security | OpenZeppelin AccessControl |
| Network | Ethereum Sepolia |

## Project Structure

```text
contracts/   Solidity smart contracts
scripts/     Deployment scripts
src/         React frontend
test/        Hardhat contract tests
docs/        Report, architecture, and demo notes
public/      Static browser assets
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

Compile and test contracts:

```bash
npm run compile
npm test
```

## Environment Setup

Copy `.env.example` to `.env` and configure:

```env
PRIVATE_KEY=
SEPOLIA_RPC_URL=
ETHERSCAN_API_KEY=
VITE_CONTRACT_ADDRESS=
VITE_CHAIN_ID=11155111
VITE_CHAIN_NAME=Sepolia
VITE_BLOCK_EXPLORER=https://sepolia.etherscan.io
```

Deploy to Sepolia:

```bash
npm run deploy:sepolia
```

After deployment, paste the contract address into `VITE_CONTRACT_ADDRESS` and restart the Vite dev server.

## Security Notes

ElectionSphere enforces voter eligibility and duplicate-vote prevention on-chain. Wallet transactions are public on the blockchain, so this version is designed for transparent elections and academic demonstrations, not anonymous production voting.
