import { useEffect, useRef } from 'react';
import { useCart } from '@shopify/hydrogen-react';
import { useCartDrawer } from '~/contexts/cart-drawer-context';

export function CartAutoOpener() {
    const { totalQuantity } = useCart();
    const { openCart } = useCartDrawer();
    const prevQuantity = useRef(totalQuantity || 0);

    useEffect(() => {
        // Only open if quantity increased
        if ((totalQuantity || 0) > prevQuantity.current) {
            openCart();
        }
        prevQuantity.current = totalQuantity || 0;
    }, [totalQuantity, openCart]);

    return null;
}
