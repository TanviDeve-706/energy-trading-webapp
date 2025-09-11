const hre = require("hardhat");

async function main() {
  console.log("Deploying EnergyTrading contract...");

  // Get the ContractFactory
  const EnergyTrading = await hre.ethers.getContractFactory("EnergyTrading");

  // Deploy the contract
  const energyTrading = await EnergyTrading.deploy();

  await energyTrading.waitForDeployment();

  const address = await energyTrading.getAddress();
  console.log("EnergyTrading deployed to:", address);

  // Verify the contract on Etherscan (if on testnet/mainnet)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await energyTrading.deploymentTransaction().wait(6);

    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan");
    } catch (error) {
      console.log("Error verifying contract:", error.message);
    }
  }

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: address,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    `./deployments/${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to:", `./deployments/${hre.network.name}.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
