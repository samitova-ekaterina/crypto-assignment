import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("MultiSigWallet", function () {
    async function deployWalletFixture() {
        const [owner1, owner2, owner3, nonOwner, recipient] =
            await ethers.getSigners();

        const requiredConfirmations = 2;

        const wallet = await ethers.deployContract("MultiSigWallet", [
            [owner1.address, owner2.address, owner3.address],
            requiredConfirmations,
        ]);

        await wallet.waitForDeployment();

        return {
            wallet,
            owner1,
            owner2,
            owner3,
            nonOwner,
            recipient,
            requiredConfirmations,
        };
    }

    it("Should deploy with correct owners and required confirmations", async function () {
        const { wallet, owner1, owner2, owner3, requiredConfirmations } =
            await deployWalletFixture();

        expect(await wallet.isOwner(owner1.address)).to.equal(true);
        expect(await wallet.isOwner(owner2.address)).to.equal(true);
        expect(await wallet.isOwner(owner3.address)).to.equal(true);
        expect(await wallet.requiredConfirmations()).to.equal(
            requiredConfirmations
        );

        const owners = await wallet.getOwners();
        expect(owners.length).to.equal(3);
    });

    it("Should receive Ether", async function () {
        const { wallet, owner1 } = await deployWalletFixture();

        const walletAddress = await wallet.getAddress();
        const amount = ethers.parseEther("1");

        await owner1.sendTransaction({
            to: walletAddress,
            value: amount,
        });

        expect(await ethers.provider.getBalance(walletAddress)).to.equal(amount);
    });

    it("Should allow an owner to submit a transaction", async function () {
        const { wallet, recipient } = await deployWalletFixture();

        const amount = ethers.parseEther("0.5");

        await wallet.submitTransaction(recipient.address, amount, "0x");

        expect(await wallet.getTransactionCount()).to.equal(1);

        const transaction = await wallet.getTransaction(0);

        expect(transaction[0]).to.equal(recipient.address);
        expect(transaction[1]).to.equal(amount);
        expect(transaction[3]).to.equal(false);
        expect(transaction[4]).to.equal(0);
    });

    it("Should not allow a non-owner to submit a transaction", async function () {
        const { wallet, nonOwner, recipient } = await deployWalletFixture();

        const amount = ethers.parseEther("0.5");

        await expect(
            wallet.connect(nonOwner).submitTransaction(recipient.address, amount, "0x")
        ).to.be.revertedWith("Not an owner");
    });

    it("Should allow owners to confirm a transaction", async function () {
        const { wallet, owner1, owner2, recipient } = await deployWalletFixture();

        const amount = ethers.parseEther("0.5");

        await wallet.submitTransaction(recipient.address, amount, "0x");

        await wallet.connect(owner1).confirmTransaction(0);
        await wallet.connect(owner2).confirmTransaction(0);

        const transaction = await wallet.getTransaction(0);

        expect(transaction[4]).to.equal(2);
        expect(await wallet.isConfirmed(0, owner1.address)).to.equal(true);
        expect(await wallet.isConfirmed(0, owner2.address)).to.equal(true);
    });

    it("Should not allow duplicate confirmations", async function () {
        const { wallet, owner1, recipient } = await deployWalletFixture();

        const amount = ethers.parseEther("0.5");

        await wallet.submitTransaction(recipient.address, amount, "0x");

        await wallet.connect(owner1).confirmTransaction(0);

        await expect(
            wallet.connect(owner1).confirmTransaction(0)
        ).to.be.revertedWith("Transaction already confirmed");
    });

    it("Should allow an owner to revoke confirmation before execution", async function () {
        const { wallet, owner1, recipient } = await deployWalletFixture();

        const amount = ethers.parseEther("0.5");

        await wallet.submitTransaction(recipient.address, amount, "0x");

        await wallet.connect(owner1).confirmTransaction(0);
        await wallet.connect(owner1).revokeConfirmation(0);

        const transaction = await wallet.getTransaction(0);

        expect(transaction[4]).to.equal(0);
        expect(await wallet.isConfirmed(0, owner1.address)).to.equal(false);
    });

    it("Should not execute transaction without enough confirmations", async function () {
        const { wallet, owner1, recipient } = await deployWalletFixture();

        const amount = ethers.parseEther("0.5");

        await wallet.submitTransaction(recipient.address, amount, "0x");
        await wallet.connect(owner1).confirmTransaction(0);

        await expect(wallet.executeTransaction(0)).to.be.revertedWith(
            "Not enough confirmations"
        );
    });

    it("Should execute transaction after required confirmations", async function () {
        const { wallet, owner1, owner2, recipient } = await deployWalletFixture();

        const walletAddress = await wallet.getAddress();
        const depositAmount = ethers.parseEther("1");
        const transferAmount = ethers.parseEther("0.5");

        await owner1.sendTransaction({
            to: walletAddress,
            value: depositAmount,
        });

        const recipientBalanceBefore = await ethers.provider.getBalance(
            recipient.address
        );

        await wallet.submitTransaction(recipient.address, transferAmount, "0x");

        await wallet.connect(owner1).confirmTransaction(0);
        await wallet.connect(owner2).confirmTransaction(0);

        await wallet.executeTransaction(0);

        const recipientBalanceAfter = await ethers.provider.getBalance(
            recipient.address
        );

        const transaction = await wallet.getTransaction(0);

        expect(transaction[3]).to.equal(true);
        expect(recipientBalanceAfter - recipientBalanceBefore).to.equal(
            transferAmount
        );
    });

    it("Should add a new owner through a multi-sig transaction", async function () {
        const { wallet, owner1, owner2, nonOwner } = await deployWalletFixture();

        const walletAddress = await wallet.getAddress();

        const data = wallet.interface.encodeFunctionData("addOwner", [
            nonOwner.address,
        ]);

        await wallet.submitTransaction(walletAddress, 0, data);

        await wallet.connect(owner1).confirmTransaction(0);
        await wallet.connect(owner2).confirmTransaction(0);

        await wallet.executeTransaction(0);

        expect(await wallet.isOwner(nonOwner.address)).to.equal(true);

        const owners = await wallet.getOwners();
        expect(owners.length).to.equal(4);
    });

    it("Should remove an owner through a multi-sig transaction", async function () {
        const { wallet, owner1, owner2, owner3 } = await deployWalletFixture();

        const walletAddress = await wallet.getAddress();

        const data = wallet.interface.encodeFunctionData("removeOwner", [
            owner3.address,
        ]);

        await wallet.submitTransaction(walletAddress, 0, data);

        await wallet.connect(owner1).confirmTransaction(0);
        await wallet.connect(owner2).confirmTransaction(0);

        await wallet.executeTransaction(0);

        expect(await wallet.isOwner(owner3.address)).to.equal(false);

        const owners = await wallet.getOwners();
        expect(owners.length).to.equal(2);
    });

    it("Should change required confirmations through a multi-sig transaction", async function () {
        const { wallet, owner1, owner2 } = await deployWalletFixture();

        const walletAddress = await wallet.getAddress();

        const data = wallet.interface.encodeFunctionData(
            "changeRequiredConfirmations",
            [1]
        );

        await wallet.submitTransaction(walletAddress, 0, data);

        await wallet.connect(owner1).confirmTransaction(0);
        await wallet.connect(owner2).confirmTransaction(0);

        await wallet.executeTransaction(0);

        expect(await wallet.requiredConfirmations()).to.equal(1);
    });

    it("Should emit Deposit event when receiving Ether", async function () {
        const { wallet, owner1 } = await deployWalletFixture();

        const walletAddress = await wallet.getAddress();
        const amount = ethers.parseEther("1");

        await expect(
            owner1.sendTransaction({
                to: walletAddress,
                value: amount,
            })
        )
            .to.emit(wallet, "Deposit")
            .withArgs(owner1.address, amount, amount);
    });

    it("Should emit SubmitTransaction event", async function () {
        const { wallet, owner1, recipient } = await deployWalletFixture();

        const amount = ethers.parseEther("0.5");

        await expect(
            wallet.connect(owner1).submitTransaction(recipient.address, amount, "0x")
        )
            .to.emit(wallet, "SubmitTransaction")
            .withArgs(owner1.address, 0, recipient.address, amount, "0x");
    });

    it("Should emit ConfirmTransaction event", async function () {
        const { wallet, owner1, recipient } = await deployWalletFixture();

        const amount = ethers.parseEther("0.5");

        await wallet.submitTransaction(recipient.address, amount, "0x");

        await expect(wallet.connect(owner1).confirmTransaction(0))
            .to.emit(wallet, "ConfirmTransaction")
            .withArgs(owner1.address, 0);
    });

    it("Should emit RevokeConfirmation event", async function () {
        const { wallet, owner1, recipient } = await deployWalletFixture();

        const amount = ethers.parseEther("0.5");

        await wallet.submitTransaction(recipient.address, amount, "0x");

        await wallet.connect(owner1).confirmTransaction(0);

        await expect(wallet.connect(owner1).revokeConfirmation(0))
            .to.emit(wallet, "RevokeConfirmation")
            .withArgs(owner1.address, 0);
    });

    it("Should emit ExecuteTransaction event", async function () {
        const { wallet, owner1, owner2, recipient } = await deployWalletFixture();

        const walletAddress = await wallet.getAddress();
        const depositAmount = ethers.parseEther("1");
        const transferAmount = ethers.parseEther("0.5");

        await owner1.sendTransaction({
            to: walletAddress,
            value: depositAmount,
        });

        await wallet.submitTransaction(recipient.address, transferAmount, "0x");

        await wallet.connect(owner1).confirmTransaction(0);
        await wallet.connect(owner2).confirmTransaction(0);

        await expect(wallet.connect(owner1).executeTransaction(0))
            .to.emit(wallet, "ExecuteTransaction")
            .withArgs(owner1.address, 0);
    });

    it("Should reject confirmation for invalid transaction id", async function () {
        const { wallet, owner1 } = await deployWalletFixture();

        await expect(
            wallet.connect(owner1).confirmTransaction(999)
        ).to.be.revertedWith("Transaction does not exist");
    });

    it("Should reject execution for invalid transaction id", async function () {
        const { wallet, owner1 } = await deployWalletFixture();

        await expect(
            wallet.connect(owner1).executeTransaction(999)
        ).to.be.revertedWith("Transaction does not exist");
    });

    it("Should reject revocation for invalid transaction id", async function () {
        const { wallet, owner1 } = await deployWalletFixture();

        await expect(
            wallet.connect(owner1).revokeConfirmation(999)
        ).to.be.revertedWith("Transaction does not exist");
    });

    it("Should not allow direct addOwner call", async function () {
        const { wallet, nonOwner } = await deployWalletFixture();

        await expect(
            wallet.addOwner(nonOwner.address)
        ).to.be.revertedWith("Only wallet can call this function");
    });

    it("Should not allow direct removeOwner call", async function () {
        const { wallet, owner3 } = await deployWalletFixture();

        await expect(
            wallet.removeOwner(owner3.address)
        ).to.be.revertedWith("Only wallet can call this function");
    });

    it("Should not allow direct changeRequiredConfirmations call", async function () {
        const { wallet } = await deployWalletFixture();

        await expect(
            wallet.changeRequiredConfirmations(1)
        ).to.be.revertedWith("Only wallet can call this function");
    });

    it("Should emit OwnerAdded event through a multi-sig transaction", async function () {
        const { wallet, owner1, owner2, nonOwner } = await deployWalletFixture();

        const walletAddress = await wallet.getAddress();

        const data = wallet.interface.encodeFunctionData("addOwner", [
            nonOwner.address,
        ]);

        await wallet.submitTransaction(walletAddress, 0, data);

        await wallet.connect(owner1).confirmTransaction(0);
        await wallet.connect(owner2).confirmTransaction(0);

        await expect(wallet.executeTransaction(0))
            .to.emit(wallet, "OwnerAdded")
            .withArgs(nonOwner.address);
    });

    it("Should emit OwnerRemoved event through a multi-sig transaction", async function () {
        const { wallet, owner1, owner2, owner3 } = await deployWalletFixture();

        const walletAddress = await wallet.getAddress();

        const data = wallet.interface.encodeFunctionData("removeOwner", [
            owner3.address,
        ]);

        await wallet.submitTransaction(walletAddress, 0, data);

        await wallet.connect(owner1).confirmTransaction(0);
        await wallet.connect(owner2).confirmTransaction(0);

        await expect(wallet.executeTransaction(0))
            .to.emit(wallet, "OwnerRemoved")
            .withArgs(owner3.address);
    });

    it("Should emit RequiredConfirmationsChanged event through a multi-sig transaction", async function () {
        const { wallet, owner1, owner2 } = await deployWalletFixture();

        const walletAddress = await wallet.getAddress();

        const data = wallet.interface.encodeFunctionData(
            "changeRequiredConfirmations",
            [1]
        );

        await wallet.submitTransaction(walletAddress, 0, data);

        await wallet.connect(owner1).confirmTransaction(0);
        await wallet.connect(owner2).confirmTransaction(0);

        await expect(wallet.executeTransaction(0))
            .to.emit(wallet, "RequiredConfirmationsChanged")
            .withArgs(1);
    });
});
