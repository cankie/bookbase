require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');
const { PRIVATE_KEY } = process.env;

module.exports = {
  solidity: {
    version: '0.8.24',
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  networks: {
    base: {
      url: 'https://mainnet.base.org',
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    },
    base_sepolia: {
      url: 'https://sepolia.base.org',
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: {
      base: process.env.BASESCAN_API_KEY || ''
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org"
        }
      },
      {
        network: "base_sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
        }
      }
    ]
  }
};
