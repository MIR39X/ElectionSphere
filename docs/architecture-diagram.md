# Architecture Diagram

```mermaid
flowchart LR
    U["Registered Voter"] --> M["MetaMask Wallet"]
    A["Election Admin"] --> M2["MetaMask Wallet"]
    R["Registrar"] --> M3["MetaMask Wallet"]

    M --> F["React Frontend (ElectionSphere)"]
    M2 --> F
    M3 --> F

    F --> E["Ethers.js Integration Layer"]
    E --> C["ElectionManager Smart Contract"]
    C --> B["Sepolia Testnet"]

    C --> V["Voter Registry"]
    C --> S["Election State Machine"]
    C --> K["Candidate Records"]
    C --> T["Vote Tally Storage"]

    F --> D["Live Result Dashboard"]
    F --> P["Admin Control Panel"]
    F --> Q["Voter Ballot View"]
```

## Explanation

- MetaMask authenticates users through wallet ownership.
- React frontend offers admin, registrar, and voter workflows.
- Ethers.js handles read/write operations against the deployed contract.
- Smart contract stores election state, candidate list, voter approvals, and vote counts on-chain.
- Result charts render live tallies from blockchain state.
