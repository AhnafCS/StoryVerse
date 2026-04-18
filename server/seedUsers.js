import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/storyverse');
    console.log('Connected to MongoDB');

    // Clear existing users (optional - remove if you want to keep existing users)
    // await User.deleteMany({});
    // console.log('Cleared existing users');

    const users = [
      {
        email: 'alice.wilson@example.com',
        password: 'password123',
        name: 'Alice Wilson',
        username: 'alicewilson',
        bio: 'Fantasy writer and mythology enthusiast. Love exploring character psychology.',
        avatar: '',
        isVerified: true
      },
      {
        email: 'bob.chen@example.com',
        password: 'password123',
        name: 'Bob Chen',
        username: 'bobchen',
        bio: 'Anime lover and creative storyteller. Always looking for new narratives.',
        avatar: '',
        isVerified: false
      },
      {
        email: 'carol.martinez@example.com',
        password: 'password123',
        name: 'Carol Martinez',
        username: 'carolmartinez',
        bio: 'Literature student specializing in modern fiction. Book reviewer and blogger.',
        avatar: '',
        isVerified: false
      },
      {
        email: 'david.jones@example.com',
        password: 'password123',
        name: 'David Jones',
        username: 'davidjones',
        bio: 'Screenwriter and film buff. Passionate about story structure and character arcs.',
        avatar: '',
        isVerified: true
      },
      {
        email: 'emma.davis@example.com',
        password: 'password123',
        name: 'Emma Davis',
        username: 'emmadavis',
        bio: 'Poet and creative writer. Exploring the depths of human emotions through words.',
        avatar: '',
        isVerified: false
      },
      {
        email: 'frank.kim@example.com',
        password: 'password123',
        name: 'Frank Kim',
        username: 'frankkim',
        bio: 'Comic book enthusiast and graphic novelist. Visual storytelling is my passion.',
        avatar: '',
        isVerified: false
      },
      {
        email: 'grace.lee@example.com',
        password: 'password123',
        name: 'Grace Lee',
        username: 'gracelee',
        bio: 'Psychology student interested in character analysis and narrative therapy.',
        avatar: '',
        isVerified: true
      },
      {
        email: 'henry.taylor@example.com',
        password: 'password123',
        name: 'Henry Taylor',
        username: 'henrytaylor',
        bio: 'Historical fiction writer. Researching ancient myths and legends.',
        avatar: '',
        isVerified: false
      }
    ];

    // Hash passwords and create users
    const salt = await bcrypt.genSalt(12);
    
    for (const userData of users) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = new User({
        ...userData,
        password: hashedPassword
      });

      await user.save();
      console.log(`Created user: ${userData.name} (@${userData.username})`);
    }

    // Add some follow relationships
    const alice = await User.findOne({ username: 'alicewilson' });
    const bob = await User.findOne({ username: 'bobchen' });
    const carol = await User.findOne({ username: 'carolmartinez' });
    const david = await User.findOne({ username: 'davidjones' });
    const emma = await User.findOne({ username: 'emmadavis' });

    if (alice && bob && carol) {
      // Alice follows Bob and Carol
      alice.following.push(bob._id, carol._id);
      bob.followers.push(alice._id);
      carol.followers.push(alice._id);
      
      // Bob follows Alice and David
      bob.following.push(alice._id, david._id);
      alice.followers.push(bob._id);
      david.followers.push(bob._id);

      // Carol follows Emma
      carol.following.push(emma._id);
      emma.followers.push(carol._id);

      await alice.save();
      await bob.save();
      await carol.save();
      await david.save();
      await emma.save();

      console.log('Added follow relationships');
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();
