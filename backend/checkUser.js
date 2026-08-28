import './config/env.js';
import connectDB from './config/db.js';
import User from './models/User.js';

const checkUser = async () => {
  try {
    await connectDB();
    const email = 'neelasaikumar2020@gmail.com';
    const user = await User.findOne({ email });
    console.log('User found:', user);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUser();
