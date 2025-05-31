import { createReducer, on } from '@ngrx/store';
import {
	setProfileLoading,
	setEmailLoading,
	setPasswordLoading,
	setRemoveLoading,
	setUnlinkLoading,
	setUserpicLoading,
} from '../actions/loading.action';
import { LoadingState } from '../state/loading.state';

export const initialState: LoadingState = {
	userpicLoading: false,
	profileLoading: false,
	emailLoading: false,
	passwordLoading: false,
	removeLoading: false,
	unlinkLoading: false,
	verifyButtonDisabled: false,
};

export const loadingReducer = createReducer(
	initialState,
	on(setUserpicLoading, (state, { userpicLoading }) => ({
		...state,
		userpicLoading: userpicLoading,
	})),
	on(setProfileLoading, (state, { profileLoading }) => ({
		...state,
		profileLoading: profileLoading,
	})),
	on(setEmailLoading, (state, { emailLoading }) => ({
		...state,
		emailLoading: emailLoading,
	})),
	on(setPasswordLoading, (state, { passwordLoading }) => ({
		...state,
		passwordLoading: passwordLoading,
	})),
	on(setRemoveLoading, (state, { removeLoading }) => ({
		...state,
		removeLoading: removeLoading,
	})),
	on(setUnlinkLoading, (state, { unlinkLoading }) => ({
		...state,
		unlinkLoading: unlinkLoading,
	})),
);
