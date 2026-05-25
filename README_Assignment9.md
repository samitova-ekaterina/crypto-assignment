# Assignment 9: ERC-721 Soulbound Student Visit Card and ERC-1155 Game Character Collection

## 1. Project Overview

This project implements two separate NFT smart contracts in Solidity:

1. `SoulboundVisitCardERC721.sol` — an ERC-721 soulbound student visit card contract.
2. `GameCharacterCollectionERC1155.sol` — an ERC-1155 game character collection contract with 10 different character token IDs.

Both contracts were deployed and tested on the **Sepolia testnet** using **Remix IDE** and **MetaMask**.

The main purpose of the assignment was to demonstrate the difference between:

- a unique non-transferable ERC-721 NFT, and
- an ERC-1155 collection that supports multiple token IDs, batch minting, and batch transfer.

---

## 2. Project Concept

The project theme is **student life and academic burnout**.

### ERC-721 concept

The ERC-721 NFT represents a fictional student visit card for **Elizabeth**.

The visit card is implemented as a **soulbound token**. This means that the token can be minted to a student wallet, but it cannot be transferred or approved after minting.

This matches the idea of a student identity-like NFT: a student visit card belongs to one student wallet and should not be transferable to another person.

NFT name:

```text
Soulbound Student Burnout Card
```

Student data used in metadata:

```text
Student Name: Elizabeth
Student ID: ST-2026-009
Course: Blockchain and Crypto
Year: 2026
Status: Permanently Overdue
```

### ERC-1155 concept

The ERC-1155 contract represents a collection of 10 emotional states of an emotionally burned-out student.

Collection name:

```text
Elizabeth's Student Burnout: No Recovery Edition
```

Each token ID represents a different game character:

| Token ID | Character Name | Emotional State |
|---:|---|---|
| 1 | Deadline Zombie | Exhausted but still moving |
| 2 | Caffeine Prisoner | Dependent on coffee, still tired |
| 3 | Debugging Ghost | Lost inside endless errors |
| 4 | Lecture Void | Physically present, mentally gone |
| 5 | Panic Submitter | Uploading at the last second |
| 6 | Group Project Hostage | Trapped in team chaos |
| 7 | Exam Doomsayer | Expecting failure in advance |
| 8 | Sleep-Deprived Coder | Writing code without memory |
| 9 | Burnout Goblin | Too tired to care anymore |
| 10 | Silent Breakdown | Looks calm, internally collapsing |

---

## 3. Technologies Used

- Solidity `^0.8.20`
- OpenZeppelin Contracts `v4.9.6`
- Remix IDE
- MetaMask
- Sepolia testnet
- ERC-721
- ERC-1155

OpenZeppelin contracts were used because the assignment required using audited ERC-721 and ERC-1155 contract implementations.

---

## 4. Contract 1: SoulboundVisitCardERC721.sol

### Purpose

`SoulboundVisitCardERC721.sol` implements a unique ERC-721 NFT student visit card.

The token is soulbound: it can be minted, but it cannot be transferred or approved after minting.

### Main inherited contracts

```solidity
ERC721URIStorage
Ownable
```

`ERC721URIStorage` is used because the NFT needs to store a `tokenURI` pointing to metadata.

`Ownable` is used because only the contract owner/admin should be able to mint the student visit card.

### One-token minting logic

The contract contains a fixed token ID:

```solidity
uint256 public constant VISIT_CARD_TOKEN_ID = 1;
```

It also contains a flag:

```solidity
bool public visitCardMinted;
```

Before minting, the contract checks:

```solidity
require(!visitCardMinted, "Visit card already minted");
```

After the mint is completed, the flag is set to `true`:

```solidity
visitCardMinted = true;
```

This prevents minting more than one visit card.

### Soulbound behavior

The soulbound behavior is implemented by blocking transfer and approval operations.

The contract disables:

- `transferFrom`
- `safeTransferFrom`
- `approve`
- `setApprovalForAll`

The contract also uses `_beforeTokenTransfer` to allow minting only when `from == address(0)` and to block normal transfers after minting.

| Operation | Allowed? | Explanation |
|---|---:|---|
| Mint | Yes | The token is created for the student wallet |
| Transfer | No | The visit card is soulbound and cannot be transferred |
| Approval | No | Another address must not be able to transfer the token |
| Operator approval | No | The token must remain linked to the original student wallet |

---

## 5. Contract 2: GameCharacterCollectionERC1155.sol

### Purpose

`GameCharacterCollectionERC1155.sol` implements an ERC-1155 collection with 10 different token IDs.

Each token ID represents a separate game character from the student burnout theme.

### Token IDs

The contract defines 10 constants:

```solidity
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
```

### Metadata URI storage

The contract stores a separate URI for each token ID:

```solidity
mapping(uint256 => string) private tokenURIs;
```

The function `uri(uint256 tokenId)` returns the metadata URI for a specific token ID.

### Batch minting

The function:

```solidity
mintFullCollection(address to)
```

mints all 10 token IDs in one transaction.

Internally it creates:

```text
ids     = [1,2,3,4,5,6,7,8,9,10]
amounts = [1,1,1,1,1,1,1,1,1,1]
```

Then it calls:

```solidity
_mintBatch(to, ids, amounts, "");
```

This demonstrates ERC-1155 batch minting.

### Batch transfer

Batch transfer was demonstrated with the standard ERC-1155 function:

```solidity
safeBatchTransferFrom(from, to, ids, amounts, data)
```

In testing, token IDs `1` and `2` were transferred in one transaction:

```text
ids:     [1,2]
amounts: [1,1]
data:    0x
```

This demonstrates that ERC-1155 allows transferring multiple token IDs in a single transaction.

---

## 6. Metadata Structure and Storage

Metadata is stored outside the smart contracts and referenced through URI strings.

### ERC-721 metadata

The ERC-721 contract uses `tokenURI`.

Example metadata for the soulbound visit card:

```json
{
  "name": "Soulbound Student Burnout Card",
  "description": "A non-transferable student visit card representing Elizabeth, a fictional student surviving academic burnout.",
  "image": "ipfs://REPLACE_WITH_IMAGE_CID/student_visit_card.png",
  "attributes": [
    {
      "trait_type": "Student Name",
      "value": "Elizabeth"
    },
    {
      "trait_type": "Student ID",
      "value": "ST-2026-009"
    },
    {
      "trait_type": "Course",
      "value": "Blockchain and Crypto"
    },
    {
      "trait_type": "Year",
      "value": "2026"
    },
    {
      "trait_type": "Status",
      "value": "Permanently Overdue"
    }
  ]
}
```

During testing, the ERC-721 token was minted with this URI:

```text
ipfs://student-burnout-card-elizabeth.json
```

### ERC-1155 metadata

The ERC-1155 contract uses `uri(tokenId)`.

Example metadata for token ID `1`:

```json
{
  "name": "Deadline Zombie",
  "description": "A burned-out student who keeps moving toward the deadline with almost no energy left.",
  "image": "ipfs://REPLACE_WITH_IMAGE_CID/1.png",
  "attributes": [
    {
      "trait_type": "Emotional State",
      "value": "Exhausted but still moving"
    },
    {
      "trait_type": "Energy",
      "value": 8
    },
    {
      "trait_type": "Rarity",
      "value": "Common"
    }
  ]
}
```

Each ERC-1155 token ID has:

- a unique name;
- a unique image URI;
- a description;
- attributes;
- at least two parameters.

The current educational implementation uses IPFS-style placeholder links. For a final marketplace-compatible version, the placeholders `REPLACE_WITH_IMAGE_CID` and `REPLACE_WITH_METADATA_CID` should be replaced with real IPFS CIDs after uploading the images and JSON metadata files.

---

## 7. Deployment Instructions

Deployment was done in Remix IDE.

### General steps

1. Open Remix IDE.
2. Create `SoulboundVisitCardERC721.sol`.
3. Paste the Solidity code.
4. Compile the contract using Solidity `0.8.20` or a compatible `0.8.x` compiler.
5. Create `GameCharacterCollectionERC1155.sol`.
6. Paste the Solidity code.
7. Compile the second contract.
8. Open the `Deploy & Run Transactions` tab.
9. Connect MetaMask through WalletConnect / Browser Provider.
10. Select **Sepolia testnet**.
11. Deploy `SoulboundVisitCardERC721`.
12. Deploy `GameCharacterCollectionERC1155`.

### Network used

```text
Sepolia testnet
```

### Owner / student wallet used

```text
0xed7cd2da67afab2c2b0ece8892b201aea0d632d3
```

---

## 8. ERC-721 Testing Process

### 8.1 Mint the soulbound visit card

Function used:

```solidity
mintVisitCard(address studentWallet, string memory metadataURI)
```

Parameters used:

```text
studentWallet:
0xed7cd2da67afab2c2b0ece8892b201aea0d632d3

metadataURI:
ipfs://student-burnout-card-elizabeth.json
```

After the transaction was confirmed, token ID `1` was minted to the student wallet.

### 8.2 Check that the visit card was minted

Function used:

```solidity
visitCardMinted()
```

Result:

```text
true
```

This confirms that the visit card was successfully minted and cannot be minted again.

### 8.3 Check token owner

Function used:

```solidity
ownerOf(1)
```

Result:

```text
0xED7cd2DA67afAb2c2B0eCE8892B201aEa0d632d3
```

This confirms that token ID `1` belongs to the student wallet.

---

## 9. ERC-1155 Testing Process

### 9.1 Mint the full collection

Function used:

```solidity
mintFullCollection(address to)
```

Parameter used:

```text
to:
0xed7cd2da67afab2c2b0ece8892b201aea0d632d3
```

This function minted 10 ERC-1155 NFTs in one batch transaction:

```text
Token IDs: [1,2,3,4,5,6,7,8,9,10]
Amounts:   [1,1,1,1,1,1,1,1,1,1]
```

This demonstrates ERC-1155 batch minting.

### 9.2 Batch transfer

Function used:

```solidity
safeBatchTransferFrom(from, to, ids, amounts, data)
```

Parameters used:

```text
from:
0xed7cd2da67afab2c2b0ece8892b201aea0d632d3

to:
0x6cA45741a98Ab6b518C160FeeE24b1425be3e8d2

ids:
[1,2]

amounts:
[1,1]

data:
0x
```

This transferred token IDs `1` and `2` to the second wallet in one transaction.

This demonstrates ERC-1155 batch transfer functionality.

### 9.3 Check balances after batch transfer

Function used:

```solidity
balanceOf(account, id)
```

Check token ID `1`:

```text
account:
0x6cA45741a98Ab6b518C160FeeE24b1425be3e8d2

id:
1
```

Result:

```text
1
```

Check token ID `2`:

```text
account:
0x6cA45741a98Ab6b518C160FeeE24b1425be3e8d2

id:
2
```

Result:

```text
1
```

This confirms that token IDs `1` and `2` were successfully transferred to the second wallet.

---

## 10. Deployed Contract Addresses

### ERC-721 Soulbound Visit Card contract

```text
0x2b4ecbd700FBa8De67eC699339d4d8D98a166635
```

Sepolia Etherscan link:

```text
https://sepolia.etherscan.io/address/0x2b4ecbd700FBa8De67eC699339d4d8D98a166635
```

### ERC-1155 Game Character Collection contract

```text
0xC95d6F9Aeb44850aA4388D06D507223Ff4095850
```

Sepolia Etherscan link:

```text
https://sepolia.etherscan.io/address/0xC95d6F9Aeb44850aA4388D06D507223Ff4095850
```

---

## 11. Proof of Functionality

### Wallets used

Owner / student wallet:

```text
0xed7cd2da67afab2c2b0ece8892b201aea0d632d3
```

Second wallet used for ERC-1155 batch transfer:

```text
0x6cA45741a98Ab6b518C160FeeE24b1425be3e8d2
```

### Transaction evidence

The following blockchain actions were completed on Sepolia:

| Action | Contract | Evidence |
|---|---|---|
| Deploy ERC-721 contract | `SoulboundVisitCardERC721` | Confirmed in Remix / Sepolia Etherscan |
| Mint ERC-721 visit card | `mintVisitCard(...)` | Confirmed in Remix / MetaMask; `visitCardMinted = true`; `ownerOf(1)` returns the student wallet |
| Deploy ERC-1155 contract | `GameCharacterCollectionERC1155` | Confirmed in Remix / Sepolia Etherscan |
| Batch mint 10 ERC-1155 characters | `mintFullCollection(...)` | Confirmed in Remix; transaction shown in Remix console |
| Batch transfer ERC-1155 tokens #1 and #2 | `safeBatchTransferFrom(...)` | Confirmed in Remix; transaction shown in Remix console |
| Verify token #1 transfer | `balanceOf(secondWallet, 1)` | Result: `1` |
| Verify token #2 transfer | `balanceOf(secondWallet, 2)` | Result: `1` |

Visible short transaction hash fragments from the Remix console:

| Action | Short hash shown in Remix |
|---|---|
| ERC-1155 batch mint full collection | `0x7c4...53f71` |
| ERC-1155 batch transfer tokens #1 and #2 | `0xe30...0ab27` |

The full transaction hashes can be opened from the `view on Etherscan` links in Remix or from MetaMask Activity.

### Screenshots included as proof

The submission includes screenshots showing:

1. Both contracts deployed in Remix.
2. ERC-721 mint transaction confirmation.
3. `visitCardMinted = true`.
4. `ownerOf(1)` returning the student wallet address.
5. ERC-1155 `mintFullCollection` transaction confirmation.
6. ERC-1155 `safeBatchTransferFrom` transaction confirmation.
7. `balanceOf(second wallet, 1) = 1`.
8. `balanceOf(second wallet, 2) = 1`.

---

## 12. Conclusion

This assignment demonstrates two NFT standards used for different purposes.

The ERC-721 contract represents one unique student visit card. It is implemented as a soulbound token by disabling transfers and approvals after minting.

The ERC-1155 contract represents a collection of 10 game character NFTs. It demonstrates how multiple token IDs can exist inside one contract and how ERC-1155 supports efficient batch minting and batch transfers.

The contracts were deployed and tested on the Sepolia testnet. The required minting, ownership checks, batch minting, batch transfer, and balance verification were completed successfully.
