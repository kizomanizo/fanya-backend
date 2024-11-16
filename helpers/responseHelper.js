export const sendResponse = (res, success, message, payload = null) => {
  return res.status(success ? 200 : 400).json({
    success,
    message,
    payload,
  });
};
