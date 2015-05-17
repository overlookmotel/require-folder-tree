// --------------------
// require-folder-tree module
// --------------------

// modules
var fs = require('fs'),
	pathModule = require('path'),
	_ = require('lodash');

// exports
module.exports = function(path, options) {
	// parse options
	options = _.extend({
		recurse: true,
		filterFiles: /^(.+)\.js(on)?$/,
		filterFolders: /^([^\.].*)$/,
		//fileNameTransform: undefined,
		folderNameTransform: (options || {}).fileNameTransform,
		//fileNameAttribute: undefined,
		folderNameAttribute: (options || {}).fileNameAttribute,
		//fileParentAttribute: undefined,
		folderParentAttribute: (options || {}).fileParentAttribute,
		flatten: false,
		flattenPrefix: false,
		flattenCamel: false,
		//flattenSeparator: undefined,
		//flattenCustom: undefined,
		//indexFile: undefined,
		//foldersKey: undefined,
		//filesKey: undefined
	}, options || {});

	if (options.fileNameAttribute === true) options.fileNameAttribute = 'name';
	if (options.folderNameAttribute === true) options.folderNameAttribute = 'name';
	if (options.fileParentAttribute === true) options.fileParentAttribute = 'parent';
	if (options.folderParentAttribute === true) options.folderParentAttribute = 'parent';

	// create flatten function
	if (options.flatten && !options.flattenCustom) {
		if (options.flattenCamel) {
			if (options.flattenSeparator) throw new Error("You cannot use both options 'flattenCamel' and 'flattenSeparator' simultaneously. Provide a custom function to 'flattenCustom' instead");

			options.flattenCustom = function(a, b) {return a + _.capitalize(b);};
		} else if (options.flattenSeparator) {
			options.flattenCustom = function(a, b) {return a + options.flattenSeparator + b;};
		} else if (options.flattenPrefix) {
			options.flattenCustom = function(a, b) {return a + b;};
		} else {
			options.flattenCustom = function(a, b) {return b;}; // jshint ignore:line
		}
	}

	return processFolder(path, options);
};

function processFolder(path, options)
{
	// get list of files in dir
	var files = fs.readdirSync(path);
	files.sort();

	// get index file
	var result = {};

	if (options.indexFile && files.indexOf(options.indexFile) != -1) {
		var filePath = pathModule.join(path, options.indexFile);
		if (!fs.statSync(filePath).isDirectory()) result = _.clone(require(filePath));
	}

	// create files & folders parameters
	var resultFiles = result,
		resultFolders = result,
		keepFolders = false;

	if (options.filesKey) resultFiles = result[options.filesKey] = _.clone(result[options.filesKey] || {});
	if (options.foldersKey) {
		keepFolders = !!result[options.foldersKey];
		resultFolders = result[options.foldersKey] = _.clone(result[options.foldersKey] || {});
	}

	// get all files
	var folders = [];
	files.forEach(function(file) {
		var filePath = pathModule.join(path, file);

		if (fs.statSync(filePath).isDirectory()) {
			folders.push(file);
			return;
		}

		if (options.indexFile && file == options.indexFile) return;

		if (options.filterFiles) {
			var match = file.match(options.filterFiles);
			if (!match) return;
			file = match[1];
		}

		if (options.fileNameTransform) file = options.fileNameTransform(file);

		var obj = require(filePath);
		if (options.fileNameAttribute || options.fileParentAttribute) {
			obj = _.clone(obj);
			if (options.fileNameAttribute) obj[options.fileNameAttribute] = file;
			if (options.fileParentAttribute) obj[options.fileParentAttribute] = result;
		}
		resultFiles[file] = obj;
	});

	// iterate into folders
	if (!options.recurse) return result;

	var numFolders = 0;
	folders.forEach(function(file) {
		var filePath = pathModule.join(path, file);

		if (options.filterFolders) {
			var match = file.match(options.filterFolders);
			if (!match) return;
			file = match[1];
		}

		var resultFolder = processFolder(filePath, options),
			resultFolderFiles = options.filesKey ? resultFolder[options.filesKey] : resultFolder;

		if (options.folderNameTransform) file = options.folderNameTransform(file);

		if (options.flatten) {
			for (var thisFile in resultFolderFiles) {
				var resultFile = resultFolderFiles[thisFile],
					thisFileName = options.flattenCustom(file, thisFile);
				if (options.fileNameAttribute) resultFile[options.fileNameAttribute] = thisFileName;
				if (options.fileParentAttribute) resultFile[options.fileParentAttribute] = result;
				resultFiles[thisFileName] = resultFile;
			}
		} else {
			if (options.folderNameAttribute) resultFolder[options.folderNameAttribute] = file;
			if (options.folderParentAttribute) resultFolder[options.folderParentAttribute] = result;
			resultFolders[file] = resultFolder;
		}

		numFolders++;
	});

	// remove folders object key if no folders added in last step
	if (options.foldersKey && !options.flatten && !keepFolders && !numFolders) delete result[options.foldersKey];

	return result;
}
