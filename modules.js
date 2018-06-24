const debug = require('debug')('objectify-folder');
const fs = require('fs');
const glob = require('glob');
const path = require('path');

module.exports = async (options) => {

  if (typeof options === 'string') {
    options = {
      path: options
    };
  }

  if ( ! options.path) throw new Error('objectify-folder requires a string dir path or an options param with a path property.');

  if ( ! options.fn) {
    let index = 0;
    options.fn = (mod, result, file) => {
      let basename = path.basename(file, '.mjs');
      result[basename] = mod;
    };
  }

  let globbing = (options.path.indexOf('*') > -1 );
  let files = globbing ? glob.sync(options.path) : fs.readdirSync(options.path);

  let result = {};

  async function importFiles(modulesToImport) {
    debug('starting import')

    for (const file of modulesToImport) {
      let filepath = globbing ? path.resolve(file) : path.resolve(path.join(options.path, file));
      let module = await import(filepath)
      options.fn(module, result, file)
    }
  }

  await importFiles(files)
  return result;
};