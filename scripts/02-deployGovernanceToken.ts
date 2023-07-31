import { ethers, Wallet, getDefaultProvider } from "ethers";
//import { wallet } from "../config/constants";
require("dotenv").config();
import { GovernanceToken__factory} from "../typechain-types";
const rpc = "https://alfajores-forno.celo-testnet.org";
const privateKey = process.env.NEXT_PUBLIC_EVM_PRIVATE_KEY as string;
const wallet = new Wallet(privateKey);

async function main() {
    await deploy();
}

async function deploy() {
  const provider = getDefaultProvider(rpc);
  const connectedWallet = wallet.connect(provider);

  const governanceTokenFactory = new GovernanceToken__factory(connectedWallet);
  const governanceTokenContract = await governanceTokenFactory.deploy();
  console.log("Deploying Governance Token...")
  const deployTxReceipt = await governanceTokenContract.deployTransaction.wait();
  console.log(`Governance Token Contract has been deployed at this address: ${governanceTokenContract.address} on the celo network`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});