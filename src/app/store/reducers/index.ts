import { ActionReducerMap } from '@ngrx/store';
import { loadingReducer } from './loading.reducer';
import { LoadingState } from '../state/loading.state';

export interface AppState {
	loading: LoadingState;
}

export const reducers: ActionReducerMap<AppState> = {
	loading: loadingReducer,
};

export const metaReducers = [];
