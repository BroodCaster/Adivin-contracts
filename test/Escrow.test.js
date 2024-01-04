const { expect } = require('chai');
const { ethers } = require('hardhat');

const advanceBlock = async () =>
  ethers.provider.send("evm_mine", []);

const increaseTime = async (length) => {
  await ethers.provider.send("evm_increaseTime", [length]);
  await advanceBlock();
};

// TODO: add tests

describe('Escrow', function () {
    let owner;
    let buyer;
    let seller;
    let token;
    let escrow;

    beforeEach(async () => {
        ;[owner, buyer, seller] = await ethers.getSigners();

        const Token = await ethers.getContractFactory('EUR20');
        token = await Token.deploy();

        await token.mint(buyer.address, ethers.parseEther('10'))

        const Escrow = await ethers.getContractFactory('Escrow')
        escrow = await Escrow.deploy()
    })

    it('should create escrow with ERC20 token', async () => {
        await token.connect(buyer).approve(escrow.target, ethers.parseEther('1'))

        await escrow.createEscrow(
            buyer.address,
            seller.address,
            token.target,
            ethers.parseEther('1'),
            100,
            false
        )
    })

    it('should create escrow with native token', async () => {
        await escrow.createEscrow(
            buyer.address,
            seller.address,
            token.target,
            0,
            100,
            true,
            {
                value: ethers.parseEther('1')
            }
        )
    })

    it('should allow user to claim ERC20 token after cooldown', async () => {
        await token.connect(buyer).approve(escrow.target, ethers.parseEther('1'))

        await escrow.createEscrow(
            buyer.address,
            seller.address,
            token.target,
            ethers.parseEther('1'),
            100,
            false
        )

        await expect(
            escrow.connect(buyer).releaseEscrow(0)
        ).to.be.reverted
        
        await increaseTime(102)

        let sellerBalance = await token.balanceOf(seller.address)

        expect(sellerBalance).to.equal('0')

        await escrow.connect(buyer).releaseEscrow(0)

        sellerBalance = await token.balanceOf(seller.address)

        expect(sellerBalance).to.equal(ethers.parseEther('1'))
    })

    it('should allow user to claim native token after cooldown', async () => {
        await escrow.createEscrow(
            buyer.address,
            seller.address,
            token.target,
            0,
            100,
            true,
            {
                value: ethers.parseEther('1')
            }
        )

        await expect(
            escrow.connect(buyer).releaseEscrow(0)
        ).to.be.reverted
        
        await increaseTime(102)

        let sellerBalance = await seller.provider.getBalance(seller.address)

        expect(sellerBalance).to.equal(10000000000000000000000n)

        await escrow.connect(buyer).releaseEscrow(0)

        sellerBalance = await seller.provider.getBalance(seller.address)

        expect(sellerBalance).to.equal(10001000000000000000000n)
    })

    it('should allow buyer to cancel escrow with ERC20 token', async () => {
        await token.connect(buyer).approve(escrow.target, ethers.parseEther('1'))

        await escrow.createEscrow(
            buyer.address,
            seller.address,
            token.target,
            ethers.parseEther('1'),
            100,
            false
        )

        await increaseTime(10)

        let buyerBalance = await token.balanceOf(buyer.address)

        expect(buyerBalance).to.equal(ethers.parseEther('9'))

        await escrow.connect(buyer).cancelEscrow(0)

        buyerBalance = await token.balanceOf(buyer.address)

        expect(buyerBalance).to.equal(ethers.parseEther('10'))
    })

    it('should allow seller to cancel escrow with ERC20 token', async () => {
        await token.connect(buyer).approve(escrow.target, ethers.parseEther('1'))

        await escrow.createEscrow(
            buyer.address,
            seller.address,
            token.target,
            ethers.parseEther('1'),
            100,
            false
        )

        await increaseTime(10)

        let buyerBalance = await token.balanceOf(buyer.address)

        expect(buyerBalance).to.equal(ethers.parseEther('9'))

        await escrow.connect(seller).cancelEscrow(0)

        buyerBalance = await token.balanceOf(buyer.address)

        expect(buyerBalance).to.equal(ethers.parseEther('10'))
    })

    it('should allow buyer to cancel escrow with native token', async () => {
        await token.connect(buyer).approve(escrow.target, ethers.parseEther('1'))

        await escrow.createEscrow(
            buyer.address,
            seller.address,
            token.target,
            ethers.parseEther('1'),
            100,
            true,
            {
                value: ethers.parseEther('1')
            }
        )

        await increaseTime(10)

        let buyerBalance = await buyer.provider.getBalance(buyer.address)

        expect(buyerBalance).to.equal(9999999433221398065155n)

        await escrow.connect(buyer).cancelEscrow(0)

        buyerBalance = await buyer.provider.getBalance(buyer.address)

        expect(buyerBalance).to.equal(10000999391862236678021n)
    })

    it('should allow seller to cancel escrow with native token', async () => {
        await token.connect(buyer).approve(escrow.target, ethers.parseEther('1'))

        await escrow.createEscrow(
            buyer.address,
            seller.address,
            token.target,
            ethers.parseEther('1'),
            100,
            true,
            {
                value: ethers.parseEther('1')
            }
        )

        await increaseTime(10)

        let buyerBalance = await buyer.provider.getBalance(buyer.address)

        expect(buyerBalance).to.equal(10000999345500731268289n)

        await escrow.connect(seller).cancelEscrow(0)

        buyerBalance = await buyer.provider.getBalance(buyer.address)

        expect(buyerBalance).to.equal(10001999345500731268289n)
    })
})
