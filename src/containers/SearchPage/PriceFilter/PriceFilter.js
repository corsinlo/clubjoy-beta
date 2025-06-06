import React from 'react';
import { bool } from 'prop-types';

import PriceFilterPlain from './PriceFilterPlain';
import PriceFilterPopup from './PriceFilterPopup';

function PriceFilter(props) {
  const { showAsPopup, marketplaceCurrency, ...rest } = props;
  return showAsPopup ? (
    <PriceFilterPopup marketplaceCurrency={marketplaceCurrency} {...rest} />
  ) : (
    <PriceFilterPlain marketplaceCurrency={marketplaceCurrency} {...rest} />
  );
}

PriceFilter.defaultProps = {
  showAsPopup: false,
};

PriceFilter.propTypes = {
  showAsPopup: bool,
};

export default PriceFilter;
