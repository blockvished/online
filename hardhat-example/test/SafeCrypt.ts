import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import { getAddress } from "viem";

describe("SafeCrypt", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  it("Should deploy the contract", async function () {
    const safeCrypt = await viem.deployContract("SafeCrypt");

    assert.ok(safeCrypt.address);
    assert.match(
      safeCrypt.address,
      /^0x[a-fA-F0-9]{40}$/,
      "Invalid contract address format",
    );
  });

  it("Owner can add an admin", async function () {
    const safeCrypt = await viem.deployContract("SafeCrypt");
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
    const safeCrypt = await viem.deployContract("SafeCrypt");
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

  it("Add content Id and read the event", async function () {
    const safeCrypt = await viem.deployContract("SafeCrypt");
    const cid = "testcid";
    const [deployer] = await viem.getWalletClients();
    const senderAddress = getAddress(deployer.account.address);

    const targetAddress = getAddress(
      "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    ); // normalize input

    await viem.assertions.emitWithArgs(
      safeCrypt.write.addCID([targetAddress, cid]),
      safeCrypt,
      "CIDAdded",
      [targetAddress, cid, senderAddress],
    );
  });

  it("Add content Id and get the CID", async function () {
    const safeCrypt = await viem.deployContract("SafeCrypt");
    const cid = "testcid";

    await safeCrypt.write.addCID([
      "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
      cid,
    ]);

    assert.equal(
      cid,
      await safeCrypt.read.getCID([
        "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
        1n,
      ]),
    );
  });

  it("Get all cids", async function () {
    const safeCrypt = await viem.deployContract("SafeCrypt");
    const cid = "testcid";

    for (let i = 1n; i <= 3n; i++) {
      await safeCrypt.write.addCID([
        "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
        `${cid}${`i`}`,
      ]);
    }

    assert.equal(
      3n,
      await safeCrypt.read.getCIDCount([
        "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
      ]),
    );
  });
});
