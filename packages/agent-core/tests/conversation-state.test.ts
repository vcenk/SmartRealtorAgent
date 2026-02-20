import { describe, expect, it } from 'vitest';
import { ConversationState } from '../src/conversation-state';

describe('ConversationState', () => {
  it('handles valid state transitions', () => {
    const state = new ConversationState();
    state.transition('ENGAGED');
    state.transition('QUALIFYING');
    expect(state.get().state).toBe('QUALIFYING');
  });

  it('rejects invalid transitions', () => {
    const state = new ConversationState();
    expect(() => state.transition('CAPTURED')).toThrow('Invalid state transition');
  });

  it('tracks qualification completeness', () => {
    const state = new ConversationState();
    state.updateQualification({ name: 'A', contact: 'a@example.com', timeline: '30 days' });
    expect(state.canCapture()).toBe(true);
  });
});
