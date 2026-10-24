import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { FLEET_ASSETS, FLEET_SCENARIOS, type FleetMode, type FleetScenario } from '../lib/fleetData';

export interface FleetSelection { id: string; name: string; type: string; metric: string; status: string }
interface Props { mode: FleetMode; scenario: FleetScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: FleetSelection) => void }
interface Api { setMode: (m: FleetMode) => void; setScenario: (s: FleetScenario) => void; setSelected: (id: string | null) => void }

const CYAN = 0x51d6ff, GREEN = 0x53f0be, AMBER = 0xf4bd72, VIOLET = 0xa991ff, ROSE = 0xff7088;

export function FleetScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D construction equipment yard with tower crane, excavators, wheel loader, telehandler, generator and survey drone."
      cameraPosition={[24, 16, 28]}
      target={[0, 7, 0]}
      fov={40}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.009 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.12}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x9de0d0, 0x030706, 1.0));
        const key = new THREE.DirectionalLight(0xe8fff4, 1.7);
        key.position.set(-16, 24, 18);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.65);
        rim.position.set(18, 10, -18);
        scene.add(rim);

        const yard = new THREE.Mesh(new THREE.BoxGeometry(34, 0.5, 26), new THREE.MeshStandardMaterial({ color: 0x121c16, roughness: 0.85, metalness: 0.15 }));
        yard.position.y = -0.25;
        scene.add(yard);
        const grid: THREE.Vector3[] = [];
        for (let x = -16; x <= 16; x += 2) grid.push(new THREE.Vector3(x, 0.01, -12), new THREE.Vector3(x, 0.01, 12));
        for (let z = -12; z <= 12; z += 2) grid.push(new THREE.Vector3(-16, 0.01, z), new THREE.Vector3(16, 0.01, z));
        scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(grid), new THREE.LineBasicMaterial({ color: 0x1c5d4d, transparent: true, opacity: 0.16 })));

        const pickables: THREE.Mesh[] = [];
        const assets: Record<string, THREE.Mesh> = {};
        const yellow = new THREE.MeshStandardMaterial({ color: 0xd9a521, metalness: 0.4, roughness: 0.5 });
        const dark = new THREE.MeshStandardMaterial({ color: 0x2a3330, metalness: 0.5, roughness: 0.5 });

        // Tower crane.
        const crane = new THREE.Group();
        const mast = new THREE.Mesh(new THREE.BoxGeometry(0.7, 18, 0.7), yellow);
        mast.position.y = 9;
        crane.add(mast);
        const jib = new THREE.Mesh(new THREE.BoxGeometry(18, 0.5, 0.5), yellow);
        jib.position.set(4, 18, 0);
        crane.add(jib);
        const counter = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 1.4), dark);
        counter.position.set(-4, 17.5, 0);
        crane.add(counter);
        const hook = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), dark);
        hook.position.set(8, 13, 0);
        crane.add(hook);
        const hit = new THREE.Mesh(new THREE.BoxGeometry(3, 18, 3), new THREE.MeshBasicMaterial({ visible: false }));
        hit.position.y = 9;
        hit.userData.assetId = 'TC-01';
        crane.add(hit);
        pickables.push(hit);
        assets['TC-01'] = hit;
        crane.position.set(-8, 0, -3);
        scene.add(crane);

        const excavator = (x: number, z: number, id: string) => {
          const g = new THREE.Group();
          const tracks = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.6, 1.6), dark);
          tracks.position.y = 0.35;
          g.add(tracks);
          const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 1.5), yellow);
          body.position.y = 1.1;
          body.userData.assetId = id;
          g.add(body);
          pickables.push(body);
          assets[id] = body;
          const arm = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.8, 0.35), yellow);
          arm.position.set(1.4, 1.9, 0);
          arm.rotation.z = -0.65;
          g.add(arm);
          const bucket = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 1.1), dark);
          bucket.position.set(2.6, 2.9, 0);
          g.add(bucket);
          g.position.set(x, 0, z);
          scene.add(g);
        };
        excavator(-2, 4, 'EX-01');
        excavator(3, 4, 'EX-02');

        // Wheel loader.
        const loader = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 1.8), yellow);
        body.position.y = 1.1;
        body.userData.assetId = 'LD-01';
        loader.add(body);
        pickables.push(body);
        assets['LD-01'] = body;
        for (const dx of [-1, 1]) {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.35, 12), dark);
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(dx, 0.55, 0.9);
          loader.add(wheel);
          const wheel2 = wheel.clone();
          wheel2.position.z = -0.9;
          loader.add(wheel2);
        }
        loader.position.set(8, 0, 2);
        scene.add(loader);

        // Telehandler.
        const tele = new THREE.Group();
        const tbody = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 1.6), yellow);
        tbody.position.y = 1.0;
        tbody.userData.assetId = 'TH-01';
        tele.add(tbody);
        pickables.push(tbody);
        assets['TH-01'] = tbody;
        const boom = new THREE.Mesh(new THREE.BoxGeometry(5, 0.3, 0.3), yellow);
        boom.position.set(2.6, 2.4, 0);
        boom.rotation.z = 0.25;
        tele.add(boom);
        tele.position.set(7, 0, 7);
        scene.add(tele);

        // Generator.
        const gen = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 1.4), new THREE.MeshStandardMaterial({ color: 0x4f5f58, metalness: 0.5, roughness: 0.45 }));
        gen.position.set(-10, 0.7, 7);
        gen.userData.assetId = 'GEN-01';
        scene.add(gen);
        pickables.push(gen);
        assets['GEN-01'] = gen;

        // Drone.
        const drone = new THREE.Group();
        for (let i = 0; i < 4; i++) {
          const arm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 0.06), dark);
          arm.rotation.y = (i / 4) * Math.PI;
          drone.add(arm);
        }
        const rotor = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.04, 12), new THREE.MeshBasicMaterial({ color: CYAN }));
        rotor.position.y = 0.1;
        drone.add(rotor);
        drone.position.set(0, 8, -8);
        scene.add(drone);

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          Object.entries(assets).forEach(([id, mesh]) => {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (!mat.emissive) return;
            const color = currentMode === 'utilisation' ? (id === 'TH-01' ? AMBER : GREEN) :
              currentMode === 'maintenance' ? (id === 'EX-02' ? ROSE : GREEN) :
                currentMode === 'emissions' ? (id === 'GEN-01' ? AMBER : GREEN) : AMBER;
            mat.emissive = new THREE.Color(color);
            mat.emissiveIntensity = id === currentSelected ? 0.9 : 0.12;
          });
          const a = FLEET_ASSETS.find((x) => x.id === currentSelected);
          if (a) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid rgba(83,240,190,.5);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:#53f0be;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${a.id} · ${a.type.toUpperCase()}</span><div style="margin-top:2px;font-weight:500">${a.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${a.metric} · ${a.status}</div></div>`;
          } else label.style.display = 'none';
          void FLEET_SCENARIOS[currentScenario];
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
          const a = FLEET_ASSETS.find((x) => x.id === hit.object.userData.assetId);
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
          drone.position.y = 8 + Math.sin(elapsed * 1.5) * 0.3;
          drone.rotation.y += dt * 0.6;
          hook.position.y = 13 + Math.sin(elapsed * 0.8) * 1.2;
          if (currentSelected) {
            const a = FLEET_ASSETS.find((x) => x.id === currentSelected);
            if (a) projected.set(a.x, 6.5, a.z).project(ctx.camera);
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
