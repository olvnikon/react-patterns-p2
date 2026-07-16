import {
  ReportsEntry,
  reportsReducer,
  reportsReducerKey,
} from '@demo/feature-reports';

import type { AppStore } from '../app/store/configureAppStore';

export function injectReportsReducer(store: AppStore) {
  store.injectReducer(reportsReducerKey, reportsReducer);
}

export function ReportsRoute() {
  return <ReportsEntry />;
}
