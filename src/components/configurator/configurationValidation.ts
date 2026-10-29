import {
  slipperConfigurationSchema,
  type SlipperColorSection,
  type SlipperConfiguration,
} from "@/domain/slipper";

import {getMessages} from "@/i18n/dictionaries";
import type {AppLocale} from "@/i18n/routing";

export interface ConfigurationErrors {
  recipientName?: string;
  euSize?: string;
  colors: Partial<Record<SlipperColorSection, string>>;
}

export interface ConfigurationValidationState {
  isValid: boolean;
  errors: ConfigurationErrors;
}

export function validateConfiguration(
  configuration: SlipperConfiguration,
  locale: AppLocale = "en",
): ConfigurationValidationState {
  const result = slipperConfigurationSchema.safeParse(configuration);
  const errors: ConfigurationErrors = { colors: {} };

  if (result.success) {
    return { isValid: true, errors };
  }

  for (const issue of result.error.issues) {
    const [group, field] = issue.path;

    if (group === "recipientName" && !errors.recipientName) {
      errors.recipientName = getMessages(locale).Validation.recipientName;
    } else if (group === "euSize" && !errors.euSize) {
      errors.euSize = getMessages(locale).Validation.euSize;
    } else if (
      group === "colors" &&
      typeof field === "string" &&
      !errors.colors[field as SlipperColorSection]
    ) {
      const section = field as SlipperColorSection;
      const label = getMessages(locale).Zones[section].label;
      errors.colors[section] = getMessages(locale).Validation.colour.replace("{zone}", label);
    }
  }

  return { isValid: false, errors };
}
