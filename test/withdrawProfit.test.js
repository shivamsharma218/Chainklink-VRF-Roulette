const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("withdrawHouseProfit", function () {

    let roulette;
    let player;

    beforeEach(async function () {

        [, player] = await ethers.getSigners();

        const Roulette = await ethers.getContractFactory("Roulette");

        roulette = await Roulette.deploy(
            "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE",
            "100",
            "0x9e1344a1247c8a1785d0a4681a27152bffdb43666ae5bf7d14d24a5efd44bf71"
        );

        await roulette.waitForDeployment();

        await roulette.startRound();

        await roulette.connect(player).placeBet(0, {
            value: ethers.parseEther("1")
        });
    });

    it("should have profit after bet", async function () {

        expect(
            await roulette.houseProfit()
        ).to.equal(
            ethers.parseEther("0.025")
        );
    });

    it("should allow owner to withdraw profit", async function () {

        await roulette.withdrawHouseProfit();

        expect(
            await roulette.houseProfit()
        ).to.equal(0);
    });

    it("should revert if no profit", async function () {

        const Roulette = await ethers.getContractFactory("Roulette");

        const fresh = await Roulette.deploy(
            "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE",
            "100",
            "0x9e1344a1247c8a1785d0a4681a27152bffdb43666ae5bf7d14d24a5efd44bf71"
        );

        await fresh.waitForDeployment();

        await expect(
            fresh.withdrawHouseProfit()
        ).to.be.revertedWith(
            "No profit"
        );
    });
});