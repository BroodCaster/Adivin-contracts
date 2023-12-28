require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */


module.exports = {
  networks: {
    hardhat: {
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${process.env.API_KEY}`,
      accounts: [`0x59108d3b9c2eb25aa8e2a847bfb2d1e98bb0024541c38820aff2d70d170f47d0`]
    },
    mainnet: {
      url: `https://polygon-mainnet.infura.io/v3/${process.env.API_KEY}`,
      accounts: [`0x59108d3b9c2eb25aa8e2a847bfb2d1e98bb0024541c38820aff2d70d170f47d0`]
    }
  },
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  etherscan: {
    apiKey: "32P94NM9MRA7EK74M3RNBJED5X57UPVQNV"
  },
}
