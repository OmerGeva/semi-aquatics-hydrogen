import React from 'react';
import styles from  './EmailForm.module.scss';

// Packages
import axios from 'axios';
import { EmailFormProps } from '../../interfaces/page_interface';
import Form from '../form/form.component';

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
  const handleSuccessResponse = (response: any) => {
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
    setErrorMessage(error.message);
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

    const apiUrl = `https://proxy-semi-aquatics.onrender.com/api/subscribe/${email}`;
    try {
      const response = await axios.post(apiUrl, {});
      handleSuccessResponse(response);
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
