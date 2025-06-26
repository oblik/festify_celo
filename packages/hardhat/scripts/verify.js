// scripts/verify.js
async function main() {
  const hre = require("hardhat");
  const contractAddress = "0xEbc79539af49e1Ee8fE7Ee8721bcA293441ED058";
  // No constructor arguments for FestivalGreetings
  await hre.run("verify:verify", {
    address: contractAddress,
    constructorArguments: [],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 