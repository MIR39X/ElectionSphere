const REQUIRED_ENV_VARS = ["PRIVATE_KEY", "SEPOLIA_RPC_URL"]

function assertRequiredEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key] || !String(process.env[key]).trim())
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }
}

async function main() {
  assertRequiredEnv()

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("Deploying with account:", deployer.address);
  console.log("Target network:", `${network.name} (chainId: ${network.chainId})`);

  const election = await ethers.deployContract("ElectionManager", [
    "Campus Blockchain Election 2026",
    "Transparent student council election with on-chain verification.",
    deployer.address,
  ]);

  await election.waitForDeployment();

  const contractAddress = await election.getAddress();
  console.log("ElectionManager deployed to:", contractAddress);
  console.log("Set VITE_CONTRACT_ADDRESS to:", contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
