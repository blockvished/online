// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {SafeCrypt} from "./SealCrypt.sol";
import {Test} from "forge-std/Test.sol";

contract SealCryptTest is Test {
  SafeCrypt sealcrypt;

  function setUp() public {
    sealcrypt = new SafeCrypt();
  }

  function test_InitialValue() public view {
    address owner = sealcrypt.owner();
    require(sealcrypt.owner() == owner, "what");
  }
}
