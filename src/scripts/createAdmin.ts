import dotenv from 'dotenv';
import connectDB from '../config/db';
import User from '../models/User.model';

dotenv.config();

const ADMIN_SECRET = process.env.ADMIN_CREATION_SECRET;

async function createAdmin(email: string, password: string, secretKey: string) {
  if (secretKey !== ADMIN_SECRET) {
    console.error('Invalid admin creation secret key');
    process.exit(1);
  }

  try {
    await connectDB();
    
    const admin = new User({
      name: 'Admin',
      email,
      password,
      role: 'admin'
    });

    await admin.save();
    console.log('Admin user created successfully with \n Admin Email:', email, '\n Admin Password`:', password);
    process.exit(0);
  } catch (error) {
    if(error instanceof Error) console.error('Error creating admin:', error.message);
    else console.error('Pata nahi kya hua');
    process.exit(1);
  }
}

console.log(process.argv);

createAdmin(process.argv[2], process.argv[3], process.argv[4]);