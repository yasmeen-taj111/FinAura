const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const isServerError = statusCode >= 500;
  res.status(statusCode).json({
    message: isServerError && process.env.NODE_ENV === 'production' ? 'Something went wrong. Please try again.' : err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };
