const hre = require("hardhat");

async function main() {
  const address = process.env.CONTRACT_ADDRESS;
  if (!address) throw new Error("CONTRACT_ADDRESS not set in .env");

  const Roulette = await hre.ethers.getContractFactory("Roulette");
  const roulette = await Roulette.attach(address);

  console.log("Placing bet...");
  let tx = await roulette.placeBet(2, { value: hre.ethers.parseEther("0.001") }); // 0 = Red  1=black 2 green
  await tx.wait();
  console.log("Bet placed, tx:", tx.hash);

 
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});