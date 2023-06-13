import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Campaign__factory, CampaignManager__factory } from "../typechain-types";

function convertToUnits(_tx: any[]) {
  let arr: any = [];
  for (let i = 0; i < _tx.length; i++) {
    let result = Number(_tx[i]);
    arr.push(result);
  }
  return arr;
}

describe("CampaignManager", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployCampaignManagerFixture() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const TARGET = ethers.utils.parseEther("13");
    let campaignCID = "bafybeigcjyxzjvkvlqsnjj6d5bqgcv4o57aoi3q5um2ab5agtwvfx5imfe";
    const amount = ethers.utils.parseEther("1");

    //const CampaignManager = await ethers.getContractFactory("CampaignManager");
    const CampaignManager = new CampaignManager__factory(owner);
    const campaignFactory = new Campaign__factory(owner);
    const campaignManager = await CampaignManager.deploy();
    await campaignManager.deployed();

    return { campaignManager, owner, campaignFactory, otherAccount, TARGET, campaignCID, amount };
  }

  describe("Deployment", function () {
    it("Should create a campaign", async function () {
      const { campaignManager, TARGET, campaignCID } = await loadFixture(deployCampaignManagerFixture);
      let tx = await campaignManager.createCampaign(campaignCID, TARGET);
      let txReceipt = await tx.wait();
      let result = txReceipt.logs[0].data;
      const campaignId = ethers.BigNumber.from(result).toNumber();
      expect(campaignId).to.equal(1);
      console.log(`Campaign ID is ${campaignId}`)
    });

    it("Should return the created campaigns and owner should always equal the account that created it", async function () {
      const { campaignManager, campaignFactory, owner, TARGET, campaignCID } = await loadFixture(deployCampaignManagerFixture);
      let tx = await campaignManager.createCampaign(campaignCID, TARGET);
      let txReceipt = await tx.wait();
      let result = txReceipt.logs[0].data;
      const campaignId = ethers.BigNumber.from(result).toNumber();
      let campaign = await campaignManager.getParticularCampaign(campaignId);
      console.log(`This is the created campaign address ${campaign}`);
      let campaignInstance = campaignFactory.attach(campaign);
      let campaignOwner = await campaignInstance.owner();
      expect(campaignOwner).to.equal(owner.address);
      console.log(`Campaign owner address is ${campaignOwner} and is equal to default owner address ${owner.address}`)
    });

    it("Should donate to a campaign", async function () {
      const { campaignManager, campaignFactory, owner, TARGET, campaignCID, amount } = await loadFixture(
        deployCampaignManagerFixture
      );
      let tx = await campaignManager.createCampaign(campaignCID, TARGET);
      let txReceipt = await tx.wait();
      let result = txReceipt.logs[0].data;
      const campaignId = ethers.BigNumber.from(result).toNumber();
      let campaign = await campaignManager.getParticularCampaign(campaignId);
      console.log(`This is the created campaign address ${campaign}`);

      // Multiply the amount by 1.3
      //const sentAmount = ethers.utils.parseUnits("0.9");

      await campaignManager.donate(campaignId, 1000000, { gasLimit: 1000000, value: amount });
      const balance = await ethers.provider.getBalance(campaign);

      // Convert the balance to ether
      //const balanceInEther = ethers.utils.formatEther(balance);
      console.log(`The campaign contract of address ${campaign} has a balance of ${balance.toNumber()}`);
      expect(balance.toNumber()).to.eq(1000000);

    });
    
    it("Owner should be able to claim campaign donations", async function () {
      const { campaignManager, campaignFactory, owner, TARGET, campaignCID, amount } = await loadFixture(
        deployCampaignManagerFixture
      );
      let tx = await campaignManager.createCampaign(campaignCID, TARGET);
      let txReceipt = await tx.wait();
      let result = txReceipt.logs[0].data;
      const campaignId = ethers.BigNumber.from(result).toNumber();
      let campaign = await campaignManager.getParticularCampaign(campaignId);
      console.log(`This is the created campaign address ${campaign}`);

      // Multiply the amount by 1.3
      //const sentAmount = ethers.utils.parseUnits("0.9");

      await campaignManager.donate(campaignId, 1000000, { gasLimit: 1000000, value: amount });
     
      await campaignManager.claim(campaignId, 1000000, {gasLimit:2000000 });
      const ownerBalance = await ethers.provider.getBalance(owner.address);
      console.log(`The owner address ${owner.address} that has campaign contract of address ${campaign} now has a balance of ${ownerBalance.toNumber()}`);
      expect(ownerBalance.toNumber()).to.eq(1000000);



    });

    // beforeEach(async () => {

    //   const { campaignManager, campaignFactory, owner, TARGET, campaignCID } = await loadFixture(deployCampaignManagerFixture);
    //   let tx = await campaignManager.createCampaign(campaignCID, TARGET);
    //   let txReceipt = await tx.wait();
    //   let result = txReceipt.logs[0].data;
    //   const returnedValue = ethers.BigNumber.from(result).toNumber();
    //   let campaign = await campaignManager.getParticularCampaign(returnedValue);
    //   let campaignInstance = campaignFactory.attach(campaign);

    // })



    // it("Should fail if the unlockTime is not in the future", async function () {
    //   // We don't use the fixture here because we want a different deployment
    //   const latestTime = await time.latest();
    //   const Lock = await ethers.getContractFactory("Lock");
    //   await expect(Lock.deploy(latestTime, { value: 1 })).to.be.revertedWith(
    //     "Unlock time should be in the future"
    //   );
    // });
  });

  // describe("Withdrawals", function () {
  //   describe("Validations", function () {
  //     it("Should revert with the right error if called too soon", async function () {
  //       const { lock } = await loadFixture(deployOneYearLockFixture);

  //       await expect(lock.withdraw()).to.be.revertedWith(
  //         "You can't withdraw yet"
  //       );
  //     });

  //     it("Should revert with the right error if called from another account", async function () {
  //       const { lock, unlockTime, otherAccount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // We can increase the time in Hardhat Network
  //       await time.increaseTo(unlockTime);

  //       // We use lock.connect() to send a transaction from another account
  //       await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
  //         "You aren't the owner"
  //       );
  //     });

  //     it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
  //       const { lock, unlockTime } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // Transactions are sent using the first signer by default
  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).not.to.be.reverted;
  //     });
  //   });

  //   // describe("Events", function () {
  //   //   it("Should emit an event on withdrawals", async function () {
  //   //     const { lock, unlockTime, lockedAmount } = await loadFixture(
  //   //       deployOneYearLockFixture
  //   //     );

  //   //     await time.increaseTo(unlockTime);

  //   //     await expect(lock.withdraw())
  //   //       .to.emit(lock, "Withdrawal")
  //   //       .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
  //   //   });
  //   // });

  //   // describe("Transfers", function () {
  //   //   it("Should transfer the funds to the owner", async function () { 
  //   //     const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
  //   //       deployOneYearLockFixture
  //   //     );

  //   //     await time.increaseTo(unlockTime);

  //   //     await expect(lock.withdraw()).to.changeEtherBalances(
  //   //       [owner, lock],
  //   //       [lockedAmount, -lockedAmount]
  //   //     );
  //   //   });
  //   // });
  // });
});
