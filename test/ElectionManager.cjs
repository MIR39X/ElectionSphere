const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ElectionManager", function () {
  async function deployFixture() {
    const [admin, registrar, voterOne, voterTwo, outsider] = await ethers.getSigners();
    const election = await ethers.deployContract("ElectionManager", [
      "University Election",
      "Blockchain secured campus election",
      admin.address,
    ]);

    await election.waitForDeployment();

    return { election, admin, registrar, voterOne, voterTwo, outsider };
  }

  it("assigns bootstrap roles to the initial admin", async function () {
    const { election, admin } = await deployFixture();

    expect(await election.hasRole(await election.DEFAULT_ADMIN_ROLE(), admin.address)).to.equal(true);
    expect(await election.hasRole(await election.ELECTION_ADMIN_ROLE(), admin.address)).to.equal(true);
  });

  it("lets admin manage candidates and registrars before voting opens", async function () {
    const { election, admin, registrar } = await deployFixture();

    await election.connect(admin).grantRegistrar(registrar.address);
    await election.connect(admin).addCandidate("Ayesha Noor", "Unity Front", "Digital campus services", "ipfs://candidate-1");
    const candidate = await election.getCandidate(1);

    expect(candidate.name).to.equal("Ayesha Noor");
    expect(await election.hasRole(await election.REGISTRAR_ROLE(), registrar.address)).to.equal(true);
  });

  it("allows only registered wallets to vote and only once", async function () {
    const { election, admin, registrar, voterOne, voterTwo } = await deployFixture();

    await election.connect(admin).grantRegistrar(registrar.address);
    await election.connect(admin).addCandidate("Ayesha Noor", "Unity Front", "Digital campus services", "ipfs://candidate-1");
    await election.connect(registrar).registerVoter(voterOne.address);
    await election.connect(registrar).registerVoter(voterTwo.address);
    await election.connect(admin).advanceState(1);
    await election.connect(admin).advanceState(2);

    await election.connect(voterOne).castVote(1);

    await expect(election.connect(voterOne).castVote(1)).to.be.reverted;
    await election.connect(voterTwo).castVote(1);

    const candidate = await election.getCandidate(1);
    expect(candidate.voteCount).to.equal(2n);
    expect(await election.totalVotesCast()).to.equal(2n);
  });

  it("rejects unregistered voters", async function () {
    const { election, admin, outsider } = await deployFixture();

    await election.connect(admin).addCandidate("Bilal Khan", "Progress Bloc", "Transport and safety", "ipfs://candidate-2");
    await election.connect(admin).advanceState(1);
    await election.connect(admin).advanceState(2);

    await expect(election.connect(outsider).castVote(1)).to.be.reverted;
  });

  it("enforces sequential state transitions", async function () {
    const { election, admin } = await deployFixture();

    await election.connect(admin).addCandidate("Maya Ali", "Future Voice", "Scholarship reform", "ipfs://candidate-3");

    await expect(election.connect(admin).advanceState(2)).to.be.reverted;

    await election.connect(admin).advanceState(1);
    await election.connect(admin).advanceState(2);
    await election.connect(admin).advanceState(3);
    await election.connect(admin).advanceState(4);

    expect(await election.currentState()).to.equal(4n);
  });
});
