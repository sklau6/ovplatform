import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { DEAL_WORKSTREAMS, DEALS_SCENARIOS, type DealsMode, type DealsScenario } from '../lib/dealsData';

export interface DealsSelection { id: string; name: string; progress: number; owner: string; status: string }
interface Props { mode: DealsMode; scenario: DealsScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: DealsSelection) => void }
interface Api { setMode: (m: DealsMode) => void; setScenario: (s: DealsScenario) => void; setSelected: (id: string | null) => void }

const CYAN = 0x51d6ff, GREEN = 0x53f0be, AMBER = 0xf4bd72, VIOLET = 0xa991ff, ROSE = 0xff7088;

export function DealsScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D deal room with acquisition target, due diligence workstreams, IC gates, synergy rings and bid stages."
      cameraPosition={[16, 10, 20]}
      target={[0, 3, 0]}
      fov={38}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.012 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.13}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x9de0d0, 0x030706, 0.95));
        const key = new THREE.DirectionalLight(0xd8fff8, 1.6);
        key.position.set(-12, 18, 14);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.7);
        rim.position.set(14, 8, -14);
        scene.add(rim);

        const floor = new THREE.Mesh(new THREE.CylinderGeometry(10, 10.4, 0.4, 64), new THREE.MeshStandardMaterial({ color: 0x071411, metalness: 0.6, roughness: 0.45 }));
        floor.position.y = -0.2;
        scene.add(floor);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(8.4, 0.03, 5, 100), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.22 }));
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.03;
        scene.add(ring);

        // Target tower.
        const target = new THREE.Mesh(new THREE.BoxGeometry(3, 7, 3), new THREE.MeshStandardMaterial({ color: 0x2a4a40, emissive: GREEN, emissiveIntensity: 0.3, metalness: 0.45, roughness: 0.4 }));
        target.position.y = 3.5;
        scene.add(target);
        const targetEdge = new THREE.LineSegments(new THREE.EdgesGeometry(target.geometry), new THREE.LineBasicMaterial({ color: GREEN, transparent: true, opacity: 0.5 }));
        target.add(targetEdge);

        const records: Array<{ id: string; mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; pos: THREE.Vector3; color: string }> = [];
        const pickables: THREE.Mesh[] = [];
        DEAL_WORKSTREAMS.forEach((w, i) => {
          const a = (i / DEAL_WORKSTREAMS.length) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(a) * 6.2;
          const z = Math.sin(a) * 6.2;
          const color = new THREE.Color(w.color);
          const mat = new THREE.MeshStandardMaterial({ color: 0x2e4038, emissive: color, emissiveIntensity: 0.35, metalness: 0.35, roughness: 0.5 });
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), mat);
          mesh.position.set(x, 1.4, z);
          mesh.rotation.y = -a;
          mesh.userData.streamId = w.id;
          scene.add(mesh);
          pickables.push(mesh);
          const edge = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 }));
          mesh.add(edge);
          const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, 1.4, z), new THREE.Vector3(0, 3.5, 0)]), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.25 }));
          scene.add(line);
          records.push({ id: w.id, mesh, mat, pos: new THREE.Vector3(x, 1.4, z), color: w.color });
        });

        // IC gates.
        const gates: THREE.Mesh[] = [];
        for (let i = 0; i < 3; i++) {
          const gate = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.04, 5, 6), new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.5 }));
          gate.position.set(-4 + i * 4, 4.5, 7.5);
          scene.add(gate);
          gates.push(gate);
        }

        // Synergy rings.
        const synergyRings: THREE.Mesh[] = [];
        for (let i = 0; i < 3; i++) {
          const r = new THREE.Mesh(new THREE.TorusGeometry(2 + i * 1.2, 0.03, 4, 50), new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.25 - i * 0.05 }));
          r.rotation.x = Math.PI / 2;
          r.position.y = 0.1;
          scene.add(r);
          synergyRings.push(r);
        }

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          records.forEach((r) => {
            const w = DEAL_WORKSTREAMS.find((x) => x.id === r.id)!;
            const color = currentMode === 'diligence' ? (w.progress >= 75 ? GREEN : w.progress >= 60 ? AMBER : ROSE) :
              currentMode === 'risk' ? (w.status === 'Data gap' ? ROSE : w.progress >= 75 ? GREEN : AMBER) :
                currentMode === 'synergies' ? (w.id === 'FIN' || w.id === 'COM' ? AMBER : GREEN) : new THREE.Color(w.color).getHex();
            r.mat.emissive.setHex(color);
            r.mat.emissiveIntensity = r.id === currentSelected ? 0.9 : 0.35;
            r.mesh.scale.setScalar(r.id === currentSelected ? 1.15 : 1);
          });
          synergyRings.forEach((r) => { r.visible = currentMode === 'synergies'; });
          gates.forEach((g) => { g.visible = currentMode === 'pipeline'; });
          const w = DEAL_WORKSTREAMS.find((x) => x.id === currentSelected);
          if (w) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid ${w.color}88;border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:${w.color};font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${w.id} · ${w.progress}% COMPLETE</span><div style="margin-top:2px;font-weight:500">${w.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${w.owner} · ${w.status}</div></div>`;
          } else label.style.display = 'none';
          void DEALS_SCENARIOS[currentScenario];
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
          const w = DEAL_WORKSTREAMS.find((x) => x.id === hit.object.userData.streamId);
          return w ? { id: w.id, name: w.name, progress: w.progress, owner: w.owner, status: w.status } : null;
        };
        const move = (event: PointerEvent) => { updatePointer(event); ctx.renderer.domElement.style.cursor = pick() ? 'pointer' : 'grab'; };
        const click = (event: PointerEvent) => { updatePointer(event); const w = pick(); if (w) onSelectRef.current(w); };
        ctx.renderer.domElement.addEventListener('pointermove', move);
        ctx.renderer.domElement.addEventListener('pointerup', click);
        ctx.addDispose(() => {
          ctx.renderer.domElement.removeEventListener('pointermove', move);
          ctx.renderer.domElement.removeEventListener('pointerup', click);
        });

        const projected = new THREE.Vector3();
        ctx.addUpdate((dt, elapsed) => {
          target.rotation.y += dt * 0.1;
          ring.rotation.z += dt * 0.04;
          records.forEach((r, i) => { r.mesh.position.y = 1.4 + Math.sin(elapsed * 1.2 + i) * 0.05; });
          if (currentSelected) {
            const r = records.find((x) => x.id === currentSelected);
            if (r) projected.set(r.pos.x, 3.2, r.pos.z).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            label.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
          }
        });
      }}
    />
  );
}
