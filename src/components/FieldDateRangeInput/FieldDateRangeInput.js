/**
 * Provides a date picker for Final Forms (using https://github.com/airbnb/react-dates)
 *
 * NOTE: If you are using this component inside BookingDatesForm,
 * you should convert value.date to start date and end date before submitting it to API
 */

import React, { Component } from 'react';
import { bool, func, object, oneOf, string, number } from 'prop-types';
import { isInclusivelyAfterDay, isInclusivelyBeforeDay } from 'react-dates';
import { Field } from 'react-final-form';
import classNames from 'classnames';
import moment from 'moment';

import { useConfiguration } from '../../context/configurationContext';
import { START_DATE, END_DATE } from '../../util/dates';
import { FieldSelect, ValidationError } from '..';

import DateRangeInput from './DateRangeInput';
import css from './FieldDateRangeInput.module.css';

const MAX_MOBILE_SCREEN_WIDTH = 768;

class FieldDateRangeInputComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { focusedInput: null };
    this.handleBlur = this.handleBlur.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
  }

  componentDidUpdate(prevProps) {
    // Update focusedInput in case a new value for it is
    // passed in the props. This may occur if the focus
    // is manually set to the date picker.
    if (this.props.focusedInput && this.props.focusedInput !== prevProps.focusedInput) {
      this.setState({ focusedInput: this.props.focusedInput });
    }
  }

  handleBlur(focusedInput) {
    this.setState({ focusedInput: null });
    this.props.input.onBlur(focusedInput);
    // Notify the containing component that the focused
    // input has changed.
    if (this.props.onFocusedInputChange) {
      this.props.onFocusedInputChange(null);
    }
  }

  handleFocus(focusedInput) {
    this.setState({ focusedInput });
    this.props.input.onFocus(focusedInput);
  }

  componentDidMount() {
    this.handleSeatsArrayUpdate();
  }

  componentDidUpdate(prevProps) {
    // Check if seatsArray has changed
    if (this.props.seatsArray !== prevProps.seatsArray) {
      this.handleSeatsArrayUpdate();
    }
  }

  handleSeatsArrayUpdate() {
    // Check if seatsArray exists and its length is greater than 1
    if (this.props.seatsArray?.length > 1) {
      // If setShowSeatNames function is passed as prop, call it
      if (typeof this.props.setShowSeatNames === 'function') {
        this.props.setShowSeatNames(true);
      }
    }
  }

  render() {
    const {
      className,
      rootClassName,
      isDaily,
      startDateId,
      startDateLabel,
      endDateId,
      endDateLabel,
      input,
      meta,
      useMobileMargins,
      // Extract focusedInput and onFocusedInputChange so that
      // the same values will not be passed on to subcomponents.
      focusedInput,
      onFocusedInputChange,
      seatsArray,
      seatsLabel,
      setShowSeatNames,
      ...rest
    } = this.props;

    if (startDateLabel && !startDateId) {
      throw new Error('startDateId required when a startDateLabel is given');
    }

    if (endDateLabel && !endDateId) {
      throw new Error('endDateId required when a endDateLabel is given');
    }

    // If startDate is valid label changes color and bottom border changes color too
    const startDateLabelClasses = classNames(css.startDateLabel);

    // If endDate is valid label changes color and bottom border changes color too
    const endDateLabelClasses = classNames(css.endDateLabel);

    const label =
      startDateLabel && endDateLabel ? (
        <div className={classNames(css.labels, { [css.mobileMargins]: useMobileMargins })}>
          <label className={startDateLabelClasses} htmlFor={startDateId}>
            {startDateLabel}
          </label>
          <label className={endDateLabelClasses} htmlFor={endDateId}>
            {endDateLabel}
          </label>
        </div>
      ) : null;

    const { onBlur, onFocus, type, checked, ...restOfInput } = input;
    const inputProps = {
      isDaily,
      minimumNights: isDaily ? 0 : 1,
      onBlur: this.handleBlur,
      onFocus: this.handleFocus,
      useMobileMargins,
      readOnly: typeof window !== 'undefined' && window.innerWidth < MAX_MOBILE_SCREEN_WIDTH,
      ...restOfInput,
      ...rest,
      focusedInput: this.state.focusedInput,
      startDateId,
      endDateId,
    };
    const classes = classNames(rootClassName || css.fieldRoot, className);
    const errorClasses = classNames({ [css.mobileMargins]: useMobileMargins });

    const seatsSelectionMaybe =
      seatsArray?.length > 1 ? (
        <FieldSelect name="seats" id="seats" label={seatsLabel}>
          {seatsArray.map((s) => (
            <option value={s} key={s}>
              {s}
            </option>
          ))}
        </FieldSelect>
      ) : null;

    return (
      <div className={classes}>
        {label}
        <DateRangeInput {...inputProps} />
        <ValidationError className={errorClasses} fieldMeta={meta} />
        {seatsSelectionMaybe}
      </div>
    );
  }
}

FieldDateRangeInputComponent.defaultProps = {
  className: null,
  rootClassName: null,
  useMobileMargins: false,
  endDateId: null,
  endDateLabel: null,
  endDatePlaceholderText: null,
  startDateId: null,
  startDateLabel: null,
  startDatePlaceholderText: null,
  focusedInput: null,
  onFocusedInputChange: null,
};

FieldDateRangeInputComponent.propTypes = {
  className: string,
  rootClassName: string,
  isDaily: bool.isRequired,
  useMobileMargins: bool,
  endDateId: string,
  endDateLabel: string,
  endDatePlaceholderText: string,
  startDateId: string,
  startDateLabel: string,
  startDatePlaceholderText: string,
  input: object.isRequired,
  meta: object.isRequired,
  focusedInput: oneOf([START_DATE, END_DATE]),
  onFocusedInputChange: func,

  isOutsideRange: func.isRequired,
  firstDayOfWeek: number.isRequired,
};

function FieldDateRangeInput(props) {
  const config = useConfiguration();
  const { isOutsideRange, firstDayOfWeek, ...rest } = props;

  // Outside range -><- today ... today+available days -1 -><- outside range
  const defaultIsOutSideRange = (day) => {
    const endOfRange = config.stripe.dayCountAvailableForBooking - 1;
    return (
      !isInclusivelyAfterDay(day, moment()) ||
      !isInclusivelyBeforeDay(day, moment().add(endOfRange, 'days'))
    );
  };
  const defaultFirstDayOfWeek = config.localization.firstDayOfWeek;

  return (
    <Field
      component={FieldDateRangeInputComponent}
      isOutsideRange={isOutsideRange || defaultIsOutSideRange}
      firstDayOfWeek={firstDayOfWeek || defaultFirstDayOfWeek}
      {...rest}
    />
  );
}

export { DateRangeInput };
export default FieldDateRangeInput;
