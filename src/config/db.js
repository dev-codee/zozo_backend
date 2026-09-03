import mongoose from 'mongoose';
import env from './env.js';
import logger from '../utils/logger.js';

const connectDB = async () => {
    let retries = 5;
    while (retries > 0) {
        try {
            const conn = await mongoose.connect(env.MONGODB_URI, {
                serverSelectionTimeoutMS: 5000,
            });
            logger.info(`MongoDB Connected: ${conn.connection.host}`);
            return;
        } catch (error) {
            retries -= 1;
            logger.error(`MongoDB Connection Error (${retries} retries remaining): ${error.message}`);
            if (retries === 0) {
                logger.error('Could not connect to MongoDB after 5 attempts.');
                // Removed process.exit(1) to allow server to stay up and let Mongoose auto-reconnect
            }
            await new Promise((res) => setTimeout(res, 3000));
        }
    }
};

export default connectDB;
