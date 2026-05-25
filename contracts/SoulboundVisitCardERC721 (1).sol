// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// OpenZeppelin Contracts v4.9.6 is used because it is stable and simple for Remix.
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.6/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.6/contracts/token/ERC721/IERC721.sol";
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.6/contracts/access/Ownable.sol";

/**
 * @title SoulboundVisitCardERC721
 * @dev A non-transferable ERC-721 NFT representing one fictional student's visit card.
 *      The token is soulbound: after minting it cannot be transferred or approved.
 */
contract SoulboundVisitCardERC721 is ERC721URIStorage, Ownable {
    // The assignment requires exactly one unique student visit card NFT.
    uint256 public constant VISIT_CARD_TOKEN_ID = 1;

    // This flag prevents minting more than one visit card.
    bool public visitCardMinted;

    /**
     * @dev Creates the ERC-721 collection with a name and symbol.
     */
    constructor() ERC721("Soulbound Student Burnout Card", "SSBC") {}

    /**
     * @dev Mints the only soulbound visit card to a student's wallet.
     * @param studentWallet The wallet that will receive the soulbound NFT.
     * @param metadataURI The URI pointing to the ERC-721 metadata JSON file.
     *
     * Only the contract owner/admin can call this function.
     */
    function mintVisitCard(address studentWallet, string memory metadataURI) external onlyOwner {
        require(!visitCardMinted, "Visit card already minted");
        require(studentWallet != address(0), "Invalid student wallet");

        visitCardMinted = true;

        _safeMint(studentWallet, VISIT_CARD_TOKEN_ID);
        _setTokenURI(VISIT_CARD_TOKEN_ID, metadataURI);
    }

    /**
     * @dev Blocks all token transfers after minting.
     *      Minting is allowed because `from` is address(0).
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);

        // Allow minting only. Block transfers and burns.
        if (from != address(0)) {
            revert("Soulbound: transfers are disabled");
        }
    }

    /**
     * @dev Disables ERC-721 approvals because a soulbound token must not be transferable by another address.
     */
    function approve(address, uint256) public pure override(ERC721, IERC721) {
        revert("Soulbound: approvals are disabled");
    }

    /**
     * @dev Disables operator approvals for all tokens.
     */
    function setApprovalForAll(address, bool) public pure override(ERC721, IERC721) {
        revert("Soulbound: approvals are disabled");
    }

    /**
     * @dev Explicitly disables transferFrom.
     */
    function transferFrom(address, address, uint256) public pure override(ERC721, IERC721) {
        revert("Soulbound: transfers are disabled");
    }

    /**
     * @dev Explicitly disables safeTransferFrom without data.
     */
    function safeTransferFrom(address, address, uint256) public pure override(ERC721, IERC721) {
        revert("Soulbound: transfers are disabled");
    }

    /**
     * @dev Explicitly disables safeTransferFrom with data.
     */
    function safeTransferFrom(address, address, uint256, bytes memory) public pure override(ERC721, IERC721) {
        revert("Soulbound: transfers are disabled");
    }
}