export const successResponse = (data, message = 'Success', statusCode = 200) => ({
  success: true,
  message,
  data,
  statusCode
});

export const errorResponse = (message = 'Error', statusCode = 500) => ({
  success: false,
  message,
  statusCode
});
