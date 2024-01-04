const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with address: ", deployer.address);
  const Contract = await hre.ethers.getContractFactory("AdivinFactory");
  const contract = await Contract.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log("AdivinFactory contract address: ", address);

  const EscrowContract = await hre.ethers.getContractFactory("Escrow");
  const escrowContract = await EscrowContract.deploy();

  await escrowContract.waitForDeployment();
  const escrowAddress = await escrowContract.getAddress();
  console.log("Escrow contract address: ", escrowAddress);

  await hre.run("verify:verify", {
    address: address,
    constructorArguments: []
  });

  await hre.run("verify:verify", {
    address: escrowAddress,
    constructorArguments: []
  });
}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});