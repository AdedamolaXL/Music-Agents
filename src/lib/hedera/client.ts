import { Client, AccountId, PrivateKey } from "@hashgraph/sdk";

let client: Client | null = null;

export function getHederaClient(): Client {
  if (client) return client

  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY;
  const network = process.env.HEDERA_NETWORK ?? 'testnet';

  if (!accountId || !privateKey) {
    throw new Error(
      'HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be set in .env.local'
    )
  }

  client = network == 'testnet'
    ? Client.forTestnet()
    : Client.forMainnet()
  
  client.setOperator(
    AccountId.fromString(accountId),
    PrivateKey.fromString(privateKey)
  )
  return client
}