const successResponse = (
  res,
  { statusCode = 200, message = "Success", data = {}, meta = null, exposeTopLevel = true }
) => {
  const payload = {
    success: true,
    message,
    data,
  };

  if (exposeTopLevel && data && typeof data === "object" && !Array.isArray(data)) {
    Object.assign(payload, data);
  }

  if (meta) payload.meta = meta;

  return res.status(statusCode).json(payload);
};

module.exports = { successResponse };
