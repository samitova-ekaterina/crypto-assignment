import { network } from "hardhat";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";

/**
 * Deploys MyTokenV2 logic and points the existing proxy to it (UUPS).
 *
 * Requires PROXY_ADDRESS in environment (same address users hold as "token").
 * Caller must be the proxy owner (the address that ran initialize).
 */
async function main() {
    const { ethers } = await network.connect({ plugins: [hardhatEthers] });

    const proxyAddress = process.env.PROXY_ADDRESS;
    if (!proxyAddress) {
        throw new Error("Set PROXY_ADDRESS to your MyTokenProxy address (e.g. in .env)");
    }

    const [deployer] = await ethers.getSigners();
    console.log("Deployer (must be proxy owner):", deployer.address);
    console.log("Proxy:", proxyAddress);

    const V2Factory = await ethers.getContractFactory("MyTokenV2");
    const v2impl = await V2Factory.deploy();
    await v2impl.waitForDeployment();
    const v2Address = await v2impl.getAddress();
    console.log("MyTokenV2 (new logic):", v2Address);

    const v1AtProxy = await ethers.getContractAt("MyTokenV1", proxyAddress);
    const tx = await v1AtProxy.upgradeToAndCall(v2Address, "0x");
    const receipt = await tx.wait();
    console.log("upgradeToAndCall tx hash:", receipt.hash);

    const tokenV2 = await ethers.getContractAt("MyTokenV2", proxyAddress);
    console.log('version():', await tokenV2.version());
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
