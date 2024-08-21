'use client';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { useFormatter, useTranslations } from 'next-intl';

import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';

import { getCustomerOrders } from '../../page-data';
import { assembleProductData, ProductSnippet } from '../product-snippet';

export type Orders = NonNullable<Awaited<ReturnType<typeof getCustomerOrders>>>['orders'];

interface OrdersListProps {
  customerOrders: Orders;
  ordersCount?: number;
}

enum VisibleListItemsPerDevice {
  xs = 1,
  md = 3,
  lg = 4,
  xl = 5,
}

const HiddenQuantity = ({ itemsQuantity }: { itemsQuantity: number }) => {
  const smItems = itemsQuantity - VisibleListItemsPerDevice.xs;
  const mdItems = itemsQuantity - VisibleListItemsPerDevice.md;
  const lgItems = itemsQuantity - VisibleListItemsPerDevice.lg;
  const xlItems = itemsQuantity - VisibleListItemsPerDevice.xl;

  return (
    <>
      {smItems > 0 && (
        <div className="list-item w-36 md:!hidden">
          <div className="flex h-36 w-full items-center justify-center bg-gray-200 font-semibold text-gray-500">
            +{smItems}
          </div>
        </div>
      )}
      {mdItems > 0 && (
        <div className="hidden w-36 md:list-item lg:hidden">
          <div className="flex h-36 w-full items-center justify-center bg-gray-200 font-semibold text-gray-500">
            +{mdItems}
          </div>
        </div>
      )}
      {lgItems > 0 && (
        <div className="hidden w-36 lg:list-item xl:hidden">
          <div className="flex h-36 w-full items-center justify-center bg-gray-200 font-semibold text-gray-500">
            +{lgItems}
          </div>
        </div>
      )}
      {xlItems > 0 && (
        <div className="hidden w-36 xl:list-item">
          <div className="flex h-36 w-full items-center justify-center bg-gray-200 font-semibold text-gray-500">
            +{xlItems}
          </div>
        </div>
      )}
    </>
  );
};

interface ActionButtonsProps {
  className: string;
  orderId: number;
  orderTrackingUrl?: string;
  orderStatus: string | null;
}

const OrderActionButtons = ({
  className,
  orderId,
  orderStatus,
  orderTrackingUrl,
}: ActionButtonsProps) => {
  const t = useTranslations('Account.Orders');

  return (
    <div className={className}>
      <Button aria-label={t('viewDetails')} asChild className="w-full md:w-fit" variant="secondary">
        <Link href={{ pathname: '/account/orders', query: { order: orderId } }}>
          {t('viewDetails')}
        </Link>
      </Button>
      {Boolean(orderTrackingUrl) && (
        <Button
          aria-label={t('trackOrder')}
          asChild
          className="w-full md:w-fit"
          variant="secondary"
        >
          <Link href={{ pathname: orderTrackingUrl }}>{t('trackOrder')}</Link>
        </Button>
      )}
      {Boolean(orderStatus) && orderStatus === 'SHIPPED' && (
        <Button
          aria-label={t('returnOrder')}
          asChild
          className="w-full md:w-fit"
          variant="secondary"
        >
          <Link href={{ pathname: '' }}>{t('returnOrder')}</Link>
        </Button>
      )}
    </div>
  );
};
const OrderDetails = ({
  orderId,
  orderDate,
  orderPrice,
  orderStatus,
}: {
  orderId: number;
  orderDate: string;
  orderPrice: {
    value: number;
    currencyCode: string;
  };
  orderStatus: string;
}) => {
  const t = useTranslations('Account.Orders');
  const format = useFormatter();

  return (
    <div className="inline-flex flex-col gap-2 text-base md:flex-row md:gap-12">
      <Link href={{ pathname: '/account/orders', query: { order: orderId } }}>
        <p className="flex justify-between md:flex-col">
          <span>{t('orderNumber')}</span>
          <span className="font-semibold">{orderId}</span>
        </p>
      </Link>
      <p className="flex justify-between md:flex-col">
        <span>{t('placedDate')}</span>
        <span className="font-semibold">
          {format.dateTime(new Date(orderDate), {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </p>
      <p className="flex justify-between md:flex-col">
        <span>{t('totalPrice')}</span>
        <span className="font-semibold">
          {format.number(orderPrice.value, {
            style: 'currency',
            currency: orderPrice.currencyCode,
          })}
        </span>
      </p>
      <p className="align-center flex h-fit justify-center gap-2.5 rounded-3xl bg-secondary/10 px-4 py-1.5 font-semibold text-primary">
        {orderStatus}
      </p>
    </div>
  );
};

export const OrdersList = ({ customerOrders }: OrdersListProps) => {
  const ordersHistory = customerOrders.map((order) => ({
    ...order,
    consignments: {
      shipping: order.consignments.shipping
        ? order.consignments.shipping.map(({ lineItems, shipments }) => ({
            lineItems: removeEdgesAndNodes(lineItems),
            shipments: removeEdgesAndNodes(shipments),
          }))
        : null,
    },
  }));

  return (
    <ul className="flex w-full flex-col">
      {ordersHistory.map(({ entityId, orderedAt, status, totalIncTax, consignments }) => {
        // NOTE: url will be supported later
        const trackingUrl = consignments.shipping
          ? consignments.shipping
              .flatMap(({ shipments }) =>
                shipments.map((shipment) => {
                  if (
                    shipment.tracking?.__typename === 'OrderShipmentNumberAndUrlTracking' ||
                    shipment.tracking?.__typename === 'OrderShipmentUrlOnlyTracking'
                  ) {
                    return shipment.tracking.url;
                  }

                  return null;
                }),
              )
              .find((url) => url !== null)
          : undefined;

        return (
          <li
            className="inline-flex border-collapse flex-col gap-y-6 border-t border-gray-200 py-6 last:border-b"
            key={entityId}
          >
            <OrderDetails
              orderDate={orderedAt.utc}
              orderId={entityId}
              orderPrice={totalIncTax}
              orderStatus={status.label}
            />
            <div className="flex gap-4">
              <ul className="inline-flex gap-4 [&>*:nth-child(n+2)]:hidden md:[&>*:nth-child(n+2)]:list-item md:[&>*:nth-child(n+4)]:hidden lg:[&>*:nth-child(n+4)]:list-item lg:[&>*:nth-child(n+5)]:hidden xl:[&>*:nth-child(n+5)]:list-item lg:[&>*:nth-child(n+7)]:hidden">
                {(consignments.shipping ?? []).map(({ lineItems }) => {
                  return lineItems.slice(0, VisibleListItemsPerDevice.xl).map((shippedProduct) => {
                    return (
                      <li className="w-36" key={shippedProduct.entityId}>
                        <ProductSnippet
                          imagePriority={true}
                          imageSize="square"
                          product={assembleProductData({ ...shippedProduct, productOptions: [] })}
                        />
                      </li>
                    );
                  });
                })}
              </ul>
              <HiddenQuantity
                itemsQuantity={(consignments.shipping ?? []).reduce((orderItems, shipment) => {
                  const totalQuantity = shipment.lineItems.reduce(
                    (total, items) => total + items.quantity,
                    0,
                  );

                  return orderItems + totalQuantity;
                }, 0)}
              />
              <OrderActionButtons
                className="hidden lg:ms-auto lg:inline-flex lg:flex-col lg:gap-2"
                orderId={entityId}
                orderStatus={status.value}
                orderTrackingUrl={trackingUrl}
              />
            </div>
            <OrderActionButtons
              className="inline-flex flex-col gap-2 md:flex-row lg:hidden"
              orderId={entityId}
              orderStatus={status.value}
              orderTrackingUrl={trackingUrl}
            />
          </li>
        );
      })}
    </ul>
  );
};
