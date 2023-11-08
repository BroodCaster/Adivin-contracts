// SPDX-License-Identifier: ISC
pragma solidity ^0.8.9;

import './InheritancePlan.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AdivinFactory is Ownable {
    InheritancePlan[] public InheritanceArray;

    event InheritancePlanCreated(address InheritancePlanner, address inheritanceAddress, uint256 cooldown);

    function createNewInheritance(address _inheritancePlanner, address[] memory _beneficiaries, uint256 _cooldown, address[] memory _tokenAddress) public{
        InheritancePlan inheritance = new InheritancePlan(_inheritancePlanner, _beneficiaries, _cooldown, _tokenAddress);
        InheritanceArray.push(inheritance);
        emit InheritancePlanCreated(_inheritancePlanner, address(inheritance), _cooldown);
    }

    function getCooldownStatus(uint256 _index) public view returns(bool){
        return InheritancePlan(address(InheritanceArray[_index]))._getCooldownStatus();
    }

    // function getBeneficiar(uint256 _index) public view returns(address[] memory){
    //     return InheritancePlan(address(InheritanceArray[_index])).beneficiaries;
    // }

    function getOwner(uint256 _index) public view returns(address){
        return InheritancePlan(address(InheritanceArray[_index])).owner();
    }

    function getInheritanceAddress(uint256 _index) public view returns(address){
        return address(InheritanceArray[_index]);
    }
    
}
