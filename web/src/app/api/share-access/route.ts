// app/api/share-access/route.ts

import { NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { SEAL_ENCRYPT_ABI } from "@/lib/contractAbi";
import type { NextRequest } from "next/server";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address;
const PRIVATE_KEY = process.env.PRIVATEKEY! as `0x${string}`;
const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
const TARGET_CHAIN = sepolia;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { userAddress, documentId, recipientAddress, action, signedMessage } =
      body;

    // Console log all the received data
    console.log("=== Share Access API Called ===");
    console.log("User Address:", userAddress);
    console.log("Document ID (CID):", documentId);
    console.log("Recipient Address:", recipientAddress);
    console.log("Action:", action);
    console.log("Signed Message:", signedMessage);
    console.log("==============================");

    // Validate required fields
    if (
      !userAddress ||
      !documentId ||
      !recipientAddress ||
      !action ||
      !signedMessage
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate action
    if (action !== "share" && action !== "revoke") {
      return NextResponse.json(
        { error: 'Invalid action. Must be "share" or "revoke"' },
        { status: 400 },
      );
    }

    if (!CONTRACT_ADDRESS || !PRIVATE_KEY || !RPC_URL) {
      console.error(
        "Missing environment variables: Contract Address, Private Key, or RPC URL.",
      );
      return NextResponse.json(
        { message: "Server configuration error." },
        { status: 500 },
      );
    }

    // Viem setup
    const deployerAccount = privateKeyToAccount(PRIVATE_KEY);
    const publicClient = createPublicClient({
      chain: TARGET_CHAIN,
      transport: http(RPC_URL),
    });
    const walletClient = createWalletClient({
      account: deployerAccount,
      chain: TARGET_CHAIN,
      transport: http(RPC_URL),
    });

    // Prepare args
    const args: [Address, bigint, Address] = [
      userAddress as Address,
      BigInt(documentId), // <-- convert to bigint
      recipientAddress as Address,
    ];

    const functionName =
      action === "share" ? "shareDocumentAccess" : "revokeDocumentAccess";

    console.log(`Calling contract function: ${functionName} with args`, args);

    // Simulate
    const { request: writeRequest } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESS,
      abi: SEAL_ENCRYPT_ABI,
      functionName,
      args,
      account: deployerAccount,
    });

    console.log("Simulation successful. Sending transaction...");

    const txHash = await walletClient.writeContract(writeRequest);
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    console.log(`Transaction Mined. Status: ${receipt.status}`);

    return NextResponse.json({
      success: true,
      action,
      recipientAddress,
      documentId,
      message: `Successfully ${action}d access`,
    });
  } catch (error: any) {
    console.error("Share access API error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to process access request",
        details: error.toString(),
      },
      { status: 500 },
    );
  }
}
