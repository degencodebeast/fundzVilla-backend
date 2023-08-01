import { ethers, Wallet, getDefaultProvider } from "ethers";
//import { wallet } from "../config/constants";
require("dotenv").config();
import { CampaignManager__factory } from "../typechain-types";
//const rpc = "https://alfajores-forno.celo-testnet.org";
const privateKey = process.env.NEXT_PUBLIC_EVM_PRIVATE_KEY as string;
const wallet = new Wallet(privateKey);
//const rpc = "https://polygon-mumbai.g.alchemy.com/v2/Ksd4J1QVWaOJAJJNbr_nzTcJBJU-6uP3"
const rpc = "https://forno.celo.org"

async function main() {
    await deployCampaignManager();
}

const cusd = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
const cusdx = "0x3acb9a08697b6db4cd977e8ab42b6f24722e6d6e";
const cusdHost = "0xA4Ff07cF81C02CFD356184879D953970cA957585";

const fdai = "0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7";
const fdaiX = "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f";
const mumbaiHost = "0xEB796bdb90fFA0f28255275e16936D25d3418603"

async function deployCampaignManager() {
  const provider = getDefaultProvider(rpc);
  const connectedWallet = wallet.connect(provider);

  const campaignManagerFactory = new CampaignManager__factory(connectedWallet);
  const campaignManagerContract = await campaignManagerFactory.deploy(cusd, cusdx, cusdHost);
  console.log("Deploying Campaign Manager...")
  const deployTxReceipt = await campaignManagerContract.deployTransaction.wait();
  console.log(`Campaign Manager has been deployed at this address: ${campaignManagerContract.address} on the celo mainnet network`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});