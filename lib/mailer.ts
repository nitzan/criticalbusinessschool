/**
 * Pluggable mailer.
 *
 * By default this is a "stub" transport that logs outgoing mail to the server
 * console instead of delivering it. This keeps the newsletter service fully
 * functional in development without any external email account.
 *
 * To wire up real delivery later, implement a transport that satisfies the
 * `MailTransport` interface (e.g. nodemailer SMTP or a provider SDK) and return
 * it from `getTransport()`. No calling code needs to change.
 */

export interface MailMessage {
  to: string;
  subject: string;
  /** Plain text / markdown body of the email. */
  text: string;
}

export interface SendResult {
  success: boolean;
  error?: string;
}

export interface MailTransport {
  send(message: MailMessage): Promise<SendResult>;
}

/**
 * Stub transport: records the message to the console and reports success.
 */
class ConsoleTransport implements MailTransport {
  async send(message: MailMessage): Promise<SendResult> {
    console.log(
      `[mailer] ----- outgoing email -----\n` +
        `To: ${message.to}\n` +
        `Subject: ${message.subject}\n\n` +
        `${message.text}\n` +
        `[mailer] --------------------------`
    );
    return { success: true };
  }
}

let transport: MailTransport | null = null;

/**
 * Returns the active mail transport. Swap the implementation here to enable
 * real delivery (the rest of the app calls `sendMail` and is transport-agnostic).
 */
export function getTransport(): MailTransport {
  if (!transport) {
    transport = new ConsoleTransport();
  }
  return transport;
}

/** Override the transport (useful for tests or wiring a real provider). */
export function setTransport(custom: MailTransport): void {
  transport = custom;
}

export async function sendMail(message: MailMessage): Promise<SendResult> {
  try {
    return await getTransport().send(message);
  } catch (error: any) {
    return { success: false, error: error?.message || 'Unknown mailer error' };
  }
}
