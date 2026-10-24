import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { CYBER_LINKS, CYBER_NODES, CYBER_SCENARIOS, type CyberMode, type CyberScenario } from '../lib/cyberData';

export interface CyberSelection { id: string; name: string; zone: string; type: string; metric: string; risk: string }
interface Props { mode: CyberMode; scenario: CyberScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: CyberSelection) => void }
interface Api { setMode: (m: CyberMode) => void; setScenario: (s: CyberScenario) => void; setSelected: (id: string | null) => void }

const CYAN = 0x51d6ff, GREEN = 0x53f0be, AMBER = 0xf4bd72, ROSE = 0xff7088, VIOLET = 0xa991ff;

export function CyberScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D cyber and OT security twin with cloud, IT, BIM, BMS, SCADA, IoT, SOC, identity, backup and vendor nodes, attack paths and response."
      cameraPosition={[24, 18, 28]}
      target={[0, 3, 0]}
      fov={40}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.008 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.14}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x9bdfe5, 0x030706, 0.9));
        const key = new THREE.DirectionalLight(0xd8fff8, 1.6);
        key.position.set(-22, 32, 22);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.7);
        rim.position.set(26, 12, -22);
        scene.add(rim);

        const floor = new THREE.Mesh(new THREE.PlaneGeometry(44, 34), new THREE.MeshStandardMaterial({ color: 0x06110e, metalness: 0.6, roughness: 0.5 }));
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);
        const grid: THREE.Vector3[] = [];
        for (let x = -22; x <= 22; x += 2) grid.push(new THREE.Vector3(x, 0.01, -17), new THREE.Vector3(x, 0.01, 17));
        for (let z = -17; z <= 17; z += 2) grid.push(new THREE.Vector3(-22, 0.01, z), new THREE.Vector3(22, 0.01, z));
        scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(grid), new THREE.LineBasicMaterial({ color: 0x1a5d5d, transparent: true, opacity: 0.16 })));

        const nodeMap = new Map<string, THREE.Vector3>();
        const records: Array<{ id: string; mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; pos: THREE.Vector3; zone: string; risk: string }> = [];
        const pickables: THREE.Mesh[] = [];
        for (const n of CYBER_NODES) {
          const color = n.zone === 'OT' ? GREEN : n.zone === 'Cloud' ? CYAN : n.zone === 'DMZ' ? VIOLET : CYAN;
          const mat = new THREE.MeshStandardMaterial({ color: 0x12302b, emissive: color, emissiveIntensity: 0.4, metalness: 0.5, roughness: 0.35 });
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(n.type === 'SOC' ? 2.6 : 1.8, n.type === 'SOC' ? 1.2 : 1.4, n.type === 'SOC' ? 2.6 : 1.8), mat);
          mesh.position.set(n.x, n.y, n.z);
          mesh.userData.nodeId = n.id;
          scene.add(mesh);
          pickables.push(mesh);
          const halo = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.02, 5, 40), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 }));
          halo.rotation.x = Math.PI / 2.2;
          mesh.add(halo);
          nodeMap.set(n.id, new THREE.Vector3(n.x, n.y, n.z));
          records.push({ id: n.id, mesh, mat, pos: new THREE.Vector3(n.x, n.y, n.z), zone: n.zone, risk: n.risk });
        }

        const links: Array<{ line: THREE.Line; particle: THREE.Mesh; from: THREE.Vector3; to: THREE.Vector3; a: string; b: string }> = [];
        for (const [a, b] of CYBER_LINKS) {
          const from = nodeMap.get(a);
          const to = nodeMap.get(b);
          if (!from || !to) continue;
          const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([from, to]), new THREE.LineBasicMaterial({ color: 0x2f8d80, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending }));
          scene.add(line);
          const particle = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.7 }));
          scene.add(particle);
          links.push({ line, particle, from, to, a, b });
        }

        const ring = new THREE.Mesh(new THREE.TorusGeometry(13, 0.03, 6, 100), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.18 }));
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.3;
        scene.add(ring);

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          const s = CYBER_SCENARIOS[currentScenario];
          records.forEach((r) => {
            const n = CYBER_NODES.find((x) => x.id === r.id)!;
            const color = currentMode === 'zones' ? (n.zone === 'OT' ? GREEN : n.zone === 'Cloud' ? CYAN : n.zone === 'DMZ' ? VIOLET : AMBER) :
              currentMode === 'threats' ? (n.risk === 'High' ? ROSE : n.risk === 'Medium' ? AMBER : GREEN) :
                n.zone === 'OT' ? GREEN : CYAN;
            r.mat.emissive.setHex(n.id === s.compromised ? ROSE : color);
            r.mat.emissiveIntensity = n.id === s.compromised ? 1.1 : r.id === currentSelected ? 0.9 : 0.4;
            r.mesh.scale.setScalar(r.id === currentSelected ? 1.2 : 1);
          });
          links.forEach((l) => {
            const onAttack = (l.a === s.compromised || l.b === s.compromised) && currentMode !== 'network';
            const color = onAttack ? ROSE : currentMode === 'zones' ? GREEN : CYAN;
            (l.line.material as THREE.LineBasicMaterial).color.setHex(color);
            (l.line.material as THREE.LineBasicMaterial).opacity = onAttack ? 0.8 : 0.28;
            (l.particle.material as THREE.MeshBasicMaterial).color.setHex(color);
          });
          const n = CYBER_NODES.find((x) => x.id === currentSelected);
          if (n) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid rgba(81,214,255,.5);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:#51d6ff;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${n.id} · ${n.zone}</span><div style="margin-top:2px;font-weight:500">${n.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${n.metric} · risk ${n.risk}</div></div>`;
          } else label.style.display = 'none';
        };
        apiRef.current = {
          setMode: (m) => { currentMode = m; apply(); },
          setScenario: (s) => { currentScenario = s; apply(); },
          setSelected: (id) => { currentSelected = id; apply(); },
        };
        apply();

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        const updatePointer = (event: PointerEvent) => {
          const rect = ctx.renderer.domElement.getBoundingClientRect();
          pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        };
        const pick = () => {
          raycaster.setFromCamera(pointer, ctx.camera);
          const hit = raycaster.intersectObjects(pickables, false)[0];
          if (!hit) return null;
          const n = CYBER_NODES.find((x) => x.id === hit.object.userData.nodeId);
          return n ? { id: n.id, name: n.name, zone: n.zone, type: n.type, metric: n.metric, risk: n.risk } : null;
        };
        const move = (event: PointerEvent) => { updatePointer(event); ctx.renderer.domElement.style.cursor = pick() ? 'pointer' : 'grab'; };
        const click = (event: PointerEvent) => { updatePointer(event); const n = pick(); if (n) onSelectRef.current(n); };
        ctx.renderer.domElement.addEventListener('pointermove', move);
        ctx.renderer.domElement.addEventListener('pointerup', click);
        ctx.addDispose(() => {
          ctx.renderer.domElement.removeEventListener('pointermove', move);
          ctx.renderer.domElement.removeEventListener('pointerup', click);
        });

        const projected = new THREE.Vector3();
        ctx.addUpdate((dt, elapsed) => {
          links.forEach((l, i) => {
            const t = (elapsed * 0.12 + i * 0.08) % 1;
            l.particle.position.lerpVectors(l.from, l.to, t);
            (l.particle.material as THREE.MeshBasicMaterial).opacity = 0.15 + Math.sin(t * Math.PI) * 0.7;
          });
          ring.rotation.z += dt * 0.04;
          records.forEach((r, i) => {
            r.mesh.position.y = r.pos.y + Math.sin(elapsed * 1.4 + i) * 0.06;
          });
          const n = CYBER_NODES.find((x) => x.id === currentSelected);
          if (n) {
            projected.set(n.x, n.y + 1.6, n.z).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            label.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
          }
        });
      }}
    />
  );
}
