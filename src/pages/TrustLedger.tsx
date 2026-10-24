import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowLeftRight, ArrowRight, Box, Check, CheckCircle2, ChevronRight, CircleAlert, Copy,
  Cpu, Database, FileCheck2, Fingerprint, GitBranch, Globe2, Hash, Layers, Leaf, Link2,
  Loader2, Lock, ShieldCheck, Sparkles, TriangleAlert, Wrench, XCircle, Zap, ExternalLink,
} from 'lucide-react';
import { Badge, Button, LiveTag, Modal, Panel, Progress, Segmented } from '../components/ui';
import { ASSETS, assetById } from '../lib/data';
import type { LedgerBlock, Tx } from '../lib/types';
import { appendBlock, createLedger, sha256Hex, verifyChain } from '../lib/ledger';
import { TrustChainScene } from '../components/TrustChainScene';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn, hkTime, shortHash } from '../lib/utils';

const TX_META: Record<Tx['type'], { icon: typeof Box; label: string; tone: string }> = {
  ASSET_ANCHOR: { icon: Box, label: 'Asset anchor', tone: 'var(--accent)' },
  CARBON_RETIRE: { icon: Leaf, label: 'Carbon retirement', tone: '#3ee0a1' },
  CARBON_TRANSFER: { icon: ArrowLeftRight, label: 'Carbon transfer', tone: 'var(--cyan)' },
  WORK_ORDER: { icon: Wrench, label: 'Work order', tone: 'var(--amber)' },
  MODEL_AUDIT: { icon: Cpu, label: 'Model audit', tone: 'var(--violet)' },
  HANDOVER: { icon: FileCheck2, label: 'Handover', tone: 'var(--cyan)' },
};

interface Credit {
  id: string;
  serial: string;
  project: string;
  vintage: string;
  tonnes: number;
  status: 'available' | 'retired' | 'listed';
  owner: string;
}

const INITIAL_CREDITS: Credit[] = [
  { id: 'CC-1021', serial: 'VCU-26-4471', project: 'TKO Energy Retrofit', vintage: '2025', tonnes: 420, status: 'retired', owner: 'Ophylla SPV' },
  { id: 'CC-1022', serial: 'VCU-26-4482', project: 'Kai Tak Demand Response', vintage: '2026', tonnes: 640, status: 'listed', owner: 'Ophylla Ventures' },
  { id: 'CC-1023', serial: 'VCU-26-4491', project: 'Harbourview Retrofit', vintage: '2026', tonnes: 240, status: 'available', owner: 'Harbourview Owners Corp.' },
  { id: 'CC-1024', serial: 'VCU-25-3917', project: 'Kowloon East Solar Canopy', vintage: '2025', tonnes: 384, status: 'available', owner: 'KE Campus SPV' },
];

function passportPayload(asset: (typeof ASSETS)[number], energyOverride?: number) {
  return {
    asset_id: asset.id,
    name: asset.name,
    district: asset.district,
    gfa_ft2: asset.gfa,
    energy_intensity: energyOverride ?? asset.energy,
    occupancy: asset.occupancy,
    model_urn: asset.modelUrn,
    model_version: asset.modelVersion,
    sensors: asset.sensors,
    lease_expiry: asset.leaseExpiry,
  };
}

function CodeLine({ line }: { line: string }) {
  const trimmed = line.trim();
  if (trimmed.startsWith('//')) return <div className="text-[#5f7d70]">{line}</div>;
  const parts = line.split(/(function|event|contract|struct|mapping|public|external|returns|emit|require|onlyRole|bytes32|uint64|address)/g);
  return (
    <div className="text-[#a9bccb]">
      {parts.map((p, i) => (
        /^(function|event|contract|struct|mapping|public|external|returns|emit|require|onlyRole|bytes32|uint64|address)$/.test(p)
          ? <span key={i} className="text-[#c4b5fd]">{p}</span>
          : <span key={i}>{p}</span>
      ))}
    </div>
  );
}

export function TrustLedger() {
  const [params, setParams] = useSearchParams();
  const { toast } = useLive();
  const { t } = useI18n();
  const [blocks, setBlocks] = useState<LedgerBlock[]>([]);
  const [selectedHeight, setSelectedHeight] = useState<number | null>(null);
  const [chain3d, setChain3d] = useState(true);
  const [loading, setLoading] = useState(true);
  const [integrity, setIntegrity] = useState<'idle' | 'verifying' | 'valid' | 'invalid'>('idle');
  const [anchoring, setAnchoring] = useState(false);
  const [assetId, setAssetId] = useState(params.get('asset') ?? 'KT-01');
  const [tampered, setTampered] = useState(false);
  const [digest, setDigest] = useState('');
  const [anchoredDigest, setAnchoredDigest] = useState('');
  const [credits, setCredits] = useState<Credit[]>(INITIAL_CREDITS);
  const [creditAction, setCreditAction] = useState<{ credit: Credit; action: 'transfer' | 'retire' } | null>(null);
  const [recipient, setRecipient] = useState('Ophylla Ventures');
  const [tonnes, setTonnes] = useState(100);
  const [processing, setProcessing] = useState(false);
  const autoAnchored = useRef(false);

  const latest = blocks[blocks.length - 1];
  const selected = blocks.find((b) => b.height === selectedHeight) ?? latest;
  const asset = assetById(assetId) ?? ASSETS[0];

  useEffect(() => {
    let alive = true;
    createLedger().then((chain) => {
      if (!alive) return;
      setBlocks(chain);
      setSelectedHeight(chain[chain.length - 1].height);
      setLoading(false);
      verifyChain(chain).then((ok) => alive && setIntegrity(ok ? 'valid' : 'invalid'));
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    Promise.all([
      sha256Hex(JSON.stringify(passportPayload(asset))),
      sha256Hex(JSON.stringify(passportPayload(asset, tampered ? Number((asset.energy * 1.124).toFixed(2)) : undefined))),
    ]).then(([expected, current]) => {
      if (!alive) return;
      setAnchoredDigest(expected);
      setDigest(current);
    });
    return () => { alive = false; };
  }, [asset, tampered]);

  useEffect(() => {
    setTampered(false);
  }, [assetId]);

  const anchor = async (reason = 'Scheduled portfolio snapshot') => {
    if (!latest || anchoring) return;
    setAnchoring(true);
    const tx: Tx = {
      id: `TX-${Date.now().toString().slice(-6)}`,
      type: 'ASSET_ANCHOR',
      subject: `${asset.id} · ${asset.name}`,
      detail: `${reason} · ${asset.modelVersion} · ${asset.sensors} sensor bindings`,
      actor: 'T. Lau',
      hash: '0x' + (await sha256Hex(`${asset.id}-${Date.now()}`)),
    };
    await new Promise((r) => setTimeout(r, 850));
    const block = await appendBlock(latest, [tx]);
    setBlocks((b) => [...b, block]);
    setSelectedHeight(block.height);
    setAnchoring(false);
    setIntegrity('valid');
    toast('Snapshot anchored', `Block #${block.height} written · ${shortHash(block.hash)} · validator quorum 4/5.`, 'success');
    params.delete('anchor');
    setParams(params, { replace: true });
    return block;
  };

  useEffect(() => {
    if (loading || autoAnchored.current || params.get('anchor') !== '1' || !latest) return;
    autoAnchored.current = true;
    anchor('COO-initiated governance snapshot');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, params, latest]);

  const verify = async () => {
    setIntegrity('verifying');
    const ok = await verifyChain(blocks);
    setIntegrity(ok ? 'valid' : 'invalid');
    toast(ok ? 'Chain verified' : 'Integrity break detected', ok ? `${blocks.length} blocks recomputed · every previous-hash link is intact.` : 'A block hash does not match its contents.', ok ? 'success' : 'error');
  };

  const copy = (value: string) => {
    navigator.clipboard?.writeText(value).then(() => toast('Copied', 'Value copied to clipboard.', 'info')).catch(() => toast('Copy unavailable', 'Clipboard access was blocked by the browser.', 'warning'));
  };

  const retired = credits.filter((c) => c.status === 'retired').reduce((s, c) => s + c.tonnes, 0);
  const available = credits.filter((c) => c.status !== 'retired').reduce((s, c) => s + c.tonnes, 0);

  const confirmCreditAction = async () => {
    if (!creditAction || !latest) return;
    setProcessing(true);
    const { credit, action } = creditAction;
    const amount = Math.min(tonnes, credit.tonnes);
    const type = action === 'retire' ? 'CARBON_RETIRE' : 'CARBON_TRANSFER';
    const tx: Tx = {
      id: `TX-${Date.now().toString().slice(-6)}`,
      type,
      subject: credit.project,
      detail: action === 'retire' ? `${amount} tCO₂e retired · ${credit.serial}` : `${amount} tCO₂e transferred to ${recipient} · ${credit.serial}`,
      actor: 'T. Lau',
      value: amount,
      hash: '0x' + (await sha256Hex(`${credit.id}-${action}-${Date.now()}`)),
    };
    await new Promise((r) => setTimeout(r, 750));
    const block = await appendBlock(latest, [tx]);
    setBlocks((b) => [...b, block]);
    setSelectedHeight(block.height);
    setCredits((list) => list.map((c) => c.id === credit.id
      ? { ...c, tonnes: c.tonnes - amount, status: action === 'retire' ? 'retired' : c.status, owner: action === 'transfer' ? recipient : c.owner }
      : c));
    setProcessing(false);
    setCreditAction(null);
    setIntegrity('valid');
    toast(action === 'retire' ? 'Credits retired' : 'Credits transferred', `${amount} tCO₂e · block #${block.height} · ${shortHash(block.hash)}`, 'success');
  };

  const selectedTx = useMemo(() => selected?.transactions ?? [], [selected]);

  return (
    <div className="page-enter mx-auto max-w-[1540px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-2">Trust layer · blockchain</div>
          <h1 className="display text-[28px] text-white">{t('trust.title', 'Proof, not promises.')}</h1>
          <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-[var(--muted)]">
            {t('trust.desc', 'Every model revision, handover pack and carbon retirement is anchored with a SHA-256 digest. Verify independently; trust the record, not the platform.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> Height {latest?.height.toLocaleString() ?? '—'}</span>
          <Button variant="secondary" size="sm" onClick={verify} disabled={integrity === 'verifying' || loading}>
            {integrity === 'verifying' ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />} Verify chain
          </Button>
          <Button variant="primary" size="sm" onClick={() => anchor('COO-initiated governance snapshot')} disabled={anchoring || loading}>
            {anchoring ? <Loader2 size={12} className="animate-spin" /> : <Fingerprint size={12} />} Anchor snapshot
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { l: 'Ledger height', v: latest?.height.toLocaleString() ?? '—', s: '9 validators · 4/5 quorum', icon: Layers },
          { l: 'Transactions', v: blocks.reduce((s, b) => s + b.txCount, 0).toString(), s: 'models · handovers · carbon', icon: GitBranch },
          { l: 'Assets attested', v: '19 / 19', s: '100% of portfolio', icon: Box },
          { l: 'Integrity', v: integrity === 'invalid' ? 'BREAK' : '100%', s: integrity === 'valid' ? 'verified just now' : 'verification available', icon: ShieldCheck },
        ].map((s) => (
          <div key={s.l} className="panel flex items-center gap-3 px-4 py-3.5">
            <div className={cn('grid h-9 w-9 place-items-center rounded-lg border', integrity === 'invalid' && s.l === 'Integrity' ? 'border-[rgba(251,113,133,.3)] bg-[rgba(251,113,133,.08)] text-[var(--rose)]' : 'border-[var(--line)] bg-white/[.02] text-[var(--muted)]')}>
              <s.icon size={15} />
            </div>
            <div>
              <div className="text-[8.5px] uppercase tracking-[0.1em] text-[var(--dim)]">{s.l}</div>
              <div className="num text-[18px] text-white">{s.v}</div>
              <div className="text-[8.5px] text-[var(--dim)]">{s.s}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel overflow-hidden xl:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3">
            <div className="flex items-center gap-2">
              <Link2 size={13} className="text-[var(--accent)]" />
              <span className="text-[11.5px] font-medium text-[#dbe5ee]">Ledger explorer</span>
              <LiveTag label="Ophylla chain" />
            </div>
            <div className="flex items-center gap-3 font-mono text-[8px] text-[var(--dim)]">
              <div className="tabs">
                <button className={cn('tab', !chain3d && 'active')} onClick={() => setChain3d(false)}>2D</button>
                <button className={cn('tab', chain3d && 'active')} onClick={() => setChain3d(true)}>3D chain</button>
              </div>
              <span>SHA-256</span><span className="h-3 w-px bg-[var(--line-2)]" /><span>3.2s finality</span>
            </div>
          </div>

          <div className={cn('border-b border-[var(--line)] bg-black/15', chain3d ? 'relative h-[258px] p-0' : 'px-4 py-3')}>
            {chain3d ? (
              <>
                {loading ? (
                  <div className="flex h-full items-center justify-center gap-2 text-[10px] text-[var(--dim)]"><Loader2 size={12} className="animate-spin" /> Reconstructing chain from genesis…</div>
                ) : (
                  <TrustChainScene blocks={blocks} selectedHeight={selectedHeight} onSelect={setSelectedHeight} />
                )}
                <div className="pointer-events-none absolute left-4 top-3 flex items-center gap-2 font-mono text-[7.5px] uppercase tracking-[0.14em] text-[var(--dim)]">
                  <span className="live-dot" /> 3D ledger · drag to orbit · click a block
                </div>
                <div className="pointer-events-none absolute bottom-3 right-4 font-mono text-[7.5px] text-[var(--dim)]">{blocks.length} blocks · SHA-256</div>
              </>
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {loading && <div className="flex items-center gap-2 py-4 text-[10px] text-[var(--dim)]"><Loader2 size={12} className="animate-spin" /> Reconstructing chain from genesis…</div>}
                {blocks.slice(-7).map((b, i) => (
                  <div key={b.height} className="flex shrink-0 items-center gap-2">
                    {i > 0 && <div className="h-px w-3 bg-gradient-to-r from-[rgba(62,224,161,.5)] to-[rgba(62,224,161,.1)]" />}
                    <button
                      onClick={() => setSelectedHeight(b.height)}
                      className={cn('group w-[104px] rounded-lg border p-2 text-left transition-all',
                        selected?.height === b.height ? 'border-[rgba(62,224,161,.45)] bg-[rgba(62,224,161,.07)] shadow-[0_0_24px_-8px_rgba(62,224,161,.4)]' : 'border-[var(--line)] bg-white/[.015] hover:border-[var(--line-2)]')}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn('font-mono text-[8px]', selected?.height === b.height ? 'text-[var(--accent)]' : 'text-[var(--dim)]')}>#{b.height}</span>
                        {b.height === latest?.height ? <span className="live-dot" /> : <span className="h-1 w-1 rounded-full bg-[var(--dim)]" />}
                      </div>
                      <div className="mt-1 font-mono text-[7.5px] text-[var(--dim)]">{hkTime(new Date(b.timestamp), true)}</div>
                      <div className="mt-1 truncate font-mono text-[7.5px] text-[var(--muted)]">{shortHash(b.hash, 8)}</div>
                      <div className="mt-1.5 flex items-center justify-between font-mono text-[7px] text-[var(--dim)]">
                        <span>{b.txCount} tx</span><span>{b.validator.replace('opv-', '')}</span>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selected && (
            <div className="grid gap-0 md:grid-cols-[1.55fr_1fr]">
              <div className="border-b border-[var(--line)] md:border-b-0 md:border-r">
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="eyebrow text-[8px]">Block transactions</span>
                  <span className="font-mono text-[8px] text-[var(--dim)]">{selectedTx.length} record{selectedTx.length > 1 ? 's' : ''}</span>
                </div>
                <div className="space-y-0">
                  {selectedTx.map((tx) => {
                    const meta = TX_META[tx.type];
                    return (
                      <div key={tx.id} className="border-t border-[var(--line)] px-4 py-3">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[var(--line)] bg-white/[.02]"><meta.icon size={11} style={{ color: meta.tone }} /></div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-[7.5px] uppercase tracking-wider" style={{ color: meta.tone }}>{meta.label}</span>
                              <span className="font-mono text-[7.5px] text-[var(--dim)]">{tx.id}</span>
                            </div>
                            <div className="mt-0.5 text-[10.5px] text-[#dbe5ee]">{tx.subject}</div>
                            <div className="mt-0.5 text-[9px] leading-relaxed text-[var(--dim)]">{tx.detail}</div>
                            <div className="mt-1.5 flex items-center gap-2 font-mono text-[7.5px] text-[var(--dim)]">
                              <span>{tx.hash.slice(0, 18)}…</span>
                              <button onClick={() => copy(tx.hash)} className="text-[var(--dim)] hover:text-[var(--accent)]" aria-label="Copy transaction hash"><Copy size={8} /></button>
                              <span className="ml-auto">by {tx.actor}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="eyebrow text-[8px]">Block header</span>
                  <Badge tone="green">Finalised</Badge>
                </div>
                <div className="space-y-2 border-t border-[var(--line)] px-4 py-3 font-mono text-[8px]">
                  {[
                    ['height', selected.height.toString()],
                    ['timestamp', new Date(selected.timestamp).toISOString()],
                    ['validator', selected.validator],
                    ['nonce', selected.nonce.toString()],
                    ['tx count', selected.txCount.toString()],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-start justify-between gap-3">
                      <span className="shrink-0 uppercase tracking-wider text-[var(--dim)]">{k}</span>
                      <span className="truncate text-right text-[#bfd0dd]">{v}</span>
                    </div>
                  ))}
                  <div className="border-t border-[var(--line)] pt-2">
                    <div className="text-[7px] uppercase tracking-wider text-[var(--dim)]">Block hash</div>
                    <div className="mt-0.5 break-all text-[7.5px] leading-relaxed text-[var(--accent)]">{selected.hash}</div>
                  </div>
                  <div>
                    <div className="text-[7px] uppercase tracking-wider text-[var(--dim)]">Previous hash</div>
                    <div className="mt-0.5 break-all text-[7.5px] leading-relaxed text-[#7f98a8]">{selected.previousHash}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <div className="space-y-4 xl:col-span-4">
          <section className="panel overflow-hidden">
            <div className="border-b border-[var(--line)] px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-[8.5px]">Integrity verification</span>
                <ShieldCheck size={13} className="text-[var(--accent)]" />
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn('grid h-11 w-11 place-items-center rounded-xl border', integrity === 'invalid' ? 'border-[rgba(251,113,133,.35)] bg-[rgba(251,113,133,.08)]' : 'border-[rgba(62,224,161,.28)] bg-[rgba(62,224,161,.07)]')}>
                  {integrity === 'invalid' ? <XCircle size={19} className="text-[var(--rose)]" /> : integrity === 'verifying' ? <Loader2 size={19} className="animate-spin text-[var(--accent)]" /> : <CheckCircle2 size={19} className="text-[var(--accent)]" />}
                </div>
                <div>
                  <div className={cn('font-display text-[15px]', integrity === 'invalid' ? 'text-[var(--rose)]' : 'text-white')}>
                    {integrity === 'invalid' ? 'Integrity break' : integrity === 'verifying' ? 'Recomputing hashes…' : 'Chain intact'}
                  </div>
                  <div className="mt-0.5 font-mono text-[8px] text-[var(--dim)]">{blocks.length} blocks · {blocks.reduce((s, b) => s + b.txCount, 0)} transactions</div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {[
                  ['Hash algorithm', 'SHA-256'],
                  ['Validator quorum', '4 of 5'],
                  ['Finality', '3.2 seconds'],
                  ['Anchoring cadence', '6 minutes'],
                  ['Last verification', integrity === 'valid' ? 'Just now' : 'Pending'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between border-b border-[var(--line)] pb-1.5 text-[9px] last:border-0">
                    <span className="text-[var(--dim)]">{k}</span><span className="font-mono text-[#cfdae4]">{v}</span>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="outline" className="mt-3 w-full" onClick={verify}>
                <ShieldCheck size={12} /> Recompute every block hash
              </Button>
              <div className="mt-3 rounded-lg border border-[var(--line)] bg-white/[.015] p-2.5">
                <div className="flex items-center gap-1.5 text-[9px] text-[var(--muted)]"><Lock size={10} className="text-[var(--accent)]" /> Auditor access</div>
                <div className="mt-1 text-[8.5px] leading-relaxed text-[var(--dim)]">Read-only verification endpoint with Merkle proofs. SOC 2 Type II · ISO 27001 · PDPO aligned.</div>
              </div>
            </div>
          </section>

          <section className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
              <span className="eyebrow text-[8.5px]">Smart contract</span>
              <span className="font-mono text-[8px] text-[var(--dim)]">Passport.sol · v1.4</span>
            </div>
            <div className="code-block overflow-x-auto p-3.5 font-mono text-[8px] leading-[1.7]">
              {[
                '// SPDX-License-Identifier: MIT',
                'pragma solidity ^0.8.24;',
                '',
                'contract AssetPassport {',
                '  struct Anchor { bytes32 digest; uint64 at; address by; }',
                '  mapping(bytes32 => Anchor) public anchors;',
                '  event Anchored(bytes32 indexed id, bytes32 digest);',
                '',
                '  function anchor(bytes32 id, bytes32 digest)',
                '    external onlyRole(ATTESTER) {',
                '    require(digest != bytes32(0), "empty");',
                '    anchors[id] = Anchor(digest, uint64(block.timestamp), msg.sender);',
                '    emit Anchored(id, digest);',
                '  }',
                '}',
              ].map((line, i) => <CodeLine key={i} line={line} />)}
            </div>
            <div className="flex items-center justify-between border-t border-[var(--line)] px-4 py-2 font-mono text-[8px] text-[var(--dim)]">
              <span>0x7A21…9F04</span>
              <button onClick={() => copy('0x7A21c4e8f19b3d5704a2c6e8b1d9f40a9F04')} className="flex items-center gap-1 hover:text-[var(--accent)]"><Copy size={8} /> copy</button>
            </div>
          </section>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel overflow-hidden xl:col-span-5">
          <div className="border-b border-[var(--line)] px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="eyebrow mb-1">Asset passport</div>
                <div className="font-display text-[13.5px] text-white">Provenance & integrity</div>
              </div>
              <select value={assetId} onChange={(e) => setAssetId(e.target.value)} className="input h-7 w-[130px] text-[10px]" aria-label="Select asset">
                {ASSETS.map((a) => <option key={a.id} value={a.id}>{a.id} · {a.name.slice(0, 18)}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[12px] font-medium text-white">{asset.name}</div>
                <div className="mt-0.5 font-mono text-[8px] text-[var(--dim)]">{asset.modelUrn} · {asset.modelVersion}</div>
              </div>
              <Badge tone="green"><CheckCircle2 size={9} /> Attested</Badge>
            </div>

            <div className={cn('rounded-lg border p-3', tampered ? 'border-[rgba(251,113,133,.35)] bg-[rgba(251,113,133,.05)]' : 'border-[rgba(62,224,161,.18)] bg-[rgba(62,224,161,.03)]')}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[9px] font-medium" style={{ color: tampered ? 'var(--rose)' : 'var(--accent)' }}>
                  <Fingerprint size={10} /> {tampered ? 'Integrity mismatch' : 'Digest matches anchored record'}
                </span>
                {tampered ? <Badge tone="rose">Tampered</Badge> : <Badge tone="green">Verified</Badge>}
              </div>
              <div className="mt-2 grid gap-2 font-mono text-[7.5px]">
                <div>
                  <div className="text-[var(--dim)]">Anchored SHA-256</div>
                  <div className="mt-0.5 break-all text-[#9fb4c4]">{anchoredDigest || 'computing…'}</div>
                </div>
                <div>
                  <div className="text-[var(--dim)]">Current digest</div>
                  <div className={cn('mt-0.5 break-all', tampered ? 'text-[var(--rose)]' : 'text-[var(--accent)]')}>{digest || 'computing…'}</div>
                </div>
              </div>
              {tampered && (
                <div className="mt-2 rounded border border-[rgba(251,113,133,.2)] bg-black/20 p-2 text-[8.5px] leading-relaxed text-[#fda4b0]">
                  energy_intensity was altered by +12.4%. Any consumer of this passport would reject the record. The ledger still holds the original digest.
                </div>
              )}
              <div className="mt-2.5 flex gap-1.5">
                <button onClick={() => { setTampered((v) => !v); toast(tampered ? 'Record restored' : 'Tamper simulated', tampered ? 'Canonical passport restored and re-verified.' : 'A field was altered locally to demonstrate detection.', tampered ? 'success' : 'warning'); }} className="flex-1 rounded-md border border-[var(--line-2)] py-1.5 text-[8.5px] text-[#cfdae4] hover:bg-white/[.04]">
                  {tampered ? 'Restore original' : 'Simulate tamper'}
                </button>
                <button onClick={() => toast('Passport verified', `${shortHash(anchoredDigest)} matches block #${latest?.height}.`, 'success')} className="flex-1 rounded-md border border-[rgba(62,224,161,.28)] py-1.5 text-[8.5px] text-[var(--accent)] hover:bg-[rgba(62,224,161,.07)]">Re-verify</button>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="eyebrow text-[8px]">Provenance timeline</span>
                <span className="font-mono text-[7.5px] text-[var(--dim)]">5 events</span>
              </div>
              <div className="relative ml-1 space-y-2.5 border-l border-[var(--line-2)] pl-4">
                {[
                  { label: 'Design authoring · IFC 4.3', actor: 'Design consultant', date: '12 Mar 2021', idx: 0 },
                  { label: 'BIM handover pack sealed', actor: 'A. Cheng', date: '04 Jun 2021', idx: 2 },
                  { label: 'Commissioning evidence', actor: 'Commissioning agent', date: '18 Sep 2021', idx: 4 },
                  { label: 'Sensor bindings attested', actor: 'Platform ops', date: '02 Jan 2026', idx: 6 },
                  { label: 'Annual assurance review', actor: 'Independent auditor', date: '14 Aug 2026', idx: 8 },
                ].map((e) => (
                  <div key={e.label} className="relative">
                    <span className="absolute -left-[21px] top-1 h-1.5 w-1.5 rounded-full bg-[var(--accent)] ring-4 ring-[#0a1017]" />
                    <div className="text-[9.5px] text-[#cfdae4]">{e.label}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[7.5px] text-[var(--dim)]">
                      <span>{e.actor}</span><span>·</span><span>{e.date}</span>
                      <span className="ml-auto text-[#7f98a8]">{shortHash(blocks[e.idx]?.hash ?? '0x0000000000', 8)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="panel overflow-hidden xl:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] px-4 py-3">
            <div>
              <div className="eyebrow mb-1">Carbon registry</div>
              <div className="font-display text-[13.5px] text-white">Verified credits</div>
            </div>
            <div className="flex items-center gap-3 font-mono text-[8px]">
              <span className="text-[var(--accent)]">RETIRED {retired.toLocaleString()} t</span>
              <span className="text-[var(--muted)]">AVAILABLE {available.toLocaleString()} t</span>
              <Badge tone="cyan">Verra VCS</Badge>
            </div>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Serial</th><th>Project</th><th>Vintage</th><th className="text-right">tCO₂e</th><th>Owner</th><th>Status</th><th /></tr></thead>
              <tbody>
                {credits.map((c) => (
                  <tr key={c.id}>
                    <td><span className="font-mono text-[9px] text-[#bfd0dd]">{c.serial}</span></td>
                    <td><span className="text-[10px] text-[#dbe5ee]">{c.project}</span></td>
                    <td><span className="font-mono text-[9px] text-[var(--muted)]">{c.vintage}</span></td>
                    <td className="num-cell text-right">{c.tonnes.toLocaleString()}</td>
                    <td><span className="text-[9px] text-[var(--muted)]">{c.owner}</span></td>
                    <td>
                      <span className={cn('badge', c.status === 'retired' ? 'badge-rose' : c.status === 'listed' ? 'badge-violet' : 'badge-green')}>{c.status}</span>
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <button disabled={c.status === 'retired' || c.tonnes === 0} onClick={() => setCreditAction({ credit: c, action: 'retire' })} className="btn btn-ghost btn-sm disabled:opacity-30" title="Retire credits">Retire</button>
                        <button disabled={c.status === 'retired' || c.tonnes === 0} onClick={() => setCreditAction({ credit: c, action: 'transfer' })} className="btn btn-ghost btn-sm disabled:opacity-30" title="Transfer credits">Transfer</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line)] px-4 py-2.5">
            <span className="flex items-center gap-1.5 font-mono text-[7.5px] uppercase tracking-wider text-[var(--dim)]"><Globe2 size={9} /> Registry mirror · double-entry reconciled 14:32 HKT</span>
            <span className="font-mono text-[7.5px] text-[var(--dim)]">Every retirement writes a ledger block</span>
          </div>
        </section>
      </div>

      <Modal
        open={!!creditAction}
        onClose={() => !processing && setCreditAction(null)}
        eyebrow="Carbon registry"
        title={creditAction ? `${creditAction.action === 'retire' ? 'Retire' : 'Transfer'} verified credits` : ''}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreditAction(null)} disabled={processing}>Cancel</Button>
            <Button variant="primary" onClick={confirmCreditAction} disabled={processing || tonnes <= 0}>
              {processing ? <Loader2 size={12} className="animate-spin" /> : <Leaf size={12} />}
              {processing ? 'Writing block…' : creditAction?.action === 'retire' ? 'Retire credits' : 'Transfer credits'}
            </Button>
          </>
        }
      >
        {creditAction && (
          <div className="space-y-4">
            <div className="rounded-lg border border-[var(--line)] bg-white/[.02] p-3">
              <div className="flex items-center justify-between text-[9px]"><span className="text-[var(--dim)]">Project</span><span className="text-[#dbe5ee]">{creditAction.credit.project}</span></div>
              <div className="mt-1.5 flex items-center justify-between text-[9px]"><span className="text-[var(--dim)]">Serial</span><span className="font-mono text-[#dbe5ee]">{creditAction.credit.serial}</span></div>
              <div className="mt-1.5 flex items-center justify-between text-[9px]"><span className="text-[var(--dim)]">Available</span><span className="font-mono text-[var(--accent)]">{creditAction.credit.tonnes} tCO₂e</span></div>
            </div>
            {creditAction.action === 'transfer' && (
              <div>
                <label className="eyebrow mb-1.5 block text-[8px]">Recipient</label>
                <select value={recipient} onChange={(e) => setRecipient(e.target.value)} className="input">
                  {['Ophylla Ventures', 'Marina Central SPV', 'Harbourview Owners Corp.', 'KE Campus SPV', 'Retirement registry'].map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="eyebrow mb-1.5 block text-[8px]">Tonnes to {creditAction.action === 'retire' ? 'retire' : 'transfer'}</label>
              <input type="number" min={1} max={creditAction.credit.tonnes} value={tonnes} onChange={(e) => setTonnes(Math.max(0, Math.min(creditAction.credit.tonnes, Number(e.target.value))))} className="input" />
            </div>
            <div className="rounded-lg border border-[rgba(62,224,161,.15)] bg-[rgba(62,224,161,.03)] p-3 text-[9px] leading-relaxed text-[var(--muted)]">
              This action writes an immutable block to the Ophylla trust ledger and reconciles to the Verra registry mirror. Retirements cannot be reversed.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
