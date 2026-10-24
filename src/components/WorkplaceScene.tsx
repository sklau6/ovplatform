import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { WORKPLACE_SCENARIOS, WORKPLACE_ZONES, type WorkplaceMode, type WorkplaceScenario } from '../lib/workplaceData';

export interface WorkplaceSelection { id: string; name: string; type: string; detail: string }

interface Props {
  mode: WorkplaceMode;
  scenario: WorkplaceScenario;
  selectedId: string | null;
  autoRotate?: boolean;
  onSelect?: (s: WorkplaceSelection) => void;
}

interface Api { setMode: (m: WorkplaceMode) => void; setScenario: (s: WorkplaceScenario) => void; setSelected: (id: string | null) => void }

const GREEN = 0x53f0be, CYAN = 0x51d6ff, VIOLET = 0xa991ff, AMBER = 0xf4bd72;

export function WorkplaceScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D smart workplace floor with desks, meeting rooms, focus pods, café, people, sensors and utilisation heatmap."
      cameraPosition={[17, 13, 21]}
      target={[0, 1.8, 0]}
      fov={38}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.012 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.14}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x9de0d5, 0x030706, 0.95));
        const key = new THREE.DirectionalLight(0xd8fff8, 1.7);
        key.position.set(-12, 20, 16);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.8);
        rim.position.set(14, 8, -14);
        scene.add(rim);

        const slab = new THREE.Mesh(new THREE.BoxGeometry(26, 0.4, 18), new THREE.MeshStandardMaterial({ color: 0x0a1714, metalness: 0.55, roughness: 0.45 }));
        slab.position.y = 0.8;
        scene.add(slab);
        const glass = new THREE.MeshPhysicalMaterial({ color: 0x8ee7d6, transparent: true, opacity: 0.13, roughness: 0.08, metalness: 0.2, side: THREE.DoubleSide, depthWrite: false });
        for (const [x, z, w, d] of [[0, -9, 26, 0.06], [-13, 0, 0.06, 18], [13, 0, 0.06, 18]] as const) {
          const wall = new THREE.Mesh(new THREE.BoxGeometry(w, 3.2, d), glass);
          wall.position.set(x, 2.4, z);
          scene.add(wall);
        }
        const grid: THREE.Vector3[] = [];
        for (let x = -13; x <= 13; x += 2) grid.push(new THREE.Vector3(x, 1.02, -9), new THREE.Vector3(x, 1.02, 9));
        for (let z = -9; z <= 9; z += 2) grid.push(new THREE.Vector3(-13, 1.02, z), new THREE.Vector3(13, 1.02, z));
        scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(grid), new THREE.LineBasicMaterial({ color: 0x1c5d4d, transparent: true, opacity: 0.18 })));

        // Desks.
        const deskMat = new THREE.MeshStandardMaterial({ color: 0x8f9c92, roughness: 0.55, metalness: 0.2 });
        const screenMat = new THREE.MeshStandardMaterial({ color: 0x0b1a1e, emissive: 0x2d7c8a, emissiveIntensity: 0.5, metalness: 0.4, roughness: 0.35 });
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 5; c++) {
            const x = -10 + c * 2.3;
            const z = -6 + r * 2.5;
            const desk = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.9), deskMat);
            desk.position.set(x, 1.15, z);
            scene.add(desk);
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.65, 0.08), deskMat);
            leg.position.set(x, 0.82, z);
            scene.add(leg);
            const screen = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.42, 0.04), screenMat);
            screen.position.set(x, 1.45, z - 0.3);
            scene.add(screen);
            const chair = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 12), new THREE.MeshStandardMaterial({ color: 0x1d3b32, roughness: 0.6 }));
            chair.position.set(x, 0.72, z + 0.7);
            scene.add(chair);
          }
        }

        // Meeting rooms, focus pods, café, reception, forum.
        const roomMat = new THREE.MeshPhysicalMaterial({ color: 0x5fc9bc, transparent: true, opacity: 0.2, roughness: 0.1, metalness: 0.2 });
        for (const [x, z, w, d] of [[6, -6, 6, 4], [6, -1.5, 6, 3.5]] as const) {
          const room = new THREE.Mesh(new THREE.BoxGeometry(w, 2.8, d), roomMat);
          room.position.set(x, 2.2, z);
          scene.add(room);
          const frame = new THREE.LineSegments(new THREE.EdgesGeometry(room.geometry), new THREE.LineBasicMaterial({ color: 0x53f0be, transparent: true, opacity: 0.5 }));
          room.add(frame);
        }
        for (let i = 0; i < 3; i++) {
          const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 2.2, 12, 1, true), new THREE.MeshStandardMaterial({ color: 0x2a4d45, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
          pod.position.set(-9 + i * 2.4, 2.1, 5.5);
          scene.add(pod);
        }
        const cafe = new THREE.Mesh(new THREE.BoxGeometry(4, 1.1, 3), new THREE.MeshStandardMaterial({ color: 0x5a4734, roughness: 0.7 }));
        cafe.position.set(9, 1.4, 4);
        scene.add(cafe);
        const counter = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 1.2), deskMat);
        counter.position.set(9, 2.0, 4);
        scene.add(counter);
        const reception = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.0, 1.0), new THREE.MeshStandardMaterial({ color: 0x2a5b4f, roughness: 0.5 }));
        reception.position.set(9, 1.3, -3);
        scene.add(reception);
        const forum = new THREE.Mesh(new THREE.BoxGeometry(5, 0.2, 3), new THREE.MeshStandardMaterial({ color: 0x223d38, roughness: 0.6 }));
        forum.position.set(2, 1.2, 5);
        scene.add(forum);

        // Plants.
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x2b7c53, roughness: 0.8 });
        for (const [x, z] of [[-12, 8], [12, 8], [-12, -8], [12, -8], [0, 8], [12, 1]]) {
          const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.4, 8), new THREE.MeshStandardMaterial({ color: 0x6b5c4c, roughness: 0.8 }));
          pot.position.set(x, 1.2, z);
          scene.add(pot);
          const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 0), leafMat);
          crown.position.set(x, 1.75, z);
          scene.add(crown);
        }

        // People.
        const people: THREE.Group[] = [];
        for (let i = 0; i < 16; i++) {
          const p = new THREE.Group();
          const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.5, 3, 6), new THREE.MeshStandardMaterial({ color: i % 3 === 0 ? 0x3e7c67 : 0x46636d, roughness: 0.6 }));
          body.position.y = 0.55;
          p.add(body);
          const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), new THREE.MeshStandardMaterial({ color: 0xd1b59a, roughness: 0.6 }));
          head.position.y = 0.95;
          p.add(head);
          const x = -10 + (i % 5) * 2.3 + (i % 2 ? 0.4 : -0.3);
          const z = -5.5 + Math.floor(i / 5) * 2.4;
          p.position.set(x, 0.95, z);
          scene.add(p);
          people.push(p);
        }

        // Zone markers and sensors.
        const zones: Array<{ id: string; mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; base: number }> = [];
        const pickables: THREE.Mesh[] = [];
        for (const z of WORKPLACE_ZONES) {
          const mat = new THREE.MeshStandardMaterial({ color: 0x1a3a30, emissive: new THREE.Color(z.color), emissiveIntensity: 0.15, transparent: true, opacity: 0.35, roughness: 0.6, depthWrite: false });
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(z.w, 0.04, z.d), mat);
          mesh.position.set(z.x, 1.03, z.z);
          mesh.userData.zoneId = z.id;
          scene.add(mesh);
          pickables.push(mesh);
          zones.push({ id: z.id, mesh, mat, base: 0.15 });
          const sensor = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshBasicMaterial({ color: z.color }));
          sensor.position.set(z.x, 3.6, z.z);
          scene.add(sensor);
        }

        // Ceiling light bars.
        for (let i = 0; i < 6; i++) {
          const light = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.06, 0.1), new THREE.MeshBasicMaterial({ color: 0xc9fff0, transparent: true, opacity: 0.55 }));
          light.position.set(-9 + i * 3.6, 3.8, 2);
          scene.add(light);
        }

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          zones.forEach((z) => {
            const zone = WORKPLACE_ZONES.find((w) => w.id === z.id)!;
            const color = currentMode === 'energy' ? (zone.energy > 12 ? AMBER : GREEN) :
              currentMode === 'comfort' ? (zone.comfort > 80 ? GREEN : zone.comfort > 75 ? CYAN : AMBER) :
                currentMode === 'bookings' ? (zone.type === 'Meet' ? VIOLET : GREEN) :
                  zone.occupancy / zone.capacity > 0.7 ? AMBER : GREEN;
            z.mat.emissive.setHex(color);
            z.mat.emissiveIntensity = z.id === currentSelected ? 0.9 : 0.18;
            z.base = z.id === currentSelected ? 0.55 : 0.35;
            z.mat.opacity = z.base;
          });
          const s = WORKPLACE_SCENARIOS[currentScenario];
          people.forEach((p, i) => { p.visible = i < Math.round((s.people / 112) * 16); });
          const active = WORKPLACE_ZONES.find((z) => z.id === currentSelected);
          if (active) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid rgba(83,240,190,.5);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:#53f0be;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${active.id} · ${active.type.toUpperCase()}</span><div style="margin-top:2px;font-weight:500">${active.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${active.occupancy}/${active.capacity} people · ${active.comfort} comfort</div></div>`;
          } else label.style.display = 'none';
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
          const id = hit.object.userData.zoneId as string;
          const z = WORKPLACE_ZONES.find((w) => w.id === id);
          return z ? { id: z.id, name: z.name, type: z.type, detail: `${z.occupancy}/${z.capacity} people · ${z.comfort} comfort · ${z.energy} kWh/m²` } : null;
        };
        const move = (event: PointerEvent) => { updatePointer(event); ctx.renderer.domElement.style.cursor = pick() ? 'pointer' : 'grab'; };
        const click = (event: PointerEvent) => { updatePointer(event); const z = pick(); if (z) onSelectRef.current(z); };
        ctx.renderer.domElement.addEventListener('pointermove', move);
        ctx.renderer.domElement.addEventListener('pointerup', click);
        ctx.addDispose(() => {
          ctx.renderer.domElement.removeEventListener('pointermove', move);
          ctx.renderer.domElement.removeEventListener('pointerup', click);
        });

        const projected = new THREE.Vector3();
        ctx.addUpdate((dt, elapsed) => {
          people.forEach((p, i) => {
            p.position.y = 0.95 + Math.sin(elapsed * 2 + i) * 0.015;
            p.rotation.y = Math.sin(elapsed * 0.4 + i) * 0.2;
          });
          const z = WORKPLACE_ZONES.find((w) => w.id === currentSelected);
          if (z) {
            projected.set(z.x, 2.8, z.z).project(ctx.camera);
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
