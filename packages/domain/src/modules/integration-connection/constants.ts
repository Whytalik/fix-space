import { IntegrationService } from "./dto/requests/create-integration-connection.dto";

export const SERVICE_LIMITS: Record<IntegrationService, number> = {
  [IntegrationService.BINANCE]: 1,
  [IntegrationService.METATRADER5]: 5,
};

export interface IntegrationField {
  id: string;
  labelKey: string;
  placeholderKey: string;
  type?: "text" | "password";
}

export interface IntegrationMetadata {
  service: IntegrationService;
  label: string;
  descriptionKey: string;
  fields: IntegrationField[];
}

export const INTEGRATION_METADATA: Record<IntegrationService, IntegrationMetadata> = {
  [IntegrationService.BINANCE]: {
    service: IntegrationService.BINANCE,
    label: "Binance",
    descriptionKey: "binanceDescription",
    fields: [
      { id: "apiKey", labelKey: "apiKey", placeholderKey: "apiKeyPlaceholder" },
      { id: "apiSecret", labelKey: "apiSecret", placeholderKey: "apiSecretPlaceholder", type: "password" },
    ],
  },
  [IntegrationService.METATRADER5]: {
    service: IntegrationService.METATRADER5,
    label: "MetaTrader 5",
    descriptionKey: "mt5Description",
    fields: [],
  },
};
