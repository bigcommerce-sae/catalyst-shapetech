import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter, unstable_setRequestLocale } from 'next-intl/server';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { ProductCardFragment } from '~/client/fragments/product-card';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { Slideshow } from '~/components/slideshow';
import FeaturedImage from '~/components/ui/featured-image';
import FeaturedProductsCarousel from '~/components/ui/featured-products-carousel';
import FeaturedProductsList from '~/components/ui/featured-products-list';
import Subscribe from '~/components/ui/subscribe';
import { productCardTransformer } from '~/data-transformers/product-card-transformer';
import { LocaleType } from '~/i18n';

import image from './_images/featured1.jpg';

interface Props {
  params: {
    locale: LocaleType;
  };
}

const HomePageQuery = graphql(
  `
    query HomePageQuery {
      site {
        newestProducts(first: 12) {
          edges {
            node {
              ...ProductCardFragment
            }
          }
        }
        featuredProducts(first: 6) {
          edges {
            node {
              ...ProductCardFragment
            }
          }
        }
      }
    }
  `,
  [ProductCardFragment],
);

export default async function Home({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);

  const format = await getFormatter({ locale });

  const customerId = await getSessionCustomerId();

  const { data } = await client.fetch({
    document: HomePageQuery,
    customerId,
    fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate } },
  });

  const featuredProducts = removeEdgesAndNodes(data.site.featuredProducts).map((product) =>
    productCardTransformer(product, format),
  );
  const newestProducts = removeEdgesAndNodes(data.site.newestProducts).map((product) =>
    productCardTransformer(product, format),
  );

  return (
    <>
      <Slideshow />

      <FeaturedProductsCarousel products={newestProducts} title="New arrivals" />

      <FeaturedImage
        cta={{ href: '/#', label: 'Shop now' }}
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt."
        image={{
          src: image,
          altText: 'An assortment of brandless products against a blank background',
        }}
        title="Title"
      />

      <FeaturedProductsList
        cta={{ href: '/#', label: 'Shop now' }}
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        products={featuredProducts}
        title="Featured products"
      />

      <FeaturedProductsCarousel products={featuredProducts} title="Recently viewed" />

      <Subscribe
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor."
        title="Sign up for our newsletter"
      />
    </>
  );
}

export const runtime = 'edge';
