# Module 6 — ERC-20 Fungible Token

Creating and deploying a custom fungible token (ERC-20) on Ethereum using Hardhat and OpenZeppelin.

## Stack

- Solidity 0.8.28
- Hardhat 3
- OpenZeppelin Contracts (ERC20, Ownable)
- Ethers.js v6
- Mocha + Chai

## Contract overview

The `MyToken` contract (symbol `MTK`) is a standard ERC-20 token with an additional `mint` function restricted to the contract owner via OpenZeppelin's `Ownable`.

- Initial supply: 1,000,000 MTK
- At deployment, the entire initial supply is minted to the deployer
- The owner can mint additional tokens via `mint(to, amount)`

## Project structure


module-6-erc20-token/
├── contracts/
│   └── MyToken.sol          # Token smart contract
├── scripts/
│   └── deploy.js            # Deployment script
├── test/
│   └── MyToken.test.js      # Tests (6 cases)
├── hardhat.config.ts        # Hardhat configuration
├── package.json
└── README.md


## How to run locally

Install dependencies:

```bash
npm install
```

Compile the contract:

```bash
npx hardhat compile
```

Run tests:

```bash
npx hardhat test
```

Deploy to the local Hardhat network (start the node in one terminal, run the deploy script in another):

```bash
npx hardhat node
```

```bash
npx hardhat run scripts/deploy.js --network localhost
```

## Deployment to Sepolia Testnet

To deploy to the public Sepolia test network, create a `.env` file in the module root with the following variables:


SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
SEPOLIA_PRIVATE_KEY=your_wallet_private_key


Then run:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## Deployed contract

- **Network:** Sepolia Testnet
- **Contract address:** `0x78f62c4Fac44d5D69eFC79565153A7dB7A97F0AE`
- **Deployer address:** `0xeD7cd2DA67afAb2c2B0eCE8892B201aEa0d632d3`
- **Etherscan:** https://sepolia.etherscan.io/address/0x78f62c4Fac44d5D69eFC79565153A7dB7A97F0AE

## Tests

Coverage:

- Initial supply is assigned to the owner
- Token transfer between accounts
- Balances update correctly after a transfer
- Owner can mint new tokens
- Non-owner cannot call mint (access control)
- Transfer reverts when the sender has insufficient balance (edge case)

All 6 tests pass successfully.