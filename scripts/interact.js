import { network } from "hardhat";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";

/**
 * Mints 500 MTK to RECIPIENT, then transfers 100 MTK from owner to RECIPIENT.
 * Requires PROXY_ADDRESS in .env.
 */
async function main() {
    const { ethers } = await network.connect({ plugins: [hardhatEthers] });

    const proxyAddress = process.env.PROXY_ADDRESS;
    if (!proxyAddress) {
        throw new Error("Set PROXY_ADDRESS in .env");
    }

    const recipient = "0x6cA45741a98Ab6b518C160FeeE24b1425be3e8d2";

    const [owner] = await ethers.getSigners();
    console.log("Owner:", owner.address);
    console.log("Recipient:", recipient);
    console.log("Proxy (token):", proxyAddress);
    console.log("");

    const token = await ethers.getContractAt("MyTokenV1", proxyAddress);

    // Balances before
    const ownerBalBefore = await token.balanceOf(owner.address);
    const recipBalBefore = await token.balanceOf(recipient);
    console.log("--- Balances BEFORE ---");
    console.log("Owner    :", ethers.formatEther(ownerBalBefore), "MTK");
    console.log("Recipient:", ethers.formatEther(recipBalBefore), "MTK");
    console.log("");

    // 1) Mint 500 MTK to recipient
    console.log(">>> Mint 500 MTK to recipient...");
    const mintTx = await token.mint(recipient, ethers.parseEther("500"));
    const mintReceipt = await mintTx.wait();
    console.log("mint tx hash:", mintReceipt.hash);
    console.log("");

    // 2) Transfer 100 MTK from owner to recipient
    console.log(">>> Transfer 100 MTK from owner to recipient...");
    const transferTx = await token.transfer(recipient, ethers.parseEther("100"));
    const transferReceipt = await transferTx.wait();
    console.log("transfer tx hash:", transferReceipt.hash);
    console.log("");

    // Balances after
    const ownerBalAfter = await token.balanceOf(owner.address);
    const recipBalAfter = await token.balanceOf(recipient);
    console.log("--- Balances AFTER ---");
    console.log("Owner    :", ethers.formatEther(ownerBalAfter), "MTK");
    console.log("Recipient:", ethers.formatEther(recipBalAfter), "MTK");
    console.log("");

    console.log("--- For the report ---");
    console.log("Mint tx    : https://sepolia.etherscan.io/tx/" + mintReceipt.hash);
    console.log("Transfer tx: https://sepolia.etherscan.io/tx/" + transferReceipt.hash);
    console.log("Proxy page : https://sepolia.etherscan.io/address/" + proxyAddress);
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});