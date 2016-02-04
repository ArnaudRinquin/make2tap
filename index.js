var split = require('split');
var through2 = require('through2');

function isEmpty(line) {
  return !line.trim().length;
}

function isHeader(line) {
  return line.startsWith('##');
}

function isStep(line) {
  return line.startsWith('#');
}

function processHeader(stream, line) {
  writeLine(stream, '# ' + line.slice(2).trim());
}

function processStep(stream, index, line) {
  writeLine(stream, 'ok ' + index + ' - ' + line.slice(1).trim());
}

function processComment(stream, line) {
  var trimmed = line.trim();
  writeLine(stream, trimmed);
}

function writeLine(stream, line) {
  stream.push(line + '\n');
}

module.exports = function(){

  var initialised = false;
  var steps = 0;

  function convertLine(chunk, enc, callback) {
    var line = chunk.toString();

    if (isEmpty(line)) {
      callback();
      return;
    }

    if (!initialised) {
      initialised = true;
      writeLine(this, 'TAP version 13')
    }

    if (isHeader(line)) {
      processHeader(this, line);
      callback();
      return;
    }

    if (isStep(line)) {
      processStep(this, ++steps, line);
      callback();
      return;
    }

    processComment(this, line);
    callback();
  }

  function finish(callback) {
    writeLine(this, '1..' + steps);
  }

  return through2(convertLine, finish);
}
