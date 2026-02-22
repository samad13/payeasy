export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
}

/**
 * Mock email service since no real email provider is installed.
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
    console.log(`[EMAIL] To: ${options.to}`);
    console.log(`[EMAIL] Subject: ${options.subject}`);
    console.log(`[EMAIL] HTML: ${options.html}`);
}

export function getExportReadyEmailTemplate(): string {
    return `
    <h1>Your Data Export is Ready</h1>
    <p>Your request to export your personal data has been processed.</p>
    <p>You can download it securely from your account settings.</p>
  `;
}

export function getAccountDeletionEmailTemplate(): string {
    return `
    <h1>Account Deleted</h1>
    <p>Your account and all associated personal data have been completely deleted from our system.</p>
    <p>We're sorry to see you go!</p>
  `;
}
