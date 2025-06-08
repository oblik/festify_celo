// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

/**
 * @title FestivalGreetings
 * @dev A contract for creating and sending festival greeting NFTs
 */
contract FestivalGreetings is ERC721URIStorage, ERC721Enumerable, Ownable {
    using Strings for uint256;

    // Simple counter for token IDs
    uint256 private _nextTokenId = 1;
    
    // Mapping from token ID to festival type
    mapping(uint256 => string) private _tokenFestivals;
    
    // Mapping from token ID to sender address
    mapping(uint256 => address) private _tokenSenders;
    
    // Mapping from address to array of token IDs (sent)
    mapping(address => uint256[]) private _sentTokens;
    
    // Mapping from address to array of token IDs (received)
    mapping(address => uint256[]) private _receivedTokens;

    // Optional: Fee for minting a greeting card (can be set to 0)
    uint256 public mintFee = 0;

    // Events
    event GreetingCardMinted(
        uint256 indexed tokenId,
        address indexed sender,
        address indexed recipient,
        string festival,
        string metadataURI
    );

    constructor() ERC721("Festival Greetings", "FGRT") Ownable(msg.sender) {
        console.log("Deploying Festival Greetings NFT Contract");
    }

    /**
     * @dev Creates a new greeting card NFT and sends it to the recipient
     * @param recipient Address of the recipient
     * @param metadataURI URI for the token metadata (stored on IPFS)
     * @param festival Type of festival (e.g., "christmas", "eid", "newyear", "sallah")
     */
    function mintGreetingCard(
        address recipient,
        string memory metadataURI,
        string memory festival
    ) public payable returns (uint256) {
        require(recipient != address(0), "Cannot mint to zero address");
        require(bytes(metadataURI).length > 0, "Token URI cannot be empty");
        require(bytes(festival).length > 0, "Festival type cannot be empty");
        
        // Check if the sender has paid the mint fee (if applicable)
        if (mintFee > 0) {
            require(msg.value >= mintFee, "Insufficient funds to mint greeting card");
        }

        uint256 newTokenId = _nextTokenId++; // Increment the token ID after using it

        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, metadataURI);
        
        // Store additional information
        _tokenFestivals[newTokenId] = festival;
        _tokenSenders[newTokenId] = msg.sender;
        
        // Update sender and recipient records
        _sentTokens[msg.sender].push(newTokenId);
        _receivedTokens[recipient].push(newTokenId);

        emit GreetingCardMinted(newTokenId, msg.sender, recipient, festival, metadataURI);
        
        return newTokenId;
    }

    /**
     * @dev Returns the festival type for a given token ID
     */
    function getGreetingFestival(uint256 tokenId) public view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Festival query for nonexistent token");
        return _tokenFestivals[tokenId];
    }

    /**
     * @dev Returns the sender address for a given token ID
     */
    function getGreetingSender(uint256 tokenId) public view returns (address) {
        require(_ownerOf(tokenId) != address(0), "Sender query for nonexistent token");
        return _tokenSenders[tokenId];
    }

    /**
     * @dev Returns all token IDs sent by an address
     */
    function getSentGreetings(address sender) public view returns (uint256[] memory) {
        return _sentTokens[sender];
    }

    /**
     * @dev Returns all token IDs received by an address
     */
    function getReceivedGreetings(address recipient) public view returns (uint256[] memory) {
        return _receivedTokens[recipient];
    }

    /**
     * @dev Sets the mint fee
     * @param newFee New fee amount in wei
     */
    function setMintFee(uint256 newFee) public onlyOwner {
        mintFee = newFee;
    }

    /**
     * @dev Withdraw contract balance to owner
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Override functions to resolve conflicts between inherited contracts
     */
    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721URIStorage, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
