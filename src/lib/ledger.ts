import type { LedgerBlock, Tx } from './types';

export async function sha256Hex(input: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const data = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Deterministic fallback for restricted contexts.
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < input.length; i++) {
    h1 ^= input.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
    h2 = Math.imul(h2 ^ input.charCodeAt(i), 0x85ebca6b);
  }
  const part = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  return (part(h1) + part(h2) + part(h1 ^ h2) + part(h1 + h2) + part(h1) + part(h2) + part(h1 ^ h2) + part(h1 + h2)).slice(0, 64);
}

export function randomHex(len = 64): string {
  const bytes = new Uint8Array(len / 2);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

const SEED_TX: Array<Omit<Tx, 'hash'>> = [
  { id: 'TX-88214', type: 'ASSET_ANCHOR', subject: 'KT-01 · Ophylla Kai Tak Tower I', detail: 'BIM revision v7.2 anchored · 42 storeys · 286 sensor bindings', actor: 'A. Cheng' },
  { id: 'TX-88213', type: 'CARBON_RETIRE', subject: 'Harbourview Residences', detail: '420 tCO₂e retired · VCS-2026-HK-0912', actor: 'V. Tsang', value: 420 },
  { id: 'TX-88212', type: 'WORK_ORDER', subject: 'KE-04 · Skyline Civic Centre', detail: 'BMS controller escalation · SLA 4h · vendor dispatched', actor: 'Ops desk' },
  { id: 'TX-88211', type: 'MODEL_AUDIT', subject: 'TwinFM v2.3', detail: 'Evaluation run 1,284 assets · accuracy 94.2% · drift 1.2%', actor: 'Model governance' },
  { id: 'TX-88210', type: 'HANDOVER', subject: 'KT-02 · Kai Tak Tower II', detail: 'Level 18–24 practical completion pack · 41 documents', actor: 'R. Ma' },
  { id: 'TX-88209', type: 'CARBON_TRANSFER', subject: 'Marina Central → Ophylla SPV', detail: '180 tCO₂e transferred · serial VCU-26-4471', actor: 'V. Tsang', value: 180 },
  { id: 'TX-88208', type: 'ASSET_ANCHOR', subject: 'KE-01 · Kowloon East Campus A', detail: 'As-built model intake · variance 1.8% · clash register sealed', actor: 'M. Lee' },
  { id: 'TX-88207', type: 'WORK_ORDER', subject: 'CH-03 · Central Market Place', detail: 'Refrigeration anomaly work order raised · priority P2', actor: 'Ops desk' },
  { id: 'TX-88206', type: 'MODEL_AUDIT', subject: 'GridSense v4.0', detail: 'Setpoint recommendation batch 42 · 38 accepted by operators', actor: 'Model governance' },
];

const VALIDATORS = ['opv-validator-03', 'opv-validator-07', 'hk-node-12', 'opv-validator-01'];

export async function createLedger(): Promise<LedgerBlock[]> {
  const blocks: LedgerBlock[] = [];
  const now = Date.now();
  let previousHash = '0x' + (await sha256Hex('ophylla-genesis-2024'));
  for (let i = 0; i < 9; i++) {
    const height = 18204 + i;
    const txSeed = SEED_TX[(i * 2) % SEED_TX.length];
    const transactions: Tx[] = [];
    const txCount = i === 8 ? 3 : 1;
    for (let t = 0; t < txCount; t++) {
      const raw = SEED_TX[(i * 2 + t) % SEED_TX.length];
      const body = `${raw.id}-${height}-${t}-${i}`;
      transactions.push({ ...raw, id: `${raw.id}-${i}${t}`, hash: '0x' + (await sha256Hex(body)) });
    }
    const timestamp = now - (8 - i) * 6 * 60 * 1000;
    const nonce = 18422 + i * 137;
    const hash = await sha256Hex(`${previousHash}${height}${timestamp}${nonce}${transactions.map((t) => t.id).join('')}`);
    blocks.push({
      index: i,
      height,
      timestamp,
      previousHash,
      hash: '0x' + hash,
      nonce,
      validator: VALIDATORS[i % VALIDATORS.length],
      txCount: transactions.length,
      transactions,
    });
    previousHash = '0x' + hash;
  }
  return blocks;
}

export async function appendBlock(previous: LedgerBlock, transactions: Tx[]): Promise<LedgerBlock> {
  const timestamp = Date.now();
  const height = previous.height + 1;
  const nonce = previous.nonce + 97;
  const hash = await sha256Hex(`${previous.hash}${height}${timestamp}${nonce}${transactions.map((t) => t.id).join('')}`);
  return {
    index: previous.index + 1,
    height,
    timestamp,
    previousHash: previous.hash,
    hash: '0x' + hash,
    nonce,
    validator: VALIDATORS[height % VALIDATORS.length],
    txCount: transactions.length,
    transactions,
  };
}

export async function verifyChain(blocks: LedgerBlock[]): Promise<boolean> {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (i > 0 && b.previousHash !== blocks[i - 1].hash) return false;
    const hash = await sha256Hex(`${b.previousHash}${b.height}${b.timestamp}${b.nonce}${b.transactions.map((t) => t.id).join('')}`);
    if ('0x' + hash !== b.hash) return false;
  }
  return true;
}
