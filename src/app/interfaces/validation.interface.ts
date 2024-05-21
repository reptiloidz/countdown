export interface ValidationObjectFieldValue {
	value: boolean;
	message?: string;
}
export interface ValidationObjectField {
	[key: string]: ValidationObjectFieldValue;
}

export interface ValidationObject {
	[key: string]:
		| ValidationObjectField
		| {
				dirty: boolean;
		  };
}
