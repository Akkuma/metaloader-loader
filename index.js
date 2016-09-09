const SingleEntryPlugin = require("webpack/lib/SingleEntryPlugin");
const path = require("path");
const MemoryFS = require("memory-fs");
const METALOADER = 'metaloader';

//@NOTE: Based upon https://github.com/clef/jql-loader/
module.exports = function(content) {
  if(!this.webpack) throw new Error("Only usable with webpack");
  if (this._compiler.isChild()) return content;
  this.cacheable();

  const callback = this.async();
  const outputOptions = {
    filename: METALOADER
  };

  const loaders = this.loaders.slice(this.loaderIndex + 1).reduce(function(acc, loader) {
    acc.push(loader.request);
    return acc;
  }, []);
  loaders.push(this.resourcePath);

  const metaloaderCompiler = this._compilation.createChildCompiler(METALOADER, outputOptions);
  metaloaderCompiler.outputFileSystem = new MemoryFS();
  metaloaderCompiler.apply(new SingleEntryPlugin(this.context, '!!' + loaders.join('!'), METALOADER));

  const self = this;
  metaloaderCompiler.runAsChild(function(err, entries, compilation) {
    if(err) return callback(err);

    const file = compilation.assets[METALOADER];
    const source = file ? file.source() : content;

    callback(null, source);
  });
};
