import { graphql, ResultOf } from '~/client/graphql';
import { Carousel } from '~/components/ui/carousel';

import { ProductCard, ProductCardFragment } from '../product-card';

export const ProductCardCarouselFragment = graphql(
  `
    fragment ProductCardCarouselFragment on Product {
      ...ProductCardFragment
    }
  `,
  [ProductCardFragment],
);

type Product = ResultOf<typeof ProductCardCarouselFragment>;

export const ProductCardCarousel = ({
  title,
  products,
  showCart = true,
  showCompare = true,
  showReviews = true,
}: {
  title: string;
  products: Product[];
  showCart?: boolean;
  showCompare?: boolean;
  showReviews?: boolean;
}) => {
  if (products.length === 0) {
    return null;
  }

  const items = products.map((product) => (
    <ProductCard
      imageSize="tall"
      key={product.entityId}
      product={product}
      showCart={showCart}
      showCompare={showCompare}
      showReviews={showReviews}
    />
  ));

  return <Carousel className="mb-14" items={items} title={title} />;
};
