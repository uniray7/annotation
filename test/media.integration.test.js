const Promise = require('bluebird');
const path = require('path');
const http = require('http');
const mongoose = require('mongoose');
const needle = require('needle');
const HttpStatus = require('http-status-codes');
const includes = require('lodash/includes');

const app = require('../app.js');
const server = http.createServer(app);
const utils = require('../utils/utils.js');
const testUtils = require('./utils.js');
const config = utils.getConfig();

function json(verb, url, contentType) {
  return request(app)[verb](url)
  .set('Content-Type', contentType ? contentType : 'application/json')
  .set('Accept', 'application/json')
  .expect('Content-Type', /json/);
}


describe('Acceptance testing: ', () => {

  beforeAll(async () => {
    let listen = Promise.promisify(server.listen);
    await server.listen(config.services.api.port);
    // TODO: check the dir of frameStorage & mediaStorage existed
  });

  afterAll(() => {
    server.close(() => {app.close()});
  });

  describe('Green path:', () => {
    let mediaIds = [];
    const appHost = 'http://localhost:'+config.services.api.port;

    const mediaFile = path.join(process.env.ANNOTATION_ROOT, 'test/fixtures/video.mp4');
    const mediaName = 'test';
    const mediaDescription = 'I am test';
    const mediaFrameNum = 2;
    
    const projName = 'my project';
    const projDescript = 'my project description';
    const projType = 'obj_detection';
    const projLabels = ['apple', 'dog', 'car'];
    let projId = null;
    let projFrameId = null;
    
    const labelsSample =  [
        {"label": "dog", "bbox": [ 0.1, 0.2, 0.3, 0.4 ]},
        {"label": "car", "bbox": [ 0.12, 0.2, 0.3, 0.25 ]}];

    test('POST /api/media: Create Media', async (done) => {
      let data = {
        file: mediaFile,
        content_type: 'video/mp4'
      }
      let result = await needle('post', appHost+'/api/media', {media:data, name: 'test', description: mediaDescription}, {multipart: true})

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(mongoose.Types.ObjectId.isValid(result.body.mediaId)).toBe(true);
      mediaIds.push(result.body.mediaId);
      await testUtils.delay(3000);
      return done();
    }, 5000);


    test.skip('POST /api/media: Create Second Media', async (done) => {
      let data = {
        file: mediaFile,
        content_type: 'video/mp4'
      }
      let result = await needle('post', appHost+'/api/media', {media:data, name: 'test'}, {multipart: true})

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(mongoose.Types.ObjectId.isValid(result.body.mediaId)).toBe(true);
      mediaIds.push(result.body.mediaId);
      await testUtils.delay(3000);
      return done();
    }, 5000);


    test('POST /api/media/query: Query Media Metadata', async (done) => {
      let query = {};
      query.mediaIds = mediaIds;
      let result = await needle('post', appHost+'/api/media/query', query, {json: true});
      expect(result.statusCode).toBe(HttpStatus.OK);
      let mediaMetas = result.body;
      for (let i=0; i<mediaMetas.length; i++) {
        expect(includes(mediaIds, mediaMetas[i]._id)).toBe(true);
        expect(mediaMetas[i]).toHaveProperty('status', 'done');
        expect(mediaMetas[i]).toHaveProperty('frameNum', mediaFrameNum);
        expect(mediaMetas[i]).toHaveProperty('createdTime');
        expect(mediaMetas[i]).toHaveProperty('name');
        expect(mediaMetas[i]).toHaveProperty('description');
        expect(mediaMetas[i]).toHaveProperty('mediaUri');
      }
      return done();
    });

    test('GET /api/media/{id}/frames: Get frame of the media', async (done) => {
      let mediaId = mediaIds[0];

      let result = await needle('get', appHost+'/api/media/'+mediaId+'/frames');
      expect(result.statusCode).toBe(HttpStatus.OK);
      let frames = result.body;
      for (let i=0; i<frames.length; i++) {
        expect(frames[i]).toHaveProperty('createdTime');
        expect(frames[i]).toHaveProperty('_id');
        expect(frames[i]).toHaveProperty('frameUri');
        expect(frames[i]).toHaveProperty('mediaId', mediaId);
      }
      return done(); 
    });

    test('POST /api/projects: Create a Project:', async (done) => {
      let query = {};
      query.name = projName;
      query.description = projDescript;
      query.type = projType;
      query.labels = projLabels;

      let result = await needle('post', appHost+'/api/projects', query, {json: true});
      expect(result.statusCode).toBe(HttpStatus.OK);
      let project = result.body;
      expect(project).toHaveProperty('projectId');
      projId = project.projectId;
      expect(mongoose.Types.ObjectId.isValid(project.projectId)).toBe(true);
      return done();
    });

    test('PATCH /api/projects/{id}/media: Add Media into the Project:', async (done) => {
      let query = {};
      query.mediaIds = mediaIds;

      let result = await needle('patch', appHost+'/api/projects/'+projId+'/media', query, {json: true});
      expect(result.statusCode).toBe(HttpStatus.OK);
      return done();
    });

    test('GET /api/projects/{id}/frame: Get a Frame from the Project:', async (done) => {
      let result = await needle('get', appHost+'/api/projects/'+projId+'/frame');
      let frameMeta = result.body
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(frameMeta).toHaveProperty('lastGetTime');

      expect(frameMeta).toHaveProperty('labels');
      expect(frameMeta.labels).toEqual([]);

      expect(frameMeta).toHaveProperty('mediaId');
      expect(mediaIds).toContain(frameMeta.mediaId);

      expect(frameMeta).toHaveProperty('projectId');
      expect(frameMeta.projectId).toBe(projId);

      expect(frameMeta).toHaveProperty('frameUri');

      expect(frameMeta).toHaveProperty('status');
      expect(frameMeta.status).toBe('unlabeled');
      projFrameId = frameMeta._id;
      return done();
    });

    test('POST /api/projects/{id}/frames/{id}/labels: Post Labels for the Frame in the Project:', async (done) => {
      let query = {};
      query.labels = labelsSample;

      const queryUrl = appHost+'/api/projects/'+projId+'/frames/'+projFrameId+'/labels';
      let result = await needle('post', queryUrl, query, {json:true});
      expect(result.statusCode).toBe(HttpStatus.OK);
      return done();
    });

    test('POST /api/projects/{id}/frames/query: Query Labeled Frame:', async (done) => {
      let query = {};
      query.status = 'labeled';
      let result = await needle('post', appHost+'/api/projects/'+projId+'/frames/query', query, {json:true});

      expect(result.statusCode).toBe(HttpStatus.OK);
      const frameMeta = result.body[0];
      expect(frameMeta).toHaveProperty('_id');
      expect(frameMeta._id).toBe(projFrameId);

      expect(frameMeta).toHaveProperty('lastGetTime');

      expect(frameMeta).toHaveProperty('labels');
      expect(frameMeta.labels).toEqual(labelsSample);

      expect(frameMeta).toHaveProperty('mediaId');
      expect(mediaIds).toContain(frameMeta.mediaId);

      expect(frameMeta).toHaveProperty('projectId');
      expect(frameMeta.projectId).toBe(projId);

      expect(frameMeta).toHaveProperty('frameUri');

      expect(frameMeta).toHaveProperty('status');
      expect(frameMeta.status).toBe('labeled');

      return done();
    });
  });
}); 
