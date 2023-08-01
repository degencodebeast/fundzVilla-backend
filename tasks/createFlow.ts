import { utils, constants, BigNumber, getDefaultProvider, Wallet } from 'ethers';
import { ethers } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { CampaignManager__factory } from '../typechain-types';
require("dotenv").config();
const privateKey = process.env.NEXT_PUBLIC_EVM_PRIVATE_KEY as string;
const wallet = new Wallet(privateKey);
const rpc = "https://polygon-mumbai.g.alchemy.com/v2/Ksd4J1QVWaOJAJJNbr_nzTcJBJU-6uP3"


const fdai = "0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7";
const fdaiX = "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f";
const mumbaiHost = "0xEB796bdb90fFA0f28255275e16936D25d3418603"

const currencyInWei = BigInt(1) * BigInt(10 ** 18);
const secondsInMonth = BigInt(60 * 60 * 24 * 30);
const rate = currencyInWei / secondsInMonth;


const campaignMangagerAddr = "0xF832405d555834F59332A5da1e17f84B2D27fdEC"

const TARGET = ethers.utils.parseEther("1");

const campaignID1 = "0xa58eBD04537e5846e53e125DDBf2f60067f4f192"

let campaignCID = "bafybeigcjyxzjvkvlqsnjj6d5bqgcv4o57aoi3q5um2ab5agtwvfx5imfe"

async function main() {
    await createFlow();
}

async function createFlow() {
    const provider = getDefaultProvider(rpc);
    const connectedWallet = wallet.connect(provider);

    const campaignManagerFactory = new CampaignManager__factory(connectedWallet);
    const campaignManagerFactoryInstance = campaignManagerFactory.attach(campaignMangagerAddr);

    // try {
    //     let tx = await campaignManagerFactoryInstance.createCampaign(campaignCID, TARGET);
    //     let result = await tx.wait();

    //     console.log(`You created a campaign with the tx of ${result.transactionHash}`)

    // } catch (error) {
    //     console.log(`[source] campaignManagerFactoryInstance.createCampaign() ERROR!`);
    //     console.log(`[source]`, error);
    // }

    try {

        const _amount = ethers.utils.parseEther("1");
        let tx = await campaignManagerFactoryInstance.downgradeCUSDx(_amount, {gasLimit: 14000000});
        let txReceipt = await tx.wait();
        console.log(`You just upgraded with the tx of ${txReceipt.transactionHash}`)
    } catch (error) {
        console.log(`[source] campaignManagerFactoryInstance.createCampaign() ERROR!`);
        console.log(`[source]`, error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
