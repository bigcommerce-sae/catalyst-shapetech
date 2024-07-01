'use server';

import { BigCommerceAPIError } from '@bigcommerce/catalyst-client';

import {
  Input,
  registerCustomer as registerCustomerClient,
} from '~/client/mutations/register-customer';

import { parseAccountFormData } from '../fields/parse-fields';

interface RegisterCustomerForm {
  formData: FormData;
  reCaptchaToken?: string;
}

const isRegisterCustomerInput = (data: unknown): data is Input => {
  if (typeof data === 'object' && data !== null && 'email' in data) {
    return true;
  }

  return false;
};

export const registerCustomer = async ({ formData, reCaptchaToken }: RegisterCustomerForm) => {
  formData.delete('customer-confirmPassword');

  const parsedData = parseAccountFormData(formData);

  if (!isRegisterCustomerInput(parsedData)) {
    return {
      status: 'error',
      error: 'Something went wrong with proccessing user input',
    };
  }

  try {
    const response = await registerCustomerClient({
      formFields: parsedData,
      reCaptchaToken,
    });

    if (response.errors.length === 0) {
      return { status: 'success', data: parsedData };
    }

    return {
      status: 'error',
      error: response.errors.map((error) => error.message).join('\n'),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceAPIError) {
      return {
        status: 'error',
        error: 'Looks like we are experience a server error, please try again in a few minutes.',
      };
    }

    return {
      status: 'error',
      error: 'Something went wrong. Please try again later.',
    };
  }
};
