'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';

const UnapplyCheckoutCouponMutation = graphql(`
  mutation UnapplyCheckoutCoupon($unapplyCheckoutCouponInput: UnapplyCheckoutCouponInput!) {
    checkout {
      unapplyCheckoutCoupon(input: $unapplyCheckoutCouponInput) {
        checkout {
          entityId
        }
      }
    }
  }
`);

const RemoveCouponCodeSchema = z.object({
  checkoutEntityId: z.string(),
  couponCode: z.string(),
});

export async function removeCouponCode(formData: FormData) {
  const customerId = await getSessionCustomerId();

  try {
    const parsedData = RemoveCouponCodeSchema.parse({
      checkoutEntityId: formData.get('checkoutEntityId'),
      couponCode: formData.get('couponCode'),
    });

    const response = await client.fetch({
      document: UnapplyCheckoutCouponMutation,
      variables: {
        unapplyCheckoutCouponInput: {
          checkoutEntityId: parsedData.checkoutEntityId,
          data: {
            couponCode: parsedData.couponCode,
          },
        },
      },
      customerId,
      fetchOptions: { cache: 'no-store' },
    });

    const checkout = response.data.checkout.unapplyCheckoutCoupon?.checkout;

    if (!checkout?.entityId) {
      return { status: 'error', error: 'Error ocurred removing coupon.' };
    }

    revalidateTag(TAGS.checkout);

    return { status: 'success', data: checkout };
  } catch (error: unknown) {
    if (error instanceof Error || error instanceof z.ZodError) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error' };
  }
}
