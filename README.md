# require-folder-tree.js

# Utility to require multiple files in a folder tree with flexible options

## Current status

[![NPM version](https://img.shields.io/npm/v/require-folder-tree.svg)](https://www.npmjs.com/package/require-folder-tree)
[![Build Status](https://img.shields.io/travis/overlookmotel/require-folder-tree/master.svg)](http://travis-ci.org/overlookmotel/require-folder-tree)
[![Dependency Status](https://img.shields.io/david/overlookmotel/require-folder-tree.svg)](https://david-dm.org/overlookmotel/require-folder-tree)
[![Dev dependency Status](https://img.shields.io/david/dev/overlookmotel/require-folder-tree.svg)](https://david-dm.org/overlookmotel/require-folder-tree)
[![Coverage Status](https://img.shields.io/coveralls/overlookmotel/require-folder-tree/master.svg)](https://coveralls.io/r/overlookmotel/require-folder-tree)

API is stable and tests cover all options. No known issues.

## Basic usage

### requireFolderTree( path [, options] )

To require all the `.js` and `.json` files in a folder and any sub-folders:

```js
var requireFolderTree = require('require-folder-tree');
var modules = requireFolderTree('/path/to/folder');
```

If the file structure is:

	/
	  a.js
	  b.js
	  c/
	    d.js
	    e.js

The returned value is:

	{
	  a: ...,
	  b: ...,
	  c: {
	    d: ...,
	    e: ...
	  }
	}

## Advanced usage

Options can be passed to alter the behaviour.

### recurse

When `true`, recurses through subfolders and sub-subfolders requiring an entire tree. Set to `false` to ignore subfolders.
Defaults to `true`.

```js
// Require only files in base folder
requireFolderTree('/path/to/folder', { recurse: false });
// returns { a: ..., b: ... }
```

### filterFiles

A regular expression for what files to include. First matching group defines the key used in returned object.
Defaults to `/^(.+)\.js(on)?$/` (i.e. include all `.js` and `.json` files)

```js
// Include all .js files except those starting with `_`
requireFolderTree('/path/to/folder', { filterFiles: /^([^_].*)\.js$/ });
```

### filterFolders

A regular expression for what folders to iterate into. First matching group defines the key used in returned object.
Defaults to `/^([^\.].*)$/` (i.e. process all folders except those beginning with `.`)

```js
// Process all folders except those starting with `.` or `_`
requireFolderTree('/path/to/folder', { filterFolders: /^([^\._].*)$/ });
```

### fileNameTransform

Function for transforming object keys for files.

```js
// Transform file names to lower case
requireFolderTree('/path/to/folder', {
	fileNameTransform: function(str) { return str.toLowerCase(); }
});
```

### folderNameTransform

Like `fileNameTransform`, but for folder names.

By default, inherits value of `options.fileNameTransform`. If you want to define a `fileNameTransform` function but leave folder names unchanged, set `options.folderNameTransform = null`.

### fileNameAttribute

When set, saves the file name (after `fileNameTransform` and `flatten` have been applied) as an attribute of each `require`-d file.
If `true`, uses value `'name'`. Defaults to `undefined`.

```js
requireFolderTree('/path/to/folder', { fileNameAttribute: true, recurse: false });
// returns { a: { name: 'a', ... }, b: { name: 'b', ... } }
```

### folderNameAttribute

Like `fileNameAttribute`, but for folder names.

By default, inherits value of `options.fileNameAttribute`. If you want to save file names only, set `options.folderNameAttribute = null`.

### fileParentAttribute

When set, saves the parent folder as an attribute of each `require`-d file.
If `true`, uses value `'parent'`. Defaults to `undefined`.

```js
requireFolderTree('/path/to/folder', { fileParentAttribute: true, recurse: false });
// returns { a: { parent: <reference to root object>, ... }, b: { parent: <reference to root object>, ... } }
```

### folderParentAttribute

Like `fileParentAttribute`, but for folders.

By default, inherits value of `options.fileParentAttribute`. If you want to save file parents only, set `options.folderParentAttribute = null`.

### flatten

Flattens the folder structure when `true`.
Defaults to `false`.

```js
requireFolderTree('/path/to/folder', { flatten: true });
// returns { a: ..., b: ..., d: ..., e: ... }
```

### flattenPrefix

Controls how the object keys are created for files nested in folders when flattening.
`true` concatenates the folder name and file name.
Defaults to `false`

```js
requireFolderTree('/path/to/folder', { flatten: true, flattenPrefix: true });
// returns { a: ..., b: ..., cd: ..., ce: ... }
```

### flattenCamel

When `true`, camel-cases the keys when concatenating the folder name and file name.
Defaults to `false`

```js
requireFolderTree('/path/to/folder', { flatten: true, flattenCamel: true });
// returns { a: ..., b: ..., cD: ..., cE: ... }
```

### flattenSeparator

Sets separator between folder name and file name when concatenating.
Defaults to `undefined`.

```js
requireFolderTree('/path/to/folder', { flatten: true, flattenSeparator: '_' });
// returns { a: ..., b: ..., c_d: ..., c_e: ... }
```

### flattenCustom

Sets a custom function for combining folder name and file name when concatenating.
Defaults to `undefined`.

```js
requireFolderTree('/path/to/folder', {
	flatten: true,
	flattenCustom: function(a, b) { return a + 'x' + b; }
});
// returns { a: ..., b: ..., cxd: ..., cxe: ... }
```

### indexFile

If set, looks for the named file in each folder, and if found uses it as a base for the returned object.
Defaults to `undefined`.

```js
// if index.js contains code `module.exports = { x: 1 }`:

requireFolderTree('/path/to/folder');
// returns { a: ..., b: ..., c: { d: ..., e: ... }, index: { x: 1 } }

requireFolderTree('/path/to/folder', { indexFile: 'index.js' });
// returns { x: 1, a: ..., b: ..., c: { d: ..., e: ... } }
```

### foldersKey

If set, puts all retrieved sub-folders inside the key specified.
Defaults to `undefined`.

```js
requireFolderTree('/path/to/folder', { foldersKey: 'folders' });
// returns { a: ..., b: ..., folders: { c: { d: ..., e: ... } } }
```

### filesKey

If set, puts all retrieved files inside the key specified.
Defaults to `undefined`.

```js
requireFolderTree('/path/to/folder', { filesKey: 'files' });
// returns { files: { a: ..., b: ... }, c: { files: { d: ..., e: ... } } }
```

## Other usage notes

This module will never alter the contents of the require cache.
i.e. if you `require()` any of the files again, they will not have been altered by e.g. using `fileNameAttribute` option.

## Tests

Use `npm test` to run the tests. Use `npm run cover` to check coverage.

## Changelog

See changelog.md

## Issues

If you discover a bug, please raise an issue on Github. https://github.com/overlookmotel/require-folder-tree/issues

## Contribution

Pull requests are very welcome. Please:

* ensure all tests pass before submitting PR
* add an entry to changelog
* add tests for new features
* document new functionality/API additions in README
