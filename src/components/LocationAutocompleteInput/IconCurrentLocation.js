import React from 'react';

import css from './LocationAutocompleteInput.module.css';

function IconCurrentLocation() {
  return (
    <svg
      className={css.currentLocationIcon}
      width="12"
      height="12"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.9269636.07279915c-.0779984-.0770013-.1959959-.0950016-.2924939-.04400074L.13470842 6.02889945c-.10199788.05300089-.15499678.16900284-.12749735.28100473.02799942.11150188.12799734.1900032.24299496.1900032h5.249891v5.25008842c0 .1150019.07899836.2160036.19049604.2430041C5.71009267 11.998 5.73059224 12 5.75009184 12c.0914981 0 .1779963-.0505009.22199539-.1345023L11.9719627.36530407c.0499989-.09650162.0319993-.21500362-.0449991-.29250492"
        fill="#FFF"
        fillRule="evenodd"
      />
    </svg>
  );
}

export default IconCurrentLocation;
