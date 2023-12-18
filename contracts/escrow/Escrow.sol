// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Escrow is Ownable {
    using SafeERC20 for IERC20;

    struct EscrowInfo {
        address buyer;
        address seller;
        address token;
        uint256 amount;
        uint256 cooldown;
        bool isNative;
        bool isReleased;
    }

    bool public isPaused;

    uint256 public fee;

    mapping(uint256 => EscrowInfo) public escrowInfos;

    uint256 public counter = 0;

    event EscrowCreated(
        uint256 tokenId,
        address indexed buyer,
        address indexed seller,
        address token,
        uint256 amount,
        uint256 cooldown,
        bool isNative
    );

    event EscrowReleased(uint256 tokenId);

    modifier onlyEscrowOwner(uint256 escrowId) {
        EscrowInfo memory escrowInfo = escrowInfos[escrowId];
        require(
            escrowInfo.buyer == msg.sender,
            "onlyEscrowOwner: sender not escrow owner"
        );
        _;
    }

    modifier escrowCooldownEnded(uint256 escrowId) {
        EscrowInfo memory escrowInfo = escrowInfos[escrowId];
        require(
            block.timestamp > escrowInfo.cooldown,
            "escrowCooldownEnded: cooldown hasnt ended"
        );
        _;
    }

    modifier notPaused {
        require(!isPaused, "notPaused: contract is paused");
        _;
    }

    constructor(uint256 _fee) {
        fee = _fee;
    }

    function createEscrow(
        address buyer,
        address seller,
        address token,
        uint256 amount,
        uint256 cooldown,
        bool isNative
    ) public payable notPaused {
        require(buyer != address(0), "createEscrow: buyer zero address");
        require(seller != address(0), "createEscrow: seller zero address");
        require(token != address(0) && !isNative, "createEscrow: token zero address");
        require(!isNative && amount > 0 || isNative && msg.value > 0, "createEscrow: amount > 0");
        require(cooldown > 0, "createEscrow: cooldown > 0");

        IERC20(token).safeTransferFrom(buyer, address(this), amount);

        uint256 escrowId = counter;

        escrowInfos[escrowId] = EscrowInfo(
            buyer,
            seller,
            token,
            amount,
            block.timestamp + cooldown,
            isNative,
            false
        );

        counter++;

        emit EscrowCreated(escrowId, buyer, seller, token, amount, cooldown, isNative);
    }

    function releaseEscrow(
        uint256 escrowId
    ) public onlyEscrowOwner(escrowId) escrowCooldownEnded(escrowId) notPaused {
        EscrowInfo storage escrowInfo = escrowInfos[escrowId];

        if (escrowInfo.isNative) {
            (bool success, ) = escrowInfo.seller.call{value: escrowInfo.amount}("");
            require(success, "Transfer failed");
        } else {
            IERC20(escrowInfo.token).safeTransfer(escrowInfo.seller, escrowInfo.amount);
        }

        escrowInfo.isReleased = true;

        emit EscrowReleased(escrowId);
    }

    function pause() public onlyOwner {
        require(!isPaused, "pause: already paused");
        isPaused = true;
    }

    function unpause() public onlyOwner {
        require(isPaused, "unpause: already unpaused");
        isPaused = false;
    }
}