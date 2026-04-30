const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("ElectionManager", function () {
  async function deployFixture() {
    const [admin, registrar, voterOne, voterTwo, outsider] = await ethers.getSigners()
    const election = await ethers.deployContract("ElectionManager", [
      "University Election",
      "Blockchain secured campus election",
      admin.address,
    ])
    await election.waitForDeployment()

    return { election, admin, registrar, voterOne, voterTwo, outsider }
  }

  async function seedVotingOpenElection(election, admin, registrar, voterOne, voterTwo) {
    await election.connect(admin).grantRegistrar(registrar.address)
    await election.connect(admin).addCandidate("Ayesha Noor", "Unity Front", "Digital campus services", "ipfs://candidate-1")
    await election.connect(admin).addCandidate("Bilal Khan", "Progress Bloc", "Transport and safety", "ipfs://candidate-2")
    await election.connect(registrar).registerVoter(voterOne.address)
    await election.connect(registrar).registerVoter(voterTwo.address)
    await election.connect(admin).advanceState(1)
    await election.connect(admin).advanceState(2)
  }

  it("assigns bootstrap roles to the initial admin", async function () {
    const { election, admin } = await deployFixture()

    expect(await election.hasRole(await election.DEFAULT_ADMIN_ROLE(), admin.address)).to.equal(true)
    expect(await election.hasRole(await election.ELECTION_ADMIN_ROLE(), admin.address)).to.equal(true)
    expect(await election.hasRole(await election.REGISTRAR_ROLE(), admin.address)).to.equal(true)
  })

  it("rejects non-admin candidate and state actions", async function () {
    const { election, outsider } = await deployFixture()

    await expect(
      election.connect(outsider).addCandidate("Ayesha Noor", "Unity Front", "Digital campus services", "ipfs://candidate-1")
    )
      .to.be.revertedWithCustomError(election, "AccessControlUnauthorizedAccount")
      .withArgs(outsider.address, await election.ELECTION_ADMIN_ROLE())

    await expect(election.connect(outsider).advanceState(1))
      .to.be.revertedWithCustomError(election, "AccessControlUnauthorizedAccount")
      .withArgs(outsider.address, await election.ELECTION_ADMIN_ROLE())
  })

  it("rejects empty or whitespace candidate names", async function () {
    const { election, admin } = await deployFixture()

    await expect(
      election.connect(admin).addCandidate("", "Unity Front", "Digital campus services", "ipfs://candidate-1")
    ).to.be.revertedWithCustomError(election, "EmptyCandidateName")

    await expect(
      election.connect(admin).addCandidate("   \n\t  ", "Unity Front", "Digital campus services", "ipfs://candidate-1")
    ).to.be.revertedWithCustomError(election, "EmptyCandidateName")
  })

  it("supports registrar grant and revoke behavior", async function () {
    const { election, admin, registrar, voterOne } = await deployFixture()

    await election.connect(admin).grantRegistrar(registrar.address)
    expect(await election.hasRole(await election.REGISTRAR_ROLE(), registrar.address)).to.equal(true)

    await election.connect(registrar).registerVoter(voterOne.address)
    expect(await election.registeredVoters(voterOne.address)).to.equal(true)

    await election.connect(admin).revokeRegistrar(registrar.address)
    expect(await election.hasRole(await election.REGISTRAR_ROLE(), registrar.address)).to.equal(false)

    await expect(election.connect(registrar).registerVoter(admin.address))
      .to.be.revertedWithCustomError(election, "AccessControlUnauthorizedAccount")
      .withArgs(registrar.address, await election.REGISTRAR_ROLE())
  })

  it("enforces zero address checks for registrar and voter actions", async function () {
    const { election, admin } = await deployFixture()

    await expect(election.connect(admin).grantRegistrar(ethers.ZeroAddress)).to.be.revertedWithCustomError(
      election,
      "ZeroAddress"
    )
    await expect(election.connect(admin).revokeRegistrar(ethers.ZeroAddress)).to.be.revertedWithCustomError(
      election,
      "ZeroAddress"
    )
    await expect(election.connect(admin).registerVoter(ethers.ZeroAddress)).to.be.revertedWithCustomError(
      election,
      "ZeroAddress"
    )
    await expect(election.connect(admin).removeVoter(ethers.ZeroAddress)).to.be.revertedWithCustomError(
      election,
      "ZeroAddress"
    )
  })

  it("rejects duplicate voter registration", async function () {
    const { election, admin, registrar, voterOne } = await deployFixture()

    await election.connect(admin).grantRegistrar(registrar.address)
    await election.connect(registrar).registerVoter(voterOne.address)

    await expect(election.connect(registrar).registerVoter(voterOne.address))
      .to.be.revertedWithCustomError(election, "DuplicateRegistration")
      .withArgs(voterOne.address)
  })

  it("allows only registered wallets to vote and only once", async function () {
    const { election, admin, registrar, voterOne, voterTwo } = await deployFixture()

    await seedVotingOpenElection(election, admin, registrar, voterOne, voterTwo)
    await election.connect(voterOne).castVote(1)

    await expect(election.connect(voterOne).castVote(1))
      .to.be.revertedWithCustomError(election, "DuplicateVote")
      .withArgs(voterOne.address)

    await election.connect(voterTwo).castVote(1)

    const candidate = await election.getCandidate(1)
    expect(candidate.voteCount).to.equal(2n)
    expect(await election.totalVotesCast()).to.equal(2n)
  })

  it("rejects unregistered voters", async function () {
    const { election, admin, outsider } = await deployFixture()

    await election.connect(admin).addCandidate("Bilal Khan", "Progress Bloc", "Transport and safety", "ipfs://candidate-2")
    await election.connect(admin).advanceState(1)
    await election.connect(admin).advanceState(2)

    await expect(election.connect(outsider).castVote(1))
      .to.be.revertedWithCustomError(election, "VoterNotRegistered")
      .withArgs(outsider.address)
  })

  it("rejects voting for inactive candidates", async function () {
    const { election, admin, registrar, voterOne, voterTwo } = await deployFixture()

    await election.connect(admin).grantRegistrar(registrar.address)
    await election.connect(admin).addCandidate("Ayesha Noor", "Unity Front", "Digital campus services", "ipfs://candidate-1")
    await election.connect(admin).addCandidate("Bilal Khan", "Progress Bloc", "Transport and safety", "ipfs://candidate-2")
    await election
      .connect(admin)
      .updateCandidate(2, "Bilal Khan", "Progress Bloc", "Transport and safety", "ipfs://candidate-2", false)
    await election.connect(registrar).registerVoter(voterOne.address)
    await election.connect(registrar).registerVoter(voterTwo.address)
    await election.connect(admin).advanceState(1)
    await election.connect(admin).advanceState(2)

    await expect(election.connect(voterOne).castVote(2))
      .to.be.revertedWithCustomError(election, "CandidateInactive")
      .withArgs(2)
  })

  it("enforces sequential state transitions", async function () {
    const { election, admin } = await deployFixture()

    await election.connect(admin).addCandidate("Maya Ali", "Future Voice", "Scholarship reform", "ipfs://candidate-3")

    await expect(election.connect(admin).advanceState(2))
      .to.be.revertedWithCustomError(election, "InvalidTransition")
      .withArgs(0, 2)

    await election.connect(admin).advanceState(1)
    await election.connect(admin).advanceState(2)
    await election.connect(admin).advanceState(3)
    await election.connect(admin).advanceState(4)

    expect(await election.currentState()).to.equal(4n)
  })

  it("blocks candidate/voter mutations when setup window is closed", async function () {
    const { election, admin, registrar, voterOne, voterTwo } = await deployFixture()

    await seedVotingOpenElection(election, admin, registrar, voterOne, voterTwo)

    await expect(
      election.connect(admin).addCandidate("Late Entry", "Late Bloc", "Post opening candidate", "ipfs://late")
    )
      .to.be.revertedWithCustomError(election, "ActionNotAllowedInState")
      .withArgs(2)

    await expect(election.connect(registrar).registerVoter(admin.address))
      .to.be.revertedWithCustomError(election, "ActionNotAllowedInState")
      .withArgs(2)
  })

  it("supports complete results publishing flow", async function () {
    const { election, admin, registrar, voterOne, voterTwo } = await deployFixture()

    await seedVotingOpenElection(election, admin, registrar, voterOne, voterTwo)
    await election.connect(voterOne).castVote(1)
    await election.connect(voterTwo).castVote(2)

    await election.connect(admin).advanceState(3)
    await election.connect(admin).advanceState(4)

    expect(await election.currentState()).to.equal(4n)

    const [candidates, totalVotes] = await election.getLiveResults()
    expect(candidates.length).to.equal(2)
    expect(totalVotes).to.equal(2n)
  })
})
