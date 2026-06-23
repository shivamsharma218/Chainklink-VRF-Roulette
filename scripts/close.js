const hre = require("hardhat");

async function main() {
  const address = process.env.CONTRACT_ADDRESS;
  if (!address) throw new Error("CONTRACT_ADDRESS not set in .env");

  const Roulette = await hre.ethers.getContractFactory("Roulette");
  const roulette = await Roulette.attach(address);

 

  console.log("Closing betting and requesting randomness...");
  tx = await roulette.closeBettingAndRequestRandomness();
  await tx.wait();
  console.log("Randomness requested, tx:", tx.hash);

  const phase = await roulette.phase();
  console.log("Current phase:", phase.toString(), "(2 = AwaitingRandomness)");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});