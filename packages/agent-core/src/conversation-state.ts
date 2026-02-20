export type LeadState = 'NEW' | 'ENGAGED' | 'QUALIFYING' | 'CAPTURED' | 'PAUSED';

export type LeadQualification = {
  name?: string;
  contact?: string;
  timeline?: string;
  area?: string;
  budget?: string;
  sellingContext?: string;
};

export type ConversationSnapshot = {
  state: LeadState;
  qualification: LeadQualification;
};

const transitions: Record<LeadState, LeadState[]> = {
  NEW: ['ENGAGED', 'PAUSED'],
  ENGAGED: ['QUALIFYING', 'PAUSED'],
  QUALIFYING: ['CAPTURED', 'PAUSED'],
  CAPTURED: ['PAUSED'],
  PAUSED: ['ENGAGED'],
};

export class ConversationState {
  private snapshot: ConversationSnapshot = {
    state: 'NEW',
    qualification: {},
  };

  get(): ConversationSnapshot {
    return this.snapshot;
  }

  transition(next: LeadState): ConversationSnapshot {
    const allowed = transitions[this.snapshot.state].includes(next);
    if (!allowed) {
      throw new Error(`Invalid state transition: ${this.snapshot.state} -> ${next}`);
    }
    this.snapshot = { ...this.snapshot, state: next };
    return this.snapshot;
  }

  updateQualification(update: LeadQualification): ConversationSnapshot {
    this.snapshot = {
      ...this.snapshot,
      qualification: {
        ...this.snapshot.qualification,
        ...update,
      },
    };
    return this.snapshot;
  }

  canCapture(): boolean {
    const q = this.snapshot.qualification;
    return Boolean(q.name && q.contact && q.timeline);
  }
}
