import { createHash } from "node:crypto";

import { Resend } from "resend";

import type { GiftRequest } from "../../domain/gift-request/giftRequest";
import { renderGiftRequestEmail } from "./email";

interface DeliveryEnvironment {
  RESEND_API_KEY?: string;
  GIFT_REQUEST_FROM_EMAIL?: string;
  GIFT_REQUEST_TO_EMAIL?: string;
}

interface ResendResult {
  data: { id: string } | null;
  error: { message: string } | null;
}

export type GiftRequestEmailSender = (
  payload: {
    from: string;
    to: string[];
    replyTo: string;
    subject: string;
    html: string;
    text: string;
  },
  options: { idempotencyKey: string },
) => Promise<ResendResult>;

export class GiftRequestDeliveryError extends Error {
  readonly reason: "configuration" | "provider";

  constructor(
    message: string,
    reason: "configuration" | "provider",
  ) {
    super(message);
    this.name = "GiftRequestDeliveryError";
    this.reason = reason;
  }
}

function requireEnvironment(environment: DeliveryEnvironment) {
  const apiKey = environment.RESEND_API_KEY?.trim();
  const from = environment.GIFT_REQUEST_FROM_EMAIL?.trim();
  const to = environment.GIFT_REQUEST_TO_EMAIL?.trim();

  if (!apiKey || !from || !to) {
    throw new GiftRequestDeliveryError(
      "Gift request email environment is incomplete",
      "configuration",
    );
  }

  return { apiKey, from, to };
}

function createIdempotencyKey(request: GiftRequest) {
  const utcDay = new Date().toISOString().slice(0, 10);
  const digest = createHash("sha256")
    .update(`${utcDay}:${JSON.stringify(request)}`)
    .digest("hex")
    .slice(0, 32);
  return `gift-wish/${digest}`;
}

export async function deliverGiftRequest(
  request: GiftRequest,
  options: {
    environment?: DeliveryEnvironment;
    sendEmail?: GiftRequestEmailSender;
  } = {},
) {
  const environment: DeliveryEnvironment = options.environment ?? {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    GIFT_REQUEST_FROM_EMAIL: process.env.GIFT_REQUEST_FROM_EMAIL,
    GIFT_REQUEST_TO_EMAIL: process.env.GIFT_REQUEST_TO_EMAIL,
  };
  const { apiKey, from, to } = requireEnvironment(environment);
  const content = renderGiftRequestEmail(request);
  const resend = options.sendEmail ? null : new Resend(apiKey);
  const sendEmail: GiftRequestEmailSender =
    options.sendEmail ??
    ((payload, sendOptions) =>
      resend!.emails.send(payload, sendOptions) as Promise<ResendResult>);

  const result = await sendEmail(
    {
      from,
      to: [to],
      replyTo: request.requester.email,
      ...content,
    },
    { idempotencyKey: createIdempotencyKey(request) },
  );

  if (result.error || !result.data?.id) {
    throw new GiftRequestDeliveryError(
      "Resend did not accept the gift request notification",
      "provider",
    );
  }

  return { providerRequestId: result.data.id };
}

