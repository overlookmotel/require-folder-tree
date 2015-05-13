// --------------------
// require-folder-tree module
// Tests
// --------------------

// modules
var chai = require('chai'),
	expect = chai.expect,
	pathModule = require('path'),
	requireFolderTree = require('../lib/');

// init
chai.config.includeStack = true;

// tests

/* jshint expr: true */
/* global describe, it */

var path = pathModule.join(__dirname, './example');

describe('default', function() {
	it('reads whole tree', function() {
		var tree = requireFolderTree(path);

		expect(tree).to.deep.equal({
			_index: {
				_files: {
					c: 3
				},
				_folders: {
					d: {
						e: 5
					}
				},
				a: 1,
				b: 2
			},
			f: 6,
			g: 7,
			h: {
				_index: {
					k: 11
				},
				i: 9,
				j: 10
			}
		});
	});
});

describe('filters', function() {
	it('uses file filter option', function() {
		var tree = requireFolderTree(path, {filterFiles: /^([^_].*)\.js(on)?$/});

		expect(tree).to.deep.equal({
			f: 6,
			g: 7,
			h: {
				i: 9,
				j: 10
			}
		});
	});

	it('uses folder filter option', function() {
		var tree = requireFolderTree(path, {filterFolders: /^([^h].*)$/});

		expect(tree).to.deep.equal({
			_index: {
				_files: {
					c: 3
				},
				_folders: {
					d: {
						e: 5
					}
				},
				a: 1,
				b: 2
			},
			f: 6,
			g: 7
		});
	});
});

describe('options', function() {
	it('uses recurse option', function() {
		var tree = requireFolderTree(path, {filterFiles: /^([^_].*)\.js(on)?$/, recurse: false});

		expect(tree).to.deep.equal({
			f: 6,
			g: 7
		});
	});

	it('uses indexFile option', function() {
		var tree = requireFolderTree(path, {indexFile: '_index.js'});

		expect(tree).to.deep.equal({
			_files: {
				c: 3
			},
			_folders: {
				d: {
					e: 5
				}
			},
			a: 1,
			b: 2,
			f: 6,
			g: 7,
			h: {
				i: 9,
				j: 10,
				k: 11
			}
		});
	});
});

describe('name transform options', function() {
	it('uses fileNameTransform option', function() {
		var tree = requireFolderTree(path, {fileNameTransform: function(n) {return n.toUpperCase();}});

		expect(tree).to.deep.equal({
			_INDEX: {
				_files: {
					c: 3
				},
				_folders: {
					d: {
						e: 5
					}
				},
				a: 1,
				b: 2
			},
			F: 6,
			G: 7,
			H: {
				_INDEX: {
					k: 11
				},
				I: 9,
				J: 10
			}
		});
	});

	it('uses folderNameTransform option', function() {
		var tree = requireFolderTree(path, {folderNameTransform: function(n) {return n.toUpperCase();}});

		expect(tree).to.deep.equal({
			_index: {
				_files: {
					c: 3
				},
				_folders: {
					d: {
						e: 5
					}
				},
				a: 1,
				b: 2
			},
			f: 6,
			g: 7,
			H: {
				_index: {
					k: 11
				},
				i: 9,
				j: 10
			}
		});
	});

	it('uses fileNameTransform option with folderNameTransform override', function() {
		var tree = requireFolderTree(path, {
			fileNameTransform: function(n) {return n.toUpperCase();},
			folderNameTransform: null
		});

		expect(tree).to.deep.equal({
			_INDEX: {
				_files: {
					c: 3
				},
				_folders: {
					d: {
						e: 5
					}
				},
				a: 1,
				b: 2
			},
			F: 6,
			G: 7,
			h: {
				_INDEX: {
					k: 11
				},
				I: 9,
				J: 10
			}
		});
	});
});

describe('flatten option', function() {
	it('flattens tree', function() {
		var tree = requireFolderTree(path, {filterFiles: /^([^_].*)\.js(on)?$/, flatten: true});

		expect(tree).to.deep.equal({
			f: 6,
			g: 7,
			i: 9,
			j: 10
		});
	});

	it('flattens tree with prefixing', function() {
		var tree = requireFolderTree(path, {filterFiles: /^([^_].*)\.js(on)?$/, flatten: true, flattenPrefix: true});

		expect(tree).to.deep.equal({
			f: 6,
			g: 7,
			hi: 9,
			hj: 10
		});
	});

	it('flattens tree with camelcase prefixing', function() {
		var tree = requireFolderTree(path, {filterFiles: /^([^_].*)\.js(on)?$/, flatten: true, flattenCamel: true});

		expect(tree).to.deep.equal({
			f: 6,
			g: 7,
			hI: 9,
			hJ: 10
		});
	});

	it('flattens tree with separator prefixing', function() {
		var tree = requireFolderTree(path, {filterFiles: /^([^_].*)\.js(on)?$/, flatten: true, flattenSeparator: '_'});

		expect(tree).to.deep.equal({
			f: 6,
			g: 7,
			h_i: 9, // jshint ignore:line
			h_j: 10 // jshint ignore:line
		});
	});

	it('flattens tree with custom prefixing', function() {
		var tree = requireFolderTree(path, {filterFiles: /^([^_].*)\.js(on)?$/, flatten: true, flattenCustom: function(a, b) {return a + 'x' + b;}});

		expect(tree).to.deep.equal({
			f: 6,
			g: 7,
			hxi: 9,
			hxj: 10
		});
	});
});

describe('foldersKey option', function() {
	it('puts folders in own object key', function() {
		var tree = requireFolderTree(path, {filterFiles: /^([^_].*)\.js(on)?$/, foldersKey: '_folders'});

		expect(tree).to.deep.equal({
			_folders: {
				h: {
					i: 9,
					j: 10
				}
			},
			f: 6,
			g: 7
		});
	});

	it('adds to existing object key', function() {
		var tree = requireFolderTree(path, {indexFile: '_index.js', foldersKey: '_folders'});

		expect(tree).to.deep.equal({
			_files: {
				c: 3
			},
			_folders: {
				d: {
					e: 5
				},
				h: {
					k: 11,
					i: 9,
					j: 10
				}
			},
			a: 1,
			b: 2,
			f: 6,
			g: 7
		});
	});
});

describe('filesKey option', function() {
	it('puts files in own object key', function() {
		var tree = requireFolderTree(path, {filterFiles: /^([^_].*)\.js(on)?$/, filesKey: '_files'});

		expect(tree).to.deep.equal({
			_files: {
				f: 6,
				g: 7
			},
			h: {
				_files: {
					i: 9,
					j: 10
				}
			}
		});
	});

	it('adds to existing object key', function() {
		var tree = requireFolderTree(path, {indexFile: '_index.js', filesKey: '_files'});

		expect(tree).to.deep.equal({
			_files: {
				c: 3,
				f: 6,
				g: 7
			},
			_folders: {
				d: {
					e: 5
				}
			},
			a: 1,
			b: 2,
			h: {
				k: 11,
				_files: {
					i: 9,
					j: 10
				}
			}
		});
	});
});
