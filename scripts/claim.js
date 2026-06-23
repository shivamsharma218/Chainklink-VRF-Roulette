const hre = require("hardhat");

async function main() {
  
//   const address = "0x79dD315d7e183f5852Ce270cD982bb7ad8B5Befc"; 
const address = process.env.CONTRACT_ADDRESS;
  if (!address) throw new Error("CONTRACT_ADDRESS not set in .env");
 
  const Roulette = await hre.ethers.getContractFactory("Roulette");
  const roulette = await Roulette.attach(address);

  const [deployer] = await hre.ethers.getSigners();

  const winnings = await roulette.winnings(deployer.address);
  console.log("Pending winnings:", hre.ethers.formatEther(winnings), "ETH");

  if (winnings === 0n) {
    console.log("Nothing to claim.");
    return;
  }

  const balanceBefore = await hre.ethers.provider.getBalance(deployer.address);

  const tx = await roulette.claimReward();
  await tx.wait();
  console.log("Reward claimed, tx:", tx.hash);

  const balanceAfter = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Wallet balance before:", hre.ethers.formatEther(balanceBefore), "ETH");
  console.log("Wallet balance after: ", hre.ethers.formatEther(balanceAfter), "ETH");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});