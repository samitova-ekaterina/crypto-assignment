// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title MultiSigWallet
/// @notice A wallet that requires multiple owners to confirm a transaction before execution.
contract MultiSigWallet {
    // -----------------------------
    // Events
    // -----------------------------

    /// @notice Emitted when the wallet receives Ether.
    event Deposit(address indexed sender, uint256 amount, uint256 balance);

    /// @notice Emitted when a new transaction is submitted.
    event SubmitTransaction(
        address indexed owner,
        uint256 indexed txIndex,
        address indexed to,
        uint256 value,
        bytes data
    );

    /// @notice Emitted when an owner confirms a transaction.
    event ConfirmTransaction(address indexed owner, uint256 indexed txIndex);

    /// @notice Emitted when an owner revokes a confirmation.
    event RevokeConfirmation(address indexed owner, uint256 indexed txIndex);

    /// @notice Emitted when a transaction is executed.
    event ExecuteTransaction(address indexed owner, uint256 indexed txIndex);

    /// @notice Emitted when a new owner is added.
    event OwnerAdded(address indexed newOwner);

    /// @notice Emitted when an owner is removed.
    event OwnerRemoved(address indexed removedOwner);

    /// @notice Emitted when the required number of confirmations is changed.
    event RequiredConfirmationsChanged(uint256 newRequiredConfirmations);

    // -----------------------------
    // Data structures
    // -----------------------------

    struct Transaction {
        address to;                 // Recipient address
        uint256 value;              // Amount of Ether to send
        bytes data;                 // Optional call data
        bool executed;              // True if transaction was executed
        uint256 numConfirmations;   // Number of confirmations
    }

    address[] public owners;
    mapping(address => bool) public isOwner;

    uint256 public requiredConfirmations;

    Transaction[] public transactions;

    mapping(uint256 => mapping(address => bool)) public isConfirmed;

    // -----------------------------
    // Modifiers
    // -----------------------------

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not an owner");
        _;
    }

    modifier txExists(uint256 _txIndex) {
        require(_txIndex < transactions.length, "Transaction does not exist");
        _;
    }

    modifier notExecuted(uint256 _txIndex) {
        require(!transactions[_txIndex].executed, "Transaction already executed");
        _;
    }

    modifier notConfirmed(uint256 _txIndex) {
        require(!isConfirmed[_txIndex][msg.sender], "Transaction already confirmed");
        _;
    }

    modifier confirmed(uint256 _txIndex) {
        require(isConfirmed[_txIndex][msg.sender], "Transaction not confirmed");
        _;
    }

    modifier validOwner(address _owner) {
        require(_owner != address(0), "Invalid owner address");
        require(!isOwner[_owner], "Already an owner");
        _;
    }

    modifier validRequirement(uint256 _ownerCount, uint256 _requiredConfirmations) {
        require(_ownerCount > 0, "Owners required");
        require(
            _requiredConfirmations > 0 && _requiredConfirmations <= _ownerCount,
            "Invalid number of required confirmations"
        );
        _;
    }

    // -----------------------------
    // Constructor
    // -----------------------------

    constructor(address[] memory _owners, uint256 _requiredConfirmations)
    validRequirement(_owners.length, _requiredConfirmations)
    {
        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];

            require(owner != address(0), "Invalid owner address");
            require(!isOwner[owner], "Owner not unique");

            isOwner[owner] = true;
            owners.push(owner);
        }

        requiredConfirmations = _requiredConfirmations;
    }

    // -----------------------------
    // Receive Ether
    // -----------------------------

    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    // -----------------------------
    // Transaction lifecycle
    // -----------------------------

    /// @notice Submit a new transaction for approval.
    function submitTransaction(address _to, uint256 _value, bytes memory _data)
    public
    onlyOwner
    {
        require(_to != address(0), "Invalid recipient");

        uint256 txIndex = transactions.length;

        transactions.push(
            Transaction({
                to: _to,
                value: _value,
                data: _data,
                executed: false,
                numConfirmations: 0
            })
        );

        emit SubmitTransaction(msg.sender, txIndex, _to, _value, _data);
    }

    /// @notice Confirm a transaction that has not yet been executed.
    function confirmTransaction(uint256 _txIndex)
    public
    onlyOwner
    txExists(_txIndex)
    notExecuted(_txIndex)
    notConfirmed(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];

        transaction.numConfirmations += 1;
        isConfirmed[_txIndex][msg.sender] = true;

        emit ConfirmTransaction(msg.sender, _txIndex);
    }

    /// @notice Execute a transaction once enough confirmations are collected.
    function executeTransaction(uint256 _txIndex)
    public
    onlyOwner
    txExists(_txIndex)
    notExecuted(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];

        require(
            transaction.numConfirmations >= requiredConfirmations,
            "Not enough confirmations"
        );

        // Checks-effects-interactions:
        // First mark as executed, then call external address.
        transaction.executed = true;

        (bool success, ) = transaction.to.call{value: transaction.value}(
            transaction.data
        );

        require(success, "Transaction failed");

        emit ExecuteTransaction(msg.sender, _txIndex);
    }

    /// @notice Revoke a confirmation before the transaction is executed.
    function revokeConfirmation(uint256 _txIndex)
    public
    onlyOwner
    txExists(_txIndex)
    notExecuted(_txIndex)
    confirmed(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];

        transaction.numConfirmations -= 1;
        isConfirmed[_txIndex][msg.sender] = false;

        emit RevokeConfirmation(msg.sender, _txIndex);
    }

    // -----------------------------
    // Owner management
    // -----------------------------

    /// @notice Add a new owner. This action must be executed through the wallet itself.
    function addOwner(address _newOwner)
    public
    onlyWallet
    validOwner(_newOwner)
    {
        isOwner[_newOwner] = true;
        owners.push(_newOwner);

        emit OwnerAdded(_newOwner);
    }

    /// @notice Remove an existing owner. This action must be executed through the wallet itself.
    function removeOwner(address _owner)
    public
    onlyWallet
    {
        require(isOwner[_owner], "Not an owner");

        isOwner[_owner] = false;

        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i] == _owner) {
                owners[i] = owners[owners.length - 1];
                owners.pop();
                break;
            }
        }

        if (requiredConfirmations > owners.length) {
            changeRequiredConfirmations(owners.length);
        }

        emit OwnerRemoved(_owner);
    }

    /// @notice Change the number of required confirmations. This action must be executed through the wallet itself.
    function changeRequiredConfirmations(uint256 _requiredConfirmations)
    public
    onlyWallet
    validRequirement(owners.length, _requiredConfirmations)
    {
        requiredConfirmations = _requiredConfirmations;

        emit RequiredConfirmationsChanged(_requiredConfirmations);
    }

    /// @notice Restricts a function so it can only be called by the wallet contract itself.
    modifier onlyWallet() {
        require(msg.sender == address(this), "Only wallet can call this function");
        _;
    }

    // -----------------------------
    // View functions
    // -----------------------------

    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    function getTransactionCount() public view returns (uint256) {
        return transactions.length;
    }

    function getTransaction(uint256 _txIndex)
    public
    view
    txExists(_txIndex)
    returns (
        address to,
        uint256 value,
        bytes memory data,
        bool executed,
        uint256 numConfirmations
    )
    {
        Transaction storage transaction = transactions[_txIndex];

        return (
            transaction.to,
            transaction.value,
            transaction.data,
            transaction.executed,
            transaction.numConfirmations
        );
    }
}