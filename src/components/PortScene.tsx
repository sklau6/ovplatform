import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { createVehicle } from '../lib/vehicleModels';
import { PORT_ASSETS, PORT_SCENARIOS, type PortMode, type PortScenario } from '../lib/portData';

export interface PortSelection { id: string; name: string; type: string; metric: string; status: string }
interface Props { mode: PortMode; scenario: PortScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: PortSelection) => void }
interface Api { setMode: (m: PortMode) => void; setScenario: (s: PortScenario) => void; setSelected: (id: string | null) => void }

const CYAN = 0x51d6ff, GREEN = 0x53f0be, AMBER = 0xf4bd72, VIOLET = 0xa991ff, ROSE = 0xff7088;

export function PortScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D container port with ship-to-shore cranes, container vessel, yard blocks, trucks, rail terminal, gate and quay."
      cameraPosition={[24, 16, 28]}
      target={[0, 3, 0]}
      fov={40}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.007 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.12}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x8dd8e8, 0x030706, 1.0));
        const key = new THREE.DirectionalLight(0xe8fff4, 1.7);
        key.position.set(-22, 26, 22);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.6);
        rim.position.set(24, 12, -22);
        scene.add(rim);

        const water = new THREE.Mesh(new THREE.PlaneGeometry(60, 34), new THREE.MeshPhysicalMaterial({ color: 0x0a3a4a, transparent: true, opacity: 0.9, roughness: 0.15, metalness: 0.6 }));
        water.rotation.x = -Math.PI / 2;
        water.position.set(0, -1.2, -8);
        scene.add(water);
        const quay = new THREE.Mesh(new THREE.BoxGeometry(50, 1.2, 12), new THREE.MeshStandardMaterial({ color: 0x2a3b39, metalness: 0.3, roughness: 0.75 }));
        quay.position.set(0, -0.4, 4);
        scene.add(quay);
        const apron = new THREE.Mesh(new THREE.PlaneGeometry(48, 12), new THREE.MeshStandardMaterial({ color: 0x3f4a46, roughness: 0.8 }));
        apron.rotation.x = -Math.PI / 2;
        apron.position.set(0, 0.21, 10);
        scene.add(apron);

        const pickables: THREE.Mesh[] = [];
        const assets: Record<string, THREE.Mesh> = {};
        const steel = new THREE.MeshStandardMaterial({ color: 0xb06f3a, metalness: 0.5, roughness: 0.45 });
        const containerColors = [0x4f7f6a, 0x8a5a3b, 0x3f5f7a, 0x7a6a3f, 0x5f4f7a];

        // Vessel.
        const ship = new THREE.Group();
        const hull = new THREE.Mesh(new THREE.BoxGeometry(18, 1.4, 4.4), new THREE.MeshStandardMaterial({ color: 0x273b45, metalness: 0.5, roughness: 0.4 }));
        hull.position.y = -0.4;
        ship.add(hull);
        const bridge = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 3.8), new THREE.MeshStandardMaterial({ color: 0xcfd8da, metalness: 0.3, roughness: 0.4 }));
        bridge.position.set(7, 1.2, 0);
        ship.add(bridge);
        for (let i = 0; i < 10; i++) {
          const c = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.45, 1.3), new THREE.MeshStandardMaterial({ color: containerColors[i % 5], roughness: 0.7 }));
          c.position.set(-7 + i * 1.4, 0.5, (i % 3 - 1) * 1.3);
          ship.add(c);
        }
        ship.position.set(-2, 0, -4);
        scene.add(ship);
        const shipBody = hull;
        shipBody.userData.assetId = 'VSL-01';
        pickables.push(shipBody);
        assets['VSL-01'] = shipBody;

        // STS cranes.
        const cranes: THREE.Group[] = [];
        for (const [i, x] of [-8, -1, 6].entries()) {
          const crane = new THREE.Group();
          for (const dx of [-1.4, 1.4]) for (const dz of [-1.2, 1.2]) {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 8, 0.22), steel);
            leg.position.set(dx, 4, dz);
            crane.add(leg);
          }
          const beam = new THREE.Mesh(new THREE.BoxGeometry(6, 0.35, 0.35), steel);
          beam.position.set(0, 8, 0);
          crane.add(beam);
          const boom = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 10), steel);
          boom.position.set(0, 8.2, -4);
          crane.add(boom);
          const cab = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.8), new THREE.MeshStandardMaterial({ color: 0x2c4a45, metalness: 0.5, roughness: 0.4 }));
          cab.position.set(0, 7.6, 1.2);
          crane.add(cab);
          const trolley = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.6), new THREE.MeshStandardMaterial({ color: AMBER, metalness: 0.4, roughness: 0.4 }));
          trolley.position.set(0, 7.6, -3);
          crane.add(trolley);
          const hit = new THREE.Mesh(new THREE.BoxGeometry(3.2, 8.4, 3.2), new THREE.MeshBasicMaterial({ visible: false }));
          hit.position.set(0, 4.2, 0);
          hit.userData.assetId = `STS-0${i + 1}`;
          crane.add(hit);
          pickables.push(hit);
          assets[`STS-0${i + 1}`] = hit;
          crane.position.set(x, 0, 4);
          scene.add(crane);
          cranes.push(crane);
        }

        // Rail terminal.
        for (let i = 0; i < 3; i++) {
          const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 10), new THREE.MeshStandardMaterial({ color: 0x9aa7a3, metalness: 0.7, roughness: 0.3 }));
          rail.position.set(-10 + i * 0.7, 0.25, 6);
          scene.add(rail);
        }
        const railYard = new THREE.Mesh(new THREE.BoxGeometry(4, 0.2, 10), new THREE.MeshStandardMaterial({ color: 0x44504c, roughness: 0.8 }));
        railYard.position.set(-9.3, 0.15, 6);
        railYard.userData.assetId = 'RAIL';
        scene.add(railYard);
        pickables.push(railYard);
        assets['RAIL'] = railYard;

        // Yard blocks.
        for (let b = 0; b < 3; b++) {
          for (let i = 0; i < 12; i++) {
            const c = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 1.4), new THREE.MeshStandardMaterial({ color: containerColors[i % 5], roughness: 0.7 }));
            c.position.set(8 + b * 3 + (i % 3) * 1.5, 0.45 + Math.floor(i / 3) * 0.52, 4 + (i % 4) * 1.6);
            scene.add(c);
            if (b === 0 && i === 0) {
              c.userData.assetId = 'YARD-A';
              pickables.push(c);
              assets['YARD-A'] = c;
            }
          }
        }

        // Gate.
        const gate = new THREE.Mesh(new THREE.BoxGeometry(10, 0.2, 2.5), new THREE.MeshStandardMaterial({ color: 0x3d4a46, roughness: 0.8 }));
        gate.position.set(0, 0.2, 12);
        gate.userData.assetId = 'GATE';
        scene.add(gate);
        pickables.push(gate);
        assets['GATE'] = gate;

        // Trucks.
        const trucks: THREE.Group[] = [];
        for (let i = 0; i < 6; i++) {
          const t = createVehicle('truck', containerColors[i % 5]);
          t.position.set(-16 + i * 5.5, 0.02, 9.5);
          t.rotation.y = Math.PI / 2;
          scene.add(t);
          trucks.push(t);
        }

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          const s = PORT_SCENARIOS[currentScenario];
          Object.entries(assets).forEach(([id, mesh]) => {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (!mat.emissive) return;
            const color = currentMode === 'emissions' ? (id.startsWith('STS') ? AMBER : GREEN) :
              currentMode === 'landside' ? (id === 'GATE' || id === 'RAIL' ? CYAN : GREEN) :
                currentMode === 'berth' ? (id === 'VSL-01' || id.startsWith('STS') ? CYAN : GREEN) : GREEN;
            mat.emissive = new THREE.Color(color);
            mat.emissiveIntensity = id === currentSelected ? 0.9 : 0.12;
          });
          cranes.forEach((c) => { c.rotation.z = currentScenario === 'typhoon' ? -0.5 : 0; });
          const a = PORT_ASSETS.find((x) => x.id === currentSelected);
          if (a) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid rgba(83,240,190,.5);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:#53f0be;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${a.id} · ${a.type.toUpperCase()}</span><div style="margin-top:2px;font-weight:500">${a.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${a.metric} · ${a.status}</div></div>`;
          } else label.style.display = 'none';
          void s;
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
          const hit = raycaster.intersectObjects(pickables, true)[0];
          if (!hit) return null;
          const id = hit.object.userData.assetId;
          const a = PORT_ASSETS.find((x) => x.id === id);
          return a ? { id: a.id, name: a.name, type: a.type, metric: a.metric, status: a.status } : null;
        };
        const move = (event: PointerEvent) => { updatePointer(event); ctx.renderer.domElement.style.cursor = pick() ? 'pointer' : 'grab'; };
        const click = (event: PointerEvent) => { updatePointer(event); const a = pick(); if (a) onSelectRef.current(a); };
        ctx.renderer.domElement.addEventListener('pointermove', move);
        ctx.renderer.domElement.addEventListener('pointerup', click);
        ctx.addDispose(() => {
          ctx.renderer.domElement.removeEventListener('pointermove', move);
          ctx.renderer.domElement.removeEventListener('pointerup', click);
        });

        const projected = new THREE.Vector3();
        ctx.addUpdate((dt, elapsed) => {
          trucks.forEach((t, i) => {
            t.position.x = -16 + ((elapsed * 2 + i * 6) % 36);
            t.position.z = 9.5 + Math.sin(i) * 0.4;
          });
          if (currentSelected) {
            const a = PORT_ASSETS.find((x) => x.id === currentSelected);
            if (a) projected.set(a.x, 9.5, a.z).project(ctx.camera);
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
