# Dev 1 Instructions: Smart Contract and Blockchain Backend

## Role

You are responsible only for the blockchain side of ElectionSphere.

Your focus is:

- Solidity smart contract logic
- Hardhat tests
- Deployment scripts
- Contract/deployment documentation

Do not edit frontend files.

## Allowed Files and Folders

You may edit only:

```text
contracts/
test/
scripts/
docs/contract-notes.md
docs/deployment-guide.md
hardhat.config.cjs
.env.example
```

## Do Not Touch

Do not edit:

```text
src/
public/
index.html
eslint.config.js
README.md
package.json
package-lock.json
```

If you need a frontend change, write it down and give it to Dev 2.

## Tasks

1. Improve smart contract validation
   - Reject empty candidate names.
   - Reject invalid wallet addresses.
   - Review voter removal rules.
   - Ensure only valid election state transitions are allowed.

2. Expand contract tests
   - Test non-admin access failures.
   - Test registrar grant and revoke behavior.
   - Test duplicate voter registration.
   - Test inactive candidate voting.
   - Test invalid state transitions.
   - Test result publishing flow.

3. Improve deployment workflow
   - Review `scripts/deploy.cjs`.
   - Document Sepolia deployment steps.
   - Document required `.env` variables.

4. Add documentation
   - Create `docs/contract-notes.md`.
   - Create `docs/deployment-guide.md`.
   - Explain roles, states, deployment, and known limitations.

## Commands

Use these commands for your work:

```bash
npm run compile
npm test
npm run deploy:sepolia
```

## Commit Rules

Use short, clear commit messages:

```text
Add candidate validation
Expand election state tests
Document Sepolia deployment
```

## Strict Rule

Do not edit Dev 2 files. No exceptions without team agreement.
