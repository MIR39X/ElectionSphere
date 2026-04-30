// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract ElectionManager is AccessControl {
    bytes32 public constant ELECTION_ADMIN_ROLE = keccak256("ELECTION_ADMIN_ROLE");
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    enum ElectionState {
        Setup,
        RegistrationClosed,
        VotingOpen,
        VotingClosed,
        ResultsPublished
    }

    struct Candidate {
        uint256 id;
        string name;
        string party;
        string manifesto;
        string imageUri;
        uint256 voteCount;
        bool active;
    }

    string public electionName;
    string public electionDescription;
    ElectionState public currentState;
    uint256 public candidateCount;
    uint256 public registeredVoterCount;
    uint256 public totalVotesCast;

    mapping(uint256 => Candidate) private candidates;
    mapping(address => bool) public registeredVoters;
    mapping(address => bool) public hasVoted;

    event ElectionStateUpdated(ElectionState indexed previousState, ElectionState indexed newState);
    event CandidateCreated(uint256 indexed candidateId, string name, string party);
    event CandidateUpdated(uint256 indexed candidateId, string name, string party, bool active);
    event VoterRegistered(address indexed voter);
    event VoterRemoved(address indexed voter);
    event VoteCast(address indexed voter, uint256 indexed candidateId, uint256 newVoteCount);
    event ElectionMetadataUpdated(string electionName, string electionDescription);

    error InvalidState(ElectionState requiredState, ElectionState currentState);
    error CandidateNotFound(uint256 candidateId);
    error CandidateInactive(uint256 candidateId);
    error DuplicateRegistration(address voter);
    error VoterNotRegistered(address voter);
    error VoterAlreadyVoted(address voter);
    error DuplicateVote(address voter);
    error ZeroAddress();
    error InvalidTransition(ElectionState currentState, ElectionState requestedState);
    error EmptyCandidateName();
    error ActionNotAllowedInState(ElectionState currentState);

    constructor(string memory initialName, string memory initialDescription, address initialAdmin) {
        if (initialAdmin == address(0)) {
            revert ZeroAddress();
        }

        electionName = initialName;
        electionDescription = initialDescription;
        currentState = ElectionState.Setup;

        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(ELECTION_ADMIN_ROLE, initialAdmin);
        _grantRole(REGISTRAR_ROLE, initialAdmin);
    }

    modifier onlyElectionAdmin() {
        _checkRole(ELECTION_ADMIN_ROLE, msg.sender);
        _;
    }

    modifier onlyRegistrar() {
        if (!hasRole(REGISTRAR_ROLE, msg.sender) && !hasRole(ELECTION_ADMIN_ROLE, msg.sender)) {
            revert AccessControlUnauthorizedAccount(msg.sender, REGISTRAR_ROLE);
        }
        _;
    }

    modifier inState(ElectionState requiredState) {
        if (currentState != requiredState) {
            revert InvalidState(requiredState, currentState);
        }
        _;
    }

    function _isWhitespace(bytes1 char) private pure returns (bool) {
        return char == 0x20 || char == 0x09 || char == 0x0A || char == 0x0D;
    }

    function _isBlank(string calldata value) private pure returns (bool) {
        bytes calldata raw = bytes(value);
        if (raw.length == 0) {
            return true;
        }

        for (uint256 i = 0; i < raw.length; i++) {
            if (!_isWhitespace(raw[i])) {
                return false;
            }
        }

        return true;
    }

    function _ensureMutableSetupWindow() private view {
        if (
            currentState == ElectionState.VotingOpen ||
            currentState == ElectionState.VotingClosed ||
            currentState == ElectionState.ResultsPublished
        ) {
            revert ActionNotAllowedInState(currentState);
        }
    }

    function updateElectionMetadata(string calldata name, string calldata description) external onlyElectionAdmin {
        electionName = name;
        electionDescription = description;
        emit ElectionMetadataUpdated(name, description);
    }

    function grantRegistrar(address account) external onlyElectionAdmin {
        if (account == address(0)) {
            revert ZeroAddress();
        }
        _grantRole(REGISTRAR_ROLE, account);
    }

    function revokeRegistrar(address account) external onlyElectionAdmin {
        if (account == address(0)) {
            revert ZeroAddress();
        }
        _revokeRole(REGISTRAR_ROLE, account);
    }

    function addCandidate(
        string calldata name,
        string calldata party,
        string calldata manifesto,
        string calldata imageUri
    ) external onlyElectionAdmin {
        if (_isBlank(name)) {
            revert EmptyCandidateName();
        }
        _ensureMutableSetupWindow();

        uint256 newId = ++candidateCount;
        candidates[newId] = Candidate({
            id: newId,
            name: name,
            party: party,
            manifesto: manifesto,
            imageUri: imageUri,
            voteCount: 0,
            active: true
        });

        emit CandidateCreated(newId, name, party);
    }

    function updateCandidate(
        uint256 candidateId,
        string calldata name,
        string calldata party,
        string calldata manifesto,
        string calldata imageUri,
        bool active
    ) external onlyElectionAdmin {
        if (_isBlank(name)) {
            revert EmptyCandidateName();
        }
        _ensureMutableSetupWindow();

        Candidate storage candidate = candidates[candidateId];
        if (candidate.id == 0) {
            revert CandidateNotFound(candidateId);
        }

        candidate.name = name;
        candidate.party = party;
        candidate.manifesto = manifesto;
        candidate.imageUri = imageUri;
        candidate.active = active;

        emit CandidateUpdated(candidateId, name, party, active);
    }

    function registerVoter(address voter) external onlyRegistrar {
        if (voter == address(0)) {
            revert ZeroAddress();
        }
        _ensureMutableSetupWindow();
        if (registeredVoters[voter]) {
            revert DuplicateRegistration(voter);
        }

        registeredVoters[voter] = true;
        registeredVoterCount += 1;
        emit VoterRegistered(voter);
    }

    function removeVoter(address voter) external onlyRegistrar {
        if (voter == address(0)) {
            revert ZeroAddress();
        }
        _ensureMutableSetupWindow();
        if (!registeredVoters[voter]) {
            revert VoterNotRegistered(voter);
        }
        if (hasVoted[voter]) {
            revert VoterAlreadyVoted(voter);
        }

        registeredVoters[voter] = false;
        registeredVoterCount -= 1;
        emit VoterRemoved(voter);
    }

    function advanceState(ElectionState newState) external onlyElectionAdmin {
        ElectionState previousState = currentState;

        if (uint8(newState) != uint8(previousState) + 1) {
            revert InvalidTransition(previousState, newState);
        }

        if (newState == ElectionState.RegistrationClosed && candidateCount == 0) {
            revert CandidateNotFound(0);
        }

        currentState = newState;
        emit ElectionStateUpdated(previousState, newState);
    }

    function castVote(uint256 candidateId) external inState(ElectionState.VotingOpen) {
        if (!registeredVoters[msg.sender]) {
            revert VoterNotRegistered(msg.sender);
        }
        if (hasVoted[msg.sender]) {
            revert DuplicateVote(msg.sender);
        }

        Candidate storage candidate = candidates[candidateId];
        if (candidate.id == 0) {
            revert CandidateNotFound(candidateId);
        }
        if (!candidate.active) {
            revert CandidateInactive(candidateId);
        }

        hasVoted[msg.sender] = true;
        candidate.voteCount += 1;
        totalVotesCast += 1;

        emit VoteCast(msg.sender, candidateId, candidate.voteCount);
    }

    function getCandidate(uint256 candidateId) external view returns (Candidate memory) {
        Candidate memory candidate = candidates[candidateId];
        if (candidate.id == 0) {
            revert CandidateNotFound(candidateId);
        }
        return candidate;
    }

    function getCandidates() external view returns (Candidate[] memory) {
        Candidate[] memory allCandidates = new Candidate[](candidateCount);
        for (uint256 i = 1; i <= candidateCount; i++) {
            allCandidates[i - 1] = candidates[i];
        }
        return allCandidates;
    }

    function getLiveResults() external view returns (Candidate[] memory, uint256) {
        return (this.getCandidates(), totalVotesCast);
    }
}
