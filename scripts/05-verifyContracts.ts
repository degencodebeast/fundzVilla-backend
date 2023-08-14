import { utils, constants, BigNumber, getDefaultProvider, Wallet, ContractFactory, Contract } from 'ethers';
import { ethers, network, run } from "hardhat";
//import { ethers } from "ethers";
require("dotenv").config();
const contractAddr = "0x336868235C3E9c40836dCd10BE1A8823bDD00BCB"

const cusd = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
const cusdx = "0x3acb9a08697b6db4cd977e8ab42b6f24722e6d6e";
const cusdHost = "0xA4Ff07cF81C02CFD356184879D953970cA957585";
const constructorArgs = [cusd, cusdx, cusdHost];

export async function main() {
    const chainID = network.config.chainId;
    if (chainID != 31337) {
        await verifyContract()
    }
}

async function verifyContract() {

    console.log(`Verifying fundzvilla for celo...`);

    try {
        await run("verify:verify", {
            address: contractAddr,
            constructorArguments: constructorArgs,
        });
        //console.log(`contract for ${chain.name} verified`);
    } catch (e: any) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!");
        } else {
            console.log(e);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
