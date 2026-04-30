# Demo Script

## 1. Opening

"This project is ElectionSphere, a blockchain-based voting system deployed on Ethereum Sepolia. It provides secure election management, wallet-based voting, and live result tallying."

## 2. Show Admin Login

- Connect MetaMask with the admin wallet
- Explain that wallet ownership identifies the user
- Show admin role indicators in the dashboard

## 3. Add Candidates

- Open the candidate management panel
- Add candidate name, party, and manifesto
- Submit transaction through MetaMask
- Explain that candidate data is stored on-chain

## 4. Register Voters

- Use registrar/admin wallet
- Register approved voter addresses
- Mention that only registered wallets can vote

## 5. Change Election State

- Move from `Setup` to `Registration Closed`
- Move from `Registration Closed` to `Voting Open`
- Explain why lifecycle control prevents invalid actions

## 6. Cast a Vote

- Switch to a registered voter wallet
- Connect MetaMask
- Show eligibility status
- Vote for one candidate
- Point out that the same wallet cannot vote again

## 7. Show Live Results

- Return to dashboard
- Show vote chart and total votes
- Explain that tally updates instantly after each confirmed transaction

## 8. Test Cases

- Open `test/ElectionManager.js`
- Mention duplicate-vote prevention, state transition checks, and role testing

## 9. Deployment

- Show `.env` configuration
- Mention Sepolia deployment command
- Show deployed contract address and explorer link

## 10. Closing

"ElectionSphere combines transparency, access control, blockchain immutability, and a professional user interface, making it a strong final-year blockchain project."
