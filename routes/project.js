const express = require('express');
const router = express.Router();
const projHandlers = require("../controllers/projController.js");
const projFrameHandlers = require("../controllers/projFrameController.js");

router.post('/', projHandlers.create);
router.post('/query', projHandlers.query);
router.get('/:projectId', projHandlers.getProj);
router.get('/:projectId/media', projHandlers.getMedia);
router.patch('/:projectId/media', projHandlers.patchMedia);
router.get('/:projectId/frame', projFrameHandlers.getFrame);
router.post('/:projectId/frames/query', projFrameHandlers.queryProjFrames);
router.post('/:projectId/frames/:projFrameId/labels', projFrameHandlers.postLabels);

module.exports = router;
