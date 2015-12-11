var options = require('./options')
var assign = require('object-assign')
var path = require('path')

function createModifyVars(vars) {
  var str = Object.keys(vars).reduce(function(str, cur) {
    return str + '@' + cur + ':\'' + vars[cur] + '\';'
  }, '')

  return (str !== '') ? '\n' + str : ''
}

module.exports = function (raw, cb, compiler, filePath) {
  try {
    var less = require('less')
  } catch (err) {
    return cb(err)
  }

  var opts = assign({
    filename: path.basename(filePath)
  }, options.less)

  // provide import path
  var dir = path.dirname(filePath)
  var paths = [dir, process.cwd()]
  opts.paths = opts.paths
    ? opts.paths.concat(paths)
    : paths

  if(opts.modifyVars) {
    raw += createModifyVars(opts.modifyVars)
  }

  less.render(raw, opts, function (err, res) {
    if (err) {
      return cb(err)
    }
    // Less 2.0 returns an object instead rendered string
    if (typeof res === 'object') {
      res.imports.forEach(function (file) {
        compiler.emit('dependency', file)
      })
      res = res.css
    }
    cb(null, res)
  })
}