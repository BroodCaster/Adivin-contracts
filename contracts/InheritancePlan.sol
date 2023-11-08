// SPDX-License-Identifier: ISC
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract InheritancePlan{
    address public owner;
    address public factoryAddress;
    address[] public beneficiaries;

    uint256 public cooldown;
    uint256 public start;
    uint256[] public percentages;

    bool claimStarted = false;

    address[] ERC20Addresses;

    event StartClaim(uint256 start);
    event Claim(address beneficiaries, uint256 amount);

    constructor(address _inheritancePlanner, address[] memory _beneficiaries, uint256[] memory _percentages, uint256 _cooldown, address[] memory tokenAddress){
        owner = _inheritancePlanner;
        factoryAddress = msg.sender;
        for(uint16 i = 0; i < _beneficiaries.length; i++)
        {
            beneficiaries.push(_beneficiaries[i]);
        }
        for(uint16 i = 0; i < _percentages.length; i++)
        {
            percentages.push(_percentages[i]);
        }
        cooldown = _cooldown;
        for(uint16 i = 0; i < tokenAddress.length; i++)
        {
            ERC20Addresses.push(tokenAddress[i]);
        }

    }

    function _destroyInheritance() external onlyOwner{
        for(uint16 i = 0; i < beneficiaries.length; i++)
        {
            beneficiaries[i] = address(0);
        }
        cooldown = 0;
        start = 0;
    }

    function getDivided(uint numerator, uint denominator) public pure returns(uint quotient, uint remainder) {
        quotient  = numerator / denominator;
        remainder = numerator - denominator * quotient;
    }

    function claim() external onlyBeneficiary cooldownOver{
        for(uint16 i = 0; i < ERC20Addresses.length; i++)
        {
            IERC20 token = IERC20(ERC20Addresses[i]);
            uint256 balance = token.balanceOf(owner);
            require(token.allowance(owner, address(this)) >= balance, "Approve your tokens!");
            for(uint16 k = 0; k < beneficiaries.length; k++){
                uint256 tokenAmount = (balance*percentages[k])/100;
                require(token.transferFrom(owner, beneficiaries[k], tokenAmount), "Token transfer to InheritancePlan failed");
            }
        }

    }

    function startClaim() external onlyBeneficiary{
        start = block.timestamp;
        claimStarted = true;
        emit StartClaim(start);
    }

    function _getCooldownStatus() public view returns(bool){
        if(block.timestamp >= start + cooldown){
            return true;
        }else{
            return false;
        }
    }

    function getCooldown() public view returns(uint256){
        return start + cooldown - block.timestamp;
    }

    function changeCooldown(uint256 _newCooldown) public onlyOwner{
        cooldown = _newCooldown;
        claimStarted = false;
        start = 0;
    }

    function revoke() public onlyOwner{
        start = 0;
        claimStarted = false;
    }   

    modifier onlyBeneficiary{
        bool isBeneficiary = false;
        for(uint i = 0; i < beneficiaries.length; i++){
           if(msg.sender == beneficiaries[i]){
            isBeneficiary = true;
           }
        }
        require(isBeneficiary, "You are not the beneficiar");
        _;
    }

    modifier onlyOwner{
        require(msg.sender == owner || msg.sender == factoryAddress, "You are not the owner");
        _;
    }

    modifier cooldownOver{
        require(claimStarted == true && block.timestamp >= start + cooldown, "Cooldown has not expired");
        _;
    }
}
