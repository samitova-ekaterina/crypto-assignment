import { network } from "hardhat";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";

/**
 * Deploys MyTokenV1 (logic) + MyTokenProxy pointing at V1 with initialize(initialSupply).
 *
 * After deployment, use the PROXY address for all MetaMask / ERC20 interactions.
 * Save addresses to .env for upgrade script: PROXY_ADDRESS=0x...
 */
async function main() {
    const { ethers } = await network.connect({ plugins: [hardhatEthers] });

    const [deployer] = await ethers.getSigners();
    const initialSupply = ethers.parseEther("1000000");

    console.log("Chain id:", (await ethers.provider.getNetwork()).chainId);
    console.log("Deployer:", deployer.address);

    const Impl = await ethers.getContractFactory("MyTokenV1");
    const impl = await Impl.deploy();
    await impl.waitForDeployment();
    const implAddress = await impl.getAddress();
    console.log("MyTokenV1 (logic):", implAddress);

    const initData = Impl.interface.encodeFunctionData("initialize", [initialSupply]);

    const Proxy = await ethers.getContractFactory("MyTokenProxy");
    const proxy = await Proxy.deploy(implAddress, initData);
    await proxy.waitForDeployment();
    const proxyAddress = await proxy.getAddress();
    console.log("MyTokenProxy (use this address as the token):", proxyAddress);

    const token = Impl.attach(proxyAddress);
    console.log("name:", await token.name());
    console.log("symbol:", await token.symbol());
    console.log("owner balance (MTK):", ethers.formatEther(await token.balanceOf(deployer.address)));

    console.log("\n--- For .env (upgrade script) ---");
    console.log(`PROXY_ADDRESS=${proxyAddress}`);
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
