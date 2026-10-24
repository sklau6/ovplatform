import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { WASTE_SCENARIOS, WASTE_STREAMS, type WasteMode, type WasteScenario } from '../lib/wasteData';

export interface WasteSelection { id: string; name: string; type: string; tons: number; diversion: string; value: string }
interface Props { mode: WasteMode; scenario: WasteScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: WasteSelection) => void }
interface Api { setMode: (m: WasteMode) => void; setScenario: (s: WasteScenario) => void; setSelected: (id: string | null) => void }

const CYAN = 0x51d6ff, GREEN = 0x53f0be, AMBER = 0xf4bd72, VIOLET = 0xa991ff, ROSE = 0xff7088;

export function WasteScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D construction waste and circularity yard with material skips, crusher, conveyor, excavator, truck and material passports."
      cameraPosition={[18, 10, 22]}
      target={[0, 2, 0]}
      fov={40}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.011 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.13}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x9de0d0, 0x030706, 0.95));
        const key = new THREE.DirectionalLight(0xd8fff8, 1.7);
        key.position.set(-14, 20, 16);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.7);
        rim.position.set(16, 8, -16);
        scene.add(rim);

        const yard = new THREE.Mesh(new THREE.BoxGeometry(34, 0.6, 24), new THREE.MeshStandardMaterial({ color: 0x0e1a16, metalness: 0.35, roughness: 0.75 }));
        yard.position.y = -0.3;
        scene.add(yard);
        const grid: THREE.Vector3[] = [];
        for (let x = -16; x <= 16; x += 2) grid.push(new THREE.Vector3(x, 0.01, -12), new THREE.Vector3(x, 0.01, 12));
        for (let z = -12; z <= 12; z += 2) grid.push(new THREE.Vector3(-16, 0.01, z), new THREE.Vector3(16, 0.01, z));
        scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(grid), new THREE.LineBasicMaterial({ color: 0x1c5d4d, transparent: true, opacity: 0.15 })));

        const pickables: THREE.Mesh[] = [];
        const bins: Array<{ id: string; mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; pos: THREE.Vector3; color: string }> = [];
        WASTE_STREAMS.forEach((s, i) => {
          const x = -11 + (i % 3) * 8;
          const z = -5 + Math.floor(i / 3) * 9;
          const color = new THREE.Color(s.color);
          const mat = new THREE.MeshStandardMaterial({ color: 0x3b4a42, emissive: color, emissiveIntensity: 0.2, metalness: 0.3, roughness: 0.65 });
          const bin = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.4, 3.2), mat);
          bin.position.set(x, 0.7, z);
          bin.userData.streamId = s.id;
          scene.add(bin);
          pickables.push(bin);
          // Material heap.
          const heap = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.4 + (s.tons / 900), 6), new THREE.MeshStandardMaterial({ color: s.color, roughness: 0.9 }));
          heap.position.set(x, 1.6 + s.tons / 1800, z);
          heap.rotation.y = i;
          scene.add(heap);
          bins.push({ id: s.id, mesh: bin, mat, pos: new THREE.Vector3(x, 0.7, z), color: s.color });
        });

        // Crusher.
        const crusher = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.2, 3.2), new THREE.MeshStandardMaterial({ color: 0x4f615a, metalness: 0.6, roughness: 0.4 }));
        body.position.y = 1.2;
        crusher.add(body);
        const hopper = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.8, 1.0, 8), new THREE.MeshStandardMaterial({ color: 0x8a6a3a, metalness: 0.5, roughness: 0.5 }));
        hopper.position.y = 2.8;
        crusher.add(hopper);
        crusher.position.set(8, 0, -1);
        scene.add(crusher);

        // Conveyor.
        const conveyor = new THREE.Mesh(new THREE.BoxGeometry(7, 0.25, 1.4), new THREE.MeshStandardMaterial({ color: 0x2c3f39, metalness: 0.5, roughness: 0.5 }));
        conveyor.position.set(4, 1.5, 3.5);
        conveyor.rotation.z = -0.18;
        scene.add(conveyor);

        // Excavator.
        const exc = new THREE.Group();
        const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.7, 1.8), new THREE.MeshStandardMaterial({ color: 0xc79b3a, metalness: 0.4, roughness: 0.5 }));
        exc.add(base);
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.6, 0.35), new THREE.MeshStandardMaterial({ color: 0xc79b3a, metalness: 0.4, roughness: 0.5 }));
        arm.position.set(1.4, 1.8, 0);
        arm.rotation.z = -0.7;
        exc.add(arm);
        const bucket = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 1.2), new THREE.MeshStandardMaterial({ color: 0x3f4a46, metalness: 0.5, roughness: 0.5 }));
        bucket.position.set(2.6, 3.2, 0);
        exc.add(bucket);
        exc.position.set(-2, 0.35, 7);
        scene.add(exc);

        // Truck.
        const truck = new THREE.Group();
        const cab = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 1.2), new THREE.MeshStandardMaterial({ color: 0xcfd8da, metalness: 0.4, roughness: 0.4 }));
        cab.position.set(-1.4, 0.7, 0);
        truck.add(cab);
        const bed = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.8, 1.5), new THREE.MeshStandardMaterial({ color: 0x3f5f6a, roughness: 0.7 }));
        bed.position.set(0.6, 0.7, 0);
        truck.add(bed);
        truck.position.set(11, 0, 8);
        scene.add(truck);

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          bins.forEach((b) => {
            const s = WASTE_STREAMS.find((x) => x.id === b.id)!;
            const color = currentMode === 'diversion' ? (parseInt(s.diversion) > 80 ? GREEN : AMBER) :
              currentMode === 'carbon' ? (s.type === 'Inert' ? CYAN : s.type === 'Metal' ? VIOLET : GREEN) :
                currentMode === 'market' ? (s.value !== '—' ? GREEN : ROSE) : new THREE.Color(s.color).getHex();
            b.mat.emissive.setHex(color);
            b.mat.emissiveIntensity = b.id === currentSelected ? 0.9 : 0.2;
            const scale = currentScenario === 'demolition' ? 1.2 : currentScenario === 'retrofit' ? 0.8 : 1;
            b.mesh.scale.set(scale, 1, scale);
          });
          const s = WASTE_STREAMS.find((x) => x.id === currentSelected);
          if (s) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid ${s.color}88;border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:${s.color};font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${s.id} · ${s.type.toUpperCase()}</span><div style="margin-top:2px;font-weight:500">${s.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${s.tons} t · ${s.diversion} diverted · ${s.value}</div></div>`;
          } else label.style.display = 'none';
          void WASTE_SCENARIOS[currentScenario];
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
          const s = WASTE_STREAMS.find((x) => x.id === hit.object.userData.streamId);
          return s ? { id: s.id, name: s.name, type: s.type, tons: s.tons, diversion: s.diversion, value: s.value } : null;
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
          bins.forEach((b, i) => { b.mesh.position.y = 0.7 + Math.sin(elapsed * 1.2 + i) * 0.02; });
          conveyor.rotation.x += dt * 0.3;
          if (currentSelected) {
            const b = bins.find((x) => x.id === currentSelected);
            if (b) projected.set(b.pos.x, 2.2, b.pos.z).project(ctx.camera);
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
