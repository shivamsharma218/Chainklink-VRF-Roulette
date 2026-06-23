const hre = require("hardhat");

async function main() {
  const address = process.env.CONTRACT_ADDRESS;
  if (!address) throw new Error("CONTRACT_ADDRESS not set in .env");

  const Roulette = await hre.ethers.getContractFactory("Roulette");
  const roulette = await Roulette.attach(address);

  const phase = await roulette.phase();
  console.log("Current phase:", phase.toString());

  if (phase.toString() !== "3") {
    console.log("Not ready yet (need phase 3 = ReadyToSettle). Wait longer and rerun.");
    return;
  }

  const tx = await roulette.settleRound();
  await tx.wait();
  console.log("Round settled, tx:", tx.hash);

  const winningNumber = await roulette.winningNumber();
  const winningColor = await roulette.getWinningColor(winningNumber);
  console.log("Winning number:", winningNumber.toString(), "| Color:", winningColor.toString(), "(0=Red, 1=Black, 2=Green)");

  const [deployer] = await hre.ethers.getSigners();
  const myWinnings = await roulette.winnings(deployer.address);
  console.log("Your winnings:", hre.ethers.formatEther(myWinnings), "ETH");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});