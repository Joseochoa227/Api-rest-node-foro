'use strict'

var  express = require ('express');
var  ComentController = require('../controllers/coment');

var router = express.Router();
var md_auth = require('../middlewares/authenticated');


router.post('/coment/topic/:topicId',md_auth.authenticated, ComentController.add);
router.put('/coment/:commentId', md_auth.authenticated, ComentController.update);
router.delete('/coment/:topicId/:commentId', md_auth.authenticated, ComentController.delete);

module.exports = router;