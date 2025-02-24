import React from 'react';
import { instanceOf, string } from 'prop-types';
import classNames from 'classnames';
import { isSameDay, formatDateIntoPartials } from '../../util/dates';
import { injectIntl, intlShape } from '../../util/reactIntl';
import { DATE_TYPE_DATE, DATE_TYPE_TIME, DATE_TYPE_DATETIME, propTypes } from '../../util/types';

import css from './TimeRange.module.css';

// Sometimes we want to break string created by intl.formatDateTimeRange into
// shorter substrings. Intl uses special dash to separate date-time range.
const DASH = '–';
const BREAK_WORD_MIN_LENGTH = 27;

export function TimeRangeComponent(props) {
  const { rootClassName, className, startDate, endDate, seats, dateType, timeZone, intl } = props;

  const start = formatDateIntoPartials(startDate, intl, { timeZone });
  const end = formatDateIntoPartials(endDate, intl, { timeZone });
  const isSingleDay = isSameDay(startDate, endDate, timeZone);

  const dateFormatting = { month: 'short', day: 'numeric', timeZone };

  const classes = classNames(rootClassName || css.root, className);

  if (isSingleDay && dateType === DATE_TYPE_DATE) {
    return (
      <div className={classes}>
        <span className={css.dateSection}>{`${start.date}`}</span>
      </div>
    );
  }
  if (dateType === DATE_TYPE_DATE) {
    const formatted = intl.formatDateTimeRange(startDate, endDate, dateFormatting);
    // For small words, we use the default from Intl,
    // but for longer words, we add correct word wraps by adding spans.
    const range =
      formatted.length > BREAK_WORD_MIN_LENGTH ? (
        formatted.split(DASH).map((rangePartial, i) => (
          <span key={`datespan${i}`} className={css.dateSection}>
            {rangePartial}
            {i == 0 ? DASH : null}
          </span>
        ))
      ) : (
        <span className={css.dateSection}>{formatted}</span>
      );
    return <div className={classes}>{range}</div>;
  }
  if (isSingleDay && dateType === DATE_TYPE_TIME) {
    return (
      <div className={classes}>
        <span className={css.dateSection}>
          {`${start.time} - ${end.time}`} - {seats}
        </span>
      </div>
    );
  }
  if (dateType === DATE_TYPE_TIME) {
    const timeFormatting = { hour: 'numeric', minute: 'numeric' };
    const formatted = intl.formatDateTimeRange(startDate, endDate, {
      ...dateFormatting,
      ...timeFormatting,
    });
    // For small words, we use the default from Intl,
    // but for longer words, we add correct word wraps by adding spans.
    const range =
      formatted.length > BREAK_WORD_MIN_LENGTH ? (
        formatted.split(DASH).map((rangePartial, i) => (
          <span key={`datespan${i}`} className={css.dateSection}>
            {rangePartial}
            {i == 0 ? ` ${DASH} ` : null}
          </span>
        ))
      ) : (
        <span className={css.dateSection}>{formatted}</span>
      );
    return <div className={classes}>{range}</div>;
  }
  if (isSingleDay && dateType === DATE_TYPE_DATETIME) {
    return (
      <div className={classes}>
        <span className={css.dateSection}>
          {`${start.date}, ${start.time} - ${end.time}`} ({seats})
        </span>
      </div>
    );
  }
  return (
    <div className={classes}>
      <span className={css.dateSection}>{`${start.dateAndTime} - `}</span>
      <span className={css.dateSection}>
        {`${end.dateAndTime}`} ({seats})
      </span>
    </div>
  );
}

TimeRangeComponent.defaultProps = {
  rootClassName: null,
  className: null,
  dateType: null,
  timeZone: null,
};

TimeRangeComponent.propTypes = {
  rootClassName: string,
  className: string,
  startDate: instanceOf(Date).isRequired,
  endDate: instanceOf(Date).isRequired,
  dateType: propTypes.dateType,
  timeZone: string,

  // from injectIntl
  intl: intlShape.isRequired,
};

export default injectIntl(TimeRangeComponent);
