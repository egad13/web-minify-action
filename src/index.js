const core = require("@actions/core");

const fs = require("node:fs");
const path = require("node:path");

const uglifyjs = require("uglify-js");

try {
	// PARSE ACTION INPUTS ////////////////////////////////////////////////////
	const inputs = {
		inPath: core.getInput("input-dir"),
		outPath: core.getInput("output-dir") | core.getInput("input-dir"),
		maxDepth: Math.min(10, Math.max(0, parseInt(core.getInput("max-depth")))),
		js: {
			doMinify: core.getBooleanInput("js"),
			addSuffix: core.getBooleanInput("js-suffix"),
			configPath: core.getInput("js-config"),
			config: {
				compress: false,
				mangle: { properties: { regex: "/^#/" } }
			}
		}
	};

	if (inputs.js.configPath) {
		inputs.js.config = JSON.parse(fs.readFileSync(inputs.js.configPath, "utf8"));
	}

	inputs.inPathRegex = new RegExp(`^${inputs.inPath}`);

	// MINIFY /////////////////////////////////////////////////////////////////
	processFiles(inputs.inPath);


	// FUNCTIONS //////////////////////////////////////////////////////////////

	/**
	 * Minifies files using global config options. Searches through subdirectories recursively.
	 * @param {string} dirPath Path of directory to search through
	 * @param {number} depth Current depth from base directory - used for recursion
	 */
	function processFiles(dirPath, depth = 0) {
		const dir = fs.readdirSync(dirPath, { withFileTypes: true });
		const jsFiles = dir.filter(dirent => dirent.isFile() && path.extname(dirent.name) === ".js");
		const subDirs = dir.filter(dirent => dirent.isDirectory());

		// MINIFICATION ///////////////////////////////////////////////////////////
		if (inputs.js.doMinify || inputs.js.configPath) {
			processJs(jsFiles);
		}

		// RECURSION //////////////////////////////////////////////////////////////
		if (depth >= inputs.maxDepth) { return; }
		for (const dirent of subDirs) {
			const subPath = path.join(dirent.path, dirent.name);
			processFiles(subPath, depth + 1);
		}
	}

	/**
	 * Minifies javascript files using global config options.
	 * @param {fs.Dirent[]} files Array of javascript files to minify
	 */
	function processJs(files) {
		for (const dirent of files) {
			const filePath = path.join(dirent.path, dirent.name);
			core.info(`Minifying ${filePath}`);

			let code = fs.readFileSync(filePath, "utf8");

			const savePath = path.join(
				inputs.inPath !== inputs.outPath
					? dirent.path.replace(inputs.inPathRegex, inputs.outPath)
					: dirent.path,
				inputs.js.addSuffix
					? dirent.name.replace(/.js$/, ".min.js")
					: dirent.name
			);

			// Replace relative imports in file if necessary
			if (inputs.js.addSuffix) {
				code = code
					.replace(/(import.*from "\.{1,2}\/.*)\.js/g, "$1.min.js")
					.replace(/(import\("\.{1,2}\/.*)\.js/g, "$1.min.js");
			}

			// Minify
			const result = uglifyjs.minify(code, inputs.js.config);
			if (result.warnings) { result.warnings.forEach(w => core.warning(w)); }
			if (result.error) { throw result.error; }

			// Save minified code, & source map if there is one.
			fs.writeFileSync(savePath, result.code, { encoding: "utf8", flag: "w" });
			if (result.map) {
				fs.writeFileSync(`${savePath}.map`, result.map, { encoding: "utf8", flag: "w" });
			}
		}
	}
} catch (error) {
	core.setFailed(error);
}
