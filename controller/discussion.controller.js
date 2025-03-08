const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createDiscussion = async (req, res) => {
  const { content } = req.body;
  const userEmail = req.session.email; 

  if (!content || !userEmail) {
    return res.status(400).json({ error: "Content or User email missing" });
  }

  try {
    const discussion = await prisma.discussion.create({
      data: {
        userEmail: userEmail,
        comments: {
          create: {
            content: content,
            createdByEmail: userEmail,
          },
        },
      },
    });
    res.status(201).json(discussion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Recursively fetch comments with nested replies
const getNestedComments = (comments) => {
  const map = new Map();

  // Map each comment by its ID
  comments.forEach((comment) => {
    map.set(comment.id, { ...comment, replies: [] });
  });

  // Group replies under their respective parents
  const nestedComments = [];
  comments.forEach((comment) => {
    if (comment.parentId) {
      map.get(comment.parentId).replies.push(map.get(comment.id));
    } else {
      nestedComments.push(map.get(comment.id));
    }
  });

  return nestedComments;
};
const deleteDiscussion = async (req, res) => {
  const { id } = req.params;

  try {
    // Step 1: Delete all comments and their nested replies for the discussion
    await deleteAllCommentsForDiscussion(id);

    // Step 2: Delete the discussion itself
    await prisma.discussion.delete({
      where: { id },
    });

    res.status(204).send(); // No content response
  } catch (error) {
    console.error('Error deleting discussion:', error);
    res.status(500).json({ error: 'Error deleting discussion' });
  }
};


const deleteAllCommentsForDiscussion = async (discussionId) => {
  // Fetch all comments for the discussion
  const comments = await prisma.comment.findMany({
    where: { discussionId },
  });

  for (const comment of comments) {
    await deleteCommentAndReplies(comment.id);
  }
};

const deleteCommentAndReplies = async (commentId) => {
  // Fetch all replies for the given comment
  const replies = await prisma.comment.findMany({
    where: { parentId: commentId },
  });

  // Recursively delete replies
  for (const reply of replies) {
    await deleteCommentAndReplies(reply.id);
  }

  // Delete the comment itself
  await prisma.comment.delete({
    where: { id: commentId },
  });
};



// Get all discussions with nested comments
const getDiscussions = async (req, res) => {
  try {
    const discussions = await prisma.discussion.findMany({
      include: {
        comments: true, // Fetch all comments
      },
    });

    // Map nested comments for each discussion
    const discussionsWithNestedComments = discussions.map((discussion) => ({
      ...discussion,
      comments: getNestedComments(discussion.comments),
    }));

    res.status(200).json(discussionsWithNestedComments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new comment or reply
const createComment = async (req, res) => {
  const { content, discussionId, parentId } = req.body;
  const userEmail = req.session.email; // Replace with proper session handling

  if (!content || !discussionId || !userEmail) {
    return res.status(400).json({ error: "Content, discussionId, or userEmail is missing" });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        discussionId,
        parentId: parentId || null, // Parent ID for nested replies
        createdByEmail: userEmail,
      },
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createDiscussion, getDiscussions, createComment, deleteDiscussion};
