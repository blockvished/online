import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("SafeCrypt", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  it("Should deploy the contract", async function () {
    const safeCrypt = await viem.deployContract("SafeCrypt");

    // Check that the contract address exists and is valid
    assert.ok(safeCrypt.address);
    assert.match(
      safeCrypt.address,
      /^0x[a-fA-F0-9]{40}$/,
      "Invalid contract address format",
    );
  });
});
