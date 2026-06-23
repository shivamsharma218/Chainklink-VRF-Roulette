const hre = require("hardhat");

async function main() {
  const address = process.env.CONTRACT_ADDRESS;
  const Roulette = await hre.ethers.getContractFactory("Roulette");
  const roulette = await Roulette.attach(address);

  const [deployer] = await hre.ethers.getSigners();
  const winnings = await roulette.winnings(deployer.address);
  console.log("Address checked:", deployer.address);
  console.log("Winnings:", hre.ethers.formatEther(winnings), "ETH");
}

main().catch(console.error);