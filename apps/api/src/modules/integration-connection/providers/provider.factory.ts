import { Injectable, NotFoundException } from "@nestjs/common";
import { IntegrationService } from "@fixspace/domain";
import { IntegrationProvider } from "./integration.provider";
import { BinanceProvider } from "./binance.provider";
import { MetaTrader5Provider } from "./metatrader5.provider";

@Injectable()
export class IntegrationProviderFactory {
  private readonly providers: Map<IntegrationService, IntegrationProvider>;

  constructor(
    private readonly binanceProvider: BinanceProvider,
    private readonly mt5Provider: MetaTrader5Provider,
  ) {
    this.providers = new Map<IntegrationService, IntegrationProvider>([
      [IntegrationService.BINANCE, this.binanceProvider],
      [IntegrationService.METATRADER5, this.mt5Provider],
    ]);
  }

  get(service: IntegrationService): IntegrationProvider {
    const provider = this.providers.get(service);
    if (!provider) {
      throw new NotFoundException(`Integration provider for ${service} not found`);
    }
    return provider;
  }
}
