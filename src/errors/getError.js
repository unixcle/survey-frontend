import { BACKEND_ERRORS , HTTP_STATUS_ERRORS , NETWORK_ERROR_MESSAGE , TIMEOUT_ERROR_MESSAGE } from "./error";
import { DEFAULT_ERROR_MESSAGE } from "./defaultError";

export const getError = (error) => {
  if (err?.code === "ECONNABORTED") {
    return TIMEOUT_ERROR_MESSAGE;
  }
  if (!err?.response) {
    return NETWORK_ERROR_MESSAGE;
  }

  const { status, data } = err.response;
  
  if (HTTP_STATUS_ERRORS[status]) {
    return HTTP_STATUS_ERRORS[status];
  }
  const statusCode = error?.response?.data.errors?.[0].code;
  const errorMSG = error?.response?.data.errors?.[0].detail

  return errorMSG || BACKEND_ERRORS[statusCode] || DEFAULT_ERROR_MESSAGE;
};