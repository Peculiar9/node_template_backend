export interface IVerificationRepository<Verification> {
    getVerificationById(id: string): Promise<Verification|null|undefined>;
    getVerificationByGuidIdentifier(id: string): Promise<Verification[] |null|undefined>;
    createVerification(data: Partial<Verification>): Promise<Verification|undefined>;
    updateVerificationById(id: string, data: Partial<Verification>): Promise<Verification>;
    updateVerificationByPredicate(predicate: Partial<Verification>, data: Partial<Verification>): Promise<Verification>;
}
