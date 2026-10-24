import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { FIRE_FLOORS, FIRE_SCENARIOS, FIRE_SYSTEMS, type FireMode, type FireScenario } from '../lib/fireData';

export interface FireSelection { id: string; name: string; type: string; detail: string }
interface Props { mode: FireMode; scenario: FireScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: FireSelection) => void }
interface Api { setMode: (m: FireMode) => void; setScenario: (s: FireScenario) => void; setSelected: (id: string | null) => void }

const CYAN = 0x51d6ff, GREEN = 0x53f0be, AMBER = 0xf4bd72, VIOLET = 0xa991ff, ROSE = 0xff7088;

export function FireScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D building fire safety model with floor compartments, alarm, sprinklers, smoke, evacuation stairs and fire service access."
      cameraPosition={[16, 12, 20]}
      target={[0, 5, 0]}
      fov={38}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.011 }}
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
        const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x2c4f58, transparent: true, opacity: 0.25, metalness: 0.4, roughness: 0.15 });
        const floors: Array<{ id: string; slab: THREE.Mesh; mat: THREE.MeshStandardMaterial }> = [];
        const pickables: THREE.Mesh[] = [];
        for (let i = 0; i < 6; i++) {
          const y = 0.6 + i * 2.0;
          const slab = new THREE.Mesh(new THREE.BoxGeometry(10, 0.18, 8), slabMat);
          slab.position.set(0, y, 0);
          slab.userData.floorId = FIRE_FLOORS[i + 1].id;
          scene.add(slab);
          pickables.push(slab);
          const glass = new THREE.Mesh(new THREE.BoxGeometry(9.6, 1.7, 7.6), glassMat);
          glass.position.set(0, y + 0.95, 0);
          scene.add(glass);
          const edge = new THREE.LineSegments(new THREE.EdgesGeometry(slab.geometry), new THREE.LineBasicMaterial({ color: i === 4 ? ROSE : CYAN, transparent: true, opacity: i === 4 ? 0.9 : 0.3 }));
          slab.add(edge);
          floors.push({ id: FIRE_FLOORS[i + 1].id, slab, mat: slabMat });
        }
        // Core.
        const core = new THREE.Mesh(new THREE.BoxGeometry(2.4, 12, 2.4), new THREE.MeshStandardMaterial({ color: 0x4f625b, metalness: 0.3, roughness: 0.55, transparent: true, opacity: 0.65 }));
        core.position.set(-3, 6, -2);
        core.userData.systemId = 'FRS';
        scene.add(core);
        pickables.push(core);

        // Fire origin on L5.
        const fire = new THREE.Group();
        for (let i = 0; i < 5; i++) {
          const flame = new THREE.Mesh(new THREE.ConeGeometry(0.3 - i * 0.04, 0.8 + i * 0.2, 6), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xff9f43 : ROSE, transparent: true, opacity: 0.7 }));
          flame.position.set(1.5 + (i % 3) * 0.4, 9.0 + i * 0.15, 1.5);
          fire.add(flame);
        }
        scene.add(fire);

        // Smoke.
        const smoke: THREE.Mesh[] = [];
        for (let i = 0; i < 26; i++) {
          const puff = new THREE.Mesh(new THREE.SphereGeometry(0.35 + Math.random() * 0.4, 7, 7), new THREE.MeshBasicMaterial({ color: 0x7d8a86, transparent: true, opacity: 0.22 }));
          puff.position.set(1 + (Math.random() - 0.5) * 2, 9.5 + Math.random() * 4, 1 + (Math.random() - 0.5) * 2);
          scene.add(puff);
          smoke.push(puff);
        }

        // Evacuation arrows.
        const arrows: THREE.Mesh[] = [];
        for (let i = 0; i < 4; i++) {
          const a = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.5, 6), new THREE.MeshBasicMaterial({ color: GREEN }));
          a.rotation.x = Math.PI / 2;
          a.position.set(-1.5 + i * 1.2, 0.4, 6.5);
          scene.add(a);
          arrows.push(a);
        }

        // Sprinkler heads.
        for (const [x, z] of [[-2, -2], [0, -2], [2, -2], [-2, 2], [0, 2], [2, 2]] as const) {
          const head = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.3, 6), new THREE.MeshBasicMaterial({ color: CYAN }));
          head.position.set(x, 8.9, z);
          scene.add(head);
        }

        // Fire truck.
        const truck = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.2, 1.4), new THREE.MeshStandardMaterial({ color: 0xb03a3a, metalness: 0.4, roughness: 0.4 }));
        body.position.y = 0.9;
        truck.add(body);
        const cab = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 1.4), new THREE.MeshStandardMaterial({ color: 0xd8d4c8, metalness: 0.3, roughness: 0.4 }));
        cab.position.set(2.0, 0.8, 0);
        truck.add(cab);
        truck.position.set(0, 0, 8.5);
        scene.add(truck);

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          floors.forEach((f) => {
            const data = FIRE_FLOORS.find((x) => x.id === f.id)!;
            const color = currentMode === 'detection' ? (data.alarm !== 'None' ? ROSE : CYAN) :
              currentMode === 'egress' ? (data.status === 'Fire' ? ROSE : GREEN) :
                currentMode === 'suppression' ? (data.id === 'L1' || data.id === 'L5' ? CYAN : GREEN) :
                  data.status === 'Fire' ? AMBER : GREEN;
            (f.slab.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(color);
            (f.slab.material as THREE.MeshStandardMaterial).emissiveIntensity = f.id === currentSelected ? 0.9 : data.status === 'Fire' ? 0.45 : 0.12;
          });
          const floor = FIRE_FLOORS.find((x) => x.id === currentSelected);
          const sys = FIRE_SYSTEMS.find((x) => x.id === currentSelected);
          if (floor || sys) {
            label.style.display = 'block';
            const detail = floor ? `${floor.name} · ${floor.use} · ${floor.alarm !== 'None' ? `alarm ${floor.alarm}` : 'no alarm'}` : `${sys!.name} · ${sys!.detail}`;
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid rgba(255,112,136,.5);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:#ff7088;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">FIRE SAFETY</span><div style="margin-top:2px;font-weight:500">${detail}</div></div>`;
          } else label.style.display = 'none';
          fire.visible = currentScenario === 'apartment' || currentScenario === 'kitchen';
          void FIRE_SCENARIOS[currentScenario];
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
            const f = FIRE_FLOORS.find((x) => x.id === hit.object.userData.floorId);
            return f ? { id: f.id, name: f.name, type: 'Floor', detail: `${f.use} · ${f.evac} · ${f.status}` } : null;
          }
          const sys = FIRE_SYSTEMS.find((x) => x.id === hit.object.userData.systemId);
          return sys ? { id: sys.id, name: sys.name, type: 'System', detail: sys.detail } : null;
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
          smoke.forEach((p, i) => {
            p.position.y = 9.5 + ((elapsed * 1.2 + i * 0.2) % 5);
            p.position.x = 1 + Math.sin(elapsed * 0.7 + i) * 0.8;
            (p.material as THREE.MeshBasicMaterial).opacity = 0.05 + (1 - ((p.position.y - 9.5) / 5)) * 0.2;
          });
          fire.rotation.y += dt * 0.6;
          arrows.forEach((a, i) => { a.position.z = 6.5 + Math.sin(elapsed * 2 + i) * 0.2; });
          if (currentSelected) {
            const f = FIRE_FLOORS.find((x) => x.id === currentSelected);
            const idx = FIRE_FLOORS.findIndex((x) => x.id === currentSelected);
            projected.set(0, f ? 0.6 + (idx - 1) * 2.0 + 2.2 : 12.5, 4).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            label.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
          }
        });
      }}
    />
  );
}
