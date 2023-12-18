const { expect } = require('chai');
const { ethers } = require('hardhat');

// TODO: add tests

describe('Escrow', function () {
    let owner;
    let buyer;
    let seller;
    let token;
    let escrow;

    beforeEach(async () => {
        [owner, buyer] = await ethers.getSigners();

        const Token = await ethers.getContractFactory('MyToken');
        token = await Token.deploy();

        const Escrow = await ethers.getContractFactory('Escrow')
        escrow = await Escrow.deploy()
    })

    it('should create escrow with ERC20 token', async () => {
        const cooldown = 3600

        await token.approve(escrow.address, to)
    })
})
