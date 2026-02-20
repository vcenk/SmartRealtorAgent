import { describe, expect, it, vi } from 'vitest';
import { executeSkill } from '../src/executor';
import { kbSearchSkill } from '../src/kb-search';

const db = {
  searchKnowledge: vi.fn(async () => [
    { sourceId: 's1', title: 'KB1', snippet: 'Snippet', url: 'https://example.com' },
  ]),
  upsertLead: vi.fn(),
  appendConversationMessage: vi.fn(),
};

describe('kb.search', () => {
  it('returns passages and citations', async () => {
    const result = await executeSkill(
      kbSearchSkill,
      { query: 'hoa fee' },
      {
        tenantId: 't1',
        permissions: ['kb:read'],
        db,
      },
    );

    expect(result.passages[0].text).toBe('Snippet');
    expect(result.citations[0].sourceId).toBe('s1');
  });

  it('rejects without permission', async () => {
    await expect(
      executeSkill(kbSearchSkill, { query: 'x' }, { tenantId: 't1', permissions: [], db }),
    ).rejects.toThrow('Permission denied');
  });
});
