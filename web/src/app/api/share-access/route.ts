// app/api/share-access/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

    // TODO: Add your Lighthouse logic here
    // import { shareEncryptedFile, revokeEncryptedFile } from '@/lib/lighthouse';
    // if (action === 'share') {
    //   result = await shareEncryptedFile(documentId, userAddress, recipientAddress, signedMessage);
    // } else {
    //   result = await revokeEncryptedFile(documentId, userAddress, recipientAddress, signedMessage);
    // }

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
