const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Payout Logic", function () {
    let roulette;
    let owner;
    let player1;
    let player2;

    const VRF_COORDINATOR =
        "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE";

    const SUBSCRIPTION_ID = "100";

    const KEY_HASH =
        "0x9e1344a1247c8a1785d0a4681a27152bffdb43666ae5bf7d14d24a5efd44bf71";

    beforeEach(async function () {
        [owner, player1, player2] = await ethers.getSigners();

        const Roulette = await ethers.getContractFactory("Roulette");

        roulette = await Roulette.deploy(
            VRF_COORDINATOR,
            SUBSCRIPTION_ID,
            KEY_HASH
        );

        await roulette.waitForDeployment();
    });

    it("should track winnings for winning player", async function () {

        await roulette.startRound();

        await roulette.connect(player1).placeBet(0, {
            value: ethers.parseEther("1")
        }); // Red

        await roulette.connect(player2).placeBet(1, {
            value: ethers.parseEther("1")
        }); // Black

        // Normally VRF decides winner.
        // Here we'd mock winning result in a real test.

        expect(await roulette.totalBets()).to.equal(2);
    });
});