const yaml = require('js-yaml');
const fs = require('fs');

function getConfig(path) {
  let doc = yaml.safeLoad(fs.readFileSync(path, 'utf8'));
  return doc;
}

module.exports = {getConfig:getConfig};
