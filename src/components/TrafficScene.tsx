import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { createVehicle } from '../lib/vehicleModels';
import { cloneRealCar, loadRealCarTemplate } from '../lib/realCar';
import { TRAFFIC_APPROACHES, TRAFFIC_SCENARIOS, type TrafficMode, type TrafficScenario } from '../lib/trafficData';

export interface TrafficSelection { id: string; name: string; queue: number; delay: number; peds: number; bus: string; status: string }
interface Props { mode: TrafficMode; scenario: TrafficScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: TrafficSelection) => void }
interface Api { setMode: (m: TrafficMode) => void; setScenario: (s: TrafficScenario) => void; setSelected: (id: string | null) => void }

const CYAN = 0x51d6ff, GREEN = 0x53f0be, AMBER = 0xf4bd72, VIOLET = 0xa991ff, ROSE = 0xff7088;

export function TrafficScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D city intersection with roads, adaptive traffic signals, cars, bus, cyclists, pedestrians and buildings."
      cameraPosition={[0, 18, 34]}
      target={[0, 1, 0]}
      fov={40}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.008 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.13}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x9bdfe8, 0x030706, 1.0));
        const key = new THREE.DirectionalLight(0xe8fff4, 1.7);
        key.position.set(-18, 24, 18);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.6);
        rim.position.set(18, 10, -18);
        scene.add(rim);

        const base = new THREE.Mesh(new THREE.BoxGeometry(52, 0.5, 52), new THREE.MeshStandardMaterial({ color: 0x0b1713, roughness: 0.85 }));
        base.position.y = -0.25;
        scene.add(base);
        const roadMat = new THREE.MeshStandardMaterial({ color: 0x2d3533, roughness: 0.8, metalness: 0.1 });
        for (const [w, d] of [[10, 52], [52, 10]] as const) {
          const road = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, d), roadMat);
          road.position.y = 0.01;
          scene.add(road);
        }
        // Lane markings.
        const lineMat = new THREE.MeshBasicMaterial({ color: 0xd8d4b8 });
        for (let i = -24; i <= 24; i += 2) {
          if (Math.abs(i) < 6) continue;
          const h = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 1.2), lineMat);
          h.position.set(0, 0.08, i);
          scene.add(h);
          const v = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.02, 0.12), lineMat);
          v.position.set(i, 0.08, 0);
          scene.add(v);
        }
        // Sidewalks.
        for (const [x, z, w, d] of [[-9, -9, 7, 7], [9, -9, 7, 7], [-9, 9, 7, 7], [9, 9, 7, 7]] as const) {
          const walk = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, d), new THREE.MeshStandardMaterial({ color: 0x394b44, roughness: 0.8 }));
          walk.position.set(x, 0.1, z);
          scene.add(walk);
        }
        // Buildings.
        for (const [x, z, w, h, d] of [[-13, -13, 8, 10, 8], [13, -13, 8, 8, 8], [-13, 13, 8, 7, 8], [13, 13, 8, 11, 8]] as const) {
          const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: 0x1e332c, metalness: 0.4, roughness: 0.5 }));
          b.position.set(x, h / 2, z);
          scene.add(b);
          const edge = new THREE.LineSegments(new THREE.EdgesGeometry(b.geometry), new THREE.LineBasicMaterial({ color: 0x2f8d80, transparent: true, opacity: 0.3 }));
          b.add(edge);
        }

        // Signal poles.
        const signals: THREE.Group[] = [];
        const approachPos: Record<string, THREE.Vector3> = { N: new THREE.Vector3(0, 0, -7), E: new THREE.Vector3(7, 0, 0), S: new THREE.Vector3(0, 0, 7), W: new THREE.Vector3(-7, 0, 0) };
        const pickables: THREE.Mesh[] = [];
        for (const [id, pos] of Object.entries(approachPos)) {
          const pole = new THREE.Group();
          const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.2, 6), new THREE.MeshStandardMaterial({ color: 0x5c6b66, metalness: 0.6, roughness: 0.35 }));
          mast.position.y = 2.1;
          pole.add(mast);
          const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.0, 0.3), new THREE.MeshStandardMaterial({ color: 0x1c2a26, metalness: 0.4, roughness: 0.4 }));
          head.position.y = 4.0;
          head.userData.approachId = id;
          pole.add(head);
          pickables.push(head);
          for (let i = 0; i < 3; i++) {
            const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshBasicMaterial({ color: i === 0 ? ROSE : i === 1 ? AMBER : GREEN, transparent: true, opacity: i === 2 ? 0.9 : 0.25 }));
            lamp.position.set(0, 4.25 - i * 0.28, 0.18);
            head.add(lamp);
          }
          pole.position.copy(pos);
          scene.add(pole);
          signals.push(pole);
        }

        // Cars and bus — detailed silhouette, glass, wheels and lights.
        const cars: THREE.Group[] = [];
        const carColors = [0xcfd8da, 0x3f5f6a, 0x8a5a3b, 0x2c4a45, 0xa991ff, 0xb9433f];
        for (let i = 0; i < 14; i++) {
          const car = createVehicle(i % 5 === 2 ? 'van' : 'sedan', carColors[i % carColors.length]);
          car.position.set(i % 2 ? -2.5 : 2.5, 0.02, -22 + i * 21);
          car.rotation.y = i % 2 ? Math.PI : 0;
          scene.add(car);
          cars.push(car);
        }
        const bus = createVehicle('bus', 0xc79b3a);
        bus.position.set(-2.5, 0.02, -18);
        scene.add(bus);

        let disposed = false;
        loadRealCarTemplate().then((template) => {
          if (disposed) return;
          cars.forEach((placeholder, i) => {
            const real = cloneRealCar(template, carColors[i % carColors.length]);
            real.position.copy(placeholder.position);
            real.rotation.y = placeholder.rotation.y;
            scene.remove(placeholder);
            scene.add(real);
            cars[i] = real;
          });
        }).catch(() => {});
        ctx.addDispose(() => { disposed = true; });
        // Cyclists.
        for (let i = 0; i < 4; i++) {
          const bike = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.5, 1), new THREE.MeshStandardMaterial({ color: i % 2 ? CYAN : GREEN, metalness: 0.4, roughness: 0.4 }));
          bike.position.set(6.2, 0.35, -12 + i * 8);
          scene.add(bike);
        }
        // Pedestrians.
        const peds: THREE.Group[] = [];
        for (let i = 0; i < 18; i++) {
          const p = new THREE.Group();
          const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.45, 3, 6), new THREE.MeshStandardMaterial({ color: i % 3 ? 0x4f6a60 : 0x8a6a4a, roughness: 0.7 }));
          body.position.y = 0.5;
          p.add(body);
          const side = i % 4;
          const t = (i / 18) * 12 - 6;
          p.position.set(side < 2 ? -7 + side * 0.8 : 7 - (side - 2) * 0.8, 0.2, t);
          scene.add(p);
          peds.push(p);
        }

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          signals.forEach((pole) => {
            const head = pole.children.find((c) => c.userData.approachId) as THREE.Mesh;
            const mat = head.material as THREE.MeshStandardMaterial;
            const id = head.userData.approachId as string;
            const a = TRAFFIC_APPROACHES.find((x) => x.id === id)!;
            const color = currentMode === 'safety' ? (a.peds > 280 ? ROSE : GREEN) :
              currentMode === 'transit' ? (a.bus !== '6 / hr' ? GREEN : AMBER) :
                currentMode === 'emissions' ? (parseFloat(a.co2) > 18 ? AMBER : GREEN) : CYAN;
            mat.emissive = new THREE.Color(color);
            mat.emissiveIntensity = id === currentSelected ? 0.9 : 0.25;
          });
          const a = TRAFFIC_APPROACHES.find((x) => x.id === currentSelected);
          if (a) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid rgba(83,240,190,.5);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:#53f0be;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${a.id} · ${a.status.toUpperCase()}</span><div style="margin-top:2px;font-weight:500">${a.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${a.queue} m queue · ${a.delay}s delay · ${a.peds} peds/hr</div></div>`;
          } else label.style.display = 'none';
          void TRAFFIC_SCENARIOS[currentScenario];
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
          const a = TRAFFIC_APPROACHES.find((x) => x.id === hit.object.userData.approachId);
          return a ? { id: a.id, name: a.name, queue: a.queue, delay: a.delay, peds: a.peds, bus: a.bus, status: a.status } : null;
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
          cars.forEach((c, i) => {
            const speed = currentScenario === 'incident' ? 0.25 : 1.15;
            const forward = i % 2 === 0;
            const p = (elapsed * speed * 6 + i * 3.2) % 48;
            c.position.z = forward ? -24 + p : 24 - p;
            c.position.x = forward ? 2.5 : -2.5;
            c.rotation.y = forward ? 0 : Math.PI;
          });
          bus.position.z = -22 + (elapsed * 2) % 40;
          peds.forEach((p, i) => { p.position.y = 0.2 + Math.abs(Math.sin(elapsed * 3 + i)) * 0.05; });
          if (currentSelected) {
            const a = TRAFFIC_APPROACHES.find((x) => x.id === currentSelected);
            const pos = approachPos[currentSelected];
            if (a && pos) projected.set(pos.x, 5.2, pos.z).project(ctx.camera);
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
