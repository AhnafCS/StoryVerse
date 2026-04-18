import User from '../models/User.js';
import Post from '../models/Post.js';

// Get user profile by username
export const getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username })
      .select('-password')
      .populate('followers', 'username name avatar')
      .populate('following', 'username name avatar');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's posts
    const posts = await Post.find({ author: user._id })
      .populate('author', 'username name avatar')
      .populate('likes', 'username name avatar')
      .populate('comments.author', 'username name avatar')
      .sort({ createdAt: -1 });

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        bio: user.bio,
        avatar: user.avatar,
        followers: user.followers,
        following: user.following,
        followerCount: user.followerCount,
        followingCount: user.followingCount,
        isVerified: user.isVerified,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt
      },
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
        isPublic: post.isPublic,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, username, bio, avatar } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) user.name = name;
    if (username) user.username = username.toLowerCase();
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        bio: user.bio,
        avatar: user.avatar,
        followerCount: user.followerCount,
        followingCount: user.followingCount,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get current user's profile
export const getCurrentProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId)
      .select('-password')
      .populate('followers', 'username name avatar')
      .populate('following', 'username name avatar');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        bio: user.bio,
        avatar: user.avatar,
        followers: user.followers,
        following: user.following,
        followerCount: user.followerCount,
        followingCount: user.followingCount,
        isVerified: user.isVerified,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Follow a user
export const followUser = async (req, res) => {
  try {
    const followerId = req.user.userId;
    const { username } = req.params;

    const userToFollow = await User.findOne({ username });
    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userToFollow._id.toString() === followerId) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    const follower = await User.findById(followerId);
    
    // Check if already following
    if (follower.follows(userToFollow._id)) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Add to following list
    follower.follow(userToFollow._id);
    await follower.save();

    // Add to followers list
    userToFollow.followers.push(follower._id);
    await userToFollow.save();

    res.json({
      message: 'User followed successfully',
      following: true,
      followerCount: userToFollow.followerCount,
      followingCount: follower.followingCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.userId;
    const { username } = req.params;

    const userToUnfollow = await User.findOne({ username });
    if (!userToUnfollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    const follower = await User.findById(followerId);
    
    // Check if following
    if (!follower.follows(userToUnfollow._id)) {
      return res.status(400).json({ error: 'Not following this user' });
    }

    // Remove from following list
    follower.unfollow(userToUnfollow._id);
    await follower.save();

    // Remove from followers list
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== followerId
    );
    await userToUnfollow.save();

    res.json({
      message: 'User unfollowed successfully',
      following: false,
      followerCount: userToUnfollow.followerCount,
      followingCount: follower.followingCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search users
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const users = await User.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { name: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    })
    .select('username name avatar bio followerCount isVerified')
    .limit(20);

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get suggested users
export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { limit = 5 } = req.query;

    // Get current user's following list to exclude them
    let followingIds = [];
    if (userId) {
      const currentUser = await User.findById(userId).select('following');
      followingIds = currentUser ? currentUser.following.map(id => id.toString()) : [];
      followingIds.push(userId); // Add current user ID to exclusion list
    }

    // Build query
    let query = { isActive: true };
    if (followingIds.length > 0) {
      query._id = { $nin: followingIds };
    }

    // Get random users that are not being followed and not the current user
    const users = await User.find(query)
    .select('username name avatar bio followerCount isVerified')
    .limit(parseInt(limit));

    res.json({ users });
  } catch (error) {
    console.error('Error getting suggested users:', error);
    res.status(500).json({ error: error.message });
  }
};
