import React from 'react';
import { string } from 'prop-types';
import Decimal from 'decimal.js';

import { FormattedMessage, intlShape } from '../../util/reactIntl';
import { formatMoney } from '../../util/currency';
import { types as sdkTypes } from '../../util/sdkLoader';
import {
  propTypes,
  LINE_ITEM_CUSTOMER_COMMISSION,
  LINE_ITEM_PROVIDER_COMMISSION,
} from '../../util/types';

import css from './OrderBreakdown.module.css';

const { Money } = sdkTypes;

/**
 * Calculates the total price in sub units for multiple line items.
 */
const lineItemsTotal = (lineItems, marketplaceCurrency) => {
  const amount = lineItems.reduce(
    (total, item) => total.plus(item.lineTotal.amount),
    new Decimal(0),
  );
  const currency = lineItems[0] ? lineItems[0].lineTotal.currency : marketplaceCurrency;
  return new Money(amount, currency);
};

/**
 * Checks if line item represents commission
 */
const isCommission = (lineItem) =>
  lineItem.code === LINE_ITEM_PROVIDER_COMMISSION ||
  lineItem.code === LINE_ITEM_CUSTOMER_COMMISSION;

/**
 * Returns non-commission, non-reversal line items
 */
const nonCommissionNonReversalLineItems = (lineItems) =>
  lineItems.filter((item) => !isCommission(item) && !item.reversal);

/**
 * Check if there is a commission line-item for the given user role.
 */
const hasCommission = (lineItems, userRole) => {
  let commissionLineItem = null;

  if (userRole === 'customer') {
    commissionLineItem = lineItems.find((item) => item.code === LINE_ITEM_CUSTOMER_COMMISSION);
  } else if (userRole === 'provider') {
    commissionLineItem = lineItems.find((item) => item.code === LINE_ITEM_PROVIDER_COMMISSION);
  }
  return !!commissionLineItem;
};

function LineItemSubTotalMaybe(props) {
  const { lineItems, code, userRole, intl, marketplaceCurrency } = props;

  const refund = lineItems.find((item) => item.code === code && item.reversal);

  // Show subtotal only if commission line-item is applicable to user or refund is issued.
  const showSubTotal = hasCommission(lineItems, userRole) || refund;

  // all non-reversal, non-commission line items
  const subTotalLineItems = nonCommissionNonReversalLineItems(lineItems);
  // line totals of those line items combined
  const subTotal = lineItemsTotal(subTotalLineItems, marketplaceCurrency);

  const formattedSubTotal = subTotalLineItems.length > 0 ? formatMoney(intl, subTotal) : null;

  return formattedSubTotal && showSubTotal ? (
    <>
      <hr className={css.totalDivider} />
      <div className={css.subTotalLineItem}>
        <span className={css.itemLabel}>
          <FormattedMessage id="OrderBreakdown.subTotal" />
        </span>
        <span className={css.itemValue}>{formattedSubTotal}</span>
      </div>
    </>
  ) : null;
}

LineItemSubTotalMaybe.propTypes = {
  lineItems: propTypes.lineItems.isRequired,
  userRole: string.isRequired,
  intl: intlShape.isRequired,
};

export default LineItemSubTotalMaybe;
