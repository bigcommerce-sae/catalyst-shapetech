import { client } from '..';
import { getSessionCustomerAccessToken } from '../../auth';
import { graphql } from '../graphql';

const LOGOUT_MUTATION = graphql(`
  mutation Logout {
    logout {
      result
    }
  }
`);

export const logout = async () => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: LOGOUT_MUTATION,
    customerAccessToken,
  });

  return response.data.logout.result;
};
