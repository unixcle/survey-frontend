import { BACKEND_ERRORS } from "./error";
import {DEFAULT_ERROR_MESSAGE} from "./defaultError"

export const getError = () => {
  // Optional: fallback based on HTTP status
  if (statusCode === 401) return "Unauthorized access";
  if (statusCode === 403) return "Access denied";

  return BACKEND_ERRORS[errorCode] || DEFAULT_ERROR_MESSAGE;
};