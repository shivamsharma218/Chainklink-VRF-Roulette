const hre = require("hardhat");

async function main() {
//   const address = "0x79dD315d7e183f5852Ce270cD982bb7ad8B5Befc";
const address = process.env.CONTRACT_ADDRESS;
  if (!address) throw new Error("CONTRACT_ADDRESS not set in .env");
  const Roulette = await hre.ethers.getContractFactory("Roulette");
  const roulette = await Roulette.attach(address);

  const phase = await roulette.phase();
  console.log("Phase:", phase.toString(), "(0=Idle, 1=Open, 2=AwaitingRandomness, 3=ReadyToSettle)");
}

main().catch(console.error);