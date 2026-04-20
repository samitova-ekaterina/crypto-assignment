import { expect } from "chai";
import { network } from "hardhat";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";

describe("MyToken UUPS proxy (V1 -> V2)", function () {
    async function deployProxyFixture() {
        const { ethers } = await network.connect({ plugins: [hardhatEthers] });
        const [owner, alice, bob] = await ethers.getSigners();
        const initialSupply = ethers.parseEther("1000000");

        const Impl = await ethers.getContractFactory("MyTokenV1");
        const impl = await Impl.deploy();
        await impl.waitForDeployment();
        const implAddress = await impl.getAddress();

        const initData = Impl.interface.encodeFunctionData("initialize", [initialSupply]);
        const Proxy = await ethers.getContractFactory("MyTokenProxy");
        const proxy = await Proxy.deploy(implAddress, initData);
        await proxy.waitForDeployment();
        const proxyAddress = await proxy.getAddress();

        const token = Impl.attach(proxyAddress);
        return { ethers, owner, alice, bob, initialSupply, proxyAddress, implAddress, token };
    }

    it("mints and transfers through the proxy (V1)", async function () {
        const { token, owner, alice, bob, initialSupply, ethers } = await deployProxyFixture();

        expect(await token.balanceOf(owner.address)).to.equal(initialSupply);

        await token.transfer(alice.address, ethers.parseEther("100"));
        expect(await token.balanceOf(alice.address)).to.equal(ethers.parseEther("100"));

        await token.mint(bob.address, ethers.parseEther("50"));
        expect(await token.balanceOf(bob.address)).to.equal(ethers.parseEther("50"));
    });

    it("keeps balances and exposes version() after upgrade to V2", async function () {
        const { token, owner, alice, bob, initialSupply, ethers, proxyAddress } =
            await deployProxyFixture();

        await token.transfer(alice.address, ethers.parseEther("100"));
        await token.mint(bob.address, ethers.parseEther("50"));

        const ownerBal = await token.balanceOf(owner.address);
        const aliceBal = await token.balanceOf(alice.address);
        const bobBal = await token.balanceOf(bob.address);

        const V2 = await ethers.getContractFactory("MyTokenV2");
        const v2impl = await V2.deploy();
        await v2impl.waitForDeployment();
        const v2Address = await v2impl.getAddress();

        await token.upgradeToAndCall(v2Address, "0x");

        const tokenV2 = V2.attach(proxyAddress);
        expect(await tokenV2.version()).to.equal("V2");

        expect(await tokenV2.balanceOf(owner.address)).to.equal(ownerBal);
        expect(await tokenV2.balanceOf(alice.address)).to.equal(aliceBal);
        expect(await tokenV2.balanceOf(bob.address)).to.equal(bobBal);
        expect(await tokenV2.totalSupply()).to.equal(initialSupply + ethers.parseEther("50"));
    });
});
