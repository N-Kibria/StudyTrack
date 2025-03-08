const express = require('express');
const { createDiscussion, getDiscussions, createComment, deleteDiscussion } = require('../controller/discussion.controller'); // Import deleteDiscussion
const router = express.Router();


router.post('/discussions', createDiscussion);


router.get('/discussions', getDiscussions);

router.post('/comments', createComment);


router.delete("/discussions/:id", deleteDiscussion);

module.exports = router;
