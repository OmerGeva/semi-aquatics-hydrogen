import { Dispatch, SetStateAction } from 'react';
import styles from './SizePicker.module.scss';

interface SizePickerProps {
  chosenVariant: string,
  availability: boolean[],
  setChosenVariant: Dispatch<SetStateAction<any>>,
  variants: any
}

const SizePicker: React.FC<SizePickerProps> = ({
  variants,
  chosenVariant,
  setChosenVariant,
  availability
}) => {
  return (
    <div
      className={styles.sizePickerContainer}
      style={{ gridTemplateColumns: `repeat(${variants.length}, 1fr)` }}
    >
      {variants.map((variant: any, index: number) => (
        <div
          className={`${styles.size} ${chosenVariant == variant ? styles.sizeSelected : styles.sizeNotPicked} ${availability[index] ? '' : styles.unavailableItem}`}
          onClick={() => setChosenVariant(variant)}
          key={variant.node.title}
        >
          {variant.node.title}
        </div>
      ))}
    </div>
  );
};

export default SizePicker;
