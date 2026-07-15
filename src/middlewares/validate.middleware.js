import ApiError from '../utils/ApiError.js';

export const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return next(new ApiError(400, error.details[0].message));
    }
    next();
};
