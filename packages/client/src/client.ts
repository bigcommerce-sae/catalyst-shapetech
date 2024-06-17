import { BigCommerceAPIError } from './error';
import { DocumentDecoration } from './types';
import { getOperationInfo } from './utils/getOperationName';
import { normalizeQuery } from './utils/normalizeQuery';
import { getBackendUserAgent } from './utils/userAgent';

export const graphqlApiDomain: string =
  process.env.BIGCOMMERCE_GRAPHQL_API_DOMAIN ?? 'mybigcommerce.com';

export const adminApiHostname: string =
  process.env.BIGCOMMERCE_ADMIN_API_HOST ?? 'api.bigcommerce.com';

interface Config {
  storeHash: string;
  customerImpersonationToken: string;
  xAuthToken: string;
  // We don't want channel id to be optional, but we need to allow it to be undefined for environment variables
  channelId: string | undefined;
  platform?: string;
  backendUserAgentExtensions?: string;
  logger?: boolean;
  getChannelId?: (defaultChannelId: string) => Promise<string> | string;
}

interface BigCommerceResponse<T> {
  data: T;
}

class Client<FetcherRequestInit extends RequestInit = RequestInit> {
  private backendUserAgent: string;
  private readonly defaultChannelId: string;
  private getChannelId: (defaultChannelId: string) => Promise<string> | string;

  constructor(private config: Config) {
    if (!config.channelId) {
      throw new Error('Client configuration must include a channelId.');
    }

    this.defaultChannelId = config.channelId;
    this.backendUserAgent = getBackendUserAgent(config.platform, config.backendUserAgentExtensions);
    this.getChannelId = config.getChannelId
      ? config.getChannelId
      : (defaultChannelId) => defaultChannelId;
  }

  // Overload for documents that require variables
  async fetch<TResult, TVariables extends Record<string, unknown>>(config: {
    document: DocumentDecoration<TResult, TVariables>;
    variables: TVariables;
    customerId?: string;
    fetchOptions?: FetcherRequestInit;
    channelId?: string;
  }): Promise<BigCommerceResponse<TResult>>;

  // Overload for documents that do not require variables
  async fetch<TResult>(config: {
    document: DocumentDecoration<TResult, Record<string, never>>;
    variables?: undefined;
    customerId?: string;
    fetchOptions?: FetcherRequestInit;
    channelId?: string;
  }): Promise<BigCommerceResponse<TResult>>;

  async fetch<TResult, TVariables>({
    document,
    variables,
    customerId,
    fetchOptions = {} as FetcherRequestInit,
    channelId,
  }: {
    document: DocumentDecoration<TResult, TVariables>;
    variables?: TVariables;
    customerId?: string;
    fetchOptions?: FetcherRequestInit;
    channelId?: string;
  }): Promise<BigCommerceResponse<TResult>> {
    const { cache, headers = {}, ...rest } = fetchOptions;
    const query = normalizeQuery(document);
    const log = this.requestLogger(query);

    const graphqlUrl = await this.getEndpoint(channelId);

    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.customerImpersonationToken}`,
        'User-Agent': this.backendUserAgent,
        ...(customerId && { 'X-Bc-Customer-Id': customerId }),
        ...headers,
      },
      body: JSON.stringify({
        query,
        ...(variables && { variables }),
      }),
      ...(cache && { cache }),
      ...rest,
    });

    if (!response.ok) {
      throw await BigCommerceAPIError.createFromResponse(response);
    }

    log(response);

    return response.json() as Promise<BigCommerceResponse<TResult>>;
  }

  async fetchAvailableCountries() {
    const response = await fetch(
      `https://api.bigcommerce.com/stores/${this.config.storeHash}/v2/countries?limit=250`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Auth-Token': this.config.xAuthToken,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Unable to get available Countries List: ${response.statusText}`);
    }

    return response.json() as Promise<unknown>;
  }

  async fetchCountryStates(id: number) {
    const response = await fetch(
      `https://api.bigcommerce.com/stores/${this.config.storeHash}/v2/countries/${id}/states?limit=60`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Auth-Token': this.config.xAuthToken,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Unable to get available States or Provinces: ${response.statusText}`);
    }

    return response.json() as Promise<unknown>;
  }

  async fetchShippingZones() {
    const response = await fetch(
      `https://api.bigcommerce.com/stores/${this.config.storeHash}/v2/shipping/zones`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Auth-Token': this.config.xAuthToken,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Unable to get Shipping Zones: ${response.statusText}`);
    }

    return response.json() as Promise<unknown>;
  }

  private async getEndpoint(channelId?: string) {
    const resolvedChannelId = channelId ?? (await this.getChannelId(this.defaultChannelId));

    return `https://store-${this.config.storeHash}-${resolvedChannelId}.${graphqlApiDomain}/graphql`;
  }

  private requestLogger(document: string) {
    if (!this.config.logger) {
      return () => {
        // noop
      };
    }

    const { name, type } = getOperationInfo(document);

    const timeStart = Date.now();

    return (response: Response) => {
      const timeEnd = Date.now();
      const duration = timeEnd - timeStart;

      const complexity = response.headers.get('x-bc-graphql-complexity');

      // eslint-disable-next-line no-console
      console.log(
        `[BigCommerce] ${type} ${name ?? 'anonymous'} - ${duration}ms - complexity ${complexity ?? 'unknown'}`,
      );
    };
  }
}

export function createClient<FetcherRequestInit extends RequestInit = RequestInit>(config: Config) {
  return new Client<FetcherRequestInit>(config);
}
