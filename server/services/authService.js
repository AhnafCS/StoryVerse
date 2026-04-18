import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const registerUser = async (userData) => {
  const { email, password, name, username } = userData;

  // Check if user already exists by email
  const existingUserByEmail = await User.findOne({ email });
  if (existingUserByEmail) {
    throw new Error('User with this email already exists');
  }

  // Generate username if not provided
  const finalUsername = username || name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000);

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new User({
    email,
    password: hashedPassword,
    name,
    username: finalUsername.toLowerCase()
  });

  await user.save();

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    message: 'User created successfully',
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      username: user.username,
      bio: user.bio,
      avatar: user.avatar,
      followerCount: user.followerCount,
      followingCount: user.followingCount
    }
  };
};

export const loginUser = async (credentials) => {
  const { email, password } = credentials;

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  // Generate username if user doesn't have one
  if (!user.username) {
    user.username = user.name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000);
    await user.save();
  }

  // Update last seen
  user.lastSeen = Date.now();
  await user.save();

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      username: user.username,
      bio: user.bio,
      avatar: user.avatar,
      followerCount: user.followerCount,
      followingCount: user.followingCount,
      isVerified: user.isVerified,
      lastSeen: user.lastSeen
    }
  };
};
