import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: function() {
      return this.type === 'text';
    },
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['text', 'image'],
    required: true
  },
  imageUrl: {
    type: String,
    required: function() {
      return this.type === 'image';
    }
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  featureTag: {
    type: String,
    enum: ['ai', 'psychology', 'narrative', 'analytics', 'forum', null],
    default: null
  },
  featureData: {
    name: { type: String, maxlength: 100 },
    summary: { type: String, maxlength: 200 },
    fullContent: { type: String, maxlength: 2000 }
  },
  isPublic: {
    type: Boolean,
    default: true
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

postSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

// Method to check if user liked the post
postSchema.methods.isLikedBy = function(userId) {
  return this.likes && this.likes.includes(userId);
};

// Method to like a post
postSchema.methods.like = function(userId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
  }
};

// Method to unlike a post
postSchema.methods.unlike = function(userId) {
  this.likes = this.likes.filter(id => id.toString() !== userId.toString());
};

// Method to add a comment
postSchema.methods.addComment = function(authorId, content) {
  this.comments.push({
    author: authorId,
    content: content,
    createdAt: Date.now()
  });
};

// Method to remove a comment
postSchema.methods.removeComment = function(commentId) {
  this.comments = this.comments.filter(comment => comment._id.toString() !== commentId.toString());
};

// Index for better query performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1 });

export default mongoose.model('Post', postSchema);
