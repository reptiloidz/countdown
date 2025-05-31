import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LoadingState } from '../state/loading.state';

export const selectLoadingState = createFeatureSelector<LoadingState>('loading');

export const selectUserpicLoading = createSelector(selectLoadingState, (state: LoadingState) => state.userpicLoading);

export const selectProfileLoading = createSelector(selectLoadingState, (state: LoadingState) => state.profileLoading);

export const selectEmailLoading = createSelector(selectLoadingState, (state: LoadingState) => state.emailLoading);

export const selectPasswordLoading = createSelector(selectLoadingState, (state: LoadingState) => state.passwordLoading);

export const selectRemoveLoading = createSelector(selectLoadingState, (state: LoadingState) => state.removeLoading);

export const selectUnlinkLoading = createSelector(selectLoadingState, (state: LoadingState) => state.unlinkLoading);

export const selectVerifyButtonDisabled = createSelector(
	selectLoadingState,
	(state: LoadingState) => state.verifyButtonDisabled,
);
