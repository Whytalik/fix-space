import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { PropertyType } from "@nucleus/domain";
import { PropertyTypeHandler } from "./handler.interface";
import { PROPERTY_TYPE_HANDLERS } from "./property-type.tokens";

@Injectable()
export class PropertyTypeRegistry implements OnModuleInit {
  private readonly handlers = new Map<PropertyType, PropertyTypeHandler>();

  constructor(
    @Inject(PROPERTY_TYPE_HANDLERS)
    private readonly handlerList: PropertyTypeHandler[],
  ) {}

  onModuleInit(): void {
    for (const handler of this.handlerList) {
      if (this.handlers.has(handler.type)) {
        throw new Error(`Duplicate PropertyTypeHandler registered for type: ${handler.type}`);
      }
      this.handlers.set(handler.type, handler);
    }
  }

  getHandler(type: PropertyType): PropertyTypeHandler {
    const handler = this.handlers.get(type);
    if (!handler) {
      throw new Error(`No handler registered for property type: ${type}`);
    }
    return handler;
  }

  hasHandler(type: PropertyType): boolean {
    return this.handlers.has(type);
  }
}
