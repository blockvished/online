import { NextResponse } from "next/server";
import { SEAL_ENCRYPT_ABI } from "@/lib/contractAbi";
import {
  createPublicClient,
  createWalletClient,
  http,
  parseGwei,
  Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

type MetadataData = {
  filename: string;
  fileExtension: string;
  userAddress: string;
  cid: string;
};

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address;
const PRIVATE_KEY = process.env.PRIVATEKEY! as `0x${string}`;
const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
const TARGET_CHAIN = sepolia;

export async function POST(request: Request) {
  // 1. Basic Setup & Validation
  if (!CONTRACT_ADDRESS || !PRIVATE_KEY || !RPC_URL) {
    console.error(
      "Missing environment variables: Contract Address, Private Key, or RPC URL.",
    );
    return NextResponse.json(
      { message: "Server configuration error." },
      { status: 500 },
    );
  }
  try {
    const data: MetadataData = await request.json();
    const { filename, fileExtension, userAddress, cid } = data;

    // --- For now, we only console.log the received data ---
    console.log("--- Received Document Metadata ---");
    console.log(`Filename: ${filename}`);
    console.log(`Extension: ${fileExtension}`);
    console.log(`User Address: ${userAddress}`);
    console.log(`CID (IPFS Hash): ${cid}`);
    console.log("------------------------------------");

    // --- VIEM CLIENT SETUP ---

    // 2. Create the Account object from the Private Key
    const deployerAccount = privateKeyToAccount(PRIVATE_KEY);
    console.log(`Deployer Account Address: ${deployerAccount.address}`);

    // 3. Create the Public Client (for read/simulate operations)
    const publicClient = createPublicClient({
      chain: TARGET_CHAIN,
      transport: http(RPC_URL),
    });

    // 4. Create the Wallet Client (for write/sign operations)
    const walletClient = createWalletClient({
      account: deployerAccount,
      chain: TARGET_CHAIN,
      transport: http(RPC_URL),
    });

    const args: [
      Address, // user
      string, // cid
      bigint, // unlockTime
      bigint, // price
      Address[], // recipients
      boolean, // encrypted
      string,
    ] = [
      userAddress as Address, // 1. user: the original uploader
      cid, // 2. cid: the IPFS hash
      0n, // 3. unlockTime: 0n (BigInt for uint256)
      0n, // 4. price: 0n
      [], // 5. recipients: empty array
      true, // 6. encrypted: true
      filename,
    ];

    console.log("\n--- Transaction Arguments (addDocument) ---");
    console.log(`Owner: ${args[0]}`);
    console.log(`CID: ${args[1]}`);
    console.log(`Unlock Time: ${args[2].toString()}`);
    console.log(`Price: ${args[3].toString()}`);
    console.log(`Recipients: ${JSON.stringify(args[4])}`);
    console.log(`Encrypted: ${args[5]}`);
    console.log(`Filename: ${args[6]}`);

    console.log("-------------------------------------------\n");

    // 5. Simulate the transaction (optional but highly recommended)
    console.log("Simulating contract write...");
    const { request: writeRequest } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESS,
      abi: SEAL_ENCRYPT_ABI,
      functionName: "addDocument",
      args: args,
      account: deployerAccount,
      // You may need to specify an estimateGas if the simulation fails
    });
    console.log("Simulation successful. Sending transaction...");

    // 6. Execute the transaction
    const hash = await walletClient.writeContract(writeRequest);
    console.log(`Transaction Sent. Hash: ${hash}`);

    // 7. Wait for the transaction to be mined
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`Transaction Mined. Status: ${receipt.status}`);

    // 8. Send a success response
    return NextResponse.json(
      {
        message: "Document registered on chain successfully!",
        txHash: hash,
        receiptStatus: receipt.status,
        documentMetadata: data,
      },
      { status: 200 },
    );
  } catch (error) {
    // Assert the type to either 'any' or 'Error'
    const err = error as any;
    console.error(
      "API Error processing metadata and sending transaction:",
      err,
    );

    const errorMessage =
      err.message || "An unknown error occurred during transaction.";

    return NextResponse.json(
      {
        message: "Failed to register document on chain.",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
