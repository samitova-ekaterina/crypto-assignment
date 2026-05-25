// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// OpenZeppelin Contracts v4.9.6 is used because it is stable and simple for Remix.
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.6/contracts/token/ERC1155/ERC1155.sol";
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.6/contracts/access/Ownable.sol";

/**
 * @title GameCharacterCollectionERC1155
 * @dev ERC-1155 collection with 10 distinct emotionally burned-out student characters.
 *      Each token ID represents a different student emotional state.
 */
contract GameCharacterCollectionERC1155 is ERC1155, Ownable {
    // The assignment requires 10 distinct token IDs.
    uint256 public constant DEADLINE_ZOMBIE = 1;
    uint256 public constant CAFFEINE_PRISONER = 2;
    uint256 public constant DEBUGGING_GHOST = 3;
    uint256 public constant LECTURE_VOID = 4;
    uint256 public constant PANIC_SUBMITTER = 5;
    uint256 public constant GROUP_PROJECT_HOSTAGE = 6;
    uint256 public constant EXAM_DOOMSAYER = 7;
    uint256 public constant SLEEP_DEPRIVED_CODER = 8;
    uint256 public constant BURNOUT_GOBLIN = 9;
    uint256 public constant SILENT_BREAKDOWN = 10;

    // This mapping stores a separate metadata URI for every character token ID.
    mapping(uint256 => string) private tokenURIs;

    /**
     * @dev Creates the ERC-1155 collection and sets metadata URIs for all 10 characters.
     *
     * The image links inside JSON metadata can later be replaced with real IPFS image links.
     */
    constructor() ERC1155("") {
        tokenURIs[1] = "ipfs://REPLACE_WITH_METADATA_CID/1.json";
        tokenURIs[2] = "ipfs://REPLACE_WITH_METADATA_CID/2.json";
        tokenURIs[3] = "ipfs://REPLACE_WITH_METADATA_CID/3.json";
        tokenURIs[4] = "ipfs://REPLACE_WITH_METADATA_CID/4.json";
        tokenURIs[5] = "ipfs://REPLACE_WITH_METADATA_CID/5.json";
        tokenURIs[6] = "ipfs://REPLACE_WITH_METADATA_CID/6.json";
        tokenURIs[7] = "ipfs://REPLACE_WITH_METADATA_CID/7.json";
        tokenURIs[8] = "ipfs://REPLACE_WITH_METADATA_CID/8.json";
        tokenURIs[9] = "ipfs://REPLACE_WITH_METADATA_CID/9.json";
        tokenURIs[10] = "ipfs://REPLACE_WITH_METADATA_CID/10.json";
    }

    /**
     * @dev Returns the metadata URI for a specific ERC-1155 token ID.
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        require(tokenId >= 1 && tokenId <= 10, "Invalid character token ID");
        return tokenURIs[tokenId];
    }

    /**
     * @dev Allows the owner/admin to update metadata URI for a token ID.
     */
    function setTokenURI(uint256 tokenId, string memory newURI) external onlyOwner {
        require(tokenId >= 1 && tokenId <= 10, "Invalid character token ID");
        tokenURIs[tokenId] = newURI;
    }

    /**
     * @dev Mints the full collection: 1 NFT for each of the 10 character IDs.
     *      This demonstrates ERC-1155 batch minting.
     */
    function mintFullCollection(address to) external onlyOwner {
        require(to != address(0), "Invalid receiver address");

        uint256[] memory ids = new uint256[](10);
        uint256[] memory amounts = new uint256[](10);

        ids[0] = 1;
        ids[1] = 2;
        ids[2] = 3;
        ids[3] = 4;
        ids[4] = 5;
        ids[5] = 6;
        ids[6] = 7;
        ids[7] = 8;
        ids[8] = 9;
        ids[9] = 10;

        amounts[0] = 1;
        amounts[1] = 1;
        amounts[2] = 1;
        amounts[3] = 1;
        amounts[4] = 1;
        amounts[5] = 1;
        amounts[6] = 1;
        amounts[7] = 1;
        amounts[8] = 1;
        amounts[9] = 1;

        _mintBatch(to, ids, amounts, "");
    }

    /**
     * @dev Allows the owner/admin to mint selected character NFTs in a batch.
     *      This function can be used to demonstrate custom ERC-1155 batch minting.
     */
    function mintBatchCharacters(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) external onlyOwner {
        require(to != address(0), "Invalid receiver address");
        require(ids.length == amounts.length, "IDs and amounts length mismatch");

        for (uint256 i = 0; i < ids.length; i++) {
            require(ids[i] >= 1 && ids[i] <= 10, "Invalid character token ID");
        }

        _mintBatch(to, ids, amounts, "");
    }

    /**
     * @dev Allows the owner/admin to mint one selected character token.
     */
    function mintCharacter(
        address to,
        uint256 tokenId,
        uint256 amount
    ) external onlyOwner {
        require(to != address(0), "Invalid receiver address");
        require(tokenId >= 1 && tokenId <= 10, "Invalid character token ID");
        require(amount > 0, "Amount must be greater than zero");

        _mint(to, tokenId, amount, "");
    }
}