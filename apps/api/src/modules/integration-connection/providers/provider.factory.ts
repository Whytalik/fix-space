import { Injectable, NotFoundException } from "@nestjs/common";
import { IntegrationService } from "@fixspace/domain";
import { IntegrationProvider } from "./integration.provider";
import { BinanceProvider } from "./binance.provider";

@Injectable()
export class IntegrationProviderFactory {
  private readonly providers: Map<IntegrationService, IntegrationProvider>;

  constructor(private readonly binanceProvider: BinanceProvider) {
    this.providers = new Map<IntegrationService, IntegrationProvider>([[IntegrationService.BINANCE, this.binanceProvider]]);
  }

  get(service: IntegrationService): IntegrationProvider {
    const provider = this.providers.get(service);
    if (!provider) {
      throw new NotFoundException(`Integration provider for ${service} not found`);
    }
    return provider;
  }
}
