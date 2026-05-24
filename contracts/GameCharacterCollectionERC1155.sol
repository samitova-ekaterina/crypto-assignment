// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// OpenZeppelin Contracts v4.9.6 is used because it is stable and simple for Remix.
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.6/contracts/token/ERC1155/ERC1155.sol";
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.6/contracts/access/Ownable.sol";

/**
 * @title GameCharacterCollectionERC1155
 * @dev ERC-1155 NFT collection with 10 distinct game character token IDs.
 *      Theme: Elizabeth's burned-out student emotional states.
 */
contract GameCharacterCollectionERC1155 is ERC1155, Ownable {
    uint256 public constant CHARACTER_COUNT = 10;

    // Stores a separate metadata URI for each token ID.
    mapping(uint256 => string) private _tokenURIs;

    /**
     * @dev Constructor receives 10 metadata URIs, one for each character token ID.
     * Token IDs are 1..10.
     */
    constructor(string[] memory metadataURIs) ERC1155("") {
        require(metadataURIs.length == CHARACTER_COUNT, "Exactly 10 metadata URIs required");

        for (uint256 i = 0; i < CHARACTER_COUNT; i++) {
            _tokenURIs[i + 1] = metadataURIs[i];
        }
    }

    /**
     * @dev Returns metadata URI for a specific ERC-1155 token ID.
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        require(tokenId >= 1 && tokenId <= CHARACTER_COUNT, "Unknown character ID");
        return _tokenURIs[tokenId];
    }

    /**
     * @dev Allows the owner/admin to update metadata URI for a token ID if needed.
     */
    function setTokenURI(uint256 tokenId, string memory newURI) external onlyOwner {
        require(tokenId >= 1 && tokenId <= CHARACTER_COUNT, "Unknown character ID");
        _tokenURIs[tokenId] = newURI;
    }

    /**
     * @dev Mints one character token type.
     */
    function mintCharacter(address to, uint256 tokenId, uint256 amount) external onlyOwner {
        require(tokenId >= 1 && tokenId <= CHARACTER_COUNT, "Unknown character ID");
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than zero");

        _mint(to, tokenId, amount, "");
    }

    /**
     * @dev Demonstrates ERC-1155 batch minting.
     *      This creates exactly 10 NFTs: one NFT for each character ID.
     */
    function mintAllCharacters(address to) external onlyOwner {
        require(to != address(0), "Invalid recipient");

        uint256[] memory ids = new uint256[](CHARACTER_COUNT);
        uint256[] memory amounts = new uint256[](CHARACTER_COUNT);

        for (uint256 i = 0; i < CHARACTER_COUNT; i++) {
            ids[i] = i + 1;
            amounts[i] = 1;
        }

        _mintBatch(to, ids, amounts, "");
    }

    /**
     * @dev General batch mint function for demonstration and testing.
     */
    function batchMint(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        require(ids.length == amounts.length, "Arrays length mismatch");

        for (uint256 i = 0; i < ids.length; i++) {
            require(ids[i] >= 1 && ids[i] <= CHARACTER_COUNT, "Unknown character ID");
            require(amounts[i] > 0, "Amount must be greater than zero");
        }

        _mintBatch(to, ids, amounts, "");
    }
}
