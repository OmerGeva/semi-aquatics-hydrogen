import { useState } from 'react';
import styles from './Form.module.scss'
import { IconContext } from 'react-icons';
import { BsArrowRight } from 'react-icons/bs';

interface FormProps {
  placeholder?: string,
  handleSubmit: (e: any) => void,
  value: string,
  setValue: (e: any) => void
}

const Form:React.FC <FormProps> = ({ handleSubmit, placeholder, value, setValue}) => (
  <div className={styles.formContainer}>
    <input type="text" placeholder={placeholder ?? 'Subscribe'} value={value} onChange={(e) => setValue(e.target.value)}/>
    <div className={styles.submitButton} onClick={handleSubmit}>
      <IconContext.Provider value={{ className: "arrow-right-email" }}>
        <BsArrowRight />
      </IconContext.Provider>
    </div>
  </div>
)

export default Form;