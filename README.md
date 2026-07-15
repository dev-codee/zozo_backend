# zozo-backend
Backend for zozo.pk - a mobile phone price comparison platform.

## Folder Structure
- `src/config`: Configuration files (DB, Cloudinary, Env)
- `src/models`: Mongoose schemas and models
- `src/routes`: Express route definitions
- `src/controllers`: Request handlers (calls services)
- `src/services`: Business logic and database operations
- `src/middlewares`: Custom Express middlewares
- `src/validators`: Request payload validators
- `src/utils`: Helper functions and classes
- `src/jobs`: Background jobs and crons

## Running Locally
1. `npm install`
2. Copy `.env.example` to `.env` and fill values.
3. `npm run dev`
