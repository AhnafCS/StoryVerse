import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: function() {
      // Only require username for new users (created after this update)
      return !this.createdAt || this.createdAt > new Date('2024-04-19');
    },
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ""
  },
  avatar: {
    type: String,
    default: ""
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for follower count
userSchema.virtual('followerCount').get(function() {
  return this.followers ? this.followers.length : 0;
});

// Virtual for following count
userSchema.virtual('followingCount').get(function() {
  return this.following ? this.following.length : 0;
});

// Method to check if user follows another user
userSchema.methods.follows = function(userId) {
  return this.following && this.following.includes(userId);
};

// Method to follow a user
userSchema.methods.follow = function(userId) {
  if (!this.following.includes(userId)) {
    this.following.push(userId);
  }
};

// Method to unfollow a user
userSchema.methods.unfollow = function(userId) {
  this.following = this.following.filter(id => id.toString() !== userId.toString());
};

export default mongoose.model('User', userSchema);