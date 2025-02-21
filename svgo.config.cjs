module.exports = {
	plugins: [
		{
			name: 'preset-default',
			params: {
				overrides: {
					removeUnknownsAndDefaults: true,
					removeXMLProcInst: true,
					sortAttrs: true,
				},
			},
		},
	],
};
