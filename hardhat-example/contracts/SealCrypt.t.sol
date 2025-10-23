// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {SealEncrypt} from "./SealEncrypt.sol";
import {Test} from "forge-std/Test.sol";

contract SealCryptTest is Test {
    SealEncrypt sealcrypt;

    function setUp() public {
        sealcrypt = new SealEncrypt();
    }

    function test_InitialValue() public view {
        address owner = sealcrypt.owner();
        require(sealcrypt.owner() == owner, "what");
    }
}
