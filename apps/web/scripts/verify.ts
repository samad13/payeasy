// @ts-nocheck
import { SorobanRpc } from "stellar-sdk";
import "dotenv/config";

const NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet";
const contractId = process.argv[2];

if (!contractId) {
  console.error("Usage: tsx scripts/verify.ts <contract_id>");
  process.exit(1);
}

const isMainnet = NETWORK === "mainnet";
const RPC_URL = isMainnet
  ? "https://mainnet.sorobanrpc.com"
  : "https://soroban-testnet.stellar.org";

const server = new SorobanRpc.Server(RPC_URL);

async function verifyContract() {
  console.log(`Verifying contract ${contractId} on ${NETWORK}...`);
  try {
    const ledgerEntry = await server.getLedgerEntry(
      SorobanRpc.Server.getContractIdLedgerKey(contractId)
    );
    if (ledgerEntry) {
      console.log(`✅ Contract ${contractId} exists on ${NETWORK} ledger.`);
      console.log(`Latest sequence: ${ledgerEntry.latestLedger}`);
    } else {
      console.log(`❌ Contract ${contractId} not found on ${NETWORK} ledger.`);
    }
  } catch (error: any) {
    if (error?.message?.includes("not found")) {
      console.log(`❌ Contract ${contractId} not found on ${NETWORK} ledger.`);
    } else {
      console.error("Verification error:", error);
    }
  }
}

verifyContract();
