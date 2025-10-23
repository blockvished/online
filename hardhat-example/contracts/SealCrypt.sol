// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SafeCrypt {
    address public owner;
    mapping(address => bool) public isAdmin;

    mapping(address => string) public usernames;
    mapping(string => address) public usernameToAddress;

    struct Document {
        address owner;
        string cid;
        uint256 unlockTime;
        uint256 price;
        address[] recipients;
        bool encrypted;
    }

    mapping(address => mapping(uint256 => Document)) public documents;
    mapping(address => uint256) public documentCount;

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

    function addDocument(
        address user,
        string calldata cid,
        uint256 unlockTime,
        uint256 price,
        address[] calldata recipients,
        bool encrypted
    ) external onlyAdmin {
        uint256 index = documentCount[user] + 1;
        documents[user][index] = Document({
            owner: user,
            cid: cid,
            unlockTime: unlockTime,
            price: price,
            recipients: recipients,
            encrypted: encrypted
        });

        documentCount[user] = index;

        emit CIDAdded(user, cid, msg.sender);
    }

    function getDocument(
        address user,
        uint256 index
    ) external view returns (Document memory) {
        require(
            index > 0 && index <= documentCount[user],
            "Invalid document index"
        );
        return documents[user][index];
    }

    function getDocumentCount(address user) external view returns (uint256) {
        return documentCount[user];
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
