import {
  ReportsEntry,
  reportsReducer,
  reportsReducerKey,
} from '@demo/feature-reports';

import { appStore } from '../app/store/configureAppStore';

export function injectReportsReducer() {
  appStore.injectReducer(reportsReducerKey, reportsReducer);
}

export function ReportsRoute() {
  return <ReportsEntry />;
}
