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

  var metaloaderCompiler = this._compilation.createChildCompiler(METALOADER, outputOptions);
  metaloaderCompiler.outputFileSystem = new MemoryFS();
  metaloaderCompiler.apply(new SingleEntryPlugin(this.context, "!!" + this.request, METALOADER));

  metaloaderCompiler.runAsChild(function(err, entries, compilation) {
    if(err) return callback(err);

    const file = compilation.assets[METALOADER];
    return callback(null, file ? file.source() : content);
  });
};
