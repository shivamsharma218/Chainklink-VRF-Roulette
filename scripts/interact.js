const hre = require("hardhat");

async function main() {
//   const address = "0x79dD315d7e183f5852Ce270cD982bb7ad8B5Befc"; 
const address = process.env.CONTRACT_ADDRESS;
  if (!address) throw new Error("CONTRACT_ADDRESS not set in .env");
  const Roulette = await hre.ethers.getContractFactory("Roulette");
  const roulette = await Roulette.attach(address);

  const tx = await roulette.startRound();
  await tx.wait();
  console.log("Round started, tx:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});