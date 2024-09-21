import { ObjectId } from "mongodb";
import { VerificationLevel } from "../../../Enums/VerificationStatus";

export interface IUser{
    _id?: ObjectId | string | undefined;
    first_name: string;
    last_name: string;
    drivers_license: string
    age: number;
    type: string;
    email: string;
    country_code: string;
    international_phone: string;
    phone: string;
    password: string;
    profile_image: string; //url for user image
    status: string;
    isActive: boolean;
    user_secret: string;
    salt: string;
    trips_count: number;
    host_trip_count: number;
    host_badges: string;
    user_criteria: string;
    card_tokens: ICardToken[];
    stripe_id: string;
    billing_info: IBillingInfo;
    hosted_cars: (ObjectId | string)[]; //references to the cars the user has listed (host role)
    favourite_cars: (ObjectId | string)[]; // ids of cars that the user considers their favourites
    favourite_hosts: (ObjectId | string)[];  // ids of hosts that the user considers their favourites
    verification_id: ObjectId | undefined; //reference to the verification table
    verification_progress: string;
    verification_level: number | VerificationLevel; // VerificationLevel enumerator
    required_pid: boolean;
    required_poa: boolean;
    required_selfie: boolean;
    verified_selfie: boolean;
    verified_poa: boolean;
    verified_pid: boolean;
    roles: string[]; //Roles: "renter", "host" or both
    created_at: string;
    updated_at: string;
    __v: number;
}

export interface ICardToken {
    is_active: boolean; //the active and is not a dead card, usually prompt user to update card details
    token: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    is_default: boolean;
}

export interface IBillingInfo {
    street_address: string;
    city: string;
    region: string;
    zip_code: string;
    country: string;
}