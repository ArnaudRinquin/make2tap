#!/usr/bin/env node

var split = require('split');
var make2tap = require('./index');

process.stdin
  .pipe(split())
  .pipe(make2tap())
  .pipe(process.stdout);
