import { BadRequestException, Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { PropertyType } from "@fixspace/domain";
import { PropertyConfigHandler, PropertyValueHandler } from "./handler.interface";
import { PROPERTY_TYPE_HANDLERS } from "./property-type.tokens";

type FullHandler = PropertyConfigHandler & PropertyValueHandler;

@Injectable()
export class PropertyTypeRegistry implements OnModuleInit {
  private readonly handlers = new Map<PropertyType, FullHandler>();

  constructor(
    @Inject(PROPERTY_TYPE_HANDLERS)
    private readonly handlerList: FullHandler[],
  ) {}

  onModuleInit(): void {
    for (const handler of this.handlerList) {
      if (this.handlers.has(handler.type)) {
        throw new Error(`Duplicate PropertyTypeHandler registered for type: ${handler.type}`);
      }
      this.handlers.set(handler.type, handler);
    }
  }

  getConfigHandler(type: PropertyType): PropertyConfigHandler {
    const handler = this.handlers.get(type);
    if (!handler) {
      throw new BadRequestException(`No handler registered for property type: ${type}`);
    }
    return handler;
  }

  getValueHandler(type: PropertyType): PropertyValueHandler {
    const handler = this.handlers.get(type);
    if (!handler) {
      throw new BadRequestException(`No handler registered for property type: ${type}`);
    }
    return handler;
  }
}
