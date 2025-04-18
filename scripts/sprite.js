const SVGSpriter = require('svg-sprite');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const Vinyl = require('vinyl');
const glob = require('glob');

const spritePath = path.resolve('src/assets');
const cwd = path.resolve('src/assets/svg');

const spriter = new SVGSpriter({
	shape: {
		id: {
			generator: (name, file) => {
				return file.stem;
			},
		},
		transform: [
			{
				svgo: {
					plugins: [
						{
							name: 'addVectorEffectToElements',
							type: 'visitor',
							fn: () => {
								return {
									element: {
										enter: node => {
											const targetElements = ['path', 'line', 'rect', 'circle', 'ellipse', 'polygon', 'polyline'];
											if (targetElements.includes(node.name)) {
												node.attributes = node.attributes || {};
												node.attributes['vector-effect'] = 'non-scaling-stroke';
											}
										},
									},
								};
							},
						},
						{
							name: 'removeAttrs',
							active: true,
							params: {
								attrs: '(stroke|stroke-width)',
							},
						},
						{ name: 'removeUnknownsAndDefaults', active: true },
						{ name: 'sortAttrs', active: true },
					],
				},
			},
		],
	},
	mode: {
		defs: {
			dest: spritePath,
			sprite: 'sprite.svg',
		},
	},
	svg: {
		transform: [
			spriteContent => {
				const styleTag = `<style>
					[stroke^="#"],
					[stroke-opacity],
					[stroke-width],
					[stroke-linecap],
					[stroke-linejoin],
					[stroke-dasharray],
					[stroke-miterlimit],
					[stroke-dashoffset] {
						stroke: currentColor;
					}
					[fill^="#"] {
						fill: currentColor;
					}
					[stroke^="#"] {
						stroke-width:var(--icon-stroke-w, 1px);
					}</style>`;
				return spriteContent
					.replace(/(<defs)/, styleTag + '$1')
					.replace(/fill\s*=\s*"(#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?)"/g, 'fill="currentColor"');
			},
		],
	},
});

new Promise(resolve => {
	glob
		.glob('*.svg', {
			cwd,
		})
		.then(files => {
			files.forEach(function (file) {
				spriter.add(
					new Vinyl({
						path: path.join(cwd, file),
						base: spritePath,
						contents: fs.readFileSync(path.join(cwd, file)),
					}),
				);
			});
			resolve();
		});
}).then(() => {
	spriter.compile(function (error, result) {
		for (var mode in result) {
			for (var resource in result[mode]) {
				mkdirp.sync(path.dirname(result[mode][resource].path));
				fs.writeFileSync(result[mode][resource].path, result[mode][resource].contents);
			}
		}
	});
});
