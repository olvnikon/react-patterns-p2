import {
  bootstrapDataReducerKey,
  type BootstrapDataState,
} from './bootstrapDataSlice';

export type BootstrapDataRootState = {
  [bootstrapDataReducerKey]: BootstrapDataState;
};

export function selectBootstrapData(
  state: BootstrapDataRootState,
): BootstrapDataState {
  return state[bootstrapDataReducerKey];
}
