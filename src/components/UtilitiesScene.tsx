import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { UTILITIES, UTILITIES_SCENARIOS, type UtilitiesMode, type UtilitiesScenario } from '../lib/utilitiesData';

export interface UtilitiesSelection { id: string; name: string; depth: number; diameter: string; status: string; sensor: string }
interface Props { mode: UtilitiesMode; scenario: UtilitiesScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: UtilitiesSelection) => void }
interface Api { setMode: (m: UtilitiesMode) => void; setScenario: (s: UtilitiesScenario) => void; setSelected: (id: string | null) => void }

const CYAN = 0x51d6ff, GREEN = 0x53f0be, AMBER = 0xf4bd72, VIOLET = 0xa991ff, ROSE = 0xff7088;

export function UtilitiesScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D underground utilities corridor with water, power, telecom, gas, drainage and district cooling pipes, excavation and sensors."
      cameraPosition={[16, 6, 24]}
      target={[0, -1, 0]}
      fov={40}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.011 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.12}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x9de0d0, 0x030706, 0.95));
        const key = new THREE.DirectionalLight(0xd8fff8, 1.6);
        key.position.set(-14, 20, 16);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.7);
        rim.position.set(16, 8, -16);
        scene.add(rim);

        // Street above.
        const street = new THREE.Mesh(new THREE.BoxGeometry(40, 0.4, 6), new THREE.MeshStandardMaterial({ color: 0x2d3533, roughness: 0.8 }));
        street.position.set(0, 0, -5);
        scene.add(street);
        for (let i = -18; i <= 18; i += 2) {
          const line = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.02, 0.12), new THREE.MeshBasicMaterial({ color: 0xd8d4b8 }));
          line.position.set(i, 0.22, -5);
          scene.add(line);
        }
        // Cutaway soil.
        const soil = new THREE.Mesh(new THREE.BoxGeometry(40, 0.1, 16), new THREE.MeshStandardMaterial({ color: 0x3a2e22, roughness: 0.95 }));
        soil.position.set(0, -5.2, 0);
        scene.add(soil);
        const soilSide = new THREE.Mesh(new THREE.PlaneGeometry(40, 5), new THREE.MeshStandardMaterial({ color: 0x2b2118, roughness: 0.95, side: THREE.DoubleSide, transparent: true, opacity: 0.15 }));
        soilSide.position.set(0, -2.5, 8.01);
        scene.add(soilSide);

        // Trench.
        const trench = new THREE.Mesh(new THREE.BoxGeometry(14, 3.2, 4.2), new THREE.MeshStandardMaterial({ color: 0x241c14, roughness: 0.95 }));
        trench.position.set(6, -2.0, 3);
        scene.add(trench);

        // Pipes along street.
        const records: Array<{ id: string; mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; pos: THREE.Vector3; color: string }> = [];
        const pickables: THREE.Mesh[] = [];
        UTILITIES.forEach((u, i) => {
          const color = new THREE.Color(u.color);
          const mat = new THREE.MeshStandardMaterial({ color: 0x2e4038, emissive: color, emissiveIntensity: 0.4, metalness: 0.5, roughness: 0.4 });
          const geo = new THREE.CylinderGeometry(0.25, 0.25, 36, 10);
          const pipe = new THREE.Mesh(geo, mat);
          pipe.rotation.z = Math.PI / 2;
          pipe.position.set(0, -u.depth, -4 + i * 1.4);
          pipe.userData.utilityId = u.id;
          scene.add(pipe);
          pickables.push(pipe);
          records.push({ id: u.id, mesh: pipe, mat, pos: pipe.position.clone(), color: u.color });
          // Valve / sensor node.
          const valve = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 10), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5, metalness: 0.5, roughness: 0.35 }));
          valve.rotation.z = Math.PI / 2;
          valve.position.set(0, -u.depth, -4 + i * 1.4);
          scene.add(valve);
        });

        // Excavator above trench.
        const exc = new THREE.Group();
        const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.7, 1.6), new THREE.MeshStandardMaterial({ color: 0xc79b3a, metalness: 0.4, roughness: 0.5 }));
        exc.add(base);
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.6, 0.35), new THREE.MeshStandardMaterial({ color: 0xc79b3a, metalness: 0.4, roughness: 0.5 }));
        arm.position.set(1.4, 1.6, 0);
        arm.rotation.z = -0.7;
        exc.add(arm);
        const bucket = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 1.1), new THREE.MeshStandardMaterial({ color: 0x3f4a46, metalness: 0.5, roughness: 0.5 }));
        bucket.position.set(2.6, 2.8, 0);
        exc.add(bucket);
        exc.position.set(6, 0.4, 7);
        scene.add(exc);

        // Sensor nodes.
        const sensors: THREE.Mesh[] = [];
        for (let i = 0; i < 6; i++) {
          const s = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), new THREE.MeshBasicMaterial({ color: GREEN }));
          s.position.set(-14 + i * 5.5, 0.5, 6);
          scene.add(s);
          sensors.push(s);
        }

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          records.forEach((r) => {
            const u = UTILITIES.find((x) => x.id === r.id)!;
            const color = currentMode === 'clashes' ? (u.depth < 1.2 ? ROSE : GREEN) :
              currentMode === 'depth' ? (u.depth <= 1.2 ? AMBER : CYAN) :
                currentMode === 'sensors' ? (u.status === 'Live' ? GREEN : AMBER) : new THREE.Color(u.color).getHex();
            r.mat.emissive.setHex(color);
            r.mat.emissiveIntensity = r.id === currentSelected ? 0.9 : 0.4;
            r.mesh.scale.setScalar(r.id === currentSelected ? 1.25 : 1);
          });
          const u = UTILITIES.find((x) => x.id === currentSelected);
          if (u) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid ${u.color}88;border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:${u.color};font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${u.id} · ${u.depth} m DEEP</span><div style="margin-top:2px;font-weight:500">${u.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${u.diameter} · ${u.status} · ${u.sensor}</div></div>`;
          } else label.style.display = 'none';
          void UTILITIES_SCENARIOS[currentScenario];
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
          const u = UTILITIES.find((x) => x.id === hit.object.userData.utilityId);
          return u ? { id: u.id, name: u.name, depth: u.depth, diameter: u.diameter, status: u.status, sensor: u.sensor } : null;
        };
        const move = (event: PointerEvent) => { updatePointer(event); ctx.renderer.domElement.style.cursor = pick() ? 'pointer' : 'grab'; };
        const click = (event: PointerEvent) => { updatePointer(event); const u = pick(); if (u) onSelectRef.current(u); };
        ctx.renderer.domElement.addEventListener('pointermove', move);
        ctx.renderer.domElement.addEventListener('pointerup', click);
        ctx.addDispose(() => {
          ctx.renderer.domElement.removeEventListener('pointermove', move);
          ctx.renderer.domElement.removeEventListener('pointerup', click);
        });

        const projected = new THREE.Vector3();
        ctx.addUpdate((dt, elapsed) => {
          sensors.forEach((s, i) => { s.position.y = 0.5 + Math.sin(elapsed * 2 + i) * 0.1; });
          if (currentSelected) {
            const r = records.find((x) => x.id === currentSelected);
            if (r) projected.set(0, r.pos.y + 1.2, r.pos.z).project(ctx.camera);
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
