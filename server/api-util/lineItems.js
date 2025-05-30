const { get } = require('lodash');
const {
  calculateQuantityFromDates,
  calculateQuantityFromHours,
  calculateTotalFromLineItems,
  calculateShippingFee,
  hasCommissionPercentage,
  resolveVoucherFeePrice,
  resolveSizeFeePrice,
  resolveVoucherFeeDiscount,
} = require('./lineItemHelpers');
const { types } = require('sharetribe-flex-sdk');
const { Money } = types;

/**
 * Get quantity and add extra line-items that are related to delivery method
 *
 * @param {Object} orderData should contain stockReservationQuantity and deliveryMethod
 * @param {*} publicData should contain shipping prices
 * @param {*} currency should point to the currency of listing's price.
 */
const getItemQuantityAndLineItems = (orderData, publicData, currency) => {
  // Check delivery method and shipping prices
  const quantity = orderData ? orderData.stockReservationQuantity : null;
  const deliveryMethod = orderData && orderData.deliveryMethod;
  const isShipping = deliveryMethod === 'shipping';
  const isPickup = deliveryMethod === 'pickup';
  const { shippingPriceInSubunitsOneItem, shippingPriceInSubunitsAdditionalItems } =
    publicData || {};

  // Calculate shipping fee if applicable
  const shippingFee = isShipping
    ? calculateShippingFee(
      shippingPriceInSubunitsOneItem,
      shippingPriceInSubunitsAdditionalItems,
      currency,
      quantity
    )
    : null;

  // Add line-item for given delivery method.
  // Note: by default, pickup considered as free.
  const deliveryLineItem = !!shippingFee
    ? [
      {
        code: 'line-item/shipping-fee',
        unitPrice: shippingFee,
        quantity: 1,
        includeFor: ['customer', 'provider'],
      },
    ]
    : isPickup
      ? [
        {
          code: 'line-item/pickup-fee',
          unitPrice: new Money(0, currency),
          quantity: 1,
          includeFor: ['customer', 'provider'],
        },
      ]
      : [];

  return { quantity, extraLineItems: deliveryLineItem };
};

/**
 * Get quantity for arbitrary units for time-based bookings.
 *
 * @param {*} orderData should contain quantity
 */
const getHourQuantityAndLineItems = (orderData) => {
  const { bookingStart, bookingEnd } = orderData || {};
  const quantity =
    bookingStart && bookingEnd ? calculateQuantityFromHours(bookingStart, bookingEnd) : null;

  return { quantity, extraLineItems: [] };
};

/**
 * Calculate quantity based on days or nights between given bookingDates.
 *
 * @param {*} orderData should contain bookingDates
 * @param {*} code should be either 'line-item/day' or 'line-item/night'
 */
const getDateRangeQuantityAndLineItems = (orderData, code) => {
  // bookingStart & bookingend are used with day-based bookings (how many days / nights)
  const { bookingStart, bookingEnd } = orderData || {};
  const quantity =
    bookingStart && bookingEnd ? calculateQuantityFromDates(bookingStart, bookingEnd, code) : null;

  return { quantity, extraLineItems: [] };
};

/**
 * Calculate units based on days or nights between given bookingDates. Returns units and seats.
 *
 * @param {*} orderData should contain booking dates and seats
 * @param {*} code should be either 'line-item/day' or 'line-item/night'
 */
const getDateRangeUnitsSeatsLineItems = (orderData, code) => {
  const { bookingStart, bookingEnd, seats } = orderData;

  const units =
    bookingStart && bookingEnd ? calculateQuantityFromDates(bookingStart, bookingEnd, code) : null;

  return { units, seats, extraLineItems: [] };
};

/**
 * Get quantity for arbitrary units and seats for time-based bookings.
 *
 * @param {*} orderData should contain quantity
 */
const getHourUnitsSeatsAndLineItems = (orderData) => {
  const { bookingStart, bookingEnd, seats } = orderData || {};

  const units = bookingStart && bookingEnd ? 1 : null;

  return { units, seats, extraLineItems: [] };
};

/**
 * Returns collection of lineItems (max 50)
 *
 * All the line-items dedicated to _customer_ define the "payin total".
 * Similarly, the sum of all the line-items included for _provider_ create "payout total".
 * Platform gets the commission, which is the difference between payin and payout totals.
 *
 * Each line items has following fields:
 * - `code`: string, mandatory, indentifies line item type (e.g. \"line-item/cleaning-fee\"), maximum length 64 characters.
 * - `unitPrice`: money, mandatory
 * - `lineTotal`: money
 * - `quantity`: number
 * - `percentage`: number (e.g. 15.5 for 15.5%)
 * - `seats`: number
 * - `units`: number
 * - `includeFor`: array containing strings \"customer\" or \"provider\", default [\":customer\"  \":provider\" ]
 *
 * Line item must have either `quantity` or `percentage` or both `seats` and `units`.
 *
 * `includeFor` defines commissions. Customer commission is added by defining `includeFor` array `["customer"]` and provider commission by `["provider"]`.
 *
 * @param {Object} listing
 * @param {Object} orderData
 * @param {Object} providerCommission
 * @returns {Array} lineItems
 */
exports.transactionLineItems = (listing, orderData, providerCommission, customerCommission) => {
  const publicData = listing.attributes.publicData;
  const unitPrice = listing.attributes.price;
  const currency = unitPrice.currency;
  const listingType = publicData.listingType;
  const listingId = listing.id.uuid;

  if (
    listingId === '67a1f051-5349-4adc-b2d9-5f3db3070d6b' ||
    listingId === '67994f77-331c-4ed2-87e7-6e539ed8f0db' ||
    listingId === '67a76dee-7ebe-452a-b025-51f2e085219d'
  ) {
    providerCommission.percentage = 5;
  }

  if (
    listingId === '67de98c4-cc5f-40ec-a7e6-29b309ad046d'
  ) {
    providerCommission.percentage = 20;
  }

  if (orderData?.voucherFee?.id === 'NEWJOYNER' || orderData?.voucherFee?.id === 'STAYPIGNA') {
    providerCommission.percentage = 0;
  }

  /**
   * Pricing starts with order's base price:
   * Listing's price is related to a single unit. It needs to be multiplied by quantity
   *
   * Initial line-item needs therefore:
   * - code (based on unitType)
   * - unitPrice
   * - quantity
   * - includedFor
   */

  // Unit type needs to be one of the following:
  // day, night, hour or item
  const unitType = publicData.unitType;
  const code = `line-item/${unitType}`;

  // Here "extra line-items" means line-items that are tied to unit type
  // E.g. by default, "shipping-fee" is tied to 'item' aka buying products.

  const quantityAndExtraLineItems =
    unitType === 'item'
      ? getItemQuantityAndLineItems(orderData, publicData, currency)
      : unitType === 'hour'
        ? getHourUnitsSeatsAndLineItems(orderData) // Adjusted to use the new function
        : ['day', 'night'].includes(unitType) && !!orderData.seats
          ? getDateRangeUnitsSeatsLineItems(orderData, code)
          : ['day', 'night'].includes(unitType)
            ? getDateRangeQuantityAndLineItems(orderData, code)
            : {};

  const { quantity, units, seats, extraLineItems } = quantityAndExtraLineItems;

  // Throw error if there is no quantity information given
  if (!quantity && !(units && seats)) {
    const message = `Error: transition should contain quantity information: 
    stockReservationQuantity, quantity, units & seats, or bookingStart & bookingEnd (if "line-item/day" or "line-item/night" is used)`;
    const error = new Error(message);
    error.status = 400;
    error.statusText = message;
    error.data = {};
    throw error;
  }
  // A booking line item can have either quantity, or units and seats. Add the
  // correct values depending on whether units and seats exist.
  const quantityOrSeats = !!units && !!seats ? { units, seats } : { quantity };

  /**
   * If you want to use pre-defined component and translations for printing the lineItems base price for order,
   * you should use one of the codes:
   * line-item/night, line-item/day, line-item/hour or line-item/item.
   *
   * Pre-definded commission components expects line item code to be one of the following:
   * 'line-item/provider-commission', 'line-item/customer-commission'
   *
   * By default OrderBreakdown prints line items inside LineItemUnknownItemsMaybe if the lineItem code is not recognized. */

  const order = {
    code,
    unitPrice,
    ...quantityOrSeats,
    includeFor: ['customer', 'provider'],
  };
  const estimatedTotal = order?.unitPrice.amount * order?.seats;
  const voucherFeePrice = orderData?.voucherFee
    ? resolveVoucherFeePrice(orderData.voucherFee, estimatedTotal)
    : null;

  const sizeFeePrice =
    orderData.fee && orderData.fee.length > 0 ? resolveSizeFeePrice(orderData.fee) : null;

  const sizeFee = sizeFeePrice
    ? [
      {
        code: 'line-item/tappeto-Size-fees',
        unitPrice: sizeFeePrice,
        quantity: 1,
        includeFor: ['provider', 'customer'],
      },
    ]
    : [];

  const voucherFee = voucherFeePrice
    ? [
      {
        code: 'line-item/voucher',
        unitPrice: voucherFeePrice,
        quantity: 1,
        includeFor: ['customer', 'provider'],
      },
    ]
    : [];

  const getNegation = (percentage) => {
    return -1 * percentage;
  };

  // Adjusted commission percentage basing on total
  /*
  const adjustedCommission = (voucherFeePrice = 0, total = 0) => {
    if (total === 0) {
      return 0;
    }
    return (Math.abs(voucherFeePrice) / total) * 100;
  };


  // Provider commission reduces the amount of money that is paid out to provider.
  // Therefore, the provider commission line-item should have negative effect to the payout total.
  const getNegation = (percentage, voucherFeePrice, total, listingType, listingId, seats) => {

    const result = adjustedCommission(voucherFeePrice, total);
    let percentageAdjusted = result > 0 ? percentage - result : percentage;

    // Cap the discount to always result in $5 off per seat for specific listing IDs
    const cappedListingIds = [
      '669cfea6-21fd-472e-85a4-75e1b2a72314',
      '669a2306-d854-4d48-93f1-24664a352f9e',
      '669a1e0e-b03d-4a1d-bee6-652b1a6f7385'
    ];

    if (cappedListingIds.includes(listingId)) {
      const maxDiscountInCentsPerSeat = 500; // $5 in cents per seat
      const maxDiscountInCents = maxDiscountInCentsPerSeat * (seats || 1); // Calculate the maximum discount in cents based on seats
      const maxDiscountPercentage = (maxDiscountInCents / total) * 100; // Calculate the maximum discount percentage

      percentageAdjusted = Math.min(percentageAdjusted, maxDiscountPercentage);
    }

    if (percentageAdjusted > 10) {
      percentageAdjusted = 10;
    } else if (percentageAdjusted < 0) {
      percentageAdjusted = 0;
    }

    if (listingType === 'store') {
      percentageAdjusted = 50;
    }

    return -1 * percentageAdjusted;
  };
  */

  // Note: extraLineItems for product selling (aka shipping fee)
  // is not included in either customer or provider commission calculation.

  // The provider commission is what the provider pays for the transaction, and
  // it is the subtracted from the order price to get the provider payout:
  // orderPrice - providerCommission = providerPayout
  const providerCommissionMaybe = hasCommissionPercentage(providerCommission)
    ? [
      {
        code: 'line-item/provider-commission',
        unitPrice: calculateTotalFromLineItems([order, ...voucherFee, ...sizeFee]),
        percentage: getNegation(providerCommission.percentage),
        includeFor: ['provider'],
      },
    ]
    : [];

  // The customer commission is what the customer pays for the transaction, and
  // it is added on top of the order price to get the customer's payin price:
  // orderPrice + customerCommission = customerPayin
  const customerCommissionMaybe = hasCommissionPercentage(customerCommission)
    ? [
      {
        code: 'line-item/customer-commission',
        unitPrice: calculateTotalFromLineItems([order, ...voucherFee]),
        percentage: customerCommission.percentage,
        includeFor: ['customer'],
      },
    ]
    : [];

  // Let's keep the base price (order) as first line item and provider and customer commissions as last.
  // Note: the order matters only if OrderBreakdown component doesn't recognize line-item.

  const lineItems = [
    order,
    ...extraLineItems,
    ...providerCommissionMaybe,
    ...customerCommissionMaybe,
    ...voucherFee,
    ...sizeFee,
  ];

  return lineItems;
};
