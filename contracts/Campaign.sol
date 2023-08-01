//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {RedirectAll, ISuperToken, ISuperfluid} from "./RedirectAll.sol";

// import {SuperTokenV1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";

// import {SuperAppBase} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";

contract Campaign is RedirectAll {
    bool private _locked;

    // Event emitted when a token is deposited
    event Deposit(
        address indexed sender,
        address indexed tokenAddress,
        uint256 amount
    );

    address public owner;
    string public campaignCID;
    uint256 public id;
    uint256 public createdAt;
    uint256 public raisedFunds;
    uint256 public target;

    IERC20 public cusd;

    constructor(
        address _owner,
        string memory _campaignCID,
        uint256 _createdAt,
        uint256 _target,
        uint256 _id,
        ISuperfluid host,
        ISuperToken _cusdX,
        IERC20 _cusd
    ) RedirectAll(_cusdX, host, _owner) {
        owner = _owner;
        campaignCID = _campaignCID;
        createdAt = _createdAt;
        target = _target;
        id = _id;
        cusd = _cusd;
    }

    function withdraw(/*address _cusdAddr, */uint256 amount) external {
        // require(!_locked, "Reentrancy guard: reentrant call");
        // _locked = true;
        // Ensure the amount is greater than 0
        //IERC20 cusdToken = IERC20(_cusdAddr);
        require(amount > 0, "Amount must be greater than 0");

        require(owner == tx.origin, "you are not the owner");
        uint256 contractCusdBal = cusd.balanceOf(address(this));
        require(amount <= contractCusdBal, "Insufficient balance");
        //require(amount <= address(this).balance, "Insufficient balance");
        //payable(owner).transfer(amount);
        
        cusd.transfer(owner, amount);

        // (bool success, ) = payable(owner).call{value: address(this).balance}("");
        // require(success, "Failed to claim");
        //_locked = false;
    }

    receive() external payable {
        // Handle the received Ether here
    }
}
