import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, CheckCircle2, Fingerprint, Lock, Network, Radar,
  Server, ShieldCheck, Siren, UserCheck, Zap,
} from 'lucide-react';
import { CyberScene, type CyberSelection } from '../components/CyberScene';
import { Badge, Button, Panel } from '../components/ui';
import {
  CYBER_ALERTS, CYBER_CONTROLS, CYBER_KPIS, CYBER_MODES, CYBER_SCENARIOS,
  type CyberMode, type CyberScenario,
} from '../lib/cyberData';
import { useLive } from '../lib/store';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const modeIcon = { network: Network, zones: Lock, threats: Radar, response: Siren } as const;

export function Cyber() {
  const navigate = useNavigate();
  const { toast } = useLive();
  const { t } = useI18n();
  const [mode, setMode] = useState<CyberMode>('threats');
  const [scenario, setScenario] = useState<CyberScenario>('ransomware');
  const [selected, setSelected] = useState<CyberSelection | null>({ id: 'IT-APP-02', name: 'Corporate apps', zone: 'IT', type: 'App', metric: 'Ransomware signal', risk: 'High' });
  const [autoRotate, setAutoRotate] = useState(false);
  const s = CYBER_SCENARIOS[scenario];

  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow eyebrow-accent mb-1.5 flex items-center gap-2">Cyber & OT security <span className="text-[var(--dim)]">/</span> COO risk</div>
          <h1 className="display text-[26px] text-white">{t('cyber.title', 'Trust the network. Verify everything.')}</h1>
          <p className="mt-1.5 max-w-2xl text-[11.5px] text-[var(--muted)]">
            {t('cyber.desc', 'A 3D cyber and OT security twin: cloud, corporate, BIM, BMS, SCADA, IoT, identity, vendors and backup — with attack paths, IEC 62443 zones and response.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip"><span className="live-dot" /> SOC 24/7 · 19 assets</span>
          <span className="chip"><ShieldCheck size={10} className="text-[var(--accent)]" /> IEC 62443</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('/architecture')}><Server size={12} /> Architecture</Button>
          <Button variant="primary" size="sm" onClick={() => { setScenario('ot'); toast('OT intrusion simulated', 'BMS lateral movement blocked · OT conduit isolated · local control retained.', 'warning'); }}><Siren size={12} /> OT drill</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="panel dark-surface relative overflow-hidden xl:col-span-8">
          <div className="relative h-[calc(100vh-228px)] min-h-[590px] w-full bg-[#03080a]">
            <CyberScene mode={mode} scenario={scenario} selectedId={selected?.id ?? null} autoRotate={autoRotate} onSelect={setSelected} />
            <div className="pointer-events-none absolute inset-0 twin-vignette" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-3 py-1.5 backdrop-blur-md"><span className="live-dot" /><span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#bfe9da]">Security twin</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--dim)]">SOC 24/7</span><span className="h-3 w-px bg-[var(--line-2)]" /><span className="font-mono text-[8.5px] text-[var(--accent)]">{s.status}</span></div>
              <div className="rounded-lg border border-[var(--line)] bg-[#050b10]/82 px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[var(--dim)] backdrop-blur-md">{s.label} · <span className={s.risk === 'High' ? 'text-[var(--rose)]' : 'text-[var(--amber)]'}>{s.risk} risk</span></div>
            </div>
            <div className="absolute left-4 top-[68px] hidden w-[196px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#050b10]/84 backdrop-blur-xl xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5"><span className="eyebrow text-[8.5px]">Security lens</span><Fingerprint size={12} className="text-[var(--dim)]" /></div>
              <div className="space-y-0.5 p-2">{CYBER_MODES.map((m) => { const Icon = modeIcon[m.id]; return <button key={m.id} onClick={() => setMode(m.id)} className={cn('flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-left', mode === m.id && 'bg-white/[.045]')}><Icon size={12} style={{ color: mode === m.id ? m.color : undefined }} className={mode === m.id ? '' : 'text-[var(--dim)]'} /><span className={cn('flex-1 text-[9.5px]', mode === m.id ? 'text-white' : 'text-[#c9d5e0]')}>{m.label}</span></button>; })}</div>
              <div className="border-t border-[var(--line)] p-2"><div className="px-1 pb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">Scenario</div>{(['phishing', 'ransomware', 'ot'] as CyberScenario[]).map((id) => <button key={id} onClick={() => setScenario(id)} className={cn('mb-1 w-full rounded-md border px-2 py-1.5 text-left text-[9px]', scenario === id ? 'border-[rgba(255,112,136,.35)] bg-[rgba(255,112,136,.08)] text-[var(--rose)]' : 'border-[var(--line)] text-[var(--dim)]')}>{CYBER_SCENARIOS[id].label}</button>)}<button onClick={() => setAutoRotate((v) => !v)} className={cn('mt-1 w-full rounded-md border py-1.5 text-[9px]', autoRotate ? 'border-[var(--line-2)] bg-white/[.055] text-white' : 'border-[var(--line)] text-[var(--dim)]')}>Orbit</button></div>
            </div>
            <div className="pointer-events-none absolute bottom-[20px] left-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--line)] bg-[#050b10]/72 px-2.5 py-1.5 font-mono text-[8px] text-[var(--dim)] backdrop-blur"><span className="uppercase tracking-[0.12em]">Zones</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" /> IT</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> OT</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--violet)]" /> DMZ</span><span className="text-[7.5px]">click a node</span></div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden xl:col-span-4 xl:h-[calc(100vh-228px)]">
          <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--dim)]">{selected ? `${selected.id} · ${selected.zone}` : 'Security twin'}</div><Badge tone={s.risk === 'High' ? 'rose' : 'amber'}>{s.status}</Badge></div><h2 className="mt-1 font-display text-[15px] text-white">{selected?.name ?? 'OCEAN security'}</h2><div className="mt-0.5 text-[9px] text-[var(--muted)]">{selected ? `${selected.metric} · risk ${selected.risk}` : s.note}</div><div className="mt-3 grid grid-cols-3 gap-2">{[{ l: 'MTTD', v: '6.2m' }, { l: 'MTTC', v: '18.4m' }, { l: 'Critical', v: '1' }].map((x) => <div key={x.l} className="rounded-md border border-[var(--line)] bg-white/[.018] p-2"><div className="font-mono text-[6.5px] uppercase tracking-wider text-[var(--dim)]">{x.l}</div><div className="mt-0.5 num text-[11px] text-white">{x.v}</div></div>)}</div></div>
          <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Live alerts</span><Siren size={10} className="text-[var(--rose)]" /></div><div className="mt-2 space-y-1.5">{CYBER_ALERTS.map((a) => <div key={a.id} className="rounded border border-[var(--line)] bg-white/[.012] p-2"><div className="flex items-center gap-2"><span className={cn('h-1.5 w-1.5 rounded-full', a.severity === 'Critical' ? 'bg-[var(--rose)]' : a.severity === 'High' ? 'bg-[var(--amber)]' : 'bg-[var(--cyan)]')} /><span className="flex-1 font-mono text-[6.5px] text-[var(--dim)]">{a.id}</span><span className="font-mono text-[6px] text-[var(--muted)]">{a.status}</span></div><div className="mt-1 text-[7.5px] text-[#dbe5ee]">{a.title}</div><div className="mt-0.5 text-[6.5px] leading-relaxed text-[var(--dim)]">{a.detail}</div></div>)}</div></div>
            <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Controls</span><Lock size={10} className="text-[var(--accent)]" /></div><div className="mt-2 space-y-1.5">{CYBER_CONTROLS.map((c) => <div key={c.label} className="flex items-center gap-2 text-[7.5px]"><CheckCircle2 size={9} className="text-[var(--accent)]" /><span className="flex-1 text-[var(--muted)]">{c.label}</span><span className="font-mono text-[6.5px] text-[var(--dim)]">{c.value}</span></div>)}</div></div>
            <div className="px-4 py-3"><div className="flex items-center justify-between"><span className="eyebrow">Response</span><Zap size={10} className="text-[var(--amber)]" /></div><p className="mt-1.5 text-[8px] leading-relaxed text-[var(--muted)]">{s.note}</p></div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--line)] p-3"><Button variant="secondary" size="sm" className="flex-1" onClick={() => toast('SOC brief exported', 'Alerts, controls, attack path and response timeline exported.', 'success')}><ShieldCheck size={11} /> SOC brief</Button><Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/war-room')}><UserCheck size={11} /> War room</Button></div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{CYBER_KPIS.map((k) => <div key={k.label} className="panel p-4"><div className="flex items-center justify-between"><span className="text-[8px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</span><ShieldCheck size={12} className="text-[var(--accent)]" /></div><div className="mt-2 num text-[23px] text-white">{k.value} <span className="text-[8px] text-[var(--dim)]">{k.unit}</span></div><div className="mt-1 text-[8px] text-[var(--accent)]">{k.delta}</div></div>)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" eyebrow="IEC 62443" title="Zones and conduits" action={<Badge tone="green">segmented</Badge>}><div className="grid grid-cols-1 gap-2 md:grid-cols-2">{[{ z: 'IT zone', d: 'Corporate, BIM CDE and identity' }, { z: 'OT zone', d: 'BMS, SCADA and IoT mesh' }, { z: 'DMZ', d: 'Vendor access and backup' }, { z: 'Cloud', d: 'Workloads and data services' }].map((x) => <div key={x.z} className="rounded border border-[var(--line)] bg-white/[.014] p-2.5"><div className="text-[8.5px] text-[#dbe5ee]">{x.z}</div><div className="mt-1 text-[7px] text-[var(--dim)]">{x.d}</div></div>)}</div></Panel>
        <Panel className="xl:col-span-5" eyebrow="Response sequence" title="Contain, isolate, recover" action={<AlertTriangle size={12} className="text-[var(--amber)]" />}><div className="space-y-2">{['Detect and triage', 'Isolate identity / host', 'Block OT conduit', 'Validate backup', 'Restore and review'].map((x, i) => <div key={x} className="flex items-center gap-2 text-[8px]"><span className="grid h-4 w-4 place-items-center rounded-full border border-[var(--line-2)] font-mono text-[6px] text-[var(--dim)]">{i + 1}</span><span className="text-[var(--muted)]">{x}</span>{i < 3 && <span className="ml-auto font-mono text-[6px] text-[var(--accent)]">automatic</span>}</div>)}</div></Panel>
      </div>
    </div>
  );
}
