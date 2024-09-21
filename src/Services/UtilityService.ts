

import { randomBytes, createHmac, pseudoRandomBytes } from 'crypto';
import { Parser } from 'json2csv';
import { Readable } from 'stream';
// import { Parser } from 'json2csv';
const { Transform } = require('json2csv');
class UtilityService {





  //===============================//
  // TYPE ANNULLING AND OPERATIONS //
  //==============================//

  public static getTypeName<T>(type: new () => T): string {
    return (type as any).name;
  }

  public static checkWordLimit(text: string, wordLimit: number): boolean {
    const wordRegex = /\w+/g; // Matches words (letters, numbers, underscores)
    const words = text.match(wordRegex);
    return words ? words.length <= wordLimit : false;
  }
  //==========================//
  // CRYPTOGRAPHY AND HASHING //
  //=========================//

  public static getKey4(
    prefix: string,
    one: string,
    two: string,
    three: string
  ) {
    return `${prefix}-${one}-${two}-${three}`;
  }

  public static Guid = () => {
    var w = () => { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); }
    return `${w()}${w()}-${w()}-${w()}-${w()}-${w()}${w()}${w()}`;
  }

  public static generateNumberToken(length: number) {
    if (length > 16) {
      throw new Error('Token length cannot be greater than 16');
    }
    const randomBytes = pseudoRandomBytes(Math.ceil(length / 2));
    const digits: any = '0123456789';
    const filteredBytes = randomBytes.filter(byte => digits.includes(String.fromCharCode(byte)));
    if (filteredBytes.length < Math.ceil(length / 2)) {
      throw new Error('Failed to generate enough random digits');
    }
    const token = filteredBytes.slice(0, length).map(byte => digits[byte]).join('');

    return token;
  }

  //Mostly for OTP
  public static generate6Digit(): string {
    let token = '';
    const digits = '0123456789';

    for (let i = 0; i < 6; i++) {
      const index = Math.floor(Math.random() * digits.length);
      token += digits[index];
    }

    return token;
  }

  public static signHash = (hashStr: string) =>
    UtilityService.base64UrlEncode(hashStr);

  public static createtokenHash(tokenStr: string, secret: string) {
    const hash64 = createHmac("sha256", secret)
      .update(tokenStr)
      .digest("base64");
    console.log("UtilityService::TokenHashBase64: ", hash64);
    return hash64;
  }

  public static generateRandomBytes(secretLength: number) {
    secretLength = secretLength || 32;
    return randomBytes(secretLength);
  }

  public static base64Tobase64UrlEncode = (base64String: string) =>
    base64String.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  public static base64UrlEncode(data: string): string {
    const buffer = Buffer.from(data, "ascii");
    const base64 = buffer.toString("base64");
    const base64url = this.base64Tobase64UrlEncode(base64);
    return base64url;
  }


  public static base64UrlDecode(token: string): any {
    const base64String = token.replace(/-/g, "+").replace(/_/g, "/");
    const paddingLength = base64String.length % 4;
    if (paddingLength === 2) {
      token += "==";
    } else if (paddingLength === 3) {
      token += "=";
    }
    const decodedString = atob(token);
    const utf8String = decodeURIComponent(escape(decodedString));

    return utf8String;
  }




  //==============================//
  // INPUT VALIDATION AND CHECKS //
  //=============================//

  public static isNullOrEmpty(value: any) {
    if (value?.length === 0) return true;
    else if (!value) return true;
    else if (value === "") return true;
    else return false;
  }

  public static isNullOrEmptyReturn(...args: any[]) {
    for (let index = 0; index < args.length; index++) {
      const element = args[index];
      if (this.isNullOrEmpty(element)) {
        return false;
      }
    }
  }

  public static IsNullOrEmptyThrow(...args: any[]) {
    for (let index = 0; index < args.length; index++) {
      const element = args[index];
      if (this.isNullOrEmpty(element))
        throw new Error("Field cannot be Empty!!!");
    }
  }

  public static isAlphanumeric(string: string) {
    const alphanumericRegex = /^[A-HJ-NPR-Z0-9]+$/; // Excludes I, O, and Q to avoid confusion with 1, 0, and 9
    return !alphanumericRegex.test(string);
  }

  // INPUT VALIDATION AND SANITIZATION
  public static isNumber(value: any) {
    return typeof value === "number" && !isNaN(value);
  }

  public static sanitizeInput(input: any): any {
    if (typeof input === 'object' && input !== null) {
      for (const key in input) {
        if (input.hasOwnProperty(key)) {
          const sanitizedKey = key.replace(/[$.]/g, '');
          if (sanitizedKey !== key) {
            input[sanitizedKey] = input[key];
            delete input[key];
          }
          if (typeof input[sanitizedKey] === 'object') {
            input[sanitizedKey] = UtilityService.sanitizeInput(input[sanitizedKey]);
          }
        }
      }
    }
    return input;
  }


  public static normalizeString(input: string): string {
    return input.replace(/[\s.,'-]+/g, '').toLowerCase();
  }

  //@description
  /* 
    returns null if the object does not have
    a null value in any of its keys
    else it returns the key which value is null
  */
  public static objectNullCheck(obj: any): string | undefined | null {
    if (typeof obj !== "object" || !obj) {
      return;
    }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (!obj[key]) {
          return key;
        }
      }

      if (obj.hasOwnProperty(key)) {
        if (!obj[key]) {
          return obj[key];
        }
        // for nested objects
        else if (typeof obj[key] === "object") {
          const nestedNull = UtilityService.objectNullCheck(obj[key]);
          if (nestedNull !== undefined) {
            return nestedNull;
          }
        }
      } else return null;
    }
  }

  public static checkForNullOrRequiredFields<T>(requiredFields: T, obj: any) {
    if (requiredFields) {
      const fieldSet = new Set();
      for (const key in requiredFields as T) {
        fieldSet.add(key.toString());
      }
      for (const key in obj) {
        if (!fieldSet.has(key.toString())) {
          return key;
        }
      }
      return null;
    }
  }

  public static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public static isValidPhone(phoneNumber: string): boolean {
    // Regular expression for US and Canadian phone numbers
    const phoneRegex = /^(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}$/;
    return phoneRegex.test(phoneNumber);
  }

  //==============================//
  // FORMATING AND MIME_ING //
  //=============================//
  public static unixToDate = (unixTimeStamp: any) => {
    const unixToMillisecond = unixTimeStamp * 1000;
    const date = new Date(unixToMillisecond);
    console.log("Date format: ", date);
    return date;
  };

  public static dateToUnix = (dateTime: any) => {
    const dateObject = new Date(dateTime);
    const unixTimeStamp = Math.floor(dateObject.getTime() / 1000);
    return unixTimeStamp;
  }
  public static formatDate = (date: Date) =>
    date.toISOString().slice(0, 19).replace("T", " ");

  public static formatDateToISOFormat = (date: Date) =>
    date.toISOString().slice(0, 23) + "+00:00";

  public static formatDateToUrlSafeISOFormat = (date: Date) => {
    return date.toISOString().replace(/[:.]/g, '-'); // Replace colons and dots
  }
  public static formatAmount = (number: number) =>
    number.toFixed(2).toString().replace(".", "");

  public static removeWhiteSpaces = (str: string) => str.replace(/ /g, "");

  public static formatPhoneNumber = (phoneNumber: string) =>
    phoneNumber.slice(0, 4)
    + " " + phoneNumber.slice(4, 7)
    + " " + phoneNumber.slice(7, 10)
    + " " + phoneNumber.slice(10);

  public static convertInternationalToPhone = (
    internationalPhone: string,
    countryCode: string
  ) => {
    const countryCodeCharRem = countryCode + " ";
    const nationalPhone = internationalPhone.replace(countryCodeCharRem, "0");
    const phone = this.removeWhiteSpaces(nationalPhone);
    return phone;
  };

  public static convertBytesToMegaBytes = (bytes: number): number => {
    const mb = bytes / (1024 * 1024);
    const fileSizeInMb = mb.toFixed(2);
    // see if you can round up the file size to the nearest whole number
    return Number(fileSizeInMb);
  }

  public static convertMeterToMiles(meters: number) {
    const conversionFactor = 0.000621371;
    return meters * conversionFactor;
  }

  public static convertMilesToMeters(miles: number) {
    const conversionFactor = 1 / 0.000621371;
    return miles * conversionFactor;
  }

  public static removePropertiesFromObject(object: any, keysToRemove: any) {
    for (const key of keysToRemove) {
      delete object[key];
    }
    return object;
  }

  // largeDataSets
  public static convertJSON2CSVLarge(data: any[]): Readable {
    const fields = Object.keys(data[0]);
    const opts = { fields };
    const transformOpts = { highWaterMark: 16384, encoding: 'utf-8' };
    const json2csv = new Transform(opts, transformOpts);

    const readableStream = new Readable({
      read() {
        data.forEach((doc: any) => {
          if (!this.destroyed) {
            this.push(JSON.stringify(doc));
          }
        });
        this.push(null);
      },
      objectMode: true
    });

    return readableStream.pipe(json2csv);
  }

  //for simple Datasets
  public static convertJSON2CSV(data: any): any {
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid data format. Expected an object.');
    }

    const fields = Object.keys(data);
    const opts = { fields };
    const json2csvParser = new Parser(opts);

    const csv = json2csvParser.parse(fields);
    return csv;
  }
}
export default UtilityService;
