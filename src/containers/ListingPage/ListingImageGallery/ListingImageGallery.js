import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReactImageGallery from 'react-image-gallery';

import { propTypes } from '../../../util/types';
import { FormattedMessage, injectIntl, intlShape } from '../../../util/reactIntl';
import {
  AspectRatioWrapper,
  Button,
  IconClose,
  IconArrowHead,
  ResponsiveImage,
} from '../../../components';

// Copied directly from
// `node_modules/react-image-gallery/styles/css/image-gallery.css`. The
// copied file is left unedited, and all the overrides are defined in
// the component CSS file below.
import './image-gallery.css';

import css from './ListingImageGallery.module.css';

const IMAGE_GALLERY_OPTIONS = {
  showPlayButton: false,
  disableThumbnailScroll: true,
};
const MAX_LANDSCAPE_ASPECT_RATIO = 2; // 2:1
const MAX_PORTRAIT_ASPECT_RATIO = 4 / 3;

const getFirstImageAspectRatio = (firstImage, scaledVariant) => {
  if (!firstImage) {
    return { aspectWidth: 1, aspectHeight: 1 };
  }

  const v = firstImage?.attributes?.variants?.[scaledVariant];
  const w = v?.width;
  const h = v?.height;
  const hasDimensions = !!w && !!h;
  const aspectRatio = w / h;

  // We keep the fractions separated as these are given to AspectRatioWrapper
  // which expects separate width and height
  return hasDimensions && aspectRatio >= MAX_LANDSCAPE_ASPECT_RATIO
    ? { aspectWidth: 2, aspectHeight: 1 }
    : hasDimensions && aspectRatio <= MAX_PORTRAIT_ASPECT_RATIO
      ? { aspectWidth: 4, aspectHeight: 3 }
      : hasDimensions
        ? { aspectWidth: w, aspectHeight: h }
        : { aspectWidth: 1, aspectHeight: 1 };
};

function ListingImageGallery(props) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { intl, rootClassName, className, images, imageVariants, thumbnailVariants } = props;
  const thumbVariants = thumbnailVariants || imageVariants;
  // imageVariants are scaled variants.
  const { aspectWidth, aspectHeight } = getFirstImageAspectRatio(images?.[0], imageVariants[0]);
  const items = images.map((img, i) => ({
    // We will only use the image resource, but react-image-gallery
    // requires the `original` key from each item.
    original: '',
    alt: intl.formatMessage(
      { id: 'ListingImageGallery.imageAltText' },
      { index: i + 1, count: images.length },
    ),
    thumbAlt: intl.formatMessage(
      { id: 'ListingImageGallery.imageThumbnailAltText' },
      { index: i + 1, count: images.length },
    ),
    thumbnail: img.attributes?.variants?.[thumbVariants[0]],
    image: img,
  }));
  const imageSizesMaybe = isFullscreen
    ? {}
    : { sizes: `(max-width: 1024px) 100vw, (max-width: 1200px) calc(100vw - 192px), 708px` };
  const renderItem = (item) => (
    <AspectRatioWrapper
      width={aspectWidth || 1}
      height={aspectHeight || 1}
      className={isFullscreen ? css.itemWrapperFullscreen : css.itemWrapper}
    >
      <div className={css.itemCentering}>
        <ResponsiveImage
          rootClassName={css.item}
          image={item.image}
          alt={item.alt}
          variants={imageVariants}
          {...imageSizesMaybe}
        />
      </div>
    </AspectRatioWrapper>
  );
  const renderThumbInner = (item) => (
    <div>
      <ResponsiveImage
        rootClassName={css.thumb}
        image={item.image}
        alt={item.thumbAlt}
        variants={thumbVariants}
        sizes="88px"
      />
    </div>
  );

  const onScreenChange = (isFull) => {
    setIsFullscreen(isFull);
  };

  const renderLeftNav = (onClick, disabled) => (
    <button className={css.navLeft} disabled={disabled} onClick={onClick}>
      <div className={css.navArrowWrapper}>
        <IconArrowHead direction="left" size="big" />
      </div>
    </button>
  );
  const renderRightNav = (onClick, disabled) => (
    <button className={css.navRight} disabled={disabled} onClick={onClick}>
      <div className={css.navArrowWrapper}>
        <IconArrowHead direction="right" size="big" />
      </div>
    </button>
  );
  const renderFullscreenButton = (onClick, isFullscreen) =>
    isFullscreen ? (
      <Button
        onClick={onClick}
        rootClassName={css.close}
        title={intl.formatMessage({ id: 'ListingImageGallery.closeModalTitle' })}
      >
        <span className={css.closeText}>
          <FormattedMessage id="ListingImageGallery.closeModal" />
        </span>
        <IconClose rootClassName={css.closeIcon} />
      </Button>
    ) : (
      <button className={css.openFullscreen} onClick={onClick}>
        <FormattedMessage
          id="ListingImageGallery.viewImagesButton"
          values={{ count: images.length }}
        />
      </button>
    );

  if (items.length === 0) {
    return <ResponsiveImage className={css.noImage} image={null} variants={[]} alt="" />;
  }

  const classes = classNames(rootClassName || css.root, className);

  return (
    <ReactImageGallery
      additionalClass={classes}
      items={items}
      renderItem={renderItem}
      renderThumbInner={renderThumbInner}
      onScreenChange={onScreenChange}
      renderLeftNav={renderLeftNav}
      renderRightNav={renderRightNav}
      renderFullscreenButton={renderFullscreenButton}
      {...IMAGE_GALLERY_OPTIONS}
    />
  );
}

ListingImageGallery.defaultProps = {
  rootClassName: null,
  className: null,
  thumbnailVariants: null,
};

const { string, arrayOf } = PropTypes;

ListingImageGallery.propTypes = {
  rootClassName: string,
  className: string,
  images: arrayOf(propTypes.image).isRequired,
  imageVariants: arrayOf(string).isRequired,
  thumbnailVariants: arrayOf(string),

  // from injectIntl
  intl: intlShape.isRequired,
};

export default injectIntl(ListingImageGallery);
