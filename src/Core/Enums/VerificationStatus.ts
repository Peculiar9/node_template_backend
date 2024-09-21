export enum VerificationStatus{
    INITIATED = 'initiated', //when user has verified the email address
    IN_PROGRESS = 'in-progress',//when user has done phone verification
    IN_REVIEW = 'in-review',//when user has performed
    EXPIRED = 'expired',
    FAILED = 'failed',
    COMPLETED = 'completed'
}   
export enum VerificationLevel {
    email = 1,
    phone = 2,
    selfie = 3,
    license = 4,
    billingInfo = 5,
}