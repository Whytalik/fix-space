import { BadRequestException, Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { PropertyType } from "@fixspace/domain";
import { t } from "@/common/utils/i18n.helper";
import { PropertyConfigHandler, PropertyQueryHandler, PropertyValueHandler } from "./interfaces";
import { PROPERTY_TYPE_HANDLERS } from "./property-type.tokens";

type FullHandler = PropertyConfigHandler & PropertyValueHandler & PropertyQueryHandler;

@Injectable()
export class PropertyTypeRegistry implements OnModuleInit {
  private readonly handlers = new Map<PropertyType, FullHandler>();

  constructor(
    @Inject(PROPERTY_TYPE_HANDLERS)
    private readonly handlerInstances: FullHandler[],
  ) {}

  onModuleInit(): void {
    for (const handler of this.handlerInstances) {
      if (this.handlers.has(handler.type)) {
        throw new Error(`Duplicate PropertyTypeHandler registered for type: ${handler.type}`);
      }
      this.handlers.set(handler.type, handler);
    }
  }

  getConfigHandler(type: PropertyType): PropertyConfigHandler {
    const handler = this.handlers.get(type);
    if (!handler) {
      throw new BadRequestException(t("errors.PROPERTY_TYPE_NOT_REGISTERED", { type }));
    }
    return handler;
  }

  getValueHandler(type: PropertyType): PropertyValueHandler {
    const handler = this.handlers.get(type);
    if (!handler) {
      throw new BadRequestException(t("errors.PROPERTY_TYPE_NOT_REGISTERED", { type }));
    }
    return handler;
  }

  getQueryHandler(type: PropertyType): PropertyQueryHandler {
    const handler = this.handlers.get(type);
    if (!handler) {
      throw new BadRequestException(t("errors.PROPERTY_TYPE_NOT_REGISTERED", { type }));
    }
    return handler;
  }

  resolveHandlerAndConfig(property: { type: string; config: unknown }): {
    handler: FullHandler;
    config: Record<string, unknown>;
  } {
    const handler = this.handlers.get(property.type as PropertyType);
    if (!handler) {
      throw new BadRequestException(t("errors.PROPERTY_TYPE_NOT_REGISTERED", { type: property.type }));
    }
    return { handler, config: (property.config as Record<string, unknown>) ?? {} };
  }
}
