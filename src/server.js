import app from './app.js';
import connectDB from './config/db.js';
import env from './config/env.js';
import logger from './utils/logger.js';

const startServer = async () => {
    try {
        await connectDB();
        app.listen(env.PORT, () => {
            logger.info(`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
