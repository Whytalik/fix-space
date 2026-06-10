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
      return this.formatResult(result, resultType as unknown as PropertyType);
    } catch (error) {
      this.logger.warn("Formula evaluation failed", { error: (error as Error).message });
      return null;
    }
  }

  validateExpression(expression: string): void {
    jsep(expression);
  }

  private evalNode(node: jsep.Expression, ctx: Record<string, unknown>): unknown {
    switch (node.type) {
      case "Literal":
        return (node as jsep.Literal).value;

      case "Identifier": {
        const name = (node as jsep.Identifier).name;
        return name in ctx ? ctx[name] : null;
      }

      case "BinaryExpression": {
        const n = node as jsep.BinaryExpression;
        const left = this.evalNode(n.left, ctx);
        const right = this.evalNode(n.right, ctx);
        return this.applyBinary(n.operator, left, right);
      }

      case "UnaryExpression": {
        const n = node as jsep.UnaryExpression;
        return this.applyUnary(n.operator, this.evalNode(n.argument, ctx));
      }

      case "ConditionalExpression": {
        const n = node as jsep.ConditionalExpression;
        return this.evalNode(n.test, ctx) ? this.evalNode(n.consequent, ctx) : this.evalNode(n.alternate, ctx);
      }

      case "CallExpression": {
        const n = node as jsep.CallExpression;
        const fnName = ((n.callee as jsep.Identifier).name ?? "").toUpperCase();
        const args = n.arguments.map((a) => this.evalNode(a as jsep.Expression, ctx));
        return this.callBuiltin(fnName, args);
      }

      case "ArrayExpression": {
        const n = node as jsep.ArrayExpression;
        return n.elements.map((e) => (e ? this.evalNode(e, ctx) : null));
      }

      case "MemberExpression": {
        const n = node as jsep.MemberExpression;
        const obj = this.evalNode(n.object, ctx);
        if (obj === null || obj === undefined || typeof obj !== "object") return null;
        const key = n.computed ? this.evalNode(n.property, ctx) : (n.property as jsep.Identifier).name;
        return (obj as Record<string, unknown>)[key as string] ?? null;
      }

      default:
        throw new Error(`Unsupported AST node: ${node.type}`);
    }
  }

  private applyBinary(op: string, left: unknown, right: unknown): unknown {
    switch (op) {
      case "+":
        return typeof left === "string" || typeof right === "string"
          ? String(left ?? "") + String(right ?? "")
          : (left as number) + (right as number);
      case "-":
        return (left as number) - (right as number);
      case "*":
        return (left as number) * (right as number);
      case "/": {
        const r = right as number;
        return r === 0 ? null : (left as number) / r;
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
        throw new Error(`Unknown binary operator: ${op}`);
    }
  }

  private applyUnary(op: string, arg: unknown): unknown {
    switch (op) {
      case "-":
        return -(arg as number);
      case "+":
        return +(arg as number);
      case "!":
        return !arg;
      default:
        throw new Error(`Unknown unary operator: ${op}`);
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
        const arr = Array.isArray(args[0]) ? (args[0] as unknown[]) : [];
        return arr.reduce<number>((acc, v) => acc + (typeof v === "number" ? v : 0), 0);
      }

      case "AVG": {
        const arr = Array.isArray(args[0]) ? (args[0] as unknown[]) : [];
        const nums = arr.filter((v): v is number => typeof v === "number");
        return nums.length === 0 ? null : nums.reduce((a, b) => a + b, 0) / nums.length;
      }

      case "COUNT": {
        const arr = Array.isArray(args[0]) ? args[0] : [];
        return arr.filter((v) => v !== null && v !== undefined).length;
      }

      case "MIN": {
        const arr = Array.isArray(args[0]) ? (args[0] as unknown[]) : [];
        const nums = arr.filter((v): v is number => typeof v === "number");
        return nums.length === 0 ? null : Math.min(...nums);
      }

      case "MAX": {
        const arr = Array.isArray(args[0]) ? (args[0] as unknown[]) : [];
        const nums = arr.filter((v): v is number => typeof v === "number");
        return nums.length === 0 ? null : Math.max(...nums);
      }

      case "COUNT_TRUE": {
        const arr = Array.isArray(args[0]) ? args[0] : [];
        return arr.filter(Boolean).length;
      }

      case "IF":
        return args[0] ? args[1] : args[2];

      case "MAP": {
        const arr = Array.isArray(args[0]) ? (args[0] as Record<string, unknown>[]) : [];
        const key = args[1] as string;
        return arr.map((item) => (item !== null && item !== undefined && typeof item === "object" ? (item[key] ?? null) : null));
      }

      case "DATE_DIFF": {
        const d1 = new Date(args[0] as string | number | Date);
        const d2 = new Date(args[1] as string | number | Date);
        if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;
        const ms = Math.abs(d2.getTime() - d1.getTime());
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
