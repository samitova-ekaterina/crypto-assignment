import { network } from "hardhat";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";

/**
 * Post-upgrade verification:
 *  - balances are preserved (through the proxy)
 *  - version() returns "V2" (new logic is live)
 *  - a fresh transfer still works (V1 behavior intact)
 */
async function main() {
    const { ethers } = await network.connect({ plugins: [hardhatEthers] });

    const proxyAddress = process.env.PROXY_ADDRESS;
    if (!proxyAddress) {
        throw new Error("Set PROXY_ADDRESS in .env");
    }

    const recipient = "0x6cA45741a98Ab6b518C160FeeE24b1425be3e8d2";

    const [owner] = await ethers.getSigners();
    console.log("Owner    :", owner.address);
    console.log("Recipient:", recipient);
    console.log("Proxy    :", proxyAddress);
    console.log("");

    // Read via V2 ABI (includes version())
    const token = await ethers.getContractAt("MyTokenV2", proxyAddress);

    // 1) version() - new function, proof that upgrade is live
    const ver = await token.version();
    console.log(">>> version() via proxy:", ver);
    console.log("");

    // 2) balances preserved from V1 state
    const ownerBal = await token.balanceOf(owner.address);
    const recipBal = await token.balanceOf(recipient);
    console.log("--- Balances AFTER upgrade (via proxy) ---");
    console.log("Owner    :", ethers.formatEther(ownerBal), "MTK");
    console.log("Recipient:", ethers.formatEther(recipBal), "MTK");
    console.log("Total    :", ethers.formatEther(await token.totalSupply()), "MTK");
    console.log("");
    console.log("Expected: Owner = 999900 MTK, Recipient = 600 MTK, Total = 1000500 MTK");
    console.log("");

    // 3) Bonus: transfer still works after upgrade (V1 functionality intact)
    console.log(">>> Making a post-upgrade transfer of 50 MTK to confirm V1 behavior still works...");
    const tx = await token.transfer(recipient, ethers.parseEther("50"));
    const receipt = await tx.wait();
    console.log("post-upgrade transfer tx:", receipt.hash);

    const ownerBalFinal = await token.balanceOf(owner.address);
    const recipBalFinal = await token.balanceOf(recipient);
    console.log("--- Balances AFTER post-upgrade transfer ---");
    console.log("Owner    :", ethers.formatEther(ownerBalFinal), "MTK");
    console.log("Recipient:", ethers.formatEther(recipBalFinal), "MTK");
    console.log("");

    console.log("--- For the report ---");
    console.log("Proxy page     : https://sepolia.etherscan.io/address/" + proxyAddress);
    console.log("Post-upgrade tx: https://sepolia.etherscan.io/tx/" + receipt.hash);
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});