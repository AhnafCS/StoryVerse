import Post from '../models/Post.js';
import User from '../models/User.js';

// Create a new post
export const createPost = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { content, type, imageUrl, tags, featureTag, featureData } = req.body;

    if (!type || !['text', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Invalid post type' });
    }

    if (type === 'text' && !content) {
      return res.status(400).json({ error: 'Text posts must have content' });
    }

    if (type === 'image' && !imageUrl) {
      return res.status(400).json({ error: 'Image posts must have an image URL' });
    }

    const post = new Post({
      author: userId,
      content: content || '',
      type,
      imageUrl: imageUrl || '',
      tags: tags || [],
      featureTag: featureTag || null,
      featureData: featureData || null
    });

    await post.save();

    // Populate author info
    await post.populate('author', 'username name avatar');

    res.status(201).json({
      message: 'Post created successfully',
      post: {
        id: post._id,
        author: {
          id: post.author._id,
          username: post.author.username,
          name: post.author.name,
          avatar: post.author.avatar
        },
        content: post.content,
        type: post.type,
        imageUrl: post.imageUrl,
        likes: post.likes,
        comments: post.comments,
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        tags: post.tags,
        featureTag: post.featureTag,
        featureData: post.featureData,
        isPublic: post.isPublic,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get posts (feed)
export const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, author } = req.query;
    const userId = req.user?.userId;

    let query = { isPublic: true };

    // If author is specified, filter by author
    if (author) {
      const authorUser = await User.findOne({ username: author });
      if (!authorUser) {
        return res.status(404).json({ error: 'Author not found' });
      }
      query.author = authorUser._id;
    }

    const posts = await Post.find(query)
      .populate('author', 'username name avatar')
      .populate('likes', 'username name avatar')
      .populate('comments.author', 'username name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts: posts.map(post => ({
        id: post._id,
        author: {
          id: post.author._id,
          username: post.author.username,
          name: post.author.name,
          avatar: post.author.avatar
        },
        content: post.content,
        type: post.type,
        imageUrl: post.imageUrl,
        likes: post.likes,
        comments: post.comments,
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        tags: post.tags,
        featureTag: post.featureTag,
        featureData: post.featureData,
        isPublic: post.isPublic,
        isLiked: userId ? post.isLikedBy(userId) : false,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single post
export const getPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.userId;

    const post = await Post.findById(postId)
      .populate('author', 'username name avatar')
      .populate('likes', 'username name avatar')
      .populate('comments.author', 'username name avatar');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (!post.isPublic && (!userId || post.author._id.toString() !== userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      post: {
        id: post._id,
        author: {
          id: post.author._id,
          username: post.author.username,
          name: post.author.name,
          avatar: post.author.avatar
        },
        content: post.content,
        type: post.type,
        imageUrl: post.imageUrl,
        likes: post.likes,
        comments: post.comments,
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        tags: post.tags,
        isPublic: post.isPublic,
        isLiked: userId ? post.isLikedBy(userId) : false,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Like/unlike a post
export const toggleLike = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const isLiked = post.isLikedBy(userId);

    if (isLiked) {
      post.unlike(userId);
    } else {
      post.like(userId);
    }

    await post.save();

    res.json({
      message: isLiked ? 'Post unliked' : 'Post liked',
      isLiked: !isLiked,
      likeCount: post.likeCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a comment to a post
export const addComment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.addComment(userId, content.trim());
    await post.save();

    // Populate the new comment
    await post.populate('comments.author', 'username name avatar');

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      message: 'Comment added successfully',
      comment: {
        id: newComment._id,
        author: {
          id: newComment.author._id,
          username: newComment.author.username,
          name: newComment.author.name,
          avatar: newComment.author.avatar
        },
        content: newComment.content,
        createdAt: newComment.createdAt
      },
      commentCount: post.commentCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is the author of the comment or the post
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.author.toString() !== userId && post.author.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    post.removeComment(commentId);
    await post.save();

    res.json({
      message: 'Comment deleted successfully',
      commentCount: post.commentCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.author.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(postId);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's posts
export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user?.userId;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const posts = await Post.find({ author: user._id, isPublic: true })
      .populate('author', 'username name avatar')
      .populate('likes', 'username name avatar')
      .populate('comments.author', 'username name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments({ author: user._id, isPublic: true });

    res.json({
      posts: posts.map(post => ({
        id: post._id,
        author: {
          id: post.author._id,
          username: post.author.username,
          name: post.author.name,
          avatar: post.author.avatar
        },
        content: post.content,
        type: post.type,
        imageUrl: post.imageUrl,
        likes: post.likes,
        comments: post.comments,
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        tags: post.tags,
        featureTag: post.featureTag,
        featureData: post.featureData,
        isPublic: post.isPublic,
        isLiked: userId ? post.isLikedBy(userId) : false,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
