const path = require('path');
const pythonShell = require('python-shell');
const Promise = require('bluebird');
const pyRun = Promise.promisify(pythonShell.run);

function extractFrame(mediaId, videoSrc, frameDir, fps) {
// reuturn an Promise with "result" in json format 
  const options = {
    mode: 'json',
    pythonPath: '/usr/bin/python3',
    scriptPath: process.env.ANNOTATION_ROOT,
    pythonOptions: ['-u'],
    args: [mediaId, videoSrc, frameDir, fps]
  };

  return pyRun('3rdparty/extract_frame.py', options)
}
module.exports = extractFrame;
