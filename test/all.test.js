// --------------------
// require-folder-tree module
// Tests
// --------------------

// modules
var chai = require('chai'),
	expect = chai.expect,
	pathModule = require('path'),
	_ = require('lodash'),
	requireFolderTree = require('../lib/');

// init
chai.config.includeStack = true;

// tests

/* jshint expr: true */
/* global describe, it, beforeEach, afterEach */

var path = pathModule.join(__dirname, './example');

// clear require cache of example files before each test
beforeEach(function() {
	_.forIn(require.cache, function(obj, key) { // jshint ignore:line
		if (_.startsWith(key, path)) delete require.cache[key];
	});
});

// ensure required files have not been altered
afterEach(function() {
	expect(require(pathModule.join(path, '_index'))).to.deep.equal({
		_files: {c: 3},
		_folders: {d: {e: 5}},
		a: 1,
		b: 2
	});
	expect(require(pathModule.join(path, 'f'))).to.deep.equal(6);
	expect(require(pathModule.join(path, 'g'))).to.deep.equal(7);
	expect(require(pathModule.join(path, 'h/_index'))).to.deep.equal({k: 11});
	expect(require(pathModule.join(path, 'h/i'))).to.deep.equal(9);
	expect(require(pathModule.join(path, 'h/j'))).to.deep.equal(10);
	expect(require(pathModule.join(path, 'h/l/_index'))).to.deep.equal({m: 12});
	expect(require(pathModule.join(path, 'h/l/n'))).to.deep.equal(13);
});

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
				j: 10,
				l: {
					_index: {
						m: 12
					},
					n: 13
				}
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
				j: 10,
				l: {
					n: 13
				}
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
				k: 11,
				l: {
					m: 12,
					n: 13
				}
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
				J: 10,
				L: {
					_INDEX: {
						m: 12
					},
					N: 13
				}
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
				j: 10,
				L: {
					_index: {
						m: 12
					},
					n: 13
				}
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
				J: 10,
				l: {
					_INDEX: {
						m: 12
					},
					N: 13
				}
			}
		});
	});
});

describe('name attribute options', function() {
	it('uses fileNameAttribute option', function() {
		var tree = requireFolderTree(path, {fileNameAttribute: true});

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
				b: 2,
				name: '_index'
			},
			f: 6,
			g: 7,
			h: {
				_index: {
					k: 11,
					name: '_index'
				},
				i: 9,
				j: 10,
				l: {
					_index: {
						m: 12,
						name: '_index'
					},
					n: 13,
					name: 'l'
				},
				name: 'h'
			}
		});
	});

	it('uses folderNameAttribute option', function() {
		var tree = requireFolderTree(path, {folderNameAttribute: true});

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
				j: 10,
				l: {
					_index: {
						m: 12
					},
					n: 13,
					name: 'l'
				},
				name: 'h'
			}
		});
	});

	it('uses fileNameAttribute option with folderNameAttribute override', function() {
		var tree = requireFolderTree(path, {fileNameAttribute: true, folderNameAttribute: null});

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
				b: 2,
				name: '_index'
			},
			f: 6,
			g: 7,
			h: {
				_index: {
					k: 11,
					name: '_index'
				},
				i: 9,
				j: 10,
				l: {
					_index: {
						m: 12,
						name: '_index'
					},
					n: 13
				}
			}
		});
	});

	it('uses fileNameAttribute option with flatten', function() {
		var tree = requireFolderTree(path, {fileNameAttribute: true, flatten: true, flattenPrefix: true});

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
				b: 2,
				name: '_index'
			},
			f: 6,
			g: 7,
			h_index: { // jshint ignore:line
				k: 11,
				name: 'h_index'
			},
			hi: 9,
			hj: 10,
			hl_index: { // jshint ignore:line
				m: 12,
				name: 'hl_index'
			},
			hln: 13
		});
	});
});


describe('parent attribute options', function() {
	it('uses fileParentAttribute option', function() {
		var tree = requireFolderTree(path, {fileParentAttribute: true});

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
				b: 2,
				parent: tree
			},
			f: 6,
			g: 7,
			h: {
				_index: {
					k: 11,
					parent: tree.h
				},
				i: 9,
				j: 10,
				l: {
					_index: {
						m: 12,
						parent: tree.h.l
					},
					n: 13,
					parent: tree.h
				},
				parent: tree
			}
		});
	});

	it('uses folderParentAttribute option', function() {
		var tree = requireFolderTree(path, {folderParentAttribute: true});

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
				j: 10,
				l: {
					_index: {
						m: 12
					},
					n: 13,
					parent: tree.h
				},
				parent: tree
			}
		});
	});

	it('uses fileParentAttribute option with folderParentAttribute override', function() {
		var tree = requireFolderTree(path, {fileParentAttribute: true, folderParentAttribute: null});

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
				b: 2,
				parent: tree
			},
			f: 6,
			g: 7,
			h: {
				_index: {
					k: 11,
					parent: tree.h
				},
				i: 9,
				j: 10,
				l: {
					_index: {
						m: 12,
						parent: tree.h.l
					},
					n: 13
				},
			}
		});
	});

	it('uses fileParentAttribute option with flatten', function() {
		var tree = requireFolderTree(path, {fileParentAttribute: true, flatten: true, flattenPrefix: true});

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
				b: 2,
				parent: tree
			},
			f: 6,
			g: 7,
			h_index: { // jshint ignore:line
				k: 11,
				parent: tree
			},
			hi: 9,
			hj: 10,
			hl_index: { // jshint ignore:line
				m: 12,
				parent: tree
			},
			hln: 13
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
			j: 10,
			n: 13
		});
	});

	it('flattens tree with prefixing', function() {
		var tree = requireFolderTree(path, {filterFiles: /^([^_].*)\.js(on)?$/, flatten: true, flattenPrefix: true});

		expect(tree).to.deep.equal({
			f: 6,
			g: 7,
			hi: 9,
			hj: 10,
			hln: 13
		});
	});

	it('flattens tree with camelcase prefixing', function() {
		var tree = requireFolderTree(path, {filterFiles: /^([^_].*)\.js(on)?$/, flatten: true, flattenCamel: true});

		expect(tree).to.deep.equal({
			f: 6,
			g: 7,
			hI: 9,
			hJ: 10,
			hLN: 13
		});
	});

	it('flattens tree with separator prefixing', function() {
		var tree = requireFolderTree(path, {filterFiles: /^([^_].*)\.js(on)?$/, flatten: true, flattenSeparator: '_'});

		expect(tree).to.deep.equal({
			f: 6,
			g: 7,
			h_i: 9, // jshint ignore:line
			h_j: 10, // jshint ignore:line
			h_l_n: 13 // jshint ignore:line
		});
	});

	it('flattens tree with custom prefixing', function() {
		var tree = requireFolderTree(path, {filterFiles: /^([^_].*)\.js(on)?$/, flatten: true, flattenCustom: function(a, b) {return a + 'x' + b;}});

		expect(tree).to.deep.equal({
			f: 6,
			g: 7,
			hxi: 9,
			hxj: 10,
			hxlxn: 13
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
					j: 10,
					_folders: {
						l: {
							n: 13
						}
					}
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
					j: 10,
					_folders: {
						l: {
							m: 12,
							n: 13
						}
					}
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
				},
				l: {
					_files: {
						n: 13
					}
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
				},
				l: {
					m: 12,
					_files: {
						n: 13
					}
				}
			}
		});
	});
});
