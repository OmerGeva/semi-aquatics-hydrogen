import { Component } from 'react';
import { Provider } from 'react-redux';
import { AnyAction, Store } from 'redux';
import { store } from '../redux/store';

interface Props {
    initialState: object;
}
  
const withRedux = (App: any) => {
    return class AppWithRedux extends Component<Props> {
      public static async getInitialProps(appContext: any) {
        let initialProps = {};
        appContext.ctx.store = store;
  
        if (typeof App.getInitialProps === 'function') {
          initialProps = await App.getInitialProps(appContext);
        }
  
        return {
          ...initialProps,
          initialState: store.getState()
        };
      }
  
      public constructor(props: Props) {
        super(props);
      }
  
      public render() {
        return (
          <Provider store={store}>
            <App {...this.props} store={store} />
          </Provider>
        );
      }
    };
  }
  
  export default withRedux;
  