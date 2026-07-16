import { Provider } from 'react-redux';
import {
  RouterProvider,
  type RouterProviderProps,
} from 'react-router-dom';

import type { AppStore } from './store/configureAppStore';

type AppProps = {
  store: AppStore;
  router: RouterProviderProps['router'];
};

export function App({ store, router }: AppProps) {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}
