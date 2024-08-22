import { createClient } from '@bigcommerce/catalyst-client';
import { strict } from 'assert';
import { initGraphQLTada } from 'gql.tada';

import type { introspection } from '@/bigcommerce-graphql';

class MissingEnvironmentError extends Error {
  constructor(message: string) {
    super(`Missing required environment variable "\u001b[1m${message}\u001b[22m"`);
    this.name = 'MISSING_ENVIRONMENT_VARIABLE_ERR';
  }
}

const bigcommerceStoreHash = process.env.BIGCOMMERCE_STORE_HASH;
const bigcommerceChannelId = process.env.BIGCOMMERCE_CHANNEL_ID;
const bigcommerceCIT = process.env.BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN;
const bigcommerceAccessToken = process.env.BIGCOMMERCE_ACCESS_TOKEN;

strict(bigcommerceStoreHash, new MissingEnvironmentError('BIGCOMMERCE_STORE_HASH'));
strict(bigcommerceCIT, new MissingEnvironmentError('BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN'));
strict(bigcommerceAccessToken, new MissingEnvironmentError('BIGCOMMERCE_ACCESS_TOKEN'));

export const bigcommerceClient = createClient({
  storeHash: bigcommerceStoreHash,
  channelId: bigcommerceChannelId,
  customerImpersonationToken: bigcommerceCIT,
  xAuthToken: bigcommerceAccessToken,
  logger: true,
});

export const bigcommerceGraphql = initGraphQLTada<{
  introspection: introspection;
  scalars: {
    DateTime: string;
    Long: number;
    BigDecimal: number;
  };
  disableMasking: true;
}>();

export type { FragmentOf, ResultOf, VariablesOf } from 'gql.tada';
export { readFragment } from 'gql.tada';
