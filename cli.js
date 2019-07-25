#! /usr/bin/env node

const path = require('path');
const fs = require('fs');
const os = require('os');

const currentPath = process.cwd();

let numOfFiles = 0;
let numOfDirs = 0;

let log = console.log;

const [,, flag] = process.argv;
if (flag) {
  if (flag === '--help') {
    console.log('This program will show all the files from current and nested folders.');
    console.log('The result is shown in console by default.');
    console.log('Alternatively, add --f to create a log file instead (that\'s faster).');
    console.log('Have fun!');
    process.exit(0);
  } else if (flag === '--f') {
    const fileName = `log-${Date.now()}.txt`;
    console.log(`Results will be written in file ${fileName}`);
    const ws = fs.createWriteStream(fileName);
    function logger(stream) {
      return function(text) {
        stream.write(text + os.EOL);
      }
    }
    log = logger(ws);
  } else {
    throw new Error('unknown argument provided: ' + flag);
  }
}

function findAllFiles(dirPath) {
  fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
    if (err) throw(err);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file.name);
      if (file.isDirectory()) {
        numOfDirs++;
        findAllFiles(filePath);
      } else {
        numOfFiles++;
        log(filePath);
      }
    });
  });
}

findAllFiles(currentPath);

process.on('exit', code => {
  if (code === 0) {
    const subdirText = numOfDirs ? ` in ${numOfDirs} subdirectories` : '';
    console.log(`Done! Found ${numOfFiles} files` + subdirText);
    console.log(`That took ${process.uptime()} seconds`);
  }
});
