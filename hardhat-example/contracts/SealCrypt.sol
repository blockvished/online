// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SafeCrypt {
    address public owner;
    mapping(address => bool) public isAdmin;

    mapping(address => string) public usernames;
    mapping(string => address) public usernameToAddress;

    mapping(address => mapping(uint256 => string)) public cids;
    mapping(address => uint256) public cidCount;

    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event CIDAdded(address indexed user, string cid, address indexed addedBy);
    event UsernameSet(address indexed user, string username);

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
        uint256 index = cidCount[user] + 1;
        cids[user][index] = cid;
        cidCount[user] = index;

        emit CIDAdded(user, cid, msg.sender);
    }

    function getCID(
        address user,
        uint256 index
    ) external view returns (string memory) {
        require(index <= cidCount[user], "Index out of bounds");
        return cids[user][index];
    }

    function getCIDCount(address user) external view returns (uint256) {
        return cidCount[user];
    }

    function setUsername(string calldata username) external {
        require(bytes(username).length > 0, "Username cannot be empty");
        require(
            usernameToAddress[username] == address(0),
            "Username already taken"
        );

        string memory oldUsername = usernames[msg.sender];
        if (bytes(oldUsername).length > 0) {
            delete usernameToAddress[oldUsername];
        }

        usernames[msg.sender] = username;
        usernameToAddress[username] = msg.sender;

        emit UsernameSet(msg.sender, username);
    }
}
