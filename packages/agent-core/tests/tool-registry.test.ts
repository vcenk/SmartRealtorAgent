import { z } from 'zod';
import { describe, expect, it } from 'vitest';
import { ToolRegistry } from '../src/tool-registry';

describe('ToolRegistry', () => {
  it('validates input/output and executes tools', async () => {
    const registry = new ToolRegistry();
    registry.register({
      name: 'demo.tool',
      description: 'demo',
      inputSchema: z.object({ value: z.string() }),
      outputSchema: z.object({ ok: z.boolean() }),
      permissionGate: () => true,
      execute: async () => ({ ok: true }),
    });

    const result = await registry.execute('demo.tool', { value: 'x' }, { tenantId: 't1' });
    expect(result).toEqual({ ok: true });
  });

  it('throws for unknown tool', async () => {
    const registry = new ToolRegistry();
    await expect(registry.execute('missing', {}, { tenantId: 't1' })).rejects.toThrow(
      'Unknown tool',
    );
  });
});
