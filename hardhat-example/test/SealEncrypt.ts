import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import { getAddress } from "viem";
import type { Address } from "viem";

describe("SealEncrypt", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  it("Should deploy the contract", async function () {
    const safeCrypt = await viem.deployContract("SealEncrypt");

    assert.ok(safeCrypt.address);
    assert.match(
      safeCrypt.address,
      /^0x[a-fA-F0-9]{40}$/,
      "Invalid contract address format",
    );
  });

  it("Owner can add an admin", async function () {
    const safeCrypt = await viem.deployContract("SealEncrypt");
    const isActive = true;

    await safeCrypt.write.addAdmin([
      "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    ]);

    assert.equal(
      isActive,
      await safeCrypt.read.isAdmin([
        "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
      ]),
    );
  });

  it("Owner can add an admin and remove an admin", async function () {
    const safeCrypt = await viem.deployContract("SealEncrypt");
    const isActive = true;

    await safeCrypt.write.addAdmin([
      "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    ]);

    await safeCrypt.write.removeAdmin([
      "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    ]);

    assert.equal(
      !isActive,
      await safeCrypt.read.isAdmin([
        "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
      ]),
    );
  });

  it("Add document and read the event", async function () {
    const safeCrypt = await viem.deployContract("SealEncrypt");
    const cid = "testcid";
    const [deployer] = await viem.getWalletClients();
    const senderAddress = getAddress(deployer.account.address);
    const docNm = "doccc.txt";

    const targetAddress = getAddress(
      "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    ); // normalize input

    const unlockTime = 234n;
    const price = 239n;
    const recipients: Address[] = [
      "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
      "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    ];
    const encrypted = true;

    await viem.assertions.emitWithArgs(
      safeCrypt.write.addDocument([
        targetAddress,
        cid,
        unlockTime,
        price,
        recipients,
        encrypted,
        docNm,
      ]),
      safeCrypt,
      "CIDAdded",
      [targetAddress, cid, senderAddress],
    );
  });

  it("Add document and get the document", async function () {
    const safeCrypt = await viem.deployContract("SealEncrypt");
    const cid = "testcid";

    const targetAddress = getAddress(
      "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    );
    const unlockTime = 234n;
    const price = 239n;
    const recipients: Address[] = [
      getAddress("0xd8da6bf26964af9d7eed9e03e53415d37aa96045"),
      getAddress("0xd8da6bf26964af9d7eed9e03e53415d37aa96045"),
    ];
    const encrypted = true;
    const docNm = "doccc.txt";

    await safeCrypt.write.addDocument([
      targetAddress,
      cid,
      unlockTime,
      price,
      recipients,
      encrypted,
      docNm,
    ]);

    // Read document from contract
    const readD = await safeCrypt.read.getDocument([targetAddress, 1n]);

    // Normalize and sort addresses
    const normalizedReadD = {
      ...readD,
      owner: getAddress(readD.owner),
      sharedRecipients: readD.sharedRecipients.map(getAddress).sort(),
    };

    const expectedDocument = {
      docName: docNm,
      owner: targetAddress,
      cid,
      unlockTime,
      price,
      sharedRecipients: recipients.map(getAddress).sort(),
      encrypted,
    };

    assert.deepEqual(normalizedReadD, expectedDocument);
  });

  it("Get all cids", async function () {
    const safeCrypt = await viem.deployContract("SealEncrypt");
    const cid = "testcid";

    const targetAddress = getAddress(
      "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    );
    const unlockTime = 234n;
    const price = 239n;
    const recipients: Address[] = [
      getAddress("0xd8da6bf26964af9d7eed9e03e53415d37aa96045"),
      getAddress("0xd8da6bf26964af9d7eed9e03e53415d37aa96045"),
    ];
    const encrypted = true;
    const docNm = "doccc.txt";

    for (let i = 1n; i <= 3n; i++) {
      await safeCrypt.write.addDocument([
        targetAddress,
        `${cid}${`i`}`,
        unlockTime,
        price,
        recipients,
        encrypted,
        docNm,
      ]);
    }

    assert.equal(
      3n,
      await safeCrypt.read.getDocumentCount([
        "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
      ]),
    );
  });

  it("Set username to address and get username via address", async function () {
    const safeCrypt = await viem.deployContract("SealEncrypt");
    const [deployer] = await viem.getWalletClients();
    const deployerAddress = getAddress(deployer.account.address);

    const new_username = "test_username";

    await safeCrypt.write.setUsername([new_username]);
    const storedUsername = await safeCrypt.read.usernames([deployerAddress]);

    assert.strictEqual(storedUsername, new_username);
  });

  it("Set username to address and get address via username", async function () {
    const safeCrypt = await viem.deployContract("SealEncrypt");
    const [deployer] = await viem.getWalletClients();
    const deployerAddress = getAddress(deployer.account.address);

    const new_username = "test_username";

    await safeCrypt.write.setUsername([new_username]);

    assert.equal(
      deployerAddress,
      await safeCrypt.read.usernameToAddress([new_username]),
    );
  });
});
