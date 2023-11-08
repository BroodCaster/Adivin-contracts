const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with address: ", deployer.address);
  const Contract = await hre.ethers.getContractFactory("AdivinFactory");
  const contract = await Contract.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log("Contract address: ", address);

  await hre.run("verify:verify", {
    address: address,
    constructorArguments: [""]
  });
}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});