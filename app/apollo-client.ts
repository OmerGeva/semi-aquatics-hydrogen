import {  ApolloClient,  InMemoryCache,  createHttpLink,} from '@apollo/client';
import fetch from 'isomorphic-fetch'

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: createHttpLink({
    uri: "https://semi-aquatics.myshopify.com/api/2022-01/graphql.json",
    headers: {
      'Accept' : 'application/graphql',
      'X-Shopify-Storefront-Access-Token': import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN ?? '',
    },
    fetch,
  }),
})

export default client;
