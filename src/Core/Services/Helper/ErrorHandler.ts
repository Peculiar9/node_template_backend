class HttpError extends Error {
    constructor(public statusCode: number, public message: string) {
      super(message); 
      this.statusCode = statusCode;
    }
  }
  
  class BadRequestError extends HttpError {
    constructor(message: string) {
      super(400, message || "Invalid request data");
    }
  }
  
  // Usage
  throw new BadRequestError("Missing required field: name");