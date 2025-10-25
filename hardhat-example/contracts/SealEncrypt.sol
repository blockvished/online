// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SealEncrypt {
    address public owner;
    mapping(address => bool) public isAdmin;

    mapping(address => string) public usernames;
    mapping(string => address) public usernameToAddress;

    struct Document {
        string docName;
        string cid;
        address owner;
        uint256 unlockTime;
        uint256 price;
        bool encrypted;
        address[] sharedRecipients;
    }

    mapping(address => mapping(uint256 => Document)) private documents;
    mapping(address => uint256) private documentCount;

    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event DocumentAdded(string addedBy, string cid, address indexed user);
    event ShareAccess(
        address indexed user,
        string cid,
        string shareUser,
        address shareAddr
    );
    event AccessRevoked(
        address indexed user,
        string cid,
        string Revokeuser,
        address RevokeAddr
    );

    event UsernameSetAndUpdated(address indexed user, string username);
    event UsernameSetAndCreated(address indexed user, string username);

    error NotOwner();
    error NotAdmin();
    error AlreadyAdmin();
    error NotAnAdmin();
    error InvalidDocument();

    error UsernameTaken();
    error UsernameCannotBeEmpty();

    constructor() {
        owner = msg.sender;
        isAdmin[msg.sender] = true;
        emit AdminAdded(msg.sender);
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyAdmin() {
        if (!isAdmin[msg.sender]) revert NotAdmin();
        _;
    }

    function addAdmin(address _admin) external onlyOwner {
        if (isAdmin[_admin]) revert AlreadyAdmin();

        isAdmin[_admin] = true;
        emit AdminAdded(_admin);
    }

    function removeAdmin(address _admin) external onlyOwner {
        if (!isAdmin[_admin]) revert NotAnAdmin();

        isAdmin[_admin] = false;
        emit AdminRemoved(_admin);
    }

    function addDocument(
        address user,
        string calldata cid,
        uint256 unlockTime,
        uint256 price,
        address[] calldata recipients,
        bool encrypted,
        string calldata filename
    ) external onlyAdmin {
        uint256 index = documentCount[user] + 1;
        documents[user][index] = Document({
            docName: filename,
            owner: user,
            cid: cid,
            unlockTime: unlockTime,
            price: price,
            sharedRecipients: recipients,
            encrypted: encrypted
        });

        documentCount[user] = index;

        emit DocumentAdded(filename, cid, user);
    }

    function getDocument(
        address user,
        uint256 index
    ) external view returns (Document memory) {
        if (index == 0 || index > documentCount[user]) revert InvalidDocument();
        return documents[user][index];
    }

    function getDocumentCount(address user) external view returns (uint256) {
        return documentCount[user];
    }

    function setUsername(string calldata username) external {
        if (bytes(username).length == 0) revert UsernameCannotBeEmpty();
        if (usernameToAddress[username] != address(0)) revert UsernameTaken();

        string memory oldUsername = usernames[msg.sender];
        bool usernameExist = bytes(oldUsername).length > 0;
        if (usernameExist) {
            delete usernameToAddress[oldUsername];
            emit UsernameSetAndUpdated(msg.sender, username);
        } else {
            emit UsernameSetAndCreated(msg.sender, username);
        }

        usernames[msg.sender] = username;
        usernameToAddress[username] = msg.sender;
    }

    function shareDocumentAccess(
        address user,
        uint256 documentId,
        address recipient
    ) external onlyAdmin {
        Document storage doc = documents[user][documentId];
        if (documentId == 0 || documentId > documentCount[user])
            revert InvalidDocument();

        // Check if recipient already has access
        bool alreadyShared = false;
        for (uint256 i = 0; i < doc.sharedRecipients.length; i++) {
            if (doc.sharedRecipients[i] == recipient) {
                alreadyShared = true;
                break;
            }
        }

        if (!alreadyShared) {
            doc.sharedRecipients.push(recipient);
        }

        emit ShareAccess(user, doc.cid, usernames[recipient], recipient);
    }

    function revokeDocumentAccess(
        address user,
        uint256 documentId,
        address revokeAdd
    ) external onlyAdmin {
        Document storage doc = documents[user][documentId];
        if (documentId == 0 || documentId > documentCount[user])
            revert InvalidDocument();

        uint256 len = doc.sharedRecipients.length;
        for (uint256 i = 0; i < len; i++) {
            if (doc.sharedRecipients[i] == revokeAdd) {
                // Swap with last element and pop
                doc.sharedRecipients[i] = doc.sharedRecipients[len - 1];
                doc.sharedRecipients.pop();
                break;
            }
        }

        emit AccessRevoked(user, doc.cid, usernames[revokeAdd], revokeAdd);
    }
}
