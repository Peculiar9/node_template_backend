export interface EmailParams {
    to: string;
    from: string;
    subject: string;
    htmlBody: string;
    textBody?: string;
    configurationSet?: string;
}