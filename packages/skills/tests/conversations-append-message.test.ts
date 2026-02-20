import { describe, expect, it, vi } from 'vitest';
import { executeSkill } from '../src/executor';
import { appendConversationMessageSkill } from '../src/conversations-append-message';

const db = {
  searchKnowledge: vi.fn(),
  upsertLead: vi.fn(),
  appendConversationMessage: vi.fn(async () => ({ messageId: 'msg_1' })),
};

describe('conversations.appendMessage', () => {
  it('appends message', async () => {
    const result = await executeSkill(
      appendConversationMessageSkill,
      { role: 'user', content: 'Hi there' },
      {
        tenantId: 't1',
        conversationId: 'c1',
        permissions: ['conversation:write'],
        db,
      },
    );

    expect(result.messageId).toBe('msg_1');
  });

  it('blocks when missing permission', async () => {
    await expect(
      executeSkill(
        appendConversationMessageSkill,
        { role: 'user', content: 'Hi there' },
        {
          tenantId: 't1',
          conversationId: 'c1',
          permissions: [],
          db,
        },
      ),
    ).rejects.toThrow('Permission denied');
  });
});
