import { NextResponse } from "next/server";
import { buildContractTransaction } from "@/lib/stellar/contract-transactions";
import { getStellarNetworkConfig } from "@/lib/stellar/network";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { contractId, method, args, sourcePublicKey, network } = body;

    if (!contractId || !method || !sourcePublicKey) {
      return NextResponse.json(
        { error: "Missing required parameters: contractId, method, sourcePublicKey" },
        { status: 400 }
      );
    }

    const networkConfig = getStellarNetworkConfig(network);
    
    const build = await buildContractTransaction({
      sourcePublicKey,
      contractId,
      method,
      args,
      network: networkConfig.name,
    });

    const feeStats = build.feeStats as { inclusionFee?: { mode?: string } } | undefined;
    const baseFee = feeStats?.inclusionFee?.mode ? Number(feeStats.inclusionFee.mode) : 100;
    const resourceFee = build.gasEstimate?.stroops ?? 0;
    const buffer = Math.ceil(resourceFee * 0.2);
    const totalFee = build.feeStroops;

    return NextResponse.json({
      baseFee,
      resourceFee,
      buffer,
      totalFee,
      feeStats,
      network: networkConfig.name,
    });
  } catch (error: any) {
    console.error("Fee estimation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to estimate fee" },
      { status: 500 }
    );
  }
}
