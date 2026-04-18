import { expect } from "chai";
import { network } from "hardhat";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";

describe("MyToken", function () {
    async function deployMyToken() {
        const { ethers } = await network.connect({ plugins: [hardhatEthers] });

        const [owner, addr1, addr2] = await ethers.getSigners();

        const MyToken = await ethers.getContractFactory("MyToken");
        const initialSupply = ethers.parseEther("1000000");
        const myToken = await MyToken.deploy(initialSupply);
        await myToken.waitForDeployment();

        return { myToken, owner, addr1, addr2, initialSupply, ethers };
    }

    it("Should assign the initial supply to the owner", async function () {
        const { myToken, owner, initialSupply } = await deployMyToken();

        expect(await myToken.balanceOf(owner.address)).to.equal(initialSupply);
    });

    it("Should transfer tokens between accounts", async function () {
        const { myToken, addr1, ethers } = await deployMyToken();

        await myToken.transfer(addr1.address, ethers.parseEther("100"));

        expect(await myToken.balanceOf(addr1.address)).to.equal(
            ethers.parseEther("100")
        );
    });

    it("Should update balances after transfer", async function () {
        const { myToken, owner, addr1, initialSupply, ethers } = await deployMyToken();

        await myToken.transfer(addr1.address, ethers.parseEther("100"));

        expect(await myToken.balanceOf(owner.address)).to.equal(
            initialSupply - ethers.parseEther("100")
        );

        expect(await myToken.balanceOf(addr1.address)).to.equal(
            ethers.parseEther("100")
        );
    });

    it("Should allow the owner to mint tokens", async function () {
        const { myToken, addr1, ethers } = await deployMyToken();

        await myToken.mint(addr1.address, ethers.parseEther("500"));

        expect(await myToken.balanceOf(addr1.address)).to.equal(
            ethers.parseEther("500")
        );
    });

    it("Should not allow a non-owner to mint tokens", async function () {
        const { myToken, addr1, addr2, ethers } = await deployMyToken();

        await expect(
            myToken.connect(addr1).mint(addr2.address, ethers.parseEther("100"))
        ).to.be.revert(ethers);
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
        const { myToken, addr1, addr2, ethers } = await deployMyToken();

        await expect(
            myToken.connect(addr1).transfer(addr2.address, ethers.parseEther("1"))
        ).to.be.revert(ethers);
    });
});