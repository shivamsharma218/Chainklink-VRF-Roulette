const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Roulette - Same Bet Test", function () {
    let roulette, owner, player1, player2, player3;
    const BET = ethers.parseEther("1.0");

    beforeEach(async function () {
        [owner, player1, player2, player3] = await ethers.getSigners();

        
        const Roulette = await ethers.getContractFactory("Roulette");
        roulette = await Roulette.deploy(
            "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE", 
            1n,
            ethers.encodeBytes32String("keyHash")
        );

        await owner.sendTransaction({
            to: await roulette.getAddress(),
            value: ethers.parseEther("100")
        });
    });

    it("same amount bets on each color placed correctly", async function () {
        await roulette.connect(owner).startRound();

        await roulette.connect(player1).placeBet(0, { value: BET }); 
        await roulette.connect(player2).placeBet(1, { value: BET }); 
        await roulette.connect(player3).placeBet(2, { value: BET }); 

      
        expect(await roulette.totalBets()).to.equal(3n);

        
        const edge = (BET * 250n) / 10000n;
        expect(await roulette.houseProfit()).to.equal(edge * 3n);

        console.log("✅ Total bets:", await roulette.totalBets());
        console.log("✅ House profit:", ethers.formatEther(await roulette.houseProfit()));
    });
});