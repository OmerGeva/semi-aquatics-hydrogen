import React from 'react';

import { subscribeToNewsletter } from '../../lib/klaviyo/subscribe';
import { EmailFormProps } from '../../interfaces/page_interface';
import Form from '../form/form.component';

const styles = {
  sidebarEmailFormContainer: 'sidebarEmailFormContainer',
  isSidebar: 'isSidebar',
  isNotSidebar: 'isNotSidebar',
  emailForm: 'emailForm',
  emailInput: 'emailInput',
  submitButton: 'submitButton',
  messageContainer: 'messageContainer',
  hasMessage: 'hasMessage',
  errorMessage: 'errorMessage',
  successMessage: 'successMessage',
} as const;

const EmailForm: React.FC<EmailFormProps> = ({
  isSidebar,
  placeholder,
  formClassName,
  inputContainerClassName,
  inputClassName,
  buttonClassName,
  messageContainerClassName,
  onSuccess
}) => {
  const [email, setEmail] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const handleSuccessResponse = () => {
    setEmail('');
    setErrorMessage('');
    setSuccessMessage('Thank you for subscribing!');
    setTimeout(() => {
      setSuccessMessage('');
    }, 5000);

    // Call onSuccess callback if provided
    if (onSuccess) {
      onSuccess();
    }
  }

  const handleErrorResponse = (error: any) => {
    setSuccessMessage('');
    setErrorMessage(error instanceof Error && error.message ? error.message : 'Something went wrong. Please try again.');
    setTimeout(() => {
      setErrorMessage('');
    }, 5000);
  }

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      setSuccessMessage('');
      setErrorMessage('Please enter a valid email address.');
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
      return;
    }

    try {
      await subscribeToNewsletter(email.trim());
      handleSuccessResponse();
    } catch (error) {
      handleErrorResponse(error);
    }
  }

  return (
    <React.Fragment>
      <div className={`${styles.sidebarEmailFormContainer} ${isSidebar ? styles.isSidebar : styles.isNotSidebar} ${inputContainerClassName || ''}`}>
        <form className={`${styles.emailForm} ${formClassName || ''}`}>
          <input type="text" placeholder={placeholder ?? 'enter your email'} className={`${styles.emailInput} ${inputClassName || ''}`} value={email} onChange={(e) => setEmail(e.target.value)} />
          <div
            className={`${styles.submitButton} ${buttonClassName || ''}`}
            onClick={(event) => {
              void handleSubmit(event);
            }}
          >
            Subscribe
          </div>
        </form>
      </div>
    <div className={`${styles.messageContainer} ${messageContainerClassName || ''} ${errorMessage.length > 0 ? styles.hasMessage : ''}`}>
      {
        errorMessage.length > 0 &&
          <p className={styles.errorMessage}>{errorMessage}</p>
      }
      {
        successMessage.length > 0 &&
          <p className={styles.successMessage}>{successMessage}</p>
      }
    </div>
    </React.Fragment>
  );
}

export default EmailForm;
