import React, { Dispatch, SetStateAction, useState } from 'react';
import styles from './Dropdown.module.scss'
import { useOnClickOutside } from '../../hooks/use-on-click-outside';
import { useRef } from 'react'

interface DropdownProps {
    items: any[],
    availability: boolean[],
    selectedItem: any,
    selectItem: Dispatch<SetStateAction<any>>
}

const Dropdown:React.FC <DropdownProps> = ({selectedItem, selectItem, items, availability}) => {
    const ref = useRef<HTMLDivElement>(null);
    const title = selectedItem.node ? selectedItem.node.title : selectedItem;
    const [isOpen, setIsOpen] = useState(false);
    useOnClickOutside(ref, () => setIsOpen(false));

    return (
      // @ts-ignore
        <div className={styles.ddWraper} ref={ref}>
            <div className={styles.ddHeader}>
                <div onClick={() => setIsOpen(!isOpen)} className={styles.ddHeaderTitle}>{title}</div>
            </div>

            <div className={isOpen ? styles.ddListOpen : styles.ddListClosed}>
                {
                    items.map((item, index) =>
                        <div onClick={() => {selectItem(item); setIsOpen(false)}}
                            key={item.node ? item.node.title : item}
                            className={`${styles.ddListItem} ${availability[index] ? '' : styles.unavailableItem}`}>
                            {item.node ? item.node.title : item}
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default Dropdown;
