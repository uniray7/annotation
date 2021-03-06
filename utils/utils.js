const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

function checkEnv() {
  if (!(process.env.ANNOTATION_ROOT && process.env.NODE_ENV)) {
    return false;
  }
  else {
    return true;
  }
}

function getConfig() {
  if (!checkEnv()) {
    console.log('Please set environment variables "ANNOTATION_ROOT"');
    process.exit(-1);
  }
  cfgPath = path.join(process.env.ANNOTATION_ROOT, 'config', process.env.NODE_ENV+'.config.yml')
  return yaml.safeLoad(fs.readFileSync(cfgPath, 'utf8'));
}

module.exports = {
  getConfig:getConfig,
  checkEnv: checkEnv
};
