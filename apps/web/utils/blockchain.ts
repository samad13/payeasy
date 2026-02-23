export function getExplorerUrl(hash: string, network: "testnet" | "mainnet"): string {
  const baseUrl = network === "mainnet"
    ? "https://stellar.expert/explorer/public/tx"
    : "https://stellar.expert/explorer/testnet/tx";
    
  return `${baseUrl}/${hash}`;
}
