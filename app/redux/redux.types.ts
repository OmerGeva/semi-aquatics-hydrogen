export interface Store {
    product: {
        hidden: boolean,
        products: object,
        isFetching: boolean,
        chosenProduct: object,
        chosenVariantProduct: object,
        errorMessage: string
    }
}