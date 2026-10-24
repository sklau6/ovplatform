import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { POWER_ASSETS, POWER_SCENARIOS, type PowerMode, type PowerScenario } from '../lib/powerData';

export interface PowerSelection { id: string; name: string; type: string; metric: string; status: string }
interface Props { mode: PowerMode; scenario: PowerScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: PowerSelection) => void }
interface Api { setMode: (m: PowerMode) => void; setScenario: (s: PowerScenario) => void; setSelected: (id: string | null) => void }

const CYAN = 0x51d6ff, GREEN = 0x53f0be, AMBER = 0xf4bd72, VIOLET = 0xa991ff, ROSE = 0xff7088;

export function PowerScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D electrical distribution room with transformers, LV switchgear, busbars, ATS, UPS, capacitor bank and standby generator."
      cameraPosition={[16, 10, 20]}
      target={[0, 2, 0]}
      fov={40}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.011 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.12}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x9de0e8, 0x030706, 0.95));
        const key = new THREE.DirectionalLight(0xd8fff8, 1.6);
        key.position.set(-14, 20, 16);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.7);
        rim.position.set(16, 8, -16);
        scene.add(rim);

        const floor = new THREE.Mesh(new THREE.BoxGeometry(30, 0.4, 22), new THREE.MeshStandardMaterial({ color: 0x0a1714, metalness: 0.4, roughness: 0.7 }));
        floor.position.y = -0.2;
        scene.add(floor);
        const grid: THREE.Vector3[] = [];
        for (let x = -14; x <= 14; x += 2) grid.push(new THREE.Vector3(x, 0.01, -10), new THREE.Vector3(x, 0.01, 10));
        for (let z = -10; z <= 10; z += 2) grid.push(new THREE.Vector3(-14, 0.01, z), new THREE.Vector3(14, 0.01, z));
        scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(grid), new THREE.LineBasicMaterial({ color: 0x1c5d5d, transparent: true, opacity: 0.16 })));

        const steel = new THREE.MeshStandardMaterial({ color: 0x6b8a83, metalness: 0.6, roughness: 0.35 });
        const cabinetMat = new THREE.MeshStandardMaterial({ color: 0x3f5f5a, metalness: 0.5, roughness: 0.4 });
        const pickables: THREE.Mesh[] = [];
        const assets: Record<string, THREE.Mesh> = {};

        // Transformers.
        for (const [i, x] of [-7, -2].entries()) {
          const tx = new THREE.Group();
          const body = new THREE.Mesh(new THREE.BoxGeometry(3, 2.4, 2.2), cabinetMat);
          body.position.y = 1.2;
          body.userData.assetId = `TX-0${i + 1}`;
          tx.add(body);
          pickables.push(body);
          assets[`TX-0${i + 1}`] = body;
          for (let k = 0; k < 3; k++) {
            const fin = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.6, 2.4), steel);
            fin.position.set(-1.2 + k * 0.5, 1.4, 0);
            tx.add(fin);
          }
          tx.position.set(x, 0, -4);
          scene.add(tx);
        }

        // LV switchboard.
        const lv = new THREE.Group();
        for (let i = 0; i < 6; i++) {
          const cab = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.2, 1.0), cabinetMat);
          cab.position.set(-3 + i * 1.2, 1.1, 0);
          lv.add(cab);
          if (i === 2) {
            cab.userData.assetId = 'LV-01';
            pickables.push(cab);
            assets['LV-01'] = cab;
          }
        }
        lv.position.set(4, 0, -4);
        scene.add(lv);

        // Busbars.
        const busMat = new THREE.MeshStandardMaterial({ color: 0xc79b3a, metalness: 0.7, roughness: 0.3, emissive: AMBER, emissiveIntensity: 0.1 });
        for (let i = 0; i < 3; i++) {
          const bus = new THREE.Mesh(new THREE.BoxGeometry(14, 0.12, 0.12), busMat);
          bus.position.set(2, 3.2 + i * 0.25, -4);
          scene.add(bus);
        }

        // ATS.
        const ats = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.0, 1.6), cabinetMat);
        ats.position.set(4, 1.0, 1);
        ats.userData.assetId = 'ATS-01';
        scene.add(ats);
        pickables.push(ats);
        assets['ATS-01'] = ats;

        // UPS.
        const ups = new THREE.Group();
        const upsBody = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.0, 1.4), cabinetMat);
        upsBody.position.y = 1.0;
        upsBody.userData.assetId = 'UPS-01';
        ups.add(upsBody);
        pickables.push(upsBody);
        assets['UPS-01'] = upsBody;
        for (let i = 0; i < 4; i++) {
          const battery = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.18, 1.0), new THREE.MeshStandardMaterial({ color: 0x45c4f5, emissive: CYAN, emissiveIntensity: 0.4 }));
          battery.position.set(0, 0.3 + i * 0.35, 0);
          ups.add(battery);
        }
        ups.position.set(-5, 0, 3);
        scene.add(ups);

        // Capacitor bank.
        const cap = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.8, 1.2), cabinetMat);
        cap.position.set(0, 0.9, 4);
        cap.userData.assetId = 'CAP-01';
        scene.add(cap);
        pickables.push(cap);
        assets['CAP-01'] = cap;

        // Generator.
        const gen = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 1.8), new THREE.MeshStandardMaterial({ color: 0x5b6a4a, metalness: 0.4, roughness: 0.5 }));
        gen.position.set(8, 1.1, 4);
        gen.userData.assetId = 'GEN-01';
        scene.add(gen);
        pickables.push(gen);
        assets['GEN-01'] = gen;

        // Cable trays / feeders.
        const feeders: Array<{ line: THREE.Line; from: THREE.Vector3; to: THREE.Vector3; color: string }> = [];
        const feederPts: Array<[string, THREE.Vector3, THREE.Vector3, number]> = [
          ['TX-01', new THREE.Vector3(-7, 2.4, -4), new THREE.Vector3(1, 3.2, -4), CYAN],
          ['TX-02', new THREE.Vector3(-2, 2.4, -4), new THREE.Vector3(1, 3.2, -4), CYAN],
          ['LV-01', new THREE.Vector3(1, 3.2, -4), new THREE.Vector3(4, 2.2, -4), GREEN],
          ['ATS-01', new THREE.Vector3(4, 2.1, -2), new THREE.Vector3(4, 2.1, 1), AMBER],
          ['UPS-01', new THREE.Vector3(-5, 2.0, 3), new THREE.Vector3(0, 2.0, 4), CYAN],
        ];
        for (const [id, from, to, color] of feederPts) {
          const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([from, to]), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 }));
          scene.add(line);
          feeders.push({ line, from, to, color: `#${color.toString(16).padStart(6, '0')}` });
          void id;
        }
        const flowParticles: THREE.Mesh[] = [];
        for (let i = 0; i < 12; i++) {
          const p = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), new THREE.MeshBasicMaterial({ color: AMBER }));
          scene.add(p);
          flowParticles.push(p);
        }

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
            const color = currentMode === 'load' ? (id === 'TX-01' ? AMBER : id === 'GEN-01' ? GREEN : CYAN) :
              currentMode === 'quality' ? (id === 'CAP-01' ? GREEN : id === 'UPS-01' ? VIOLET : CYAN) :
                currentMode === 'reliability' ? (id === 'ATS-01' || id === 'GEN-01' || id === 'UPS-01' ? GREEN : AMBER) : CYAN;
            mat.emissive = new THREE.Color(color);
            mat.emissiveIntensity = id === currentSelected ? 0.9 : 0.2;
          });
          const a = POWER_ASSETS.find((x) => x.id === currentSelected);
          if (a) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid ${a.color}88;border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:${a.color};font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${a.id} · ${a.type.toUpperCase()}</span><div style="margin-top:2px;font-weight:500">${a.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${a.metric} · ${a.status}</div></div>`;
          } else label.style.display = 'none';
          void POWER_SCENARIOS[currentScenario];
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
          const a = POWER_ASSETS.find((x) => x.id === hit.object.userData.assetId);
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
          flowParticles.forEach((p, i) => {
            const f = feeders[i % feeders.length];
            const t = (elapsed * 0.4 + i / 12) % 1;
            p.position.lerpVectors(f.from, f.to, t);
          });
          if (currentSelected) {
            const a = POWER_ASSETS.find((x) => x.id === currentSelected);
            if (a) projected.set(a.x, 3.4, a.z).project(ctx.camera);
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
