import { describe, expect, it, vi } from 'vitest';
import { executeSkill } from '../src/executor';
import { leadsUpsertSkill } from '../src/leads-upsert';

const db = {
  searchKnowledge: vi.fn(),
  upsertLead: vi.fn(async () => ({ leadId: 'lead_1' })),
  appendConversationMessage: vi.fn(),
};

describe('leads.upsert', () => {
  it('stores lead for tenant', async () => {
    const result = await executeSkill(
      leadsUpsertSkill,
      { leadPayload: { name: 'Alex' } },
      { tenantId: 't1', permissions: ['lead:write'], db },
    );

    expect(result.leadId).toBe('lead_1');
    expect(db.upsertLead).toHaveBeenCalledWith({ tenantId: 't1', payload: { name: 'Alex' } });
  });

  it('rejects without permission', async () => {
    await expect(
      executeSkill(
        leadsUpsertSkill,
        { leadPayload: { name: 'Alex' } },
        { tenantId: 't1', permissions: [], db },
      ),
    ).rejects.toThrow('Permission denied');
  });
});
