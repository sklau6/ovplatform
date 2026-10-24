import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { PLANT_ASSETS, PLANT_SCENARIOS, type PlantMode, type PlantScenario } from '../lib/plantData';

export interface PlantSelection { id: string; name: string; type: string; status: string; metric: string }
interface Props { mode: PlantMode; scenario: PlantScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: PlantSelection) => void }
interface Api { setMode: (m: PlantMode) => void; setScenario: (s: PlantScenario) => void; setSelected: (id: string | null) => void }

const CYAN = 0x51d6ff, GREEN = 0x53f0be, AMBER = 0xf4bd72, ROSE = 0xff7088, VIOLET = 0xa991ff;

export function PlantScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D building plant room with chillers, pumps, cooling tower, AHU, BMS controller and chilled-water pipework."
      cameraPosition={[16, 10, 20]}
      target={[0, 2, 0]}
      fov={40}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.012 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.13}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x9bdfe8, 0x030706, 0.95));
        const key = new THREE.DirectionalLight(0xd8fff8, 1.6);
        key.position.set(-14, 20, 16);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.7);
        rim.position.set(16, 8, -14);
        scene.add(rim);

        const floor = new THREE.Mesh(new THREE.BoxGeometry(30, 0.6, 22), new THREE.MeshStandardMaterial({ color: 0x091714, metalness: 0.5, roughness: 0.6 }));
        floor.position.y = -0.3;
        scene.add(floor);
        const grid: THREE.Vector3[] = [];
        for (let x = -15; x <= 15; x += 2) grid.push(new THREE.Vector3(x, 0.01, -11), new THREE.Vector3(x, 0.01, 11));
        for (let z = -11; z <= 11; z += 2) grid.push(new THREE.Vector3(-15, 0.01, z), new THREE.Vector3(15, 0.01, z));
        scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(grid), new THREE.LineBasicMaterial({ color: 0x1c5d5d, transparent: true, opacity: 0.18 })));

        // Plant room frame.
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x2a4844, metalness: 0.6, roughness: 0.35 });
        for (const x of [-15, 0, 15]) for (const z of [-11, 11]) {
          const col = new THREE.Mesh(new THREE.BoxGeometry(0.3, 8, 0.3), frameMat);
          col.position.set(x, 4, z);
          scene.add(col);
        }
        const beam = new THREE.Mesh(new THREE.BoxGeometry(30, 0.2, 0.3), frameMat);
        beam.position.set(0, 8, 0);
        scene.add(beam);

        const steel = new THREE.MeshStandardMaterial({ color: 0x6b8a83, metalness: 0.65, roughness: 0.35 });
        const dark = new THREE.MeshStandardMaterial({ color: 0x1b302b, metalness: 0.5, roughness: 0.45 });
        const pickables: THREE.Mesh[] = [];
        const assets: Record<string, THREE.Mesh> = {};

        // Chillers.
        for (const [i, x] of [-8, -2].entries()) {
          const ch = new THREE.Group();
          const body = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.0, 2.4), new THREE.MeshStandardMaterial({ color: 0x4f6f6a, metalness: 0.55, roughness: 0.4, emissive: i === 1 ? ROSE : CYAN, emissiveIntensity: 0.2 }));
          body.position.y = 1.2;
          body.userData.assetId = i === 0 ? 'CH-01' : 'CH-02';
          ch.add(body);
          edge(body, CYAN, 0.3);
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 4.2, 16), new THREE.MeshStandardMaterial({ color: 0x5b7a74, metalness: 0.5, roughness: 0.4 }));
          barrel.rotation.z = Math.PI / 2;
          barrel.position.y = 2.6;
          ch.add(barrel);
          ch.position.set(x, 0, -4);
          scene.add(ch);
          pickables.push(body);
          assets[i === 0 ? 'CH-01' : 'CH-02'] = body;
        }

        // Pumps.
        for (const [i, z] of [-3, 0].entries()) {
          const pump = new THREE.Group();
          const body = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.2, 16), new THREE.MeshStandardMaterial({ color: 0x4b7770, metalness: 0.6, roughness: 0.35 }));
          body.rotation.z = Math.PI / 2;
          body.position.y = 1.0;
          body.userData.assetId = i === 0 ? 'PMP-01' : 'PMP-02';
          pump.add(body);
          pickables.push(body);
          assets[i === 0 ? 'PMP-01' : 'PMP-02'] = body;
          pump.position.set(4, 0, z);
          scene.add(pump);
        }

        // Cooling tower.
        const tower = new THREE.Group();
        const towerBody = new THREE.Mesh(new THREE.BoxGeometry(4, 4.2, 4), new THREE.MeshStandardMaterial({ color: 0x3f615b, metalness: 0.45, roughness: 0.5 }));
        towerBody.position.y = 2.1;
        towerBody.userData.assetId = 'CT-01';
        tower.add(towerBody);
        edge(towerBody, CYAN, 0.3);
        pickables.push(towerBody);
        assets['CT-01'] = towerBody;
        for (let i = 0; i < 3; i++) {
          const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.1, 16), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.6 }));
          fan.position.set(-1.2 + i * 1.2, 4.3, 0);
          tower.add(fan);
        }
        tower.position.set(9, 0, 4);
        scene.add(tower);

        // AHU.
        const ahu = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.2, 2.6), new THREE.MeshStandardMaterial({ color: 0x5c766f, metalness: 0.5, roughness: 0.4 }));
        ahu.position.set(-7, 1.1, 6);
        ahu.userData.assetId = 'AHU-01';
        scene.add(ahu);
        edge(ahu, GREEN, 0.35);
        pickables.push(ahu);
        assets['AHU-01'] = ahu;

        // BMS panel.
        const bms = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.4, 0.6), new THREE.MeshStandardMaterial({ color: 0x1d3b32, emissive: GREEN, emissiveIntensity: 0.4, metalness: 0.5, roughness: 0.35 }));
        bms.position.set(0, 1.4, 7);
        bms.userData.assetId = 'BMS';
        scene.add(bms);
        pickables.push(bms);
        assets['BMS'] = bms;

        // Pipe headers.
        const pipeMat = new THREE.MeshStandardMaterial({ color: 0x3f93a5, metalness: 0.6, roughness: 0.3, emissive: 0x0d3b4a, emissiveIntensity: 0.4 });
        const pipePts = [new THREE.Vector3(-8, 1.0, -2), new THREE.Vector3(-2, 1.0, -2), new THREE.Vector3(4, 1.0, -2), new THREE.Vector3(9, 1.0, 2)];
        const curve = new THREE.CatmullRomCurve3(pipePts);
        const pipe = new THREE.Mesh(new THREE.TubeGeometry(curve, 30, 0.18, 8, false), pipeMat);
        scene.add(pipe);
        const flowParticles: THREE.Mesh[] = [];
        for (let i = 0; i < 6; i++) {
          const p = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshBasicMaterial({ color: CYAN }));
          scene.add(p);
          flowParticles.push(p);
        }

        const ring = new THREE.Mesh(new THREE.RingGeometry(1.3, 1.4, 36), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }));
        ring.rotation.x = -Math.PI / 2;
        ring.visible = false;
        scene.add(ring);
        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          (assets['CH-02'].material as THREE.MeshStandardMaterial).emissiveIntensity = currentScenario === 'fault' ? 0.9 : 0.2;
          (assets['CH-01'].material as THREE.MeshStandardMaterial).emissiveIntensity = currentMode === 'energy' ? 0.6 : 0.2;
          (assets['PMP-01'].material as THREE.MeshStandardMaterial).emissive = new THREE.Color(currentMode === 'water' ? GREEN : CYAN);
          (assets['PMP-01'].material as THREE.MeshStandardMaterial).emissiveIntensity = currentMode === 'water' ? 0.6 : 0.3;
          (pipeMat as THREE.MeshStandardMaterial).emissiveIntensity = currentMode === 'water' ? 0.8 : 0.4;
          const a = PLANT_ASSETS.find((x) => x.id === currentSelected);
          if (a) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid rgba(83,240,190,.5);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:#53f0be;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${a.id} · ${a.type.toUpperCase()}</span><div style="margin-top:2px;font-weight:500">${a.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${a.metric} · ${a.status}</div></div>`;
          } else label.style.display = 'none';
        };
        apiRef.current = {
          setMode: (m) => { currentMode = m; apply(); },
          setScenario: (s) => { currentScenario = s; apply(); },
          setSelected: (id) => {
            currentSelected = id;
            const a = PLANT_ASSETS.find((x) => x.id === id);
            ring.visible = !!a;
            if (a) ring.position.set(a.x, 0.15, a.z);
            apply();
          },
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
          const a = PLANT_ASSETS.find((x) => x.id === hit.object.userData.assetId);
          return a ? { id: a.id, name: a.name, type: a.type, status: a.status, metric: a.metric } : null;
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
            const t = (elapsed * 0.1 + i / 6) % 1;
            p.position.copy(curve.getPointAt(t));
            p.position.y = 1.2;
          });
          ring.rotation.z += dt * 0.4;
          const a = PLANT_ASSETS.find((x) => x.id === currentSelected);
          if (a) {
            projected.set(a.x, 3.8, a.z).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            label.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
          }
        });
      }}
    />
  );
}

function edge(mesh: THREE.Mesh, color: number, opacity: number) {
  const e = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
  mesh.add(e);
  return e;
}
