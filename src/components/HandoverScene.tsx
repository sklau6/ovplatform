import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { HANDOVER_SCENARIOS, HANDOVER_SYSTEMS, type HandoverMode, type HandoverScenario } from '../lib/handoverData';

export interface HandoverSelection { id: string; name: string; floor: string; tests: string; snags: number; status: string }
interface Props { mode: HandoverMode; scenario: HandoverScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: HandoverSelection) => void }
interface Api { setMode: (m: HandoverMode) => void; setScenario: (s: HandoverScenario) => void; setSelected: (id: string | null) => void }

const CYAN = 0x51d6ff, GREEN = 0x53f0be, AMBER = 0xf4bd72, VIOLET = 0xa991ff, ROSE = 0xff7088;

export function HandoverScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D building commissioning and handover model with floors, systems, snags, asset tags and handover gate."
      cameraPosition={[16, 12, 20]}
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
        key.position.set(-14, 20, 16);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.7);
        rim.position.set(16, 8, -16);
        scene.add(rim);

        const ground = new THREE.Mesh(new THREE.BoxGeometry(24, 0.5, 18), new THREE.MeshStandardMaterial({ color: 0x0a1714, metalness: 0.3, roughness: 0.8 }));
        ground.position.y = -0.25;
        scene.add(ground);
        const grid: THREE.Vector3[] = [];
        for (let x = -11; x <= 11; x += 2) grid.push(new THREE.Vector3(x, 0.01, -8), new THREE.Vector3(x, 0.01, 8));
        for (let z = -8; z <= 8; z += 2) grid.push(new THREE.Vector3(-11, 0.01, z), new THREE.Vector3(11, 0.01, z));
        scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(grid), new THREE.LineBasicMaterial({ color: 0x1c5d5d, transparent: true, opacity: 0.16 })));

        const slabMat = new THREE.MeshStandardMaterial({ color: 0x6f847b, metalness: 0.3, roughness: 0.55 });
        const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x2c4f58, transparent: true, opacity: 0.2, metalness: 0.4, roughness: 0.15 });
        const floors: Array<{ id: string; slab: THREE.Mesh; mat: THREE.MeshStandardMaterial }> = [];
        const pickables: THREE.Mesh[] = [];
        for (let i = 0; i < 6; i++) {
          const y = 0.6 + i * 2.0;
          const slab = new THREE.Mesh(new THREE.BoxGeometry(10, 0.18, 8), slabMat);
          slab.position.set(0, y, 0);
          slab.userData.floorId = `L${i + 1}`;
          scene.add(slab);
          pickables.push(slab);
          const glass = new THREE.Mesh(new THREE.BoxGeometry(9.6, 1.7, 7.6), glassMat);
          glass.position.set(0, y + 0.95, 0);
          scene.add(glass);
          const edge = new THREE.LineSegments(new THREE.EdgesGeometry(slab.geometry), new THREE.LineBasicMaterial({ color: GREEN, transparent: true, opacity: 0.3 }));
          slab.add(edge);
          floors.push({ id: `L${i + 1}`, slab, mat: slabMat });
        }

        // Systems as colored vertical risers.
        const systems: Array<{ id: string; mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; pos: THREE.Vector3; color: string }> = [];
        HANDOVER_SYSTEMS.forEach((s, i) => {
          const color = new THREE.Color(s.color);
          const mat = new THREE.MeshStandardMaterial({ color: 0x2e4038, emissive: color, emissiveIntensity: 0.35, metalness: 0.4, roughness: 0.5 });
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 9 + (i % 2), 0.6), mat);
          mesh.position.set(-4.6 + i * 1.8, 5.5, -3.2);
          mesh.userData.systemId = s.id;
          scene.add(mesh);
          pickables.push(mesh);
          systems.push({ id: s.id, mesh, mat, pos: mesh.position.clone(), color: s.color });
        });

        // Snag pins.
        const snags: THREE.Mesh[] = [];
        for (let i = 0; i < 16; i++) {
          const pin = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.4, 6), new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? AMBER : ROSE }));
          pin.position.set(-4 + (i % 5) * 2, 1.2 + Math.floor(i / 5) * 2.0, 4.2);
          scene.add(pin);
          snags.push(pin);
        }

        // Asset tags.
        for (let i = 0; i < 8; i++) {
          const tag = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.18, 0.05), new THREE.MeshBasicMaterial({ color: CYAN }));
          tag.position.set(-3.5 + i * 1.0, 2.0, 4.1);
          scene.add(tag);
        }

        // Handover gate.
        const gate = new THREE.Group();
        for (const x of [-1.8, 1.8]) {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3, 0.2), new THREE.MeshStandardMaterial({ color: AMBER, metalness: 0.5, roughness: 0.35 }));
          leg.position.set(x, 1.5, 0);
          gate.add(leg);
        }
        const top = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.2, 0.2), new THREE.MeshStandardMaterial({ color: AMBER, metalness: 0.5, roughness: 0.35 }));
        top.position.y = 3;
        gate.add(top);
        gate.position.set(6, 0, 0);
        scene.add(gate);

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          systems.forEach((s) => {
            const data = HANDOVER_SYSTEMS.find((x) => x.id === s.id)!;
            const color = currentMode === 'snags' ? (data.snags > 6 ? ROSE : data.snags > 2 ? AMBER : GREEN) :
              currentMode === 'assets' ? (data.status === 'Complete' ? GREEN : CYAN) :
                currentMode === 'handover' ? (data.status === 'Complete' || data.status === 'Witnessed' ? GREEN : AMBER) : new THREE.Color(data.color).getHex();
            s.mat.emissive.setHex(color);
            s.mat.emissiveIntensity = s.id === currentSelected ? 0.9 : 0.35;
          });
          snags.forEach((p, i) => { p.visible = currentMode === 'snags' && i < (currentScenario === 'ready' ? 4 : currentScenario === 'punch' ? 12 : 16); });
          const data = HANDOVER_SYSTEMS.find((x) => x.id === currentSelected);
          if (data) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid ${data.color}88;border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:${data.color};font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${data.id} · ${data.status.toUpperCase()}</span><div style="margin-top:2px;font-weight:500">${data.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${data.tests} tests · ${data.snags} snags · ${data.floor}</div></div>`;
          } else label.style.display = 'none';
          void HANDOVER_SCENARIOS[currentScenario];
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
          const data = HANDOVER_SYSTEMS.find((x) => x.id === hit.object.userData.systemId);
          return data ? { id: data.id, name: data.name, floor: data.floor, tests: data.tests, snags: data.snags, status: data.status } : null;
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
        ctx.addUpdate((dt, elapsed) => {
          snags.forEach((p, i) => { p.position.y = 1.2 + Math.floor(i / 5) * 2.0 + Math.sin(elapsed * 2 + i) * 0.05; });
          if (currentSelected) {
            const s = systems.find((x) => x.id === currentSelected);
            if (s) projected.set(s.pos.x, s.pos.y + 5.5, s.pos.z).project(ctx.camera);
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
