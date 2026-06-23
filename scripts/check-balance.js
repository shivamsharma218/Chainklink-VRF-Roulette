const hre = require("hardhat");

async function main() {
  const address = process.env.CONTRACT_ADDRESS;
  const Roulette = await hre.ethers.getContractFactory("Roulette");
  const roulette = await Roulette.attach(address);

  const balance = await roulette.getBalance();
  console.log("Contract balance:", hre.ethers.formatEther(balance), "ETH");

  const winningNumber = await roulette.winningNumber();
  const winningColor = await roulette.getWinningColor(winningNumber);
  console.log("Winning number:", winningNumber.toString(), "| Color:", winningColor.toString(), "(0=Red, 1=Black, 2=Green)");

  const houseProfit = await roulette.houseProfit();
  console.log("House profit reserved:", hre.ethers.formatEther(houseProfit), "ETH");

  // figure out total owed across all bets in this round
  const totalBets = await roulette.totalBets();
  console.log("Total bets this round:", totalBets.toString());

  let totalOwed = 0n;
  for (let i = 0; i < totalBets; i++) {
    const bet = await roulette.bets(i);
    console.log(`Bet ${i}: player=${bet.player} amount=${hre.ethers.formatEther(bet.amount)} color=${bet.color}`);
    if (Number(bet.color) === Number(winningColor)) {
      const mult = await roulette.multiplier(bet.color);
      totalOwed += bet.amount * mult;
    }
  }
  console.log("Total payout owed:", hre.ethers.formatEther(totalOwed), "ETH");
}

main().catch(console.error);