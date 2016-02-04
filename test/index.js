var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');
var tap = require('tap');

function getContent(testName) {
  return fs.readFileSync(path.join(__dirname, 'expected', testName)).toString();
}

tap.test('make2tap CLI', function(test){
  test.plan(3);

  test.test('Basic', function(test){

    test.plan(3);
    exec('cat basic | ../bin.js', {
      cwd: __dirname
    }, function(error, stdout, stderr){
      test.equal(error, null);
      test.equal('', stderr);
      test.equal(getContent('basic'), stdout);
    });
  });

  test.test('With comments', function(test){

    test.plan(3);
    exec('cat comments | ../bin.js', {
      cwd: __dirname
    }, function(error, stdout, stderr){
      test.equal(error, null);
      test.equal('', stderr);
      test.equal(getContent('comments'), stdout);
    });
  });

  test.test('Proper make integration', function(test){

    test.plan(3);
    exec('make clean compile | ../bin.js', {
      cwd: __dirname
    }, function(error, stdout, stderr){
      test.equal(error, null);
      test.equal('', stderr);
      test.equal(getContent('integration'), stdout);
    });
  });
});
