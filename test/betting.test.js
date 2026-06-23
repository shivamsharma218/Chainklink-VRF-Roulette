const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Betting Tests", function () {

    let roulette;
    let owner;
    let player1;
    let player2;

    beforeEach(async function () {

        [owner, player1, player2] =
            await ethers.getSigners();

        const Roulette =
            await ethers.getContractFactory("Roulette");

        roulette = await Roulette.deploy(
            "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE",
            "100",
            "0x9e1344a1247c8a1785d0a4681a27152bffdb43666ae5bf7d14d24a5efd44bf71"
        );

        await roulette.waitForDeployment();

        await roulette.startRound();
    });

    it("multiple users can place bets", async function () {

        await roulette.connect(player1).placeBet(0, {
            value: ethers.parseEther("1")
        });

        await roulette.connect(player2).placeBet(1, {
            value: ethers.parseEther("1")
        });

        expect(
            await roulette.totalBets()
        ).to.equal(2);
    });

    it("same user can place multiple bets", async function () {

        await roulette.connect(player1).placeBet(0, {
            value: ethers.parseEther("1")
        });

        await roulette.connect(player1).placeBet(1, {
            value: ethers.parseEther("1")
        });

        expect(
            await roulette.totalBets()
        ).to.equal(2);
    });

    it("bet count increases correctly", async function () {

        expect(
            await roulette.totalBets()
        ).to.equal(0);

        await roulette.connect(player1).placeBet(0, {
            value: ethers.parseEther("1")
        });

        expect(
            await roulette.totalBets()
        ).to.equal(1);

        await roulette.connect(player2).placeBet(1, {
            value: ethers.parseEther("1")
        });

        expect(
            await roulette.totalBets()
        ).to.equal(2);
    });

    it("house profit accumulates correctly", async function () {

        await roulette.connect(player1).placeBet(0, {
            value: ethers.parseEther("1")
        });

        await roulette.connect(player2).placeBet(1, {
            value: ethers.parseEther("1")
        });

        // 2.5% of 2 ETH = 0.05 ETH

        expect(
            await roulette.houseProfit()
        ).to.equal(
            ethers.parseEther("0.05")
        );
    });

});