import React from 'react';
import { string, func, bool } from 'prop-types';
import classNames from 'classnames';
import IconsPerson from '../../media/icons/iconsPerson';
import IconsPin from '../../media/icons/iconsPin';
import IconsEuro from '../../media/icons/iconsEuro';
import { useConfiguration } from '../../context/configurationContext';

import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import { displayPrice } from '../../util/configHelpers';
import { lazyLoadWithDimensions } from '../../util/uiHelpers';
import { propTypes } from '../../util/types';
import { formatMoney } from '../../util/currency';
import { ensureListing, ensureUser } from '../../util/data';
import { richText } from '../../util/richText';
import { createSlug } from '../../util/urlHelpers';
import { isBookingProcessAlias } from '../../transactions/transaction';

import { AspectRatioWrapper, NamedLink, ResponsiveImage } from '..';

import css from './ListingCard.module.css';

const MIN_LENGTH_FOR_LONG_WORDS = 10;

const priceData = (price, currency, intl) => {
  if (price && price.currency === currency) {
    const formattedPrice = formatMoney(intl, price);
    return { formattedPrice, priceTitle: formattedPrice };
  }
  if (price) {
    return {
      formattedPrice: intl.formatMessage(
        { id: 'ListingCard.unsupportedPrice' },
        { currency: price.currency },
      ),
      priceTitle: intl.formatMessage(
        { id: 'ListingCard.unsupportedPriceTitle' },
        { currency: price.currency },
      ),
    };
  }
  return {};
};

const LazyImage = lazyLoadWithDimensions(ResponsiveImage, { loadAfterInitialRendering: 3000 });

function PriceMaybe(props) {
  const { price, publicData, config, intl } = props;
  const { listingType } = publicData || {};
  const validListingTypes = config.listing.listingTypes;
  const foundListingTypeConfig = validListingTypes.find((conf) => conf.listingType === listingType);
  const showPrice = displayPrice(foundListingTypeConfig);
  if (!showPrice && price) {
    return null;
  }

  const isBookable = isBookingProcessAlias(publicData?.transactionProcessAlias);
  const { formattedPrice, priceTitle } = priceData(price, config.currency, intl);
  return (
    <div className={css.price}>
      <div className={css.priceValue} title={priceTitle}>
        {formattedPrice}
      </div>
      {isBookable ? (
        <div className={css.perUnit}>
          <FormattedMessage id="ListingCard.perUnit" values={{ unitType: publicData?.unitType }} />
        </div>
      ) : null}
    </div>
  );
}


function LocationMaybe(props) {
  const { publicData } = props;
  const { loc } = publicData || {};

  if (!loc || loc.length === 0) {
    return null;
  }

  return (
    <div className={css.locationContainer}>
      <IconsPin />
      <span className={css.locationText}>
        {loc.join(', ')}
      </span>
    </div>
  );
}

export function ListingCardComponent(props) {
  const config = useConfiguration();
  const { className, rootClassName, intl, listing, renderSizes, setActiveListing, showAuthorInfo } =
    props;
  const min = listing.attributes.publicData?.min;
  const max = listing.attributes.publicData?.max;
  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureListing(listing);
  const id = currentListing.id.uuid;
  const { title = '', price, publicData } = currentListing.attributes;
  const slug = createSlug(title);
  const author = ensureUser(listing.author);
  const authorName = author.attributes.profile.displayName;
  const providerName = author.attributes.profile.publicData?.providerName || '';
  const firstImage =
    currentListing.images && currentListing.images.length > 0 ? currentListing.images[0] : null;

  const {
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = config.layout.listingImage;
  const variants = firstImage
    ? Object.keys(firstImage?.attributes?.variants).filter((k) => k.startsWith(variantPrefix))
    : [];

  const setActivePropsMaybe = setActiveListing
    ? {
        onMouseEnter: () => setActiveListing(currentListing.id),
        onMouseLeave: () => setActiveListing(null),
      }
    : null;

  return (
    <NamedLink className={classes} name="ListingPage" params={{ id, slug }}>
      <AspectRatioWrapper
        className={css.aspectRatioWrapper}
        width={aspectWidth}
        height={aspectHeight}
        {...setActivePropsMaybe}
      >
        <LazyImage
          rootClassName={css.rootForImage}
          alt={title}
          image={firstImage}
          variants={variants}
          sizes={renderSizes}
        />
      </AspectRatioWrapper>
      <div className={css.info}>
      <div className={css.mainInfo}>
          <div className={css.title}>
            {richText(title, {
              longWordMinLength: MIN_LENGTH_FOR_LONG_WORDS,
              longWordClass: css.longWord,
            })}
          </div>
          {/*showAuthorInfo ? (
            <div className={css.authorInfo}>
              {providerName} by <FormattedMessage id="ListingCard.author" values={{ authorName }} />
            </div>
          ) : null*/}
        </div>
        <div className={css.priceContainer}>
          {price && price.amount === 0 ? (
            <span>FREE</span>
          ) : (
            <PriceMaybe price={price} publicData={publicData} config={config} intl={intl} />
          )}
                    {listing.attributes.publicData.listingType === 'teambuilding' ? (
            <div className={css.teamBuilding}>
              <IconsPerson size="14px" color="blu" />
              {max !== undefined && max !== null ? `${min} +` : `${min}+`}
            </div>
          ) : null}
        </div>
      </div>
    </NamedLink>
  );
}

ListingCardComponent.defaultProps = {
  className: null,
  rootClassName: null,
  renderSizes: null,
  setActiveListing: null,
  showAuthorInfo: true,
};

ListingCardComponent.propTypes = {
  className: string,
  rootClassName: string,
  intl: intlShape.isRequired,
  listing: propTypes.listing.isRequired,
  showAuthorInfo: bool,

  // Responsive image sizes hint
  renderSizes: string,

  setActiveListing: func,
};

export default injectIntl(ListingCardComponent);
