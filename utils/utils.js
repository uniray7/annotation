const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

function checkEnv() {
  if (!(process.env.ANNOTATION_ROOT && process.env.ANNOTATION_ENV)) {
    return false;
  }
  else {
    return true;
  }
}

function getConfig() {
  cfgPath = path.join(process.env.ANNOTATION_ROOT, 'config', process.env.ANNOTATION_ENV+'.config.yml')
  return yaml.safeLoad(fs.readFileSync(cfgPath, 'utf8'));
}

module.exports = {
  getConfig:getConfig,
  checkEnv: checkEnv
};
