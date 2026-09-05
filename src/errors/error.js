

export const BACKEND_ERRORS = {
    no_active_account:"User can not found" ,
    INVALID_PASSWORD: "The Password is wrong",
    EMAIL_ALREADY_EXISTS: "This Email is already exist",
  USER_ALREADY_EXISTS: "User already exists",
  SURVEY_ALREADY_SUBMITTED: "Survey already submitted",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "You dont have the premision of doing this",
}


export const HTTP_STATUS_ERRORS = {
  400: "درخواست نامعتبر است",
  401: "please login into your account",
  403: "Unauthorized access",
  404: "not found",
  408: "your request had a long delay",
  429: "too many requests , please try later",
  500: "there is a error in server",
  502: "no server",
  503: "server is off for a short time please wait",
};



export const NETWORK_ERROR_MESSAGE = "check your internet connection and try again";
export const TIMEOUT_ERROR_MESSAGE = "the time request has been finished";