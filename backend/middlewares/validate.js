/**
 * Validation Middleware, Validates the request data
 * @param {Object} schema - The validation schema
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */

module.exports = (schema) => (req, res, next) => {
  try {
    const data = {
      body: req.body,
      query: req.query,
      params: req.params,
    }
    const result = schema.parse(data);
    req.validated = result;
    next();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
