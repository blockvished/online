// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SafeCrypt {

    address public owner;
    mapping(address => bool) public isAdmin;

    mapping(address => mapping(uint => string)) public cids;
    mapping(address => uint) public cidCount;

    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event CIDAdded(address indexed user, string cid, address indexed addedBy);

    constructor() {
        owner = msg.sender;
        isAdmin[msg.sender] = true;
        emit AdminAdded(msg.sender);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Not an admin");
        _;
    }

    function addAdmin(address _admin) external onlyOwner {
        require(!isAdmin[_admin], "Already an admin");
        isAdmin[_admin] = true;
        emit AdminAdded(_admin);
    }

    function removeAdmin(address _admin) external onlyOwner {
        require(isAdmin[_admin], "Not an admin");
        isAdmin[_admin] = false;
        emit AdminRemoved(_admin);
    }

    function addCID(address user, string calldata cid) external onlyAdmin {
        uint index = cidCount[user];
        cids[user][index] = cid;
        cidCount[user] = index + 1;

        emit CIDAdded(user, cid, msg.sender);
    }

    function getCID(address user, uint index) external view returns (string memory) {
        require(index < cidCount[user], "Index out of bounds");
        return cids[user][index];
    }

    function getCIDCount(address user) external view returns (uint) {
        return cidCount[user];
    }
}
