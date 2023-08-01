//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Campaign.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
//import {IFakeDAI} from "./IFakeDAI.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {ISuperfluid, ISuperToken, ISuperApp} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import {SuperTokenV1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";

error Unauthorized();

contract CampaignManager is Ownable {
    using SuperTokenV1Library for ISuperToken;

    using Counters for Counters.Counter;
    Counters.Counter private counter;

    // Event emitted when a token is deposited
    event Deposit(
        address indexed sender,
        address indexed tokenAddress,
        uint256 amount
    );

    IERC20 public cusd;
    ISuperToken public cusdX;
    ISuperfluid immutable host;

    uint256 public campaignIdCounter = 1;
    Campaign[] allCampaigns;
    mapping(address => Campaign[]) public ownerToCampaigns;
    mapping(address => uint256[]) public ownerToCampaignIds;
    mapping(uint256 => address) public campaignIdToOwner;
    mapping(uint256 => Campaign) public idToCampaigns;
    mapping(Campaign => uint256) public campaignToIds;
    mapping(uint256 => Donors[]) public campaignIdToDonors;
    mapping(Campaign => Donors) public donors;
    address[] public allDAOMembers;
    mapping(address => bool) public isDAOMember;
    mapping(address => uint256) public daoMemberToId;
    mapping(uint256 => address) public sbtIdToDaoMember;

    uint256[] public allCampaignIds;
    uint256[] public allSbtIds;

    event CampaignCreated(uint256 campaignId);

    event campaignRemoved(uint256 campaignId);

    mapping(uint256 => bool) public isCampaignVerified;

    struct Donors {
        address donorAddress;
        uint256 amountDonated;
    }

    Donors[] public _ALL_DONORS;

    constructor(IERC20 _cusd, ISuperToken _cusdX, ISuperfluid _host) {
        cusd = _cusd;
        cusdX = _cusdX;
        host = _host;
    }

    function createCampaign(
        string memory _campaignCID,
        uint256 _target
    ) public virtual returns (uint256) {
        uint256 campaignID = campaignIdCounter;
        campaignIdCounter++;

        Campaign campaign = new Campaign(
            msg.sender,
            _campaignCID,
            block.timestamp,
            _target,
            campaignID,
            host,
            cusdX,
            cusd
        );
        allCampaigns.push(campaign);
        allCampaignIds.push(campaignID);
        ownerToCampaigns[msg.sender].push(campaign);
        ownerToCampaignIds[msg.sender].push(campaignID);
        idToCampaigns[campaignID] = campaign;
        campaignToIds[campaign] = campaignID;
        campaignIdToOwner[campaignID] = msg.sender;
        emit CampaignCreated(campaignID);
        return campaignID;
    }

    function getOwnerCampaigns()
        public
        view
        returns (Campaign[] memory _allOwnerCampaigns)
    {
        _allOwnerCampaigns = ownerToCampaigns[msg.sender];
    }

    function getOwnerIds() public view returns (uint256[] memory _allOwnerIds) {
        _allOwnerIds = ownerToCampaignIds[msg.sender];
    }

    function getParticularCampaign(
        uint256 _campaignId
    ) public view returns (Campaign _campaign) {
        _campaign = idToCampaigns[_campaignId];
    }

    function getParticularCampaignId(
        Campaign campaign
    ) public view returns (uint256 _campaignId) {
        _campaignId = campaignToIds[campaign];
    }

    function getCampaignOwner(
        uint256 _campaignId
    ) public view returns (address owner) {
        owner = campaignIdToOwner[_campaignId];
    }

    //depending on the front end, you'll use the identifier that would be easier to
    //interact with, either the campaign id or the campaign contract address itself
    //can only be called by DAO, might be expensive for now, could refactor later to
    //optimize for gas
    // function removeCampaignId(uint256 element) public onlyOwner {
    //     uint index = findCampaignIdIndex(element);
    //     require(index < allCampaignIds.length, "Element not found");

    //     // Move the last element to the index being deleted
    //     allCampaignIds[index] = allCampaignIds[allCampaignIds.length - 1];

    //     // Decrease the array length
    //     allCampaignIds.pop();
    // }

    // function findCampaignIdIndex(uint element) internal view returns (uint) {
    //     for (uint i = 0; i < allCampaignIds.length; i++) {
    //         if (allCampaignIds[i] == element) {
    //             return i;
    //         }
    //     }
    //     return allCampaignIds.length; // Element not found, return an invalid index
    // }

    //can only be called by DAO, might be expensive for now, could refactor later to
    //optimize for gas
    function removeCampaignAddr(Campaign campaign) public onlyOwner {
        uint index = findCampaignAddrIndex(campaign);
        require(index < allCampaigns.length, "Element not found");

        // Move the last element to the index being deleted
        allCampaigns[index] = allCampaigns[allCampaigns.length - 1];

        // Decrease the array length
        allCampaigns.pop();
        uint256 campaignId = getParticularCampaignId(campaign);
        emit campaignRemoved(campaignId);
    }

    function findCampaignAddrIndex(
        Campaign campaign
    ) internal view returns (uint) {
        for (uint i = 0; i < allCampaigns.length; i++) {
            if (allCampaigns[i] == campaign) {
                return i;
            }
        }
        return allCampaigns.length; // Element not found, return an invalid index
    }

    function getAllCampaigns()
        public
        view
        returns (Campaign[] memory _allCampaigns)
    {
        _allCampaigns = allCampaigns;
    }

    function getAddressBalance(address account) public view returns (uint256) {
        return account.balance;
    }

    function getAllCampaignIds()
        public
        view
        returns (uint256[] memory _allCampaignIds)
    {
        _allCampaignIds = allCampaignIds;
    }

    //function enableWithdrawal() public {}

    function donate(
        uint256 _campaignId,
        uint256 _amount //address payable _recipient
        /*address _cusdAddr*/
    ) public payable virtual {
        require(
            address(idToCampaigns[_campaignId]) != address(0),
            "not a valid campaign"
        );
        // require(
        //     msg.value >= _amount,
        //     "sent amount is lower than amount you want to donate"
        // );

        //IERC20 token = IERC20(_cusdAddr);

        Campaign campaign = idToCampaigns[_campaignId];
        address campaignAddr = address(campaign);
        address payable _recipient = payable(campaignAddr);
        donors[campaign] = Donors(msg.sender, _amount);
        Donors memory donorsData = donors[campaign];
        _ALL_DONORS.push(donorsData);
        campaignIdToDonors[_campaignId].push(donorsData);
        //_recipient.transfer(_amount);
        cusd.transferFrom(msg.sender, _recipient, _amount);

        // Emit the Deposit event
        emit Deposit(msg.sender, address(cusd), _amount);
    }

    function getBalance(address _cusdAddr, address account) public view returns (uint256 _balance){
        _balance = IERC20(_cusdAddr).balanceOf(account);
    }

    function claim(uint256 _campaignId, uint256 amount/*, address _cusdAddr*/) external virtual {
        address owner = campaignIdToOwner[_campaignId];
        require(
            msg.sender == owner,
            "msg.sender is not the owner of this campaign"
        );

        Campaign campaign = idToCampaigns[_campaignId];
        Campaign campaignInstance = Campaign(campaign);
        campaignInstance.withdraw(amount);

        // (bool success, ) = address(campaign).delegatecall(
        //     abi.encodeWithSignature("withdraw(uint256)", amount)
        // );
        // require(success, "Call failed");
    }

    //can only be called by the DAO
    function verifyCampaign(uint256 _campaignId) public onlyOwner {
        require(
            !isCampaignVerified[_campaignId],
            "This campaign is already verified"
        );
        isCampaignVerified[_campaignId] = true;
    }

    function getParticularCampaignDonors(
        uint256 _campaignId
    ) public view returns (Donors[] memory _donors) {
        _donors = campaignIdToDonors[_campaignId];
    }

    function getAllDonors()
        public
        view
        returns (Donors[] memory _allDonorsData)
    {
        _allDonorsData = _ALL_DONORS;
    }

    // function getCampaignDetails() public view returns(string[] memory)
    // {}

    function joinDAO() public {
        require(
            !_isDAOMember(msg.sender),
            "You are already a member of the DAO"
        );
        uint256 sbtId;
        counter.increment();
        sbtId = counter.current();
        allSbtIds.push(sbtId);
        allDAOMembers.push(msg.sender);
        isDAOMember[msg.sender] = true;
        daoMemberToId[msg.sender] = sbtId;
        sbtIdToDaoMember[sbtId] = msg.sender;
    }

    function _isDAOMember(address _account) public view returns (bool result) {
        result = isDAOMember[_account];
    }

    function getDAOMemberId(
        address _account
    ) public view returns (uint256 _memberId) {
        _memberId = daoMemberToId[_account];
    }

    function getDAOMemberAddress(
        uint256 _sbtId
    ) public view returns (address _daoMember) {
        _daoMember = sbtIdToDaoMember[_sbtId];
    }

    function getAllDAOMembers()
        public
        view
        returns (address[] memory _allDAOMembers)
    {
        _allDAOMembers = allDAOMembers;
    }

    function upgradeCUSD(uint256 _amount) external onlyOwner {
        cusd.approve(address(cusdX), _amount);
        cusdX.upgrade(_amount);
    }

    function downgradeCUSDx(uint256 _amount) external onlyOwner {
        cusdX.downgrade(_amount);
    }

    /// @notice Create a stream into the contract.
    /// @dev This requires the contract to be a flowOperator for the msg sender.
    /// @param _token Token to stream.
    /// @param flowRate Flow rate per second to stream.
    function createFlowFromSender(
        ISuperToken _token,
        int96 flowRate,
        address _receiver
    ) external {
        //_token.createFlowWithCtx(msg.sender, address(this), flowRate);
        _token.createFlow(_receiver, flowRate);
    }

    /// @notice Update flow from contract to specified address.
    /// @param token Token to stream.
    /// @param receiver Receiver of stream.
    /// @param flowRate Flow rate per second to stream.
    function updateFlowFromSender(
        ISuperToken token,
        address receiver,
        int96 flowRate
    ) external {
        token.updateFlow(receiver, flowRate);
    }

    /// @notice Delete flow from contract to specified address.
    /// @param token Token to stop streaming.
    /// @param receiver Receiver of stream.
    function deleteFlowFromSender(
        ISuperToken token,
        address receiver
    ) external {
        token.deleteFlow(msg.sender, receiver);
    }

    /// @notice Send a lump sum of super tokens into the contract.
    /// @dev This requires a super token ERC20 approval.
    /// @param token Super Token to transfer.
    /// @param amount Amount to transfer.
    function sendLumpSumToContract(ISuperToken token, uint256 amount) external {
        token.transferFrom(msg.sender, address(this), amount);
    }
}
