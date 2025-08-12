import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://xilyor:SopI4Wj53Qic56P3aG@mongo.deeperincode.com:29930/xilyor_db_ecom?authSource=admin';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;