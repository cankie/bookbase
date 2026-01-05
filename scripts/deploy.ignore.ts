import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const BookBadge = await ethers.getContractFactory("BookBadge");
  const contract = await BookBadge.deploy();
  await contract.waitForDeployment();

  console.log("BookBadge deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
