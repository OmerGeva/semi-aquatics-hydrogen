import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { useOnClickOutside } from '../../../hooks/use-on-click-outside';
import { useRef } from 'react';
import { SELECT_SIZE_LABEL } from './constants';

const styles = {
  sizePickerDesktop: 'sizePickerDesktop',
  inputWrapper: 'inputWrapper',
  floatingLabel: 'floatingLabel',
  shrunk: 'shrunk',
  dropdownHeader: 'dropdownHeader',
  selectedItem: 'selectedItem',
  dropdownIcon: 'dropdownIcon',
  nativeInput: 'nativeInput',
  dropdownList: 'dropdownList',
  open: 'open',
  closed: 'closed',
  dropdownItem: 'dropdownItem',
  unavailable: 'unavailable',
  selected: 'selected',
  selectedDot: 'selectedDot',
  sizeLinks: 'sizeLinks',
  sizeLink: 'sizeLink',
} as const;

interface SizePickerDesktopProps {
  items: any[]; // Array of size objects (e.g., { node: { title: 'XS' } })
  availability: boolean[]; // Array indicating availability for each item
  selectedItem: any; // Currently selected size (e.g., { node: { title: 'XS' } } or string)
  selectItem: Dispatch<SetStateAction<any>>; // Function to update selected item
  label?: string; // Optional label (default: "Select your size")
  id?: string; // Optional ID for accessibility
}

const SizePickerDesktop: React.FC<SizePickerDesktopProps> = ({
  selectedItem,
  selectItem,
  items,
  availability,
  id = 'id-select-sizes',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLabelShrunk, setIsLabelShrunk] = useState(false);

  // Determine if label should shrink based on selectedItem
  useEffect(() => {
    setIsLabelShrunk(!!(selectedItem));
  }, [selectedItem]);

  useOnClickOutside(ref, () => setIsOpen(false));

  const title = selectedItem ? selectedItem.node.title : selectedItem;

  return (
    <div className={styles.sizePickerDesktop} ref={ref}>
      <div className={styles.inputWrapper}>
        <label
          className={`${styles.floatingLabel} ${isLabelShrunk ? styles.shrunk : ''}`}
          data-shrink={isLabelShrunk.toString()}
          id={`label-${id}`}
        >
          {SELECT_SIZE_LABEL}
        </label>
        <div
          className={styles.dropdownHeader}
          role="combobox"
          aria-controls={id}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-labelledby={`label-${id}`}
          onClick={() => setIsOpen(!isOpen)}
          tabIndex={0}
        >
          <span className={styles.selectedItem}>{title || SELECT_SIZE_LABEL}</span>
          <svg
            className={styles.dropdownIcon}
            focusable="false"
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
          >
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M18.131 9.505a.7.7 0 0 1 0 .99l-5.636 5.636a.7.7 0 0 1-.99 0l-5.636-5.636a.7.7 0 0 1 .99-.99L12 14.646l5.141-5.141a.7.7 0 0 1 .99 0"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <input
          aria-hidden="true"
          tabIndex={-1}
          className={styles.nativeInput}
          value={title || ''}
          readOnly
        />
      </div>

      <div id={id} className={`${styles.dropdownList} ${isOpen ? styles.open : styles.closed}`}>
        {items.map((item, index) => {
          const itemTitle = item.node ? item.node.title : item;
          const isAvailable = availability[index];
          const isSelected = itemTitle === title;

          return (
            <div
              key={item.node ? item.node.title : item}
              className={`${styles.dropdownItem} ${!isAvailable ? styles.unavailable : ''} ${
                isSelected ? styles.selected : ''
              }`}
              onClick={() => {
                if (isAvailable) {
                  selectItem(item);
                  setIsOpen(false);
                }
              }}
              role="option"
              aria-selected={isSelected}
            >
              {itemTitle}
              {isSelected && <span className={styles.selectedDot}>•</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SizePickerDesktop;
