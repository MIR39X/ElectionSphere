# Repository Guidelines

## Project Structure & Module Organization

This repository contains ElectionSphere, a React and Hardhat blockchain voting dApp.

- `src/` holds the Vite frontend. Components live in `src/components/`, hooks in `src/hooks/`, wallet and contract helpers in `src/lib/`, mock data in `src/data/`, styles in `src/styles/`, and static frontend assets in `src/assets/`.
- `contracts/` contains Solidity smart contracts, currently `ElectionManager.sol`.
- `test/` contains Hardhat contract tests, using `.cjs` files such as `ElectionManager.cjs`.
- `scripts/` contains deployment scripts, including `deploy.cjs`.
- `docs/` contains submission/reporting material. `public/` contains browser-served icons and favicons.
- Generated folders such as `artifacts/`, `cache/`, `.hardhat-data/`, `dist/`, and `node_modules/` should not be edited manually.

## Build, Test, and Development Commands

- `npm install` installs frontend, Hardhat, and Solidity tooling.
- `npm run dev` starts the Vite development server.
- `npm run build` creates the production frontend bundle in `dist/`.
- `npm run preview` serves the production build locally.
- `npm run compile` compiles Solidity contracts with Hardhat using the repo-local Hardhat data directory.
- `npm test` runs Hardhat tests from `test/`.
- `npm run lint` runs ESLint across JavaScript and JSX files.
- `npm run deploy:sepolia` deploys `scripts/deploy.cjs` to Sepolia. Configure `.env` first.

## Coding Style & Naming Conventions

Use ES modules for frontend code and CommonJS for Hardhat config, scripts, and tests. Keep React components in PascalCase (`AdminPanel.jsx`), hooks in camelCase beginning with `use` (`useElectionData.js`), and utility modules in lower camelCase (`contract.js`). Follow the existing two-space indentation style, omit semicolons in JS/JSX, and prefer focused components over large mixed-purpose files. Solidity contracts should use PascalCase contract names and descriptive function names.

## Testing Guidelines

Contract coverage is handled with Hardhat, Mocha, and Chai. Place tests in `test/` and name them after the contract or feature under test, for example `ElectionManager.cjs`. Add or update tests for role changes, election state transitions, voter registration, voting restrictions, and tally behavior whenever contract logic changes. Run `npm test` before submitting contract changes and `npm run lint` before frontend changes.

## Commit & Pull Request Guidelines

Recent commits use short imperative summaries such as `Organize root markdown files into assistant-workspace`. Keep commit subjects concise and action-oriented. Pull requests should include a clear description, test commands run, linked issues or assignment requirements, and screenshots or short clips for UI changes. Mention any Sepolia deployment details, updated contract addresses, or required `.env` changes.

## Security & Configuration Tips

Copy `.env.example` to `.env` and keep private keys, RPC URLs, and API keys out of git. After deploying, update `VITE_CONTRACT_ADDRESS` and restart Vite. Review contract permission changes carefully because `ElectionManager.sol` uses role-based access control.
