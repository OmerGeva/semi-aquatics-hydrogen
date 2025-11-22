import { useState } from 'react';
import {
    Magnifier,
    // @ts-ignore
  } from "@africasokoni/react-image-magnifiers";

const styles = {
  productImagesContainer: 'productImagesContainer',
  topImage: 'topImage',
  productImagesPreview: 'productImagesPreview',
  smallImage: 'smallImage',
  smallImageSelected: 'smallImageSelected',
} as const;

interface ImageCarouselProps {
    images: any[],
    altText: string
}
const ImageCarousel:React.FC <ImageCarouselProps> = ({images, altText}) => {
    const [selectedImage, setSelectedImage] = useState(images[0].node.transformedSrc);

    return (
        <div className={styles.productImagesContainer}>
            {/* <GlassMagnifier
            imageSrc={product.node.images.edges[0].node.transformedSrc}
            imageAlt={altText}
            magnifierSize={"40%"}
            /> */}
            <div className={styles.topImage}>
                <Magnifier
                imageSrc={selectedImage}
                imageAlt={altText}
                />
            </div>

            {/* <div className={styles.productImagesPreview}>
                {
                    images.map((image:any) => 
                    <div className={image.node.transformedSrc === selectedImage ? styles.smallImageSelected : styles.smallImage} 
                        onClick={() => setSelectedImage(image.node.transformedSrc)}
                        key={image.node.transformedSrc}>
                        <img src={image.node.transformedSrc} alt={altText} />
                    </div>
                    )
                }
            </div> */}

        </div>
    );
};

export default ImageCarousel;
