import { ZodError } from 'zod';
import type { ToolDefinition, ToolExecutionContext } from './types';

export class ToolRegistry {
  private readonly tools = new Map<string, ToolDefinition<any, any>>();

  register<I, O>(tool: ToolDefinition<I, O>): void {
    this.tools.set(tool.name, tool as ToolDefinition<any, any>);
  }

  get(toolName: string): ToolDefinition<any, any> | undefined {
    return this.tools.get(toolName);
  }

  list(): string[] {
    return [...this.tools.keys()];
  }

  async execute(toolName: string, input: unknown, context: ToolExecutionContext): Promise<unknown> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    const allowed = await tool.permissionGate(context);
    if (!allowed) {
      throw new Error(`Permission denied for tool: ${toolName}`);
    }

    let parsedInput: unknown;
    try {
      parsedInput = tool.inputSchema.parse(input);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Invalid tool input for ${toolName}: ${error.message}`);
      }
      throw error;
    }

    const output = await tool.execute(parsedInput, context);
    try {
      return tool.outputSchema.parse(output);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Invalid tool output for ${toolName}: ${error.message}`);
      }
      throw error;
    }
  }
}
