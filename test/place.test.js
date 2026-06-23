const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("placeBet", function () {

    let roulette;
    let owner;
    let player1;

    const VRF_COORDINATOR =
        "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE";

    const SUBSCRIPTION_ID = "100";

    const KEY_HASH =
        "0x9e1344a1247c8a1785d0a4681a27152bffdb43666ae5bf7d14d24a5efd44bf71";

    beforeEach(async function () {

        [owner, player1] = await ethers.getSigners();

        const Roulette = await ethers.getContractFactory("Roulette");

        roulette = await Roulette.deploy(
            VRF_COORDINATOR,
            SUBSCRIPTION_ID,
            KEY_HASH
        );

        await roulette.waitForDeployment();
    });

    it("should allow a player to place a bet", async function () {

        await roulette.startRound();

        await roulette.connect(player1).placeBet(0, {
            value: ethers.parseEther("1")
        });

        expect(await roulette.totalBets()).to.equal(1);
    });

    it("should revert if betting is closed", async function () {

        await expect(
            roulette.connect(player1).placeBet(0, {
                value: ethers.parseEther("1")
            })
        ).to.be.revertedWith("Betting closed");
    });

    it("should revert on zero bet", async function () {

        await roulette.startRound();

        await expect(
            roulette.connect(player1).placeBet(0, {
                value: 0
            })
        ).to.be.revertedWith("Zero bet");
    });

    it("should increase house profit", async function () {

        await roulette.startRound();

        await roulette.connect(player1).placeBet(0, {
            value: ethers.parseEther("1")
        });

        expect(
            await roulette.houseProfit()
        ).to.equal(
            ethers.parseEther("0.025")
        );
    });

});