import {
  slipperConfigurationSchema,
  type SlipperColorSection,
  type SlipperConfiguration,
} from "@/domain/slipper";

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
): ConfigurationValidationState {
  const result = slipperConfigurationSchema.safeParse(configuration);
  const errors: ConfigurationErrors = { colors: {} };

  if (result.success) {
    return { isValid: true, errors };
  }

  for (const issue of result.error.issues) {
    const [group, field] = issue.path;

    if (group === "recipientName" && !errors.recipientName) {
      errors.recipientName = issue.message;
    } else if (group === "euSize" && !errors.euSize) {
      errors.euSize = issue.message;
    } else if (
      group === "colors" &&
      typeof field === "string" &&
      !errors.colors[field as SlipperColorSection]
    ) {
      errors.colors[field as SlipperColorSection] = issue.message;
    }
  }

  return { isValid: false, errors };
}
