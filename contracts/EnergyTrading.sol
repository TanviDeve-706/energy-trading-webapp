// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EnergyTrading is ReentrancyGuard, Ownable {
    uint256 private _offerIds;
    uint256 private _transactionIds;
    
    struct EnergyOffer {
        uint256 id;
        address seller;
        uint256 energyAmount; // in kWh (scaled by 100 to handle decimals)
        uint256 pricePerKwh; // in wei per kWh
        string energyType; // "solar", "wind", "hydro", "other"
        string location;
        bool isActive;
        uint256 createdAt;
    }
    
    struct EnergyTransaction {
        uint256 id;
        uint256 offerId;
        address buyer;
        address seller;
        uint256 energyAmount;
        uint256 totalPrice;
        uint256 timestamp;
        bool completed;
    }
    
    // Mappings
    mapping(uint256 => EnergyOffer) public offers;
    mapping(uint256 => EnergyTransaction) public transactions;
    mapping(address => uint256[]) public userOffers;
    mapping(address => uint256[]) public userTransactions;
    mapping(address => bool) public registeredUsers;
    mapping(address => string) public userTypes; // "prosumer" or "consumer"
    
    // Events
    event UserRegistered(address indexed user, string userType);
    event OfferCreated(
        uint256 indexed offerId,
        address indexed seller,
        uint256 energyAmount,
        uint256 pricePerKwh,
        string energyType
    );
    event OfferCancelled(uint256 indexed offerId, address indexed seller);
    event EnergyPurchased(
        uint256 indexed transactionId,
        uint256 indexed offerId,
        address indexed buyer,
        address seller,
        uint256 energyAmount,
        uint256 totalPrice
    );
    
    constructor() Ownable(msg.sender) {}
    
    modifier onlyRegistered() {
        require(registeredUsers[msg.sender], "User not registered");
        _;
    }
    
    modifier offerExists(uint256 _offerId) {
        require(_offerId <= _offerIds && _offerId > 0, "Offer does not exist");
        _;
    }
    
    function registerUser(string memory _userType) external {
        require(!registeredUsers[msg.sender], "User already registered");
        require(
            keccak256(abi.encodePacked(_userType)) == keccak256(abi.encodePacked("prosumer")) ||
            keccak256(abi.encodePacked(_userType)) == keccak256(abi.encodePacked("consumer")),
            "Invalid user type"
        );
        
        registeredUsers[msg.sender] = true;
        userTypes[msg.sender] = _userType;
        
        emit UserRegistered(msg.sender, _userType);
    }
    
    function createOffer(
        uint256 _energyAmount,
        uint256 _pricePerKwh,
        string memory _energyType,
        string memory _location
    ) external onlyRegistered nonReentrant {
        require(
            keccak256(abi.encodePacked(userTypes[msg.sender])) == keccak256(abi.encodePacked("prosumer")),
            "Only prosumers can create offers"
        );
        require(_energyAmount > 0, "Energy amount must be greater than 0");
        require(_pricePerKwh > 0, "Price must be greater than 0");
        
        _offerIds++;
        uint256 newOfferId = _offerIds;
        
        offers[newOfferId] = EnergyOffer({
            id: newOfferId,
            seller: msg.sender,
            energyAmount: _energyAmount,
            pricePerKwh: _pricePerKwh,
            energyType: _energyType,
            location: _location,
            isActive: true,
            createdAt: block.timestamp
        });
        
        userOffers[msg.sender].push(newOfferId);
        
        emit OfferCreated(newOfferId, msg.sender, _energyAmount, _pricePerKwh, _energyType);
    }
    
    function buyEnergy(uint256 _offerId) 
        external 
        payable 
        onlyRegistered 
        offerExists(_offerId) 
        nonReentrant 
    {
        EnergyOffer storage offer = offers[_offerId];
        require(offer.isActive, "Offer is not active");
        require(offer.seller != msg.sender, "Cannot buy your own energy");
        
        uint256 totalPrice = (offer.energyAmount * offer.pricePerKwh) / 100;
        require(msg.value >= totalPrice, "Insufficient payment");
        
        // Mark offer as inactive
        offer.isActive = false;
        
        // Create transaction record
        _transactionIds++;
        uint256 newTransactionId = _transactionIds;
        
        transactions[newTransactionId] = EnergyTransaction({
            id: newTransactionId,
            offerId: _offerId,
            buyer: msg.sender,
            seller: offer.seller,
            energyAmount: offer.energyAmount,
            totalPrice: totalPrice,
            timestamp: block.timestamp,
            completed: true
        });
        
        userTransactions[msg.sender].push(newTransactionId);
        userTransactions[offer.seller].push(newTransactionId);
        
        // Transfer payment to seller
        payable(offer.seller).transfer(totalPrice);
        
        // Refund excess payment
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
        
        emit EnergyPurchased(
            newTransactionId,
            _offerId,
            msg.sender,
            offer.seller,
            offer.energyAmount,
            totalPrice
        );
    }
    
    function cancelOffer(uint256 _offerId) 
        external 
        onlyRegistered 
        offerExists(_offerId) 
        nonReentrant 
    {
        EnergyOffer storage offer = offers[_offerId];
        require(offer.seller == msg.sender, "Only seller can cancel offer");
        require(offer.isActive, "Offer is already inactive");
        
        offer.isActive = false;
        
        emit OfferCancelled(_offerId, msg.sender);
    }
    
    function getActiveOffers() external view returns (EnergyOffer[] memory) {
        uint256 activeCount = 0;
        
        // Count active offers
        for (uint256 i = 1; i <= _offerIds; i++) {
            if (offers[i].isActive) {
                activeCount++;
            }
        }
        
        // Create array of active offers
        EnergyOffer[] memory activeOffers = new EnergyOffer[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= _offerIds; i++) {
            if (offers[i].isActive) {
                activeOffers[currentIndex] = offers[i];
                currentIndex++;
            }
        }
        
        return activeOffers;
    }
    
    function getUserOffers(address _user) external view returns (uint256[] memory) {
        return userOffers[_user];
    }
    
    function getUserTransactions(address _user) external view returns (uint256[] memory) {
        return userTransactions[_user];
    }
    
    function getOffer(uint256 _offerId) external view offerExists(_offerId) returns (EnergyOffer memory) {
        return offers[_offerId];
    }
    
    function getTransaction(uint256 _transactionId) external view returns (EnergyTransaction memory) {
        require(_transactionId <= _transactionIds && _transactionId > 0, "Transaction does not exist");
        return transactions[_transactionId];
    }
    
    function getTotalOffers() external view returns (uint256) {
        return _offerIds;
    }
    
    function getTotalTransactions() external view returns (uint256) {
        return _transactionIds;
    }
    
    function isUserRegistered(address _user) external view returns (bool) {
        return registeredUsers[_user];
    }
    
    function getUserType(address _user) external view returns (string memory) {
        return userTypes[_user];
    }
    
    // Emergency function to withdraw contract balance (only owner)
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
}
