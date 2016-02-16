var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');
var tap = require('tap');

function getContent(testName) {
  return fs.readFileSync(path.join(__dirname, 'expected', testName)).toString();
}

tap.test('make2tap CLI', function(test){
  test.plan(4);

  test.test('Basic', function(test){

    test.plan(3);
    exec('cat basic | ../bin.js', {
      cwd: __dirname
    }, function(error, stdout, stderr){
      test.equal(error, null, 'exists without error');
      test.equal('', stderr, 'do not output on stderr');
      test.equal(stdout, getContent('basic'), 'outputs expected TAP');
    });
  });

  test.test('With comments', function(test){

    test.plan(3);
    exec('cat comments | ../bin.js', {
      cwd: __dirname
    }, function(error, stdout, stderr){
      test.equal(error, null, 'exists without error');
      test.equal('', stderr, 'do not output on stderr');
      test.equal(stdout, getContent('comments'), 'outputs expected TAP');
    });
  });

  test.test('Proper make integration', function(test){

    test.plan(3);
    exec('make clean compile 2>&1 | ../bin.js', {
      cwd: __dirname
    }, function(error, stdout, stderr){
      test.equal(error, null, 'exists without error');
      test.equal('', stderr, 'do not output on stderr');
      test.equal(stdout, getContent('integration'), 'outputs expected TAP');
    });
  });

  test.test('Error handling', function(test){

    test.plan(8);
    exec('make break 2>&1 | ../bin.js', {
      cwd: __dirname
    }, function(error, stdout, stderr){
      test.notEqual(error, null, 'exits with error');
      test.equal('', stderr, 'do not output on stderr');
      test.ok(stdout.indexOf('# Successful task') >= 0, 'outputs successful steps');
      test.ok(stdout.indexOf('ok 1 - This works fine') >= 0, 'outputs sucessful tests');
      test.ok(stdout.startsWith(getContent('error')), 'contains expected TAP');
      test.ok(stdout.indexOf('thiswillbreak') >= 0, 'outputs original stderr');
      test.ok(stdout.indexOf('1..3') >= 0, 'has proper test count');
    });

    test.test('when the first intput is an error', function(test){
      test.plan(4);
      exec('make break-direct 2>&1 | ../bin.js', {
        cwd: __dirname
      }, function(error, stdout, stderr){
        test.notEqual(error, null, 'exits with error');
        test.equal('', stderr, 'do not output on stderr');
        test.ok(stdout.indexOf('thiswillbreak') >= 0, 'outputs original stderr');
        test.ok(stdout.indexOf('1..0') >= 0, 'has proper test count');
      });
    })
  });
});
