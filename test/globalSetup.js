const Docker = require('dockerode');
const Promise = require('bluebird');
const docker = new Docker({socketPath: '/var/run/docker.sock'});
const utils = require('../utils/utils.js');

const config = utils.getConfig();

async function globalSetup () {
  console.log('\nGlobal setup:');
  console.log('- Start mongodb container');

  const mongodbContainerName = 'annoTest_mongo'
  const containerAsync = Promise.promisifyAll(docker.getContainer(mongodbContainerName));
  try {
    let res = await containerAsync.inspect();
  } catch (err) {
    console.log('- No container for mongodb');
    console.log('- Create new container for mongodb');

    await docker.createContainer({
      Image: 'mongo:3.6.0',
      name: mongodbContainerName,
      PortBindings: {'27017/tcp': [{'HostPort': config.services.database.port}]}
    })
    .then((container) => { return container.start()});
  } // catch
  console.log('Finish global setup\n');
}

module.exports = globalSetup;
