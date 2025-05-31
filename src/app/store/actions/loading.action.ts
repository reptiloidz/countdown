import { createAction, props } from '@ngrx/store';

export const setUserpicLoading = createAction('[Loading] Set Userpic Loading', props<{ userpicLoading: boolean }>());
export const setProfileLoading = createAction('[Loading] Set Profile Loading', props<{ profileLoading: boolean }>());

export const setEmailLoading = createAction('[Loading] Set Email Loading', props<{ emailLoading: boolean }>());

export const setPasswordLoading = createAction('[Loading] Set Password Loading', props<{ passwordLoading: boolean }>());

export const setRemoveLoading = createAction('[Loading] Set Remove Loading', props<{ removeLoading: boolean }>());

export const setUnlinkLoading = createAction('[Loading] Set Unlink Loading', props<{ unlinkLoading: boolean }>());

export const setVerifyButtonDisabled = createAction(
	'[Loading] Set Verify Button Disabled',
	props<{ verifyButtonDisabled: boolean }>(),
);
