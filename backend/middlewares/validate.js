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
