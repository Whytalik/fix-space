import { Injectable } from "@nestjs/common";
import jsep from "jsep";
import { PropertyType } from "@fixspace/database";
import type { FormulaPropertyConfig } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";

@Injectable()
export class FormulaEngine {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext(FormulaEngine.name);
  }

  evaluate(config: FormulaPropertyConfig, context: Record<string, unknown>): unknown {
    this.logger.debug("Evaluating formula", { preset: config.presetName });

    try {
      const { expression, resultType } = config;
      if (!expression) return null;

      const ast = jsep(expression);
      const result = this.evalNode(ast, context);
      const finalType = (resultType as unknown as PropertyType) || this.inferType(result);
      return this.formatResult(result, finalType);
    } catch (error) {
      this.logger.warn("Formula evaluation failed", { error: (error as Error).message });
      return null;
    }
  }

  validateExpression(expression: string): void {
    jsep(expression);
  }

  private inferType(value: unknown): PropertyType {
    if (value === null || value === undefined) return PropertyType.TEXT;

    if (typeof value === "number") return PropertyType.NUMBER;
    if (typeof value === "boolean") return PropertyType.CHECKBOX;

    if (value instanceof Date && !isNaN(value.getTime())) return PropertyType.DATE;

    if (typeof value === "string") {
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        return PropertyType.DATE;
      }
      return PropertyType.TEXT;
    }

    return PropertyType.TEXT;
  }

  private evalNode(node: jsep.Expression, context: Record<string, unknown>): unknown {
    switch (node.type) {
      case "Literal":
        return (node as jsep.Literal).value;

      case "Identifier": {
        const name = (node as jsep.Identifier).name;
        return name in context ? context[name] : null;
      }

      case "BinaryExpression": {
        const binaryExpression = node as jsep.BinaryExpression;
        const left = this.evalNode(binaryExpression.left, context);
        const right = this.evalNode(binaryExpression.right, context);
        return this.applyBinary(binaryExpression.operator, left, right);
      }

      case "UnaryExpression": {
        const unaryExpression = node as jsep.UnaryExpression;
        return this.applyUnary(unaryExpression.operator, this.evalNode(unaryExpression.argument, context));
      }

      case "ConditionalExpression": {
        const conditionalExpression = node as jsep.ConditionalExpression;
        return this.evalNode(conditionalExpression.test, context)
          ? this.evalNode(conditionalExpression.consequent, context)
          : this.evalNode(conditionalExpression.alternate, context);
      }

      case "CallExpression": {
        const callExpression = node as jsep.CallExpression;
        const callee = callExpression.callee as jsep.Identifier;
        if (!callee.name) {
          throw new Error("Only direct function calls are supported (e.g., ABS(x)), not member expressions (e.g., Math.abs(x))");
        }
        const fnName = callee.name.toUpperCase();
        const args = callExpression.arguments.map((arg) => this.evalNode(arg as jsep.Expression, context));
        return this.callBuiltin(fnName, args);
      }

      case "ArrayExpression": {
        const arrayExpression = node as jsep.ArrayExpression;
        return arrayExpression.elements.map((element) => (element ? this.evalNode(element, context) : null));
      }

      case "MemberExpression": {
        const memberExpression = node as jsep.MemberExpression;
        const target = this.evalNode(memberExpression.object, context);
        if (target === null || target === undefined || typeof target !== "object") return null;
        const key = memberExpression.computed
          ? this.evalNode(memberExpression.property, context)
          : (memberExpression.property as jsep.Identifier).name;
        return (target as Record<string, unknown>)[key as string] ?? null;
      }

      default:
        throw new Error(`Unsupported AST node: ${node.type}`);
    }
  }

  private applyBinary(operator: string, left: unknown, right: unknown): unknown {
    switch (operator) {
      case "+":
        return typeof left === "string" || typeof right === "string"
          ? String(left ?? "") + String(right ?? "")
          : (left as number) + (right as number);
      case "-":
        return (left as number) - (right as number);
      case "*":
        return (left as number) * (right as number);
      case "/": {
        const divisor = right as number;
        return divisor === 0 ? null : (left as number) / divisor;
      }
      case "%":
        return (left as number) % (right as number);
      case "==":
      case "===":
        return left === right;
      case "!=":
      case "!==":
        return left !== right;
      case ">":
        return (left as number) > (right as number);
      case "<":
        return (left as number) < (right as number);
      case ">=":
        return (left as number) >= (right as number);
      case "<=":
        return (left as number) <= (right as number);
      case "&&":
        return left && right;
      case "||":
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        return left || right;
      default:
        throw new Error(`Unknown binary operator: ${operator}`);
    }
  }

  private applyUnary(operator: string, operand: unknown): unknown {
    switch (operator) {
      case "-":
        return -(operand as number);
      case "+":
        return +(operand as number);
      case "!":
        return !operand;
      default:
        throw new Error(`Unknown unary operator: ${operator}`);
    }
  }

  private callBuiltin(name: string, args: unknown[]): unknown {
    switch (name) {
      case "ABS":
        return Math.abs(args[0] as number);

      case "ROUND":
        if (args.length >= 2) {
          const factor = Math.pow(10, args[1] as number);
          return Math.round((args[0] as number) * factor) / factor;
        }
        return Math.round(args[0] as number);

      case "SUM": {
        const items = Array.isArray(args[0]) ? (args[0] as unknown[]) : [];
        return items.reduce<number>((acc, value) => acc + (typeof value === "number" ? value : 0), 0);
      }

      case "AVG": {
        const items = Array.isArray(args[0]) ? (args[0] as unknown[]) : [];
        const nums = items.filter((value): value is number => typeof value === "number");
        return nums.length === 0 ? null : nums.reduce((acc, value) => acc + value, 0) / nums.length;
      }

      case "COUNT": {
        const items = Array.isArray(args[0]) ? args[0] : [];
        return items.filter((value) => value !== null && value !== undefined).length;
      }

      case "MIN": {
        const items = Array.isArray(args[0]) ? (args[0] as unknown[]) : [];
        const nums = items.filter((value): value is number => typeof value === "number");
        return nums.length === 0 ? null : Math.min(...nums);
      }

      case "MAX": {
        const items = Array.isArray(args[0]) ? (args[0] as unknown[]) : [];
        const nums = items.filter((value): value is number => typeof value === "number");
        return nums.length === 0 ? null : Math.max(...nums);
      }

      case "COUNT_TRUE": {
        const items = Array.isArray(args[0]) ? args[0] : [];
        return items.filter(Boolean).length;
      }

      case "IF":
        return args[0] ? args[1] : args[2];

      case "MAP": {
        const items = Array.isArray(args[0]) ? (args[0] as Record<string, unknown>[]) : [];
        const key = args[1] as string;
        return items.map((item) => (item !== null && item !== undefined && typeof item === "object" ? (item[key] ?? null) : null));
      }

      case "DATE_DIFF": {
        const startDate = new Date(args[0] as string | number | Date);
        const endDate = new Date(args[1] as string | number | Date);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;
        const ms = Math.abs(endDate.getTime() - startDate.getTime());
        const unit = (args[2] as string) ?? "days";
        switch (unit) {
          case "minutes":
            return ms / (1000 * 60);
          case "hours":
            return ms / (1000 * 60 * 60);
          case "weeks":
            return ms / (1000 * 60 * 60 * 24 * 7);
          default:
            return ms / (1000 * 60 * 60 * 24);
        }
      }

      default:
        throw new Error(`Unknown function: ${name}`);
    }
  }

  private formatResult(result: unknown, resultType: PropertyType): unknown {
    if (result === undefined || result === null || (typeof result === "number" && isNaN(result))) {
      return null;
    }
    switch (resultType) {
      case PropertyType.NUMBER:
      case PropertyType.RATING:
      case PropertyType.PROGRESS:
      case PropertyType.DURATION:
        return typeof result === "number" ? result : parseFloat(String(result));
      case PropertyType.TEXT:
        return String(result);
      case PropertyType.CHECKBOX:
        return Boolean(result);
      case PropertyType.DATE:
        return new Date(result as string | number | Date).toISOString();
      default:
        return result;
    }
  }
}
