import hre from "hardhat";

async function main() {
  // const game = await hre.viem.deployContract("Game");
  // console.log(`Game deployed to ${game.address}`);
  const gameFactory = await hre.viem.deployContract("GameFactory");
  console.log(`GameFactory deployed to ${gameFactory.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
