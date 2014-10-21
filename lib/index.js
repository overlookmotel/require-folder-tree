// --------------------
// require-folder-tree module
// --------------------

// modules
var fs = require('fs'),
	pathModule = require('path'),
	_ = require('lodash');

// imports
var utils = require('./utils');

// exports
module.exports = function(path, options) {
	// parse options
	options = options || {};
	
	options = _.extend({
		recurse: true,
		filterFiles: /^(.+)\.js(on)?$/,
		filterFolders: /^([^\.].*)$/,
		flatten: false,
		flattenPrefix: false,
		flattenCamel: false,
		//flattenSeparator: undefined,
		//indexFile: undefined,
		//foldersKey: undefined,
		//filesKey: undefined
	}, options);
	
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
		if (!fs.statSync(filePath).isDirectory()) {
			result = _.clone(require(filePath));
		}
	}
	
	// create files & folders parameters
	var resultFiles = result,
		resultFolders = result,
		keepFolders = false;
	
	if (options.filesKey) resultFiles = result[options.filesKey] = _.clone(result[options.filesKey] || {});
	if (options.foldersKey) {
		keepFolders = !!result[options.foldersKey]
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
		
		resultFiles[file] = require(filePath);
	});
	
	// iterate into folders
	if (!options.recurse) return result;
	
	var numFolders = 0;
	folders.forEach(function(file) {
		if (options.filterFolders) {
			var match = file.match(options.filterFolders);
			if (!match) return;
			file = match[1];
		}
		
		var resultFolder = processFolder(pathModule.join(path, file), options);
		
		if (options.flatten) {
			for (var thisFile in resultFolder) {
				var fileIndex = thisFile;
				if (options.flattenPrefix) {
					if (options.flattenCamel) fileIndex = utils.capitalize(fileIndex);
					if (options.flattenSeparator) fileIndex = options.flattenSeparator + fileIndex;
					fileIndex = file + fileIndex;
				}
				
				resultFolders[fileIndex] = resultFolder[thisFile];
			}
		} else {
			resultFolders[file] = resultFolder;
		}
		
		numFolders++;
	});
	
	// remove folders object key if no folders added in last step
	if (options.foldersKey && !options.flatten && !keepFolders && !numFolders) delete result[options.foldersKey];
	
	return result;
}
