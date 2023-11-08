const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('AdivinFactory', function () {
  let owner;
  let beneficiary;
  let token;
  let factory;
  let inheritancePlan;
  const tokenAmount = 100; // Adjust with the appropriate token amount

  beforeEach(async function () {
    [owner, beneficiary] = await ethers.getSigners();

    // Deploy the ERC20 token
    const Token = await ethers.getContractFactory('MyToken'); // Replace with your actual ERC20 token contract
    token = await Token.deploy();

    // Deploy the AdivinFactory contract with the ERC20 token address
    const Factory = await ethers.getContractFactory('AdivinFactory');
    factory = await Factory.deploy();
  });

  it('should create a new InheritancePlan with ERC20 tokens', async function () {
    const cooldown = 3600; // Adjust with the desired cooldown

    await token.approve(factory.address, tokenAmount);

    await expect(async () => {
      await factory.createNewInheritance(
        owner.address,
        beneficiary.address,
        token.address,
        tokenAmount,
        cooldown
      );
    }).to.changeTokenBalances(token, [factory, inheritancePlan], [0, tokenAmount]);

    const inheritancePlanAddress = await factory.getInheritanceAddress(0);
    inheritancePlan = await ethers.getContractAt('InheritancePlan', inheritancePlanAddress);

    const beneficiaryAddress = await inheritancePlan.getBeneficiary();
    const ownerAddress = await inheritancePlan.getOwner();
    const cooldownStatus = await inheritancePlan.getCooldownStatus();

    expect(beneficiaryAddress).to.equal(beneficiary.address);
    expect(ownerAddress).to.equal(owner.address);
    expect(cooldownStatus).to.be.false;
  });
});
