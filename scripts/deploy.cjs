async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with account:", deployer.address);

  const election = await ethers.deployContract("ElectionManager", [
    "Campus Blockchain Election 2026",
    "Transparent student council election with on-chain verification.",
    deployer.address,
  ]);

  await election.waitForDeployment();

  console.log("ElectionManager deployed to:", await election.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
