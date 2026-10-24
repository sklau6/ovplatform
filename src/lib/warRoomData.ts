export type WarScenario = 'incident' | 'quarter' | 'design';

export interface WarMessage { agentId: string; text: string; action?: string; kind?: 'signal' | 'analysis' | 'challenge' | 'decision' }

export const WAR_SCENARIOS: Record<WarScenario, { label: string; note: string; decision: string; messages: WarMessage[] }> = {
  incident: {
    label: 'Crane incident',
    note: 'A suspended load alarm at the east core. The room must protect people, site and programme.',
    decision: 'Stop works in the crane radius; evacuate two work fronts; hold the critical lift until re-assured.',
    messages: [
      { agentId: 'sentinel', text: 'Load-moment alarm on TC-02. Wind at 14 m/s and rising. I am recommending an immediate stop.', kind: 'signal', action: 'Raise stop-work' },
      { agentId: 'keystone', text: 'Two crews are inside the exclusion radius. I can clear both fronts in 3 minutes without moving the critical path.', kind: 'analysis', action: 'Clear work fronts' },
      { agentId: 'terra', text: 'Typhoon signal is still T1. No environmental trigger, but the lift plan wind limit is 12 m/s. This is a plan breach.', kind: 'challenge' },
      { agentId: 'atlas', text: 'Holding the lift costs HK$180k/day. A dropped load is uninsurable. The economics are not close.', kind: 'decision' },
    ],
  },
  quarter: {
    label: 'Quarter close',
    note: 'September close is 48 hours out. Cash, margin and delivery need one reconciled view.',
    decision: 'Close with a HK$18M collections gap; release a recovery plan to the board; no change to FY27 envelope.',
    messages: [
      { agentId: 'atlas', text: 'Revenue is on plan but collections slipped HK$18M. I need VECTOR to confirm the TKO lease date before I sign the close.', kind: 'signal', action: 'Reconcile cash' },
      { agentId: 'vector', text: 'TKO lease is signed. Two renewals are at risk; the mark-to-market is +6.2% if we hold.', kind: 'analysis', action: 'Update rent roll' },
      { agentId: 'keystone', text: 'KE handover recovery still carries HK$7.2M of margin risk. I can pull the recovery gate forward by five days.', kind: 'analysis' },
      { agentId: 'atlas', text: 'Then we close with a disclosed gap and a recovery plan. No need to reforecast the full envelope.', kind: 'decision' },
    ],
  },
  design: {
    label: 'Design review',
    note: 'Federated model review before the Stage 4 gate. Clashes, carbon and cost must converge.',
    decision: 'Release the coordinated model to Stage 4 with three open clashes owned and dated.',
    messages: [
      { agentId: 'lumen', text: 'Federation is clean except three MEP–structure clashes. Two are resolved in the model, one needs a beam penetration.', kind: 'signal', action: 'Run clash audit' },
      { agentId: 'keystone', text: 'A penetration at L07 costs HK$46k and two days. I can sequence it into the next concrete pour.', kind: 'analysis' },
      { agentId: 'terra', text: 'The low-carbon concrete mix saves 28% embodied carbon. Approving it now avoids a redesign later.', kind: 'analysis' },
      { agentId: 'lumen', text: 'Then the model is releasable with three owned clashes. I will publish the CDE snapshot tonight.', kind: 'decision' },
    ],
  },
};

export const WAR_GATES = [
  { label: 'Evidence', owner: 'LUMEN', status: 'complete' },
  { label: 'Challenge', owner: 'SENTINEL', status: 'complete' },
  { label: 'COO approval', owner: 'T. Lau', status: 'pending' },
];
