import React from 'react';
import { bool } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm, Field } from 'react-final-form';

import { FormattedMessage, injectIntl } from '../../../util/reactIntl';
import { propTypes } from '../../../util/types';
import {
  Heading,
  Form,
  NamedLink,
  IconEmailAttention,
  IconEmailSuccess,
  PrimaryButton,
} from '../../../components';

import css from './EmailVerificationForm.module.css';

function EmailVerificationFormComponent(props) {
  return (
    <FinalForm
      {...props}
      render={(formRenderProps) => {
        const { currentUser, inProgress, handleSubmit, verificationError } = formRenderProps;

        const { email, emailVerified, pendingEmail, profile } = currentUser.attributes;
        const emailToVerify = <strong>{pendingEmail || email}</strong>;
        const name = profile.firstName;

        const errorMessage = (
          <div className={css.error}>
            <FormattedMessage id="EmailVerificationForm.verificationFailed" />
          </div>
        );

        const submitInProgress = inProgress;
        const submitDisabled = submitInProgress;

        const verifyEmail = (
          <div className={css.root}>
            <div>
              <IconEmailAttention className={css.modalIcon} />
              <Heading as="h1" rootClassName={css.modalTitle}>
                <FormattedMessage id="EmailVerificationForm.verifyEmailAddress" />
              </Heading>

              <p className={css.modalMessage}>
                <FormattedMessage
                  id="EmailVerificationForm.finishAccountSetup"
                  values={{ email: emailToVerify }}
                />
              </p>

              {verificationError ? errorMessage : null}
            </div>

            <Form onSubmit={handleSubmit}>
              <Field component="input" type="hidden" name="verificationToken" />

              <div className={css.bottomWrapper}>
                <PrimaryButton
                  type="submit"
                  inProgress={submitInProgress}
                  disabled={submitDisabled}
                >
                  {inProgress ? (
                    <FormattedMessage id="EmailVerificationForm.verifying" />
                  ) : (
                    <FormattedMessage id="EmailVerificationForm.verify" />
                  )}
                </PrimaryButton>
              </div>
            </Form>
          </div>
        );

        const alreadyVerified = (
          <div className={css.root}>
            <div>
              <IconEmailSuccess className={css.modalIcon} />
              <Heading as="h1" rootClassName={css.modalTitle}>
                <FormattedMessage id="EmailVerificationForm.successTitle" values={{ name }} />
              </Heading>

              <p className={css.modalMessage}>
                <FormattedMessage id="EmailVerificationForm.successText" />
              </p>
            </div>

            <div className={css.bottomWrapper}>
              <NamedLink className={css.submitButton} name="LandingPage">
                <FormattedMessage id="EmailVerificationForm.successButtonText" />
              </NamedLink>
            </div>
          </div>
        );

        const currentEmail = <strong>{email}</strong>;
        const alreadyVerifiedButErrorReturned = (
          <div className={css.root}>
            <div>
              <IconEmailSuccess className={css.modalIcon} />
              <Heading as="h1" rootClassName={css.modalTitle}>
                <FormattedMessage id="EmailVerificationForm.noPendingTitle" values={{ name }} />
              </Heading>

              <p className={css.modalMessage}>
                <FormattedMessage
                  id="EmailVerificationForm.noPendingText"
                  values={{ email: currentEmail, lineBreak: <br /> }}
                />
              </p>
            </div>

            <div className={css.bottomWrapper}>
              <NamedLink className={css.submitButton} name="LandingPage">
                <FormattedMessage id="EmailVerificationForm.successButtonText" />
              </NamedLink>
            </div>
          </div>
        );

        const anyPendingEmailHasBeenVerifiedForCurrentUser = emailVerified && !pendingEmail;
        return anyPendingEmailHasBeenVerifiedForCurrentUser && verificationError
          ? alreadyVerifiedButErrorReturned
          : anyPendingEmailHasBeenVerifiedForCurrentUser
            ? alreadyVerified
            : verifyEmail;
      }}
    />
  );
}

EmailVerificationFormComponent.defaultProps = {
  currentUser: null,
  inProgress: false,
  verificationError: null,
};

EmailVerificationFormComponent.propTypes = {
  inProgress: bool,
  currentUser: propTypes.currentUser.isRequired,
  verificationError: propTypes.error,
};

const EmailVerificationForm = compose(injectIntl)(EmailVerificationFormComponent);

export default EmailVerificationForm;
