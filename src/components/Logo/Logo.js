import React from 'react';
import { oneOf, string } from 'prop-types';
import classNames from 'classnames';

import { useConfiguration } from '../../context/configurationContext';
import { ResponsiveImage } from '..';

import css from './Logo.module.css';

const HEIGHT_24 = 24;
const HEIGHT_36 = 36;
const HEIGHT_48 = 48;
const HEIGHT_OPTIONS = [HEIGHT_24, HEIGHT_36, HEIGHT_48];

// logoSettings property supports only 3 types at this point
const isValidLogoSettings = (settings) =>
  settings?.format === 'image' && HEIGHT_OPTIONS.includes(settings?.height);
const isImageAsset = (logo) => logo?.type === 'imageAsset';

// Each type can have multiple image variants
const getVariantNames = (variantsObj) => Object.keys(variantsObj) || [];

// Variant data contains width and height among other things
// The width is needed for sizes attribute of responsive logo imgs
const getVariantData = (variants) =>
  // This assume that "scaled" variant exists
  // If other variants are introduced, this setup might need some tuning.
  variants.scaled;
// We have maximum heights for each logo type. It's enforced through classes
const getHeightClassName = (height) =>
  height === HEIGHT_48 ? css.logo48 : height === HEIGHT_36 ? css.logo36 : css.logo24;

export function LogoComponent(props) {
  const {
    className,
    logoImageClassName,
    layout,
    marketplaceName,
    logoImageDesktop,
    logoImageMobile,
    logoSettings,
    ...rest
  } = props;

  const hasValidLogoSettings = isValidLogoSettings(logoSettings);
  const logoClasses = className || css.root;
  const logoImageClasses = classNames(
    logoImageClassName || css.logo,
    getHeightClassName(logoSettings?.height),
  );

  // Logo from hosted asset
  if (isImageAsset(logoImageDesktop) && hasValidLogoSettings && layout === 'desktop') {
    const { variants } = logoImageDesktop.attributes;
    const variantNames = getVariantNames(variants);
    const { width } = getVariantData(variants);
    return (
      <div className={logoClasses} style={{ width: `${width}px` }}>
        <ResponsiveImage
          rootClassName={logoImageClasses}
          alt={marketplaceName}
          image={logoImageDesktop}
          variants={variantNames}
          sizes={`${width}px`}
          width={width}
          height={logoSettings?.height}
        />
      </div>
    );
  }
  if (isImageAsset(logoImageMobile) && hasValidLogoSettings && layout === 'mobile') {
    const { variants } = logoImageMobile.attributes;
    const variantNames = getVariantNames(variants);
    const { width } = getVariantData(variants);

    // Sizes on small screens are mainly limited by space: side buttons take 2x66 px, the rest is for logo.
    // If logo's (1x) width is less than 188, we can use logo's width as limit for sizes attribute
    // On general case, up to the screen size of 500px, we could say that the logo _might_ take all the available space
    // However, after 500px, the max aspect ratio for the logo should start limiting the logo's width.
    const sizes =
      width <= 188 ? `${width}px` : `(max-width: 500px) calc(100vw - 132px), ${width}px`;
    return (
      <div className={logoClasses}>
        <ResponsiveImage
          rootClassName={logoImageClasses}
          alt={marketplaceName}
          image={logoImageMobile}
          variants={variantNames}
          sizes={sizes}
          width={width}
        />
      </div>
    );
  }
  if (layout === 'desktop') {
    return (
      <div className={logoClasses}>
        <img className={logoImageClasses} src={logoImageDesktop} alt={marketplaceName} {...rest} />
      </div>
    );
  }

  return (
    <div className={logoClasses}>
      <img className={logoImageClasses} src={logoImageMobile} alt={marketplaceName} {...rest} />
    </div>
  );
}

function Logo(props) {
  const config = useConfiguration();
  // NOTE: logo images are set in hosted branding.json asset or src/config/brandingConfig.js
  const { logoImageDesktop, logoImageMobile, logoSettings } = config.branding;

  return (
    <LogoComponent
      {...props}
      logoImageDesktop={logoImageDesktop}
      logoImageMobile={logoImageMobile}
      logoSettings={logoSettings}
      marketplaceName={config.marketplaceName}
    />
  );
}

Logo.defaultProps = {
  className: null,
  layout: 'desktop',
};

Logo.propTypes = {
  className: string,
  layout: oneOf(['desktop', 'mobile']),
};

export default Logo;
