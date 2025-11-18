export const firstSelectedVariant = (product: any) => {
    const variants = product.node.variants.edges
    const availableVariant = variants.find((variant: any) => variant.node.availableForSale)
    return availableVariant || product.node.variants.edges[0]
  }

export const variantAvailability = (product: any): boolean[] => {
    const variants = product.node.variants.edges
    const availabilityList = variants.map((variant: any) => variant.node.availableForSale)
    return availabilityList
}