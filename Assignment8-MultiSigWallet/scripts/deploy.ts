import { network } from "hardhat";

const { ethers } = await network.connect();

async function main() {
    // Get test accounts from the selected Hardhat network.
    const [owner1, owner2, owner3] = await ethers.getSigners();

    // Multi-signature wallet owners.
    const owners = [owner1.address, owner2.address, owner3.address];

    // Number of confirmations required to execute a transaction.
    const requiredConfirmations = 2;

    // Deploy the MultiSigWallet contract.
    const wallet = await ethers.deployContract("MultiSigWallet", [
        owners,
        requiredConfirmations,
    ]);

    await wallet.waitForDeployment();

    console.log("MultiSigWallet deployed to:", await wallet.getAddress());
    console.log("Owner 1:", owner1.address);
    console.log("Owner 2:", owner2.address);
    console.log("Owner 3:", owner3.address);
    console.log("Required confirmations:", requiredConfirmations);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});