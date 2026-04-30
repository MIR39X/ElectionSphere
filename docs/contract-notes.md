# ElectionSphere Contract Notes (Demo Scope)

## Contract
- `ElectionManager.sol`
- Solidity `0.8.28`
- Access control: OpenZeppelin `AccessControl`

## Roles
- `DEFAULT_ADMIN_ROLE`: root role holder.
- `ELECTION_ADMIN_ROLE`: manages lifecycle, candidates, and registrar access.
- `REGISTRAR_ROLE`: registers and removes voters (plus election admin can do registrar actions).

## Election States
1. `Setup`
2. `RegistrationClosed`
3. `VotingOpen`
4. `VotingClosed`
5. `ResultsPublished`

State transitions are strictly sequential. Any skip/backward/repeat transition is rejected.

## Core Validations (Demo-Critical)
- Candidate names cannot be empty or whitespace-only.
- Registrar and voter management rejects `address(0)`.
- Duplicate voter registration is rejected.
- Unregistered wallets cannot vote.
- A wallet can vote only once.
- Inactive candidates cannot receive votes.
- Candidate and voter mutations are blocked once voting opens or later.

## Voter Removal Rules
- Voter removal is allowed only before `VotingOpen`.
- Removing `address(0)` is rejected.
- Removing non-registered wallets is rejected.
- Removing a wallet that already voted is rejected.

## Known Demo Limitations
- Votes are publicly auditable on-chain (not anonymous voting).
- No proxy upgrade pattern (single immutable deployment per demo run).
- Role governance is single-admin by default unless you transfer roles manually.
