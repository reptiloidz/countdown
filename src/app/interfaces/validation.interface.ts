export interface ValidationObjectField {
	[key: string]: {
		value: boolean;
		message?: string;
	};
}

export interface ValidationObject {
	[key: string]:
		| ValidationObjectField
		| {
				dirty: boolean;
		  };
}
