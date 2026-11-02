import { parsePhoneNumberFromString } from "libphonenumber-js";
import { z } from "zod";

import { slipperConfigurationSchema } from "../slipper/slipperConfiguration";

const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

function emptyStringToUndefined(value: unknown) {
  return typeof value === "string" && value.trim() === ""
    ? undefined
    : value;
}

function normaliseInternationalPhone(value: string) {
  const internationalInput = value.trim().replace(/^00/, "+");
  const phoneNumber = parsePhoneNumberFromString(internationalInput, {
    extract: false,
  });

  return phoneNumber?.isValid() ? phoneNumber.number : null;
}

const personNameSchema = z
  .string()
  .trim()
  .min(1, "Enter your name")
  .max(80, "Keep your name to 80 characters or fewer")
  .refine(
    (value) => !CONTROL_CHARACTERS.test(value),
    "Your name contains unsupported characters",
  );

const requesterEmailSchema = z
  .string()
  .trim()
  .max(254, "Enter a shorter email address")
  .email("Enter a valid email address")
  .transform((value) => value.toLowerCase());

const whatsappPhoneSchema = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .trim()
    .max(40, "Enter a shorter WhatsApp number")
    .refine(
      (value) => normaliseInternationalPhone(value) !== null,
      "Enter a valid international number, including the country code",
    )
    .transform((value) => normaliseInternationalPhone(value) as string)
    .optional(),
);

const christmasMessageSchema = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .trim()
    .max(500, "Keep your Christmas message to 500 characters or fewer")
    .refine(
      (value) => !CONTROL_CHARACTERS.test(value),
      "Your message contains unsupported characters",
    )
    .optional(),
);

const giftRequestConfigurationSchema = slipperConfigurationSchema.extend({
  recipientName: z
    .string()
    .trim()
    .min(1, "Enter the slipper recipient's name")
    .max(80, "Keep the recipient's name to 80 characters or fewer")
    .refine(
      (value) => !CONTROL_CHARACTERS.test(value),
      "The recipient's name contains unsupported characters",
    ),
});

export const giftRequestSchema = z
  .object({
    configuration: giftRequestConfigurationSchema,
    requester: z
      .object({
        name: personNameSchema,
        email: requesterEmailSchema,
        whatsappPhone: whatsappPhoneSchema,
      })
      .strict(),
    christmasMessage: christmasMessageSchema,
    contactConsent: z.literal(true, {
      error: "Agree to contact about this Christmas wish",
    }),
  })
  .strict();

export const giftRequestSubmissionSchema = giftRequestSchema.extend({
  website: z.string().max(200).optional().default(""),
  turnstileToken: z.string().trim().min(1).max(2048),
});

export type GiftRequest = z.infer<typeof giftRequestSchema>;
export type GiftRequestSubmission = z.infer<
  typeof giftRequestSubmissionSchema
>;

