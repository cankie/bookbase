import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const BookBadgeV2 = await ethers.getContractFactory("BookBadgeV2");
  const badge = await BookBadgeV2.deploy();
  await badge.waitForDeployment();
  console.log("BookBadgeV2 deployed to:", await badge.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
