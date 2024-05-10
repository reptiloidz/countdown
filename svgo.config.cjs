module.exports = {
	plugins: [
		{
			name: "preset-default",
			params: {
				overrides: {
					removeUnknownsAndDefaults: false,
					cleanupIds: false,
					removeXMLProcInst: true,
					sortAttrs: true
				},
			},
		},
		'removeXMLNS'
	],
};
