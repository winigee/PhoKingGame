import { characters, tierGates } from '../../content';
import {
  earnedMichelin,
  MICHELIN_FLAG,
  nextTierGate,
  relationshipMet,
  type ProgressionState,
} from '../progression';

const state = (over: Partial<ProgressionState> = {}): ProgressionState => ({
  tier: 1,
  cash: 0,
  reputation: 0,
  dispositions: {},
  collected: [],
  criticsSurvived: 0,
  flags: [],
  ...over,
});

describe('tier gates', () => {
  it('tier 2 needs cash and reputation', () => {
    expect(nextTierGate(state(), tierGates, characters)).toBeUndefined();
    expect(
      nextTierGate(state({ cash: 1500000, reputation: 25 }), tierGates, characters)?.tier
    ).toBe(2);
  });

  it('tier 4 additionally needs an INVESTOR at disposition 70+', () => {
    const rich = state({ tier: 3, cash: 999999999, reputation: 99 });
    expect(nextTierGate(rich, tierGates, characters)).toBeUndefined();
    const befriended = {
      ...rich,
      collected: ['auntie_chin'],
      dispositions: { auntie_chin: 70 },
    };
    expect(nextTierGate(befriended, tierGates, characters)?.tier).toBe(4);
    // Disposition without having met the character does not count.
    const stranger = { ...rich, dispositions: { auntie_chin: 90 } };
    expect(nextTierGate(stranger, tierGates, characters)).toBeUndefined();
  });

  it('tier 6 requires the Michelin star flag', () => {
    const ready = state({ tier: 5, cash: 999999999, reputation: 99 });
    expect(nextTierGate(ready, tierGates, characters)).toBeUndefined();
    expect(
      nextTierGate({ ...ready, flags: [MICHELIN_FLAG] }, tierGates, characters)?.tier
    ).toBe(6);
  });
});

describe('relationshipMet', () => {
  it('matches by specific character or by faction', () => {
    const s = state({ collected: ['chef_bao'], dispositions: { chef_bao: 65 } });
    expect(relationshipMet({ characterId: 'chef_bao', minDisposition: 60 }, s, characters)).toBe(true);
    expect(relationshipMet({ faction: 'CHEF', minDisposition: 60 }, s, characters)).toBe(true);
    expect(relationshipMet({ faction: 'CHEF', minDisposition: 70 }, s, characters)).toBe(false);
    expect(relationshipMet({ faction: 'GANG', minDisposition: 60 }, s, characters)).toBe(false);
  });
});

describe('earnedMichelin', () => {
  it('needs tier 5 and two surviving critic visits, once only', () => {
    expect(earnedMichelin(state({ tier: 5, criticsSurvived: 1 }))).toBe(false);
    expect(earnedMichelin(state({ tier: 4, criticsSurvived: 2 }))).toBe(false);
    expect(earnedMichelin(state({ tier: 5, criticsSurvived: 2 }))).toBe(true);
    expect(
      earnedMichelin(state({ tier: 5, criticsSurvived: 2, flags: [MICHELIN_FLAG] }))
    ).toBe(false);
  });
});
