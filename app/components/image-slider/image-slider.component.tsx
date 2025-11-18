import { useState } from 'react'
import styles from './ImageSlider.module.scss'

interface ImageSliderProps {
    index: number,
    changeImage: (picNumber: number) => void
}

const ImageSlider: React.FC<ImageSliderProps> = ({index, changeImage}) => {
    return (
        <div className={styles.imageSliderContainer}>
            {
                [1,2,3,4].map(picNumber =>
                    <div key={picNumber} className={styles.individualPic} onClick={() => changeImage(picNumber)}>
                        <img  src={`lookbook-pic-${picNumber}.JPG`} />
                    </div>
                )
            }
        </div>
    );
};

export default ImageSlider;
