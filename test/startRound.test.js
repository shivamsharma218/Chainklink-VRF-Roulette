const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("startRound", function () {

    let roulette;

    beforeEach(async function () {

        const Roulette = await ethers.getContractFactory("Roulette");

        roulette = await Roulette.deploy(
            "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE",
            "100",
            "0x9e1344a1247c8a1785d0a4681a27152bffdb43666ae5bf7d14d24a5efd44bf71"
        );

        await roulette.waitForDeployment();
    });

    it("should start a new round", async function () {

        await roulette.startRound();

        expect(await roulette.phase()).to.equal(1);
    });

    it("should increment roundId", async function () {

        await roulette.startRound();

        expect(await roulette.roundId()).to.equal(1);
    });

    it("should not allow starting twice", async function () {

        await roulette.startRound();

        await expect(
            roulette.startRound()
        ).to.be.revertedWith(
            "Previous round not finished"
        );
    });
});