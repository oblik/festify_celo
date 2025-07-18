import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { FestivalGreetings, FestivalGreetings__factory } from "../typechain-types";

describe("FestivalGreetings Contract", function () {
  let FestivalGreetingsFactory: FestivalGreetings__factory;
  let festify: FestivalGreetings;
  let owner: SignerWithAddress;
  let sender: SignerWithAddress;
  let recipient: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  const MINT_FEE = ethers.utils.parseEther("0.01");
  const METADATA_URI = "ipfs://QmTest123";
  const FESTIVAL_TYPE = "christmas";

  beforeEach(async () => {
    FestivalGreetingsFactory = (await ethers.getContractFactory("FestivalGreetings")) as FestivalGreetings__factory;
    
    [owner, sender, recipient, addr1, addr2] = (await ethers.getSigners()) as SignerWithAddress[];

    festify = await FestivalGreetingsFactory.deploy();
    await festify.deployed();
  });

  describe("Deployment", function () {
    it("should deploy with correct name and symbol", async () => {
      expect(await festify.name()).to.equal("Festival Greetings");
      expect(await festify.symbol()).to.equal("FGRT");
    });

    it("should set the correct owner", async () => {
      expect(await festify.owner()).to.equal(owner.address);
    });

    it("should have the correct initial mint fee", async () => {
      expect(await festify.mintFee()).to.equal(MINT_FEE);
    });
  });

  describe("Minting Greeting Cards", function () {
    it("should mint a greeting card successfully", async () => {
      const tx = await festify.connect(sender).mintGreetingCard(
        recipient.address,
        METADATA_URI,
        FESTIVAL_TYPE,
        { value: MINT_FEE }
      );

      await expect(tx)
        .to.emit(festify, "GreetingCardMinted")
        .withArgs(1, sender.address, recipient.address, FESTIVAL_TYPE, METADATA_URI);

      expect(await festify.ownerOf(1)).to.equal(recipient.address);
      expect(await festify.tokenURI(1)).to.equal(METADATA_URI);
      expect(await festify.getGreetingFestival(1)).to.equal(FESTIVAL_TYPE);
      expect(await festify.getGreetingSender(1)).to.equal(sender.address);
    });

    it("should increment token IDs correctly", async () => {
      await festify.connect(sender).mintGreetingCard(
        recipient.address,
        METADATA_URI,
        FESTIVAL_TYPE,
        { value: MINT_FEE }
      );

      await festify.connect(addr1).mintGreetingCard(
        addr2.address,
        "ipfs://QmTest456",
        "eid",
        { value: MINT_FEE }
      );

      expect(await festify.ownerOf(1)).to.equal(recipient.address);
      expect(await festify.ownerOf(2)).to.equal(addr2.address);
    });

    it("should reject minting to zero address", async () => {
      await expect(
        festify.connect(sender).mintGreetingCard(
          ethers.constants.AddressZero,
          METADATA_URI,
          FESTIVAL_TYPE,
          { value: MINT_FEE }
        )
      ).to.be.revertedWith("Cannot mint to zero address");
    });

    it("should reject minting with empty metadata URI", async () => {
      await expect(
        festify.connect(sender).mintGreetingCard(
          recipient.address,
          "",
          FESTIVAL_TYPE,
          { value: MINT_FEE }
        )
      ).to.be.revertedWith("Token URI cannot be empty");
    });

    it("should reject minting with empty festival type", async () => {
      await expect(
        festify.connect(sender).mintGreetingCard(
          recipient.address,
          METADATA_URI,
          "",
          { value: MINT_FEE }
        )
      ).to.be.revertedWith("Festival type cannot be empty");
    });

    it("should reject minting with insufficient fee", async () => {
      const insufficientFee = ethers.utils.parseEther("0.005");
      await expect(
        festify.connect(sender).mintGreetingCard(
          recipient.address,
          METADATA_URI,
          FESTIVAL_TYPE,
          { value: insufficientFee }
        )
      ).to.be.revertedWith("Insufficient funds to mint greeting card");
    });

    it("should accept exact fee amount", async () => {
      await expect(
        festify.connect(sender).mintGreetingCard(
          recipient.address,
          METADATA_URI,
          FESTIVAL_TYPE,
          { value: MINT_FEE }
        )
      ).to.not.be.reverted;
    });

    it("should accept fee amount greater than required", async () => {
      const extraFee = ethers.utils.parseEther("0.02");
      await expect(
        festify.connect(sender).mintGreetingCard(
          recipient.address,
          METADATA_URI,
          FESTIVAL_TYPE,
          { value: extraFee }
        )
      ).to.not.be.reverted;
    });
  });

  describe("Greeting Tracking", function () {
    beforeEach(async () => {
      // Mint some greeting cards for testing
      await festify.connect(sender).mintGreetingCard(
        recipient.address,
        METADATA_URI,
        FESTIVAL_TYPE,
        { value: MINT_FEE }
      );

      await festify.connect(addr1).mintGreetingCard(
        sender.address,
        "ipfs://QmTest456",
        "eid",
        { value: MINT_FEE }
      );

      await festify.connect(recipient).mintGreetingCard(
        addr1.address,
        "ipfs://QmTest789",
        "newyear",
        { value: MINT_FEE }
      );
    });

    it("should track sent greetings correctly", async () => {
      const sentGreetings = await festify.getSentGreetings(sender.address);
      expect(sentGreetings.length).to.equal(1);
      expect(sentGreetings[0]).to.equal(1);

      const addr1SentGreetings = await festify.getSentGreetings(addr1.address);
      expect(addr1SentGreetings.length).to.equal(1);
      expect(addr1SentGreetings[0]).to.equal(2);

      const recipientSentGreetings = await festify.getSentGreetings(recipient.address);
      expect(recipientSentGreetings.length).to.equal(1);
      expect(recipientSentGreetings[0]).to.equal(3);
    });

    it("should track received greetings correctly", async () => {
      const recipientReceivedGreetings = await festify.getReceivedGreetings(recipient.address);
      expect(recipientReceivedGreetings.length).to.equal(1);
      expect(recipientReceivedGreetings[0]).to.equal(1);

      const senderReceivedGreetings = await festify.getReceivedGreetings(sender.address);
      expect(senderReceivedGreetings.length).to.equal(1);
      expect(senderReceivedGreetings[0]).to.equal(2);

      const addr1ReceivedGreetings = await festify.getReceivedGreetings(addr1.address);
      expect(addr1ReceivedGreetings.length).to.equal(1);
      expect(addr1ReceivedGreetings[0]).to.equal(3);
    });

    it("should return empty arrays for addresses with no greetings", async () => {
      const emptySentGreetings = await festify.getSentGreetings(addr2.address);
      expect(emptySentGreetings.length).to.equal(0);

      const emptyReceivedGreetings = await festify.getReceivedGreetings(addr2.address);
      expect(emptyReceivedGreetings.length).to.equal(0);
    });
  });

  describe("Greeting Information", function () {
    beforeEach(async () => {
      await festify.connect(sender).mintGreetingCard(
        recipient.address,
        METADATA_URI,
        FESTIVAL_TYPE,
        { value: MINT_FEE }
      );
    });

    it("should return correct festival type", async () => {
      expect(await festify.getGreetingFestival(1)).to.equal(FESTIVAL_TYPE);
    });

    it("should return correct sender address", async () => {
      expect(await festify.getGreetingSender(1)).to.equal(sender.address);
    });

    it("should return correct token URI", async () => {
      expect(await festify.tokenURI(1)).to.equal(METADATA_URI);
    });

    it("should reject querying festival for nonexistent token", async () => {
      await expect(
        festify.getGreetingFestival(999)
      ).to.be.revertedWith("Festival query for nonexistent token");
    });

    it("should reject querying sender for nonexistent token", async () => {
      await expect(
        festify.getGreetingSender(999)
      ).to.be.revertedWith("Sender query for nonexistent token");
    });
  });

  describe("Fee Management", function () {
    it("should allow owner to set new mint fee", async () => {
      const newFee = ethers.utils.parseEther("0.05");
      await festify.setMintFee(newFee);
      expect(await festify.mintFee()).to.equal(newFee);
    });

    it("should not allow non-owner to set mint fee", async () => {
      const newFee = ethers.utils.parseEther("0.05");
      await expect(
        festify.connect(sender).setMintFee(newFee)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should work with zero mint fee", async () => {
      await festify.setMintFee(0);
      expect(await festify.mintFee()).to.equal(0);

      // Should be able to mint without sending any ETH
      await expect(
        festify.connect(sender).mintGreetingCard(
          recipient.address,
          METADATA_URI,
          FESTIVAL_TYPE,
          { value: 0 }
        )
      ).to.not.be.reverted;
    });

    it("should work with updated mint fee", async () => {
      const newFee = ethers.utils.parseEther("0.02");
      await festify.setMintFee(newFee);

      // Should reject with old fee
      await expect(
        festify.connect(sender).mintGreetingCard(
          recipient.address,
          METADATA_URI,
          FESTIVAL_TYPE,
          { value: MINT_FEE }
        )
      ).to.be.revertedWith("Insufficient funds to mint greeting card");

      // Should accept with new fee
      await expect(
        festify.connect(sender).mintGreetingCard(
          recipient.address,
          METADATA_URI,
          FESTIVAL_TYPE,
          { value: newFee }
        )
      ).to.not.be.reverted;
    });
  });

  describe("Withdrawal", function () {
    beforeEach(async () => {
      // Mint some cards to accumulate fees
      await festify.connect(sender).mintGreetingCard(
        recipient.address,
        METADATA_URI,
        FESTIVAL_TYPE,
        { value: MINT_FEE }
      );

      await festify.connect(addr1).mintGreetingCard(
        addr2.address,
        "ipfs://QmTest456",
        "eid",
        { value: MINT_FEE }
      );
    });

    it("should allow owner to withdraw contract balance", async () => {
      const initialBalance = await owner.getBalance();
      const contractBalance = await ethers.provider.getBalance(festify.address);
      
      expect(contractBalance).to.equal(MINT_FEE.mul(2));

      const tx = await festify.withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

      const finalBalance = await owner.getBalance();
      expect(finalBalance).to.equal(initialBalance.add(contractBalance).sub(gasUsed));
    });

    it("should not allow non-owner to withdraw", async () => {
      await expect(
        festify.connect(sender).withdraw()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should reject withdrawal when contract has no balance", async () => {
      await festify.withdraw(); // First withdrawal
      await expect(
        festify.withdraw() // Second withdrawal
      ).to.be.revertedWith("No balance to withdraw");
    });
  });

  describe("ERC721 Functionality", function () {
    beforeEach(async () => {
      await festify.connect(sender).mintGreetingCard(
        recipient.address,
        METADATA_URI,
        FESTIVAL_TYPE,
        { value: MINT_FEE }
      );
    });

    it("should support ERC721 interface", async () => {
      // ERC721 interface ID
      const erc721InterfaceId = "0x80ac58cd";
      expect(await festify.supportsInterface(erc721InterfaceId)).to.be.true;
    });

    it("should support ERC721Enumerable interface", async () => {
      // ERC721Enumerable interface ID
      const erc721EnumerableInterfaceId = "0x780e9d63";
      expect(await festify.supportsInterface(erc721EnumerableInterfaceId)).to.be.true;
    });

    it("should support ERC721URIStorage interface", async () => {
      // ERC721URIStorage interface ID
      const erc721URIStorageInterfaceId = "0x5b5e139f";
      expect(await festify.supportsInterface(erc721URIStorageInterfaceId)).to.be.true;
    });

    it("should return correct total supply", async () => {
      expect(await festify.totalSupply()).to.equal(1);
      
      await festify.connect(addr1).mintGreetingCard(
        addr2.address,
        "ipfs://QmTest456",
        "eid",
        { value: MINT_FEE }
      );
      
      expect(await festify.totalSupply()).to.equal(2);
    });

    it("should return correct token by index", async () => {
      expect(await festify.tokenByIndex(0)).to.equal(1);
    });

    it("should return correct token of owner by index", async () => {
      expect(await festify.tokenOfOwnerByIndex(recipient.address, 0)).to.equal(1);
    });

    it("should return correct balance of owner", async () => {
      expect(await festify.balanceOf(recipient.address)).to.equal(1);
    });
  });

  describe("Edge Cases and Error Handling", function () {
    it("should handle multiple greetings from same sender to same recipient", async () => {
      await festify.connect(sender).mintGreetingCard(
        recipient.address,
        METADATA_URI,
        FESTIVAL_TYPE,
        { value: MINT_FEE }
      );

      await festify.connect(sender).mintGreetingCard(
        recipient.address,
        "ipfs://QmTest456",
        "eid",
        { value: MINT_FEE }
      );

      const sentGreetings = await festify.getSentGreetings(sender.address);
      expect(sentGreetings.length).to.equal(2);
      expect(sentGreetings[0]).to.equal(1);
      expect(sentGreetings[1]).to.equal(2);

      const receivedGreetings = await festify.getReceivedGreetings(recipient.address);
      expect(receivedGreetings.length).to.equal(2);
      expect(receivedGreetings[0]).to.equal(1);
      expect(receivedGreetings[1]).to.equal(2);
    });

    it("should handle self-minting (sender = recipient)", async () => {
      await expect(
        festify.connect(sender).mintGreetingCard(
          sender.address,
          METADATA_URI,
          FESTIVAL_TYPE,
          { value: MINT_FEE }
        )
      ).to.not.be.reverted;

      const sentGreetings = await festify.getSentGreetings(sender.address);
      const receivedGreetings = await festify.getReceivedGreetings(sender.address);
      
      expect(sentGreetings.length).to.equal(1);
      expect(receivedGreetings.length).to.equal(1);
      expect(sentGreetings[0]).to.equal(receivedGreetings[0]);
    });

    it("should handle very long metadata URI", async () => {
      const longURI = "ipfs://" + "Qm".repeat(1000);
      await expect(
        festify.connect(sender).mintGreetingCard(
          recipient.address,
          longURI,
          FESTIVAL_TYPE,
          { value: MINT_FEE }
        )
      ).to.not.be.reverted;
    });

    it("should handle very long festival type", async () => {
      const longFestival = "very_long_festival_name_".repeat(50);
      await expect(
        festify.connect(sender).mintGreetingCard(
          recipient.address,
          METADATA_URI,
          longFestival,
          { value: MINT_FEE }
        )
      ).to.not.be.reverted;
    });
  });

  describe("Gas Optimization", function () {
    it("should mint greeting card within reasonable gas limit", async () => {
      const tx = await festify.connect(sender).mintGreetingCard(
        recipient.address,
        METADATA_URI,
        FESTIVAL_TYPE,
        { value: MINT_FEE }
      );
      
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.lessThan(300000); // Reasonable gas limit
    });

    it("should handle multiple mints efficiently", async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          festify.connect(sender).mintGreetingCard(
            recipient.address,
            `ipfs://QmTest${i}`,
            `festival${i}`,
            { value: MINT_FEE }
          )
        );
      }
      
      await expect(Promise.all(promises)).to.not.be.reverted;
    });
  });
}); 