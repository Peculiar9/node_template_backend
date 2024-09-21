export default class ResponseFormat {


    //Response Data Interface
    public INVALID_REQUEST: ResponseDataInterface = { success: false, data: {}, message: ResponseMessage.INVALID_REQUEST_MESSAGE, error_code: 9 };
    public REQUIRED_FIELD: ResponseDataInterface = { success: false, data: {}, message: ResponseMessage.REQUIRED_FIELD_MESSAGE, error_code: 9 };
    public SUCCESSFUL_EMAIL_VERIFICATION: ResponseDataInterface = { success: false, data: {}, message: ResponseMessage.SUCCESSFUL_EMAIL_VERIFICATION_MESSAGE, error_code: 9 };
    public FAILED_EMAIL_VERIFICATION: ResponseDataInterface = { success: false, data: {}, message: ResponseMessage.FAILED_EMAIL_VERIFICATION_MESSAGE, error_code: 9 };
    public FAILED_PHONE_VERIFICATION: ResponseDataInterface = { success: false, data: {}, message: ResponseMessage.FAILED_PHONE_VERIFICATION_MESSAGE, error_code: 9 };
    public INVALID_LOGIN: ResponseDataInterface = { success: false, data: {}, message: ResponseMessage.INVALID_LOGIN_MESSAGE, error_code: 9 };
}
export interface ResponseDataInterface {
    success: boolean;
    message?: string;
    data?: any;
    meta?: {},
    error_code: number;
}

export enum ResponseMessage {
    INVALID_REQUEST_MESSAGE = "invalid request please contact admin",
    INVALID_LOGIN_MESSAGE = "invalid phone, email or password",
    INVALID_REQUEST_BODY = "invalid request body!!!",
    INVALID_ID = "invalid ID provided",
    INVALID_AUTH_HEADER_MESSAGE = "Auth header does not exist!!!",
    INVALID_BILLING_INFO = "the billing information you provided is not valid, please check and try again!!!",
    INVALID_CARD_INFO = "the card you are trying to use is not valid, please check and try again",
    INSUFFICIENT_PRIVILEDGES_MESSAGE = "user does not possess sufficient priviledges!!!",
    SUCCESSFUL_REQUEST_MESSAGE = "request successful please proceed!!!",
    SUCCESSFUL_EMAIL_VERIFICATION_MESSAGE = "User Email has been verified please proceed!!!",
    SUCCESSFUL_PHONE_VERIFICATION_MESSAGE = "User Phone has been verified successfully please proceed!!!",
    USER_ALREADY_HOST = "user is already a host, you can continue to user dashboard!!!",
    FAILED_EMAIL_VERIFICATION_MESSAGE = "Email verification invalid or cannot be verified please try again!!!",
    FAILED_PHONE_VERIFICATION_MESSAGE = "Phone verification invalid or cannot be verified please try again!!!",
    ERROR_MESSAGE = "an error occured",
    REQUIRED_FIELD_MESSAGE = "all fields are required!!!",
    INVALID_TOKEN = "invalid or expired token!!!",
    USER_ALREADY_EXISTS = 'user with the following details exists',
    USER_ALREADY_HOST_REDIRECT_TO_RENTER = 'user with these details is already a host, do you want to continue as renter?',
    USER_ALREADY_RENTER_REDIRECT_TO_HOST = 'user with these details is already a renter, do you want to continue as host?',
    USER_DOESNT_EXISTS = 'user with the following details does not exists',
    INVALID_VERIFICATION = 'this verification is invalid or has expired please restart verification',
    INVALID_DOCUMENT_UPLOAD = 'the document uploaded is not a valid license please try again or clean camera',
    INVALID_FILE_TYPE = 'invalid file type or format',
    INVALID_FILE_SIZE = 'One or more files exceeds size limit',
    INVALID_PNONE_NUMBER = 'invalid phone number please check and try again!!!',
    DUPLICATE_EMAIL_MESSAGE = 'user already exists please try another email',
    DUPLICATE_PHONE_MESSAGE = 'user already exists please try another phone',
    INVALID_PHONE = 'invalid phone or password',
    INVALID_EMAIL = 'invalid email or password',
    TOKEN_MISSING = 'token is missing in query request',
    PHONE_EMAIL_REQUIRED = 'user phone or email required!!!',
    FILE_DOES_NOT_EXIST = 'file does not exist in request, try again!!!',
    VEHICLE_PHOTOS_INVALID = 'Invalid vehicle image, please take clearer photos of vehicle',
    MISSING_REQUEST_BODY = 'Request body is missing or invalid, please provide a valid object in the request body',
    USER_ROLE_UPDATE_NOT_SUCCESSFUL = 'the user\'s role could not be updated successfully',
    

    //RATE LIMITER
    RATE_LIMIT_ERROR = "Too many requests - try again later.",

    // USER
    
    // VERIFICATION
    
    // IMAGE AND FILE ASSETS
    
    // VEHICLE
    INVALID_VIN_LENGTH = "VIN must be exactly 17 characters long.",
    INVALID_VIN_ERROR_MESSAGE = "VIN must contain only alphanumeric characters (excluding I, O, and Q).",
    CAR_VERIFICATION_SUCCESS = 'Your Car is Eligible',
    VEHICLE_VERIFICATION_FAILED_MESSAGE = "unfortunately, this car is ineligible because it's older than our limit or is not electric",
    VEHICLE_DETAILS_EXISTS = "vehicle with details already exists, check VIN or your list of listed vehicles for details",
    VEHICLE_DOESNT_EXIST = 'Vehicle with the provided details does not exist or has been removed',
    VEHICLE_EXISTS = 'Vehicle already exists',
    VEHICLE_IMAGE_UPLOADED = 'vehicle already has initial images, check vehicle listing on dashboard to update vehicle images',
    VEHICLE_IMAGE_EMPTY = 'vehicle does not have any image',
    VEHICLE_IMAGE_URLS_EMPTY = 'image urls are empty or invalid',


    //GUEST INSTRUCTIONS
    LIMIT_PER_DAY_INVALID = 'either miles per day is invalid or miles limit per day has to be more miles than ',
    INVALID_UNLIMITED_VALUE = "unlimited value should either be true or false",
    MILES_PER_DAY_NOT_ALLOWED_WITH_UNLIMITED = 'you cannot set a miles per day if you have your miles per day set to unlimited',
    INVALID_MILES_PER_DAY = "invalid input for miles per day",

    //FILE

    FILE_DOWNLOAD_SUCCESS_MESSAGE = "file downloaded successfully!!!",
    FILE_DOWNLOAD_ERROR_MESSAGE = "error downloading files!!!",
}