import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
//import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-celo";
require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
    },
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/s-hdjLqITCIC-0yx948QMzzi7v-43Sss",
      accounts: [
        "5acc566e889da617b7f8032ed5f745af8ad695ec2f5421b42b09be517067c051" ??
        "",
      ],
      chainId: 11155111
    },
    polygonMumbai: {
      url: "https://polygon-mumbai.infura.io/v3/7367c86527024f0daa1d03b7b64faa7d",
      accounts: [
        process.env.NEXT_PUBLIC_EVM_PRIVATE_KEY ??
        "",
      ],
      chainId: 80001
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: [
        "5acc566e889da617b7f8032ed5f745af8ad695ec2f5421b42b09be517067c051" ??
        "",
      ],
      chainId: 97
    },
    chiado: {
      url: "https://rpc.chiadochain.net	",
      accounts: [
        "5acc566e889da617b7f8032ed5f745af8ad695ec2f5421b42b09be517067c051" ??
        "",
      ],
      chainId: 10200,
      gasPrice: 11000000000,
    },
    goerli: {
      url: "https://goerli.infura.io/v3/a4812158fbab4a2aaa849e6f4a6dc605",
      accounts: [
        process.env.NEXT_PUBLIC_EVM_PRIVATE_KEY ??
        "",
      ],
      chainId: 5
    },
    avalancheFujiTestnet: {
      url: "https://avalanche-fuji-c-chain.publicnode.com	",
      accounts: [
        process.env.NEXT_PUBLIC_EVM_PRIVATE_KEY ??
        "",
      ],
      chainId: 43113
    },
    alfajores: {
      // can be replaced with the RPC url of your choice.
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: [
        process.env.NEXT_PUBLIC_EVM_PRIVATE_KEY ??
        ""
      ],
  },
  celo: {
      url: "https://forno.celo.org",
      accounts: [
        process.env.NEXT_PUBLIC_EVM_PRIVATE_KEY ??
        ""
      ],
  }
  },
  etherscan: {
    apiKey: {
      polygon: "7RQGFQS84Q5FNNF84YQ61T3MQDJ5Y1EB1B" ?? "",
      polygonMumbai: "7RQGFQS84Q5FNNF84YQ61T3MQDJ5Y1EB1B" ?? "",
      goerli: "1T7UC6DGWNA36AVHC4IGIRRE1MTGCSKE74" ?? "",
      sepolia: "1T7UC6DGWNA36AVHC4IGIRRE1MTGCSKE74" ?? "",
      bscTestnet: "GWKE3MR5JXP1KVY4635YHC8AKI7FI55WK3" ?? "",
      mainnet: "1T7UC6DGWNA36AVHC4IGIRRE1MTGCSKE74" ?? "",
      chiado: "64ffadd2-2ca7-47d5-8f5d-8a91d5e25d27" ?? "",
      avalancheFujiTestnet: "PC8ZV53MFPKCJDDTQSTUVAJ3EYKPUFHDWV" ?? "",
      celo: "81H4WE8MNEDWZZ1S28XSWG8XRVSZBD1SQP" ?? ""
    },
    customChains: [
      {
        network: "celo",
        chainId: 42220,
        urls: {
          apiURL: "https://rpc.ankr.com/celo",
          browserURL: "https://celoscan.io/"
        }
      }
    ]
  },
};

export default config;
