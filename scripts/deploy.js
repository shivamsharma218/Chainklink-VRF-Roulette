const hre = require("hardhat");

async function main() {
  const vrfCoordinator = "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE";
  const subscriptionId = "51593450202988415893784303942114910556422682430179502417208111292783644790394";
  const keyHash = "0x9e1344a1247c8a1785d0a4681a27152bffdb43666ae5bf7d14d24a5efd44bf71";

  console.log("Deploying Roulette...");

  const Roulette = await hre.ethers.getContractFactory("Roulette");
  const roulette = await Roulette.deploy(vrfCoordinator, subscriptionId, keyHash);
  await roulette.waitForDeployment();

  const address = await roulette.getAddress();
  console.log("Roulette deployed to:", address);
  console.log("Now add this address as a consumer on your VRF subscription at vrf.chain.link");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});