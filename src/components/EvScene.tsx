import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { createVehicle } from '../lib/vehicleModels';
import { cloneRealCar, loadRealCarTemplate } from '../lib/realCar';
import { EV_CHARGERS, EV_SCENARIOS, type EvMode, type EvScenario } from '../lib/evData';

export interface EvSelection { id: string; name: string; type: string; power: string; status: string }
interface Props { mode: EvMode; scenario: EvScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: EvSelection) => void }
interface Api { setMode: (m: EvMode) => void; setScenario: (s: EvScenario) => void; setSelected: (id: string | null) => void }

const CYAN = 0x51d6ff, GREEN = 0x53f0be, AMBER = 0xf4bd72, VIOLET = 0xa991ff, ROSE = 0xff7088;

export function EvScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D EV charging hub with solar canopy, DC fast chargers, AC chargers, vehicles, battery storage and grid connection."
      cameraPosition={[18, 12, 24]}
      target={[0, 2, 0]}
      fov={40}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.009 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.12}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x9de0e8, 0x030706, 0.95));
        const key = new THREE.DirectionalLight(0xd8fff8, 1.7);
        key.position.set(-18, 24, 18);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.65);
        rim.position.set(18, 10, -18);
        scene.add(rim);

        const ground = new THREE.Mesh(new THREE.BoxGeometry(34, 0.4, 22), new THREE.MeshStandardMaterial({ color: 0x0d1512, metalness: 0.3, roughness: 0.8 }));
        ground.position.y = -0.2;
        scene.add(ground);
        const grid: THREE.Vector3[] = [];
        for (let x = -16; x <= 16; x += 2) grid.push(new THREE.Vector3(x, 0.01, -10), new THREE.Vector3(x, 0.01, 10));
        for (let z = -10; z <= 10; z += 2) grid.push(new THREE.Vector3(-16, 0.01, z), new THREE.Vector3(16, 0.01, z));
        scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(grid), new THREE.LineBasicMaterial({ color: 0x1c5d4d, transparent: true, opacity: 0.14 })));

        // Solar canopy.
        const canopy = new THREE.Group();
        for (const x of [-8, 8]) for (const z of [-2, 4]) {
          const col = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5, 0.2), new THREE.MeshStandardMaterial({ color: 0x8fa6a0, metalness: 0.6, roughness: 0.35 }));
          col.position.set(x, 2.5, z);
          canopy.add(col);
        }
        const roof = new THREE.Mesh(new THREE.BoxGeometry(18, 0.2, 8), new THREE.MeshStandardMaterial({ color: 0x1f3b3a, metalness: 0.4, roughness: 0.5 }));
        roof.position.set(0, 5, 1);
        canopy.add(roof);
        for (let i = 0; i < 8; i++) {
          const panel = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.06, 3.4), new THREE.MeshStandardMaterial({ color: 0x1b3f5a, emissive: 0x1d5d7a, emissiveIntensity: 0.35, metalness: 0.5, roughness: 0.2 }));
          panel.position.set(-7 + i * 2, 5.15, 1);
          canopy.add(panel);
        }
        scene.add(canopy);

        const pickables: THREE.Mesh[] = [];
        const chargers: Array<{ id: string; mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; pos: THREE.Vector3 }> = [];

        const carPlaceholders: Array<{ group: THREE.Group; color: number; x: number; z: number }> = [];
        EV_CHARGERS.forEach((c, i) => {
          const color = new THREE.Color(c.color);
          const mat = new THREE.MeshStandardMaterial({ color: 0x2e4038, emissive: color, emissiveIntensity: 0.4, metalness: 0.4, roughness: 0.45 });
          const pedestal = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.5, 0.5), mat);
          pedestal.position.set(c.x, 0.75, c.z);
          pedestal.userData.chargerId = c.id;
          scene.add(pedestal);
          pickables.push(pedestal);
          const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.3), new THREE.MeshBasicMaterial({ color }));
          screen.position.set(c.x, 1.15, c.z + 0.27);
          scene.add(screen);
          // Vehicle — detailed paint, glass, wheels and lights.
          const car = createVehicle(i % 3 === 0 ? 'suv' : 'sedan', i % 2 ? 0x3f5f6a : 0xcfd8da);
          car.position.set(c.x, 0.02, c.z + 3.4);
          car.rotation.y = Math.PI;
          scene.add(car);
          carPlaceholders.push({ group: car, color: i % 2 ? 0x3f5f6a : 0xcfd8da, x: c.x, z: c.z });
          chargers.push({ id: c.id, mesh: pedestal, mat, pos: new THREE.Vector3(c.x, 0.75, c.z) });
        });

        let disposed = false;
        loadRealCarTemplate().then((template) => {
          if (disposed) return;
          carPlaceholders.forEach((slot) => {
            scene.remove(slot.group);
            const real = cloneRealCar(template, slot.color);
            real.position.set(slot.x, 0.02, slot.z + 3.4);
            real.rotation.y = Math.PI;
            scene.add(real);
          });
        }).catch(() => {});
        ctx.addDispose(() => { disposed = true; });

        // Battery storage.
        const battery = new THREE.Mesh(new THREE.BoxGeometry(3, 1.8, 1.6), new THREE.MeshStandardMaterial({ color: 0x3f5f5a, emissive: GREEN, emissiveIntensity: 0.3, metalness: 0.5, roughness: 0.4 }));
        battery.position.set(-13, 0.9, -5);
        scene.add(battery);
        // Grid transformer.
        const transformer = new THREE.Mesh(new THREE.BoxGeometry(2, 1.6, 1.6), new THREE.MeshStandardMaterial({ color: 0x5b6a4a, metalness: 0.4, roughness: 0.5 }));
        transformer.position.set(13, 0.8, -5);
        scene.add(transformer);

        // Charge particles.
        const particles: THREE.Mesh[] = [];
        for (let i = 0; i < 6; i++) {
          const p = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), new THREE.MeshBasicMaterial({ color: GREEN }));
          scene.add(p);
          particles.push(p);
        }

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          chargers.forEach((c) => {
            const d = EV_CHARGERS.find((x) => x.id === c.id)!;
            const color = currentMode === 'energy' ? (d.power === '0 kW' ? GREEN : AMBER) :
              currentMode === 'grid' ? (d.type.startsWith('DC') ? CYAN : GREEN) :
                currentMode === 'maintenance' ? (d.status === 'Fault' ? ROSE : GREEN) : new THREE.Color(d.color).getHex();
            c.mat.emissive.setHex(color);
            c.mat.emissiveIntensity = c.id === currentSelected ? 0.9 : 0.4;
            c.mesh.scale.setScalar(c.id === currentSelected ? 1.15 : 1);
          });
          const d = EV_CHARGERS.find((x) => x.id === currentSelected);
          if (d) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid ${d.color}88;border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:${d.color};font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${d.id} · ${d.type}</span><div style="margin-top:2px;font-weight:500">${d.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${d.power} · ${d.status}</div></div>`;
          } else label.style.display = 'none';
          void EV_SCENARIOS[currentScenario];
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
          const d = EV_CHARGERS.find((x) => x.id === hit.object.userData.chargerId);
          return d ? { id: d.id, name: d.name, type: d.type, power: d.power, status: d.status } : null;
        };
        const move = (event: PointerEvent) => { updatePointer(event); ctx.renderer.domElement.style.cursor = pick() ? 'pointer' : 'grab'; };
        const click = (event: PointerEvent) => { updatePointer(event); const d = pick(); if (d) onSelectRef.current(d); };
        ctx.renderer.domElement.addEventListener('pointermove', move);
        ctx.renderer.domElement.addEventListener('pointerup', click);
        ctx.addDispose(() => {
          ctx.renderer.domElement.removeEventListener('pointermove', move);
          ctx.renderer.domElement.removeEventListener('pointerup', click);
        });

        const projected = new THREE.Vector3();
        ctx.addUpdate((dt, elapsed) => {
          particles.forEach((p, i) => {
            const c = EV_CHARGERS[i];
            p.position.set(c.x, 0.5 + ((elapsed * 0.7 + i * 0.2) % 1) * 1.4, c.z - 0.5);
          });
          if (currentSelected) {
            const c = chargers.find((x) => x.id === currentSelected);
            if (c) projected.set(c.pos.x, 2.4, c.pos.z).project(ctx.camera);
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
