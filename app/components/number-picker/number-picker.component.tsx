import styles from './NumberPicker.module.scss'
import { Dispatch, SetStateAction, useState } from 'react';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';

interface ShowPageProps {
    number: number,
    soldOut: boolean,
    setNumber: Dispatch<SetStateAction<number>>
}

const NumberPicker:React.FC <ShowPageProps> = ({number, setNumber, soldOut}) => {
    return (
        <div className={soldOut ? styles.soldOutNumberPickerContainer : styles.numberPickerContainer}>
            {/* <div className={styles.addSubtractSigns} onClick={() => soldOut ? '' : setNumber(number > 1 ? number - 1 : 1)}> */}
            <div className={styles.addSubtractSigns} onClick={() => setNumber(number > 1 ? number - 1 : 1)}>
                <AiOutlineMinus />
            </div>
            {
                number
            }
            {/* <div className={styles.addSubtractSigns} onClick={() => soldOut ? '' : setNumber(number + 1)}> */}
            <div className={styles.addSubtractSigns} onClick={() => setNumber(number + 1)}>
                <AiOutlinePlus />
            </div>
        </div>
    );
};

export default NumberPicker;
