import { ethers, Wallet, getDefaultProvider } from "ethers";
//import { wallet } from "../config/constants";
require("dotenv").config();
import { CampaignManager__factory } from "../typechain-types";
const rpc = "https://alfajores-forno.celo-testnet.org";
const privateKey = process.env.NEXT_PUBLIC_EVM_PRIVATE_KEY as string;
const wallet = new Wallet(privateKey);

async function main() {
    await deploy();
}

async function deploy() {
  const provider = getDefaultProvider(rpc);
  const connectedWallet = wallet.connect(provider);

  const campaignManagerFactory = new CampaignManager__factory(connectedWallet);
  const campaignManagerContract = await campaignManagerFactory.deploy();
  console.log("Deploying Campaign Manager...")
  const deployTxReceipt = await campaignManagerContract.deployTransaction.wait();
  console.log(`Campaign Manager has been deployed at this address: ${campaignManagerContract.address} on the celo network`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});