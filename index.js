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

function isError(line) {
  return line.startsWith('make: ');
}

function processHeader(stream, line) {
  writeLine(stream, '# ' + line.slice(2).trim());
}

function passingStep(stream, index, line) {
  writeLine(stream, 'ok ' + index + ' - ' + line.slice(1).trim());
}

function breakingStep(stream, index, line) {
  writeLine(stream, 'not ok ' + index + ' - ' + line.slice(1).trim());
}

function processComment(stream, line) {
  var trimmed = line.trim();
  writeLine(stream, trimmed);
}

function writeLine(stream, line) {
  stream.push(line + '\n');
}

function processError(stream, line) {
  writeLine(stream, line.slice(5).trim());
}

module.exports = function(){

  var initialised = false;
  var steps = 0;
  var buf = [];
  var previousStep;
  var failed = false;


  function emptyBuffer(stream) {
    buf.forEach(processComment.bind(null, stream));
    buf = [];
  }

  function validatePreviousStep(stream) {
    if (previousStep) {
      passingStep(stream, ++steps, previousStep);
    }
    emptyBuffer(stream)
  }

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

    if (isError(line)) {
      if (!failed) {
        breakingStep(this, ++steps, previousStep);
        previousStep = null;
        emptyBuffer(this);
      }
      failed = true;
      processError(this, line);
      callback();
      return;
    }

    if (isHeader(line)) {
      validatePreviousStep(this);
      previousStep = null;
      processHeader(this, line);
      callback();
      return;
    }

    if (isStep(line)) {
      validatePreviousStep(this);
      previousStep = line;
      callback();
      return;
    }

    // comment line
    buf.push(line);
    callback();
  }

  function finish(callback) {
    validatePreviousStep(this);
    writeLine(this, '1..' + steps);
    if (failed) {
      process.exit(1);
    }
  }

  return through2(convertLine, finish);
}
