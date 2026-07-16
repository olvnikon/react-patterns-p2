import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';

import { router } from './routes';
import { appStore } from './store/configureAppStore';

export function App() {
  return (
    <Provider store={appStore}>
      <RouterProvider router={router} />
    </Provider>
  );
}
