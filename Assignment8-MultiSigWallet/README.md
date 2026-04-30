# Assignment 8 — Multi-Signature Wallet Smart Contract

## 1. Project overview

This project implements a Multi-Signature Wallet smart contract in Solidity.

A multi-signature wallet is a wallet controlled by several owners. Instead of allowing one person to execute transactions alone, the wallet requires a predefined number of confirmations from different owners before a transaction can be executed.

In this implementation, the wallet supports:

- multiple wallet owners;
- a required number of confirmations;
- submitting transactions;
- confirming transactions;
- revoking confirmations;
- executing approved transactions;
- receiving Ether;
- adding a new owner;
- removing an existing owner;
- changing the required number of confirmations;
- automated tests for the main wallet functionality.

The project was implemented and tested using Hardhat 3, TypeScript, Mocha, Chai, and Ethers.js.

---

## 2. Functional requirements

The wallet implements the main required functionality of a multi-signature wallet.

### 2.1 Owner management

The wallet stores a list of owners. Each owner address is also stored in a mapping:

```solidity
address[] public owners;
mapping(address => bool) public isOwner;
```

This makes it possible to:

- list all owners;
- quickly check whether an address is an owner;
- restrict sensitive actions only to wallet owners.

The constructor checks that:

- there is at least one owner;
- owner addresses are not zero addresses;
- owner addresses are unique;
- the required number of confirmations is valid.

### 2.2 Required confirmations

The contract stores the number of confirmations required to execute a transaction:

```solidity
uint256 public requiredConfirmations;
```

For example, if there are 3 owners and `requiredConfirmations = 2`, then any submitted transaction must be confirmed by at least 2 different owners before it can be executed.

### 2.3 Transaction submission

An owner can submit a new transaction using:

```solidity
submitTransaction(address _to, uint256 _value, bytes memory _data)
```

Each transaction contains:

- recipient address;
- Ether value;
- optional calldata;
- execution status;
- number of confirmations.

Transactions are stored in an array:

```solidity
Transaction[] public transactions;
```

### 2.4 Transaction confirmation

Owners can confirm submitted transactions using:

```solidity
confirmTransaction(uint256 _txIndex)
```

The contract prevents:

- non-owners from confirming;
- confirming a non-existing transaction;
- confirming an already executed transaction;
- confirming the same transaction twice by the same owner.

### 2.5 Revoking confirmation

Before a transaction is executed, an owner can revoke their confirmation:

```solidity
revokeConfirmation(uint256 _txIndex)
```

This decreases the number of confirmations and marks the owner as no longer having confirmed that transaction.

### 2.6 Transaction execution

Once a transaction has enough confirmations, any owner can execute it:

```solidity
executeTransaction(uint256 _txIndex)
```

The contract checks that:

- the transaction exists;
- the transaction has not already been executed;
- the number of confirmations is enough.

The transaction is marked as executed before the external call is made. This follows the checks-effects-interactions pattern and helps reduce reentrancy risk.

### 2.7 Adding and removing owners

The optional functionality for adding and removing owners was also implemented.

The functions are:

```solidity
addOwner(address _newOwner)
removeOwner(address _owner)
changeRequiredConfirmations(uint256 _requiredConfirmations)
```

These functions can only be called by the wallet contract itself:

```solidity
modifier onlyWallet() {
    require(msg.sender == address(this), "Only wallet can call this function");
    _;
}
```

This means that owners cannot directly add or remove owners alone. Instead, owner management must go through the same multi-signature approval process as normal transactions.

This design is more secure because changing the owner list is a sensitive governance action.

---

## 3. Contract design

### 3.1 Transaction structure

The transaction structure is:

```solidity
struct Transaction {
    address to;
    uint256 value;
    bytes data;
    bool executed;
    uint256 numConfirmations;
}
```

This allows the wallet to store both simple Ether transfers and more advanced contract calls.

### 3.2 Confirmation tracking

Confirmations are tracked using a nested mapping:

```solidity
mapping(uint256 => mapping(address => bool)) public isConfirmed;
```

The first key is the transaction index.  
The second key is the owner address.

This structure allows the contract to check whether a specific owner has already confirmed a specific transaction.

### 3.3 Access control

The contract uses modifiers to protect functions:

```solidity
modifier onlyOwner()
modifier txExists(uint256 _txIndex)
modifier notExecuted(uint256 _txIndex)
modifier notConfirmed(uint256 _txIndex)
modifier confirmed(uint256 _txIndex)
modifier onlyWallet()
```

These modifiers make the contract easier to read and reduce repeated validation logic.

---

## 4. Security considerations

### 4.1 Protection against unauthorized access

Only owners can:

- submit transactions;
- confirm transactions;
- revoke confirmations;
- execute transactions.

This is enforced using the `onlyOwner` modifier.

### 4.2 Protection against duplicate confirmations

The contract prevents one owner from confirming the same transaction more than once.

This is important because otherwise one owner could artificially increase the confirmation count.

### 4.3 Protection against invalid transactions

The contract checks that:

- a transaction exists;
- the recipient is not the zero address;
- the transaction has not already been executed;
- there are enough confirmations before execution.

### 4.4 Checks-effects-interactions pattern

In `executeTransaction`, the contract sets:

```solidity
transaction.executed = true;
```

before making the external call:

```solidity
(bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
```

This follows the checks-effects-interactions pattern.

### 4.5 Secure owner management

Adding and removing owners is not done directly by one owner.  
Instead, these actions must be submitted as wallet transactions and approved by the required number of owners.

This prevents a single owner from taking control of the wallet governance.

---

## 5. Testing

Automated tests were written in TypeScript using Mocha and Chai.

The tests cover both the main required functionality and additional edge cases.

The tests cover:

- deployment with correct owners;
- correct required confirmations value;
- receiving Ether;
- emitting the Deposit event when Ether is received;
- submitting a transaction;
- emitting the SubmitTransaction event;
- preventing non-owners from submitting transactions;
- confirming transactions;
- emitting the ConfirmTransaction event;
- preventing duplicate confirmations;
- revoking confirmations before execution;
- emitting the RevokeConfirmation event;
- preventing execution without enough confirmations;
- executing a transaction after enough confirmations;
- emitting the ExecuteTransaction event;
- rejecting confirmation for an invalid transaction id;
- rejecting execution for an invalid transaction id;
- rejecting revocation for an invalid transaction id;
- adding a new owner through a multi-signature transaction;
- emitting the OwnerAdded event;
- removing an owner through a multi-signature transaction;
- emitting the OwnerRemoved event;
- changing the required number of confirmations through a multi-signature transaction;
- emitting the RequiredConfirmationsChanged event;
- preventing direct calls to addOwner;
- preventing direct calls to removeOwner;
- preventing direct calls to changeRequiredConfirmations.

Full test command:

```bash
npx hardhat test
```

---

## 6. Local deployment

The contract was deployed locally using a Hardhat script.

Deployment command:

```bash
npx hardhat run scripts/deploy.ts
```

Example local deployment result:

```text
MultiSigWallet deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Owner 1: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Owner 2: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Owner 3: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Required confirmations: 2
```

The address is a local Hardhat network address and is used only for local testing.

---

## 7. How to run the project

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

Deploy locally:

```bash
npx hardhat run scripts/deploy.ts
```

---

## 8. Conclusion

The project implements a working multi-signature wallet smart contract. It allows several owners to jointly control wallet transactions and requires a predefined number of confirmations before execution.

The implementation includes the core multi-signature workflow and optional owner management functionality. The contract was compiled, tested, and deployed locally using Hardhat.

The tests confirm that the main functionality works correctly and that important security restrictions are enforced.
