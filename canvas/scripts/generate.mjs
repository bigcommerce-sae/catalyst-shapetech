// @ts-check

import { generateOutput, generateSchema } from '@gql.tada/cli-utils';
import dotenv from 'dotenv';
import { strict } from 'node:assert';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: '.env.local' });

const canvasRootDirPath = join(fileURLToPath(import.meta.url), '../../');

const bigcommerceChannelId = process.env.BIGCOMMERCE_CHANNEL_ID;
const bigcommerceStoreHash = process.env.BIGCOMMERCE_STORE_HASH;
const bigcommerceCIT = process.env.BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN;

class MissingEnvironmentError extends Error {
  constructor(message) {
    super(`Missing required environment variable "\u001b[1m${message}\u001b[22m"`);
    this.name = 'MISSING_ENVIRONMENT_VARIABLE_ERR';
  }
}

strict(bigcommerceStoreHash, new MissingEnvironmentError('BIGCOMMERCE_STORE_HASH'));
strict(bigcommerceCIT, new MissingEnvironmentError('BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN'));

const bigcommerceGraphQLEndpoint =
  !bigcommerceChannelId || bigcommerceChannelId === '1'
    ? `https://store-${bigcommerceStoreHash}.mybigcommerce.com/graphql`
    : `https://store-${bigcommerceStoreHash}-${bigcommerceChannelId}.mybigcommerce.com/graphql`;

await generateSchema({
  input: bigcommerceGraphQLEndpoint,
  headers: { Authorization: `Bearer ${bigcommerceCIT}` },
  output: join(canvasRootDirPath, 'src/bigcommerce.graphql'),
  tsconfig: undefined,
});

await generateOutput({
  disablePreprocessing: false,
  output: undefined,
  tsconfig: undefined,
});
