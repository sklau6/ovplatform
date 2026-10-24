import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { SEISMIC_FLOORS, SEISMIC_SCENARIOS, SEISMIC_SYSTEMS, type SeismicMode, type SeismicScenario } from '../lib/seismicData';

export interface SeismicSelection { id: string; name: string; type: string; detail: string }
interface Props { mode: SeismicMode; scenario: SeismicScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: SeismicSelection) => void }
interface Api { setMode: (m: SeismicMode) => void; setScenario: (s: SeismicScenario) => void; setSelected: (id: string | null) => void }

const CYAN = 0x51d6ff, GREEN = 0x53f0be, AMBER = 0xf4bd72, VIOLET = 0xa991ff, ROSE = 0xff7088;

export function SeismicScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D seismic building with base isolators, viscous dampers, eight floors and earthquake response."
      cameraPosition={[15, 10, 19]}
      target={[0, 5, 0]}
      fov={38}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.01 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.12}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x9dd8e8, 0x030706, 0.95));
        const key = new THREE.DirectionalLight(0xd8fff8, 1.6);
        key.position.set(-12, 18, 14);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.7);
        rim.position.set(14, 8, -14);
        scene.add(rim);

        const ground = new THREE.Mesh(new THREE.BoxGeometry(22, 0.5, 16), new THREE.MeshStandardMaterial({ color: 0x0a1714, metalness: 0.4, roughness: 0.7 }));
        ground.position.y = -0.25;
        scene.add(ground);
        const grid: THREE.Vector3[] = [];
        for (let x = -10; x <= 10; x += 2) grid.push(new THREE.Vector3(x, 0.01, -8), new THREE.Vector3(x, 0.01, 8));
        for (let z = -8; z <= 8; z += 2) grid.push(new THREE.Vector3(-10, 0.01, z), new THREE.Vector3(10, 0.01, z));
        scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(grid), new THREE.LineBasicMaterial({ color: 0x1c5d5d, transparent: true, opacity: 0.16 })));

        const steel = new THREE.MeshStandardMaterial({ color: 0x7d938b, metalness: 0.6, roughness: 0.35 });
        const slabMat = new THREE.MeshStandardMaterial({ color: 0x78948b, metalness: 0.35, roughness: 0.55 });
        const pickables: THREE.Mesh[] = [];
        const floors: Array<{ id: string; group: THREE.Group; slab: THREE.Mesh; y: number }> = [];
        const floorH = 1.25;
        for (let i = 0; i < 8; i++) {
          const g = new THREE.Group();
          const slab = new THREE.Mesh(new THREE.BoxGeometry(8, 0.18, 6), slabMat);
          slab.position.y = 1.2 + i * floorH;
          slab.userData.floorId = SEISMIC_FLOORS[i].id;
          g.add(slab);
          const edge = new THREE.LineSegments(new THREE.EdgesGeometry(slab.geometry), new THREE.LineBasicMaterial({ color: i < 4 ? CYAN : i < 7 ? AMBER : ROSE, transparent: true, opacity: 0.45 }));
          slab.add(edge);
          g.add(slab);
          pickables.push(slab);
          for (const x of [-3.8, 3.8]) for (const z of [-2.8, 2.8]) {
            const col = new THREE.Mesh(new THREE.BoxGeometry(0.16, floorH, 0.16), steel);
            col.position.set(x, 0.6 + i * floorH + floorH / 2, z);
            g.add(col);
          }
          scene.add(g);
          floors.push({ id: SEISMIC_FLOORS[i].id, group: g, slab, y: 1.2 + i * floorH });
        }
        // Core.
        const core = new THREE.Mesh(new THREE.BoxGeometry(2.2, 10, 2.2), new THREE.MeshStandardMaterial({ color: 0x6d8179, metalness: 0.25, roughness: 0.6, transparent: true, opacity: 0.5 }));
        core.position.set(0, 6.2, 0);
        core.userData.systemId = 'CORE';
        scene.add(core);
        pickables.push(core);

        // Base isolators.
        const isoMat = new THREE.MeshStandardMaterial({ color: 0x203a34, emissive: CYAN, emissiveIntensity: 0.5, metalness: 0.4, roughness: 0.4 });
        for (const x of [-3.2, 0, 3.2]) for (const z of [-2.4, 2.4]) {
          const iso = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.28, 0.6, 10), isoMat);
          iso.position.set(x, 0.6, z);
          iso.userData.systemId = 'ISO';
          scene.add(iso);
          pickables.push(iso);
        }
        // Dampers.
        const dampMat = new THREE.MeshStandardMaterial({ color: 0x24463e, emissive: AMBER, emissiveIntensity: 0.4, metalness: 0.5, roughness: 0.35 });
        for (const sign of [-1, 1]) {
          const damper = new THREE.Mesh(new THREE.BoxGeometry(0.15, 5.4, 0.15), dampMat);
          damper.position.set(sign * 4.1, 4.2, 3.1);
          damper.rotation.z = sign * 0.5;
          damper.userData.systemId = 'DMP';
          scene.add(damper);
          pickables.push(damper);
        }

        // Ground motion rings.
        const rings: THREE.Mesh[] = [];
        for (let i = 0; i < 3; i++) {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(3 + i * 2, 0.03, 4, 48), new THREE.MeshBasicMaterial({ color: ROSE, transparent: true, opacity: 0.25 - i * 0.05 }));
          ring.rotation.x = Math.PI / 2;
          ring.position.y = 0.06;
          scene.add(ring);
          rings.push(ring);
        }

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          floors.forEach((f) => {
            const data = SEISMIC_FLOORS.find((x) => x.id === f.id)!;
            const color = currentMode === 'drift' ? (data.drift <= '1/520' ? GREEN : AMBER) : currentMode === 'damage' ? (data.damage === 'Moderate' ? ROSE : data.damage === 'Minor' ? AMBER : GREEN) : CYAN;
            (f.slab.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(color);
            (f.slab.material as THREE.MeshStandardMaterial).emissiveIntensity = f.id === currentSelected ? 0.8 : 0.12;
          });
          const selFloor = SEISMIC_FLOORS.find((x) => x.id === currentSelected);
          const selSystem = SEISMIC_SYSTEMS.find((x) => x.id === currentSelected);
          if (selFloor || selSystem) {
            label.style.display = 'block';
            const detail = selFloor ? `${selFloor.name} · drift ${selFloor.drift} · ${selFloor.accel}` : `${selSystem!.name} · ${selSystem!.detail}`;
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid rgba(83,240,190,.5);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:#53f0be;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">SEISMIC</span><div style="margin-top:2px;font-weight:500">${detail}</div></div>`;
          } else label.style.display = 'none';
          void SEISMIC_SCENARIOS[currentScenario];
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
          if (hit.object.userData.floorId) {
            const f = SEISMIC_FLOORS.find((x) => x.id === hit.object.userData.floorId);
            return f ? { id: f.id, name: f.name, type: 'Floor', detail: `drift ${f.drift} · ${f.accel} · ${f.damage}` } : null;
          }
          const sys = SEISMIC_SYSTEMS.find((x) => x.id === hit.object.userData.systemId);
          return sys ? { id: sys.id, name: sys.name, type: sys.type, detail: sys.detail } : null;
        };
        const move = (event: PointerEvent) => { updatePointer(event); ctx.renderer.domElement.style.cursor = pick() ? 'pointer' : 'grab'; };
        const click = (event: PointerEvent) => { updatePointer(event); const s = pick(); if (s) onSelectRef.current(s); };
        ctx.renderer.domElement.addEventListener('pointermove', move);
        ctx.renderer.domElement.addEventListener('pointerup', click);
        ctx.addDispose(() => {
          ctx.renderer.domElement.removeEventListener('pointermove', move);
          ctx.renderer.domElement.removeEventListener('pointerup', click);
        });

        const projected = new THREE.Vector3();
        const amp = 0.12;
        ctx.addUpdate((dt, elapsed) => {
          const s = SEISMIC_SCENARIOS[currentScenario];
          const scale = s.pga === '0.32 g' ? 2.4 : s.pga === '0.18 g' ? 1.2 : 0.4;
          const sway = Math.sin(elapsed * 2.2) * amp * scale;
          floors.forEach((f, i) => {
            f.group.position.x = sway * (0.25 + i * 0.1);
            f.group.rotation.z = sway * 0.01 * (0.3 + i * 0.1);
          });
          rings.forEach((r, i) => { (r.material as THREE.MeshBasicMaterial).opacity = 0.12 + Math.sin(elapsed * 2 + i) * 0.08 + scale * 0.04; });
          if (currentSelected) {
            projected.set(0, 10.4, 3).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            label.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
          }
          void dt;
        });
      }}
    />
  );
}
