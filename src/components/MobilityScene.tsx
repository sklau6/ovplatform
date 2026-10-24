import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { createVehicle } from '../lib/vehicleModels';
import { cloneRealCar, loadRealCarTemplate } from '../lib/realCar';
import { MOBILITY_ASSETS, MOBILITY_SCENARIOS, type MobilityMode, type MobilityScenario } from '../lib/mobilityData';

export interface MobilitySelection { id: string; name: string; type: string; status: string; metric: string; detail: string }

interface Props {
  mode: MobilityMode;
  scenario: MobilityScenario;
  selectedId: string | null;
  autoRotate?: boolean;
  onSelect?: (s: MobilitySelection) => void;
}

interface Api {
  setMode: (m: MobilityMode) => void;
  setScenario: (s: MobilityScenario) => void;
  setSelected: (id: string | null) => void;
}

const ACCENT = 0x53f0be;
const CYAN = 0x51d6ff;
const AMBER = 0xf4bd72;
const VIOLET = 0xa991ff;
const ROSE = 0xff7088;

export function MobilityScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D smart-city mobility twin with roads, autonomous shuttles, transit, ferry, drones, EV charging and curb management."
      cameraPosition={[30, 24, 40]}
      target={[0, 3.5, 0]}
      fov={40}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.006 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.14}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x96dfd1, 0x030706, 0.9));
        const key = new THREE.DirectionalLight(0xd8fff4, 1.6);
        key.position.set(-34, 46, 30);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x34d7bc, 0.7);
        rim.position.set(38, 18, -32);
        scene.add(rim);

        const ground = new THREE.Mesh(new THREE.BoxGeometry(76, 1.2, 54), new THREE.MeshStandardMaterial({ color: 0x06100e, metalness: 0.55, roughness: 0.65 }));
        ground.position.y = -0.7;
        scene.add(ground);
        const surface = new THREE.Mesh(new THREE.PlaneGeometry(75, 44), new THREE.MeshStandardMaterial({ color: 0x091714, roughness: 0.88, metalness: 0.12 }));
        surface.rotation.x = -Math.PI / 2;
        surface.position.set(0, 0, -3);
        scene.add(surface);
        const water = new THREE.Mesh(new THREE.PlaneGeometry(76, 10), new THREE.MeshPhysicalMaterial({ color: 0x031c20, roughness: 0.2, metalness: 0.7, clearcoat: 0.8 }));
        water.rotation.x = -Math.PI / 2;
        water.position.set(0, 0.01, 21.5);
        scene.add(water);

        // Roads.
        const roadMat = new THREE.MeshStandardMaterial({ color: 0x1a2d2a, metalness: 0.4, roughness: 0.62 });
        const roads = new THREE.Group();
        for (const z of [-9, 0, 9]) {
          const road = new THREE.Mesh(new THREE.BoxGeometry(70, 0.05, 3.2), roadMat);
          road.position.set(0, 0.035, z);
          roads.add(road);
        }
        for (const x of [-16, 0, 16]) {
          const road = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.05, 42), roadMat);
          road.position.set(x, 0.035, -4);
          roads.add(road);
        }
        const dashes: THREE.Vector3[] = [];
        for (const z of [-9, 0, 9]) for (let x = -34; x <= 34; x += 3) dashes.push(new THREE.Vector3(x, 0.08, z));
        for (const x of [-16, 0, 16]) for (let z = -24; z <= 16; z += 3) dashes.push(new THREE.Vector3(x, 0.08, z));
        const dashGeo = new THREE.BufferGeometry().setFromPoints(dashes);
        roads.add(new THREE.Points(dashGeo, new THREE.PointsMaterial({ color: 0x8ba49b, size: 0.16, transparent: true, opacity: 0.6 })));
        scene.add(roads);
        const lanePts: THREE.Vector3[] = [];
        for (const z of [-9, 0, 9]) for (const dz of [-1.55, 1.55]) lanePts.push(new THREE.Vector3(-35, 0.07, z + dz), new THREE.Vector3(35, 0.07, z + dz));
        for (const x of [-16, 0, 16]) for (const dx of [-1.55, 1.55]) lanePts.push(new THREE.Vector3(x + dx, 0.07, -25), new THREE.Vector3(x + dx, 0.07, 17));
        scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lanePts), new THREE.LineBasicMaterial({ color: 0x4a8b7c, transparent: true, opacity: 0.42 })));
        for (const x of [-16, 0, 16]) {
          for (const z of [-9, 0, 9]) {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.2, 5), new THREE.MeshBasicMaterial({ color: 0x6d8b83 }));
            post.position.set(x + 2.1, 1.6, z + 1.8);
            scene.add(post);
            const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffd08a }));
            bulb.position.set(x + 2.1, 3.2, z + 1.8);
            scene.add(bulb);
            const light = new THREE.PointLight(0xffc879, 3.5, 14, 2);
            light.position.set(x + 2.1, 3.1, z + 1.8);
            scene.add(light);
          }
        }
        const shoreline = new THREE.Mesh(new THREE.BoxGeometry(75, 0.06, 0.1), new THREE.MeshBasicMaterial({ color: 0x51d6ff, transparent: true, opacity: 0.45 }));
        shoreline.position.set(0, 0.05, 16.4);
        scene.add(shoreline);

        // City blocks around the streets.
        const buildingMat = new THREE.MeshStandardMaterial({ color: 0x132522, metalness: 0.45, roughness: 0.55 });
        for (const [x, z, w, h, d] of [[-27, -18, 9, 9, 7], [-9, -19, 8, 14, 7], [8, -18, 9, 7, 7], [27, -19, 10, 11, 7], [-27, 16, 8, 5, 6], [27, 16, 9, 8, 6]] as const) {
          const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), buildingMat);
          b.position.set(x, h / 2, z);
          edge(b, 0x3e7f70, 0.32);
          scene.add(b);
          for (let k = 0; k < 4; k++) {
            const strip = new THREE.Mesh(new THREE.BoxGeometry(w * 0.82, 0.06, 0.04), new THREE.MeshBasicMaterial({ color: k % 2 ? 0x51d6ff : 0xf4bd72, transparent: true, opacity: 0.45 }));
            strip.position.set(x, h * 0.25 + k * (h * 0.18), z + d / 2 + 0.02);
            scene.add(strip);
          }
          const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff7088 }));
          beacon.position.set(x, h + 0.25, z);
          scene.add(beacon);
        }

        // Transit rail and station.
        const rail = new THREE.Mesh(new THREE.BoxGeometry(60, 0.16, 0.7), new THREE.MeshStandardMaterial({ color: 0x2c5f6d, metalness: 0.6, roughness: 0.35 }));
        rail.position.set(0, 3.2, -15);
        scene.add(rail);
        const station = new THREE.Mesh(new THREE.BoxGeometry(7, 2.6, 3.2), new THREE.MeshStandardMaterial({ color: 0x1e3a43, metalness: 0.5, roughness: 0.4, emissive: 0x0f3d4d, emissiveIntensity: 0.4 }));
        station.position.set(-16, 1.3, -15);
        station.userData.assetId = 'STATION-01';
        scene.add(station);
        edge(station, 0x4e9fb0, 0.4);

        // Transit train.
        const train = new THREE.Group();
        for (let i = 0; i < 3; i++) {
          const car = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.2, 1.2), new THREE.MeshStandardMaterial({ color: 0xb7d6d2, metalness: 0.5, roughness: 0.35 }));
          car.position.x = i * 3.8;
          train.add(car);
        }
        train.position.set(-20, 3.9, -15);
        scene.add(train);

        // Ferry.
        const ferry = new THREE.Group();
        const hull = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.8, 2.0), new THREE.MeshStandardMaterial({ color: 0x2e5f66, metalness: 0.5, roughness: 0.4 }));
        hull.position.y = 0.5;
        ferry.add(hull);
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.1, 1.5), new THREE.MeshStandardMaterial({ color: 0xcfe4df, metalness: 0.3, roughness: 0.5 }));
        cabin.position.y = 1.4;
        ferry.add(cabin);
        ferry.position.set(-12, 0, 22);
        ferry.userData.assetId = 'FERRY-01';
        scene.add(ferry);

        // Mobility hub, curb zones, signals.
        const hub = new THREE.Mesh(new THREE.BoxGeometry(6, 2.2, 4), new THREE.MeshStandardMaterial({ color: 0x1c3b32, metalness: 0.5, roughness: 0.45, emissive: 0x1a6b52, emissiveIntensity: 0.35 }));
        hub.position.set(24, 1.1, 12);
        hub.userData.assetId = 'HUB-01';
        scene.add(hub);
        edge(hub, 0x4fb28e, 0.4);
        const curb = new THREE.Mesh(new THREE.BoxGeometry(8, 0.12, 1.2), new THREE.MeshBasicMaterial({ color: VIOLET, transparent: true, opacity: 0.4 }));
        curb.position.set(-8, 0.9, 11.5);
        curb.userData.assetId = 'CURB-02';
        scene.add(curb);
        const signal = new THREE.Group();
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4, 6), new THREE.MeshStandardMaterial({ color: 0x4c6660, metalness: 0.6, roughness: 0.4 }));
        pole.position.y = 2;
        signal.add(pole);
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), new THREE.MeshBasicMaterial({ color: AMBER }));
        lamp.position.set(0, 4.05, 0.2);
        signal.add(lamp);
        signal.position.set(16, 0, 9);
        signal.userData.assetId = 'SIGNAL-04';
        scene.add(signal);

        // Moving cars.
        const cars: Array<{ mesh: THREE.Group; axis: 'x' | 'z'; lane: number; dir: number; speed: number; offset: number; color: THREE.Color }> = [];
        const carColors = [0xcfd8da, 0x3f5f6a, 0x8a5a3b, 0x2c4a45, 0xa991ff, 0xb9433f];
        for (let i = 0; i < 30; i++) {
          const axis: 'x' | 'z' = i % 2 === 0 ? 'x' : 'z';
          const lane = axis === 'x' ? [-9, 0, 9][i % 3] : [-16, 0, 16][i % 3];
          const color = new THREE.Color(i % 5 === 0 ? CYAN : i % 7 === 0 ? AMBER : 0x7d9892);
          const mesh = createVehicle(i % 7 === 0 ? 'van' : i % 5 === 0 ? 'suv' : 'sedan', carColors[i % carColors.length]);
          mesh.scale.setScalar(0.58);
          mesh.position.y = 0.02;
          mesh.rotation.y = axis === 'x' ? Math.PI / 2 : 0;
          mesh.visible = i < 26;
          scene.add(mesh);
          cars.push({ mesh, axis, lane, dir: i % 2 === 0 ? 1 : -1, speed: 0.5 + (i % 4) * 0.2, offset: (i * 7.3) % 60, color });
        }

        let carsDisposed = false;
        loadRealCarTemplate().then((template) => {
          if (carsDisposed) return;
          cars.forEach((slot, i) => {
            const real = cloneRealCar(template, carColors[i % carColors.length]);
            real.scale.setScalar(0.58);
            real.position.copy(slot.mesh.position);
            real.rotation.copy(slot.mesh.rotation);
            real.visible = slot.mesh.visible;
            scene.remove(slot.mesh);
            scene.add(real);
            slot.mesh = real;
          });
        }).catch(() => {});
        ctx.addDispose(() => { carsDisposed = true; });

        // AV loop.
        const loopPoints = [
          new THREE.Vector3(-24, 0.5, 6), new THREE.Vector3(-12, 0.5, 6), new THREE.Vector3(0, 0.5, 6),
          new THREE.Vector3(12, 0.5, 6), new THREE.Vector3(24, 0.5, 6), new THREE.Vector3(24, 0.5, -3),
          new THREE.Vector3(12, 0.5, -3), new THREE.Vector3(0, 0.5, -3), new THREE.Vector3(-12, 0.5, -3), new THREE.Vector3(-24, 0.5, -3),
        ];
        const loop = new THREE.CatmullRomCurve3(loopPoints, true, 'catmullrom', 0.2);
        const loopLine = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(loop.getPoints(100)),
          new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.55 }),
        );
        scene.add(loopLine);
        const pods: Array<{ mesh: THREE.Group; offset: number }> = [];
        for (let i = 0; i < 4; i++) {
          const pod = new THREE.Group();
          const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 1.1), new THREE.MeshStandardMaterial({ color: 0x2e6b5b, emissive: 0x2fbf9b, emissiveIntensity: 0.5, metalness: 0.5, roughness: 0.35 }));
          body.position.y = 0.5;
          pod.add(body);
          const lidar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.2, 12), new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.75 }));
          lidar.position.y = 0.95;
          pod.add(lidar);
          const ring = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.02, 5, 30), new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.4 }));
          ring.rotation.x = Math.PI / 2;
          ring.position.y = 0.2;
          pod.add(ring);
          pod.userData.assetId = 'AV-01';
          scene.add(pod);
          pods.push({ mesh: pod, offset: i / 4 });
        }

        // Drones.
        const drones: Array<{ mesh: THREE.Mesh; offset: number }> = [];
        for (let i = 0; i < 7; i++) {
          const drone = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), new THREE.MeshBasicMaterial({ color: CYAN }));
          drone.userData.assetId = 'DRONE-03';
          scene.add(drone);
          drones.push({ mesh: drone, offset: i / 7 });
        }

        // Selection ring + label.
        const ring = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.2, 36), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }));
        ring.rotation.x = -Math.PI / 2;
        ring.visible = false;
        scene.add(ring);
        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        const pickables = [...cars.map((c) => c.mesh), station, hub, ferry, ...pods.map((p) => p.mesh), ...drones.map((d) => d.mesh)];
        const carState = { currentMode: mode as MobilityMode, currentScenario: scenario as MobilityScenario };
        const apply = () => {
          cars.forEach((c, i) => {
            const mat = c.mesh.userData.paintMaterial as THREE.MeshPhysicalMaterial | undefined;
            if (!mat) return;
            const color = carState.currentMode === 'carbon'
              ? (i % 3 === 0 ? 0x53f0be : i % 3 === 1 ? 0xf4bd72 : 0xff7088)
              : carState.currentMode === 'traffic' ? (i % 4 === 0 ? 0xf4bd72 : 0x7d9892) : 0x000000;
            mat.emissive.setHex(color);
            mat.emissiveIntensity = carState.currentMode === 'traffic' ? 0.18 : 0.1;
          });
          loopLine.visible = carState.currentMode === 'autonomous' || carState.currentMode === 'carbon';
          (loopLine.material as THREE.LineBasicMaterial).opacity = carState.currentMode === 'autonomous' ? 0.8 : 0.3;
          train.visible = carState.currentMode === 'transit';
          ferry.visible = carState.currentMode !== 'autonomous';
          curb.visible = carState.currentMode === 'curb' || carState.currentMode === 'traffic';
          hub.visible = carState.currentMode === 'curb' || carState.currentMode === 'autonomous' || carState.currentMode === 'traffic';
          drones.forEach((d) => { d.mesh.visible = carState.currentMode === 'autonomous' || carState.currentMode === 'carbon'; });
          const s = MOBILITY_SCENARIOS[carState.currentScenario];
          cars.forEach((c, i) => { c.mesh.visible = i < s.cars; });
          pods.forEach((p) => { p.mesh.visible = carState.currentScenario !== 'incident' || p.offset < 0.5; });
        };
        apiRef.current = {
          setMode: (m) => { carState.currentMode = m; apply(); },
          setScenario: (s) => { carState.currentScenario = s; apply(); },
          setSelected: (id) => {
            const asset = MOBILITY_ASSETS.find((a) => a.id === id);
            if (!asset) { ring.visible = false; label.style.display = 'none'; return; }
            const target = [...pods.map((p) => p.mesh), station, hub, ferry, ...drones.map((d) => d.mesh)][0];
            void target;
            ring.visible = true;
            ring.position.set(0, 0.15, 0);
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid rgba(83,240,190,.5);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:#53f0be;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${asset.id} · ${asset.type}</span><div style="margin-top:2px;font-weight:500">${asset.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${asset.metric}</div></div>`;
          },
        };
        apply();

        // Picking.
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        const updatePointer = (event: PointerEvent) => {
          const rect = ctx.renderer.domElement.getBoundingClientRect();
          pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        };
        const pick = (): MobilitySelection | null => {
          raycaster.setFromCamera(pointer, ctx.camera);
          const hit = raycaster.intersectObjects(pickables, true)[0];
          if (!hit) return null;
          let o: THREE.Object3D | null = hit.object;
          while (o && !o.userData.assetId) o = o.parent;
          const id = o?.userData.assetId as string | undefined;
          const asset = MOBILITY_ASSETS.find((a) => a.id === id);
          return asset ?? null;
        };
        const move = (event: PointerEvent) => { updatePointer(event); ctx.renderer.domElement.style.cursor = pick() ? 'pointer' : 'grab'; };
        const click = (event: PointerEvent) => { updatePointer(event); const a = pick(); if (a) onSelectRef.current(a); };
        ctx.renderer.domElement.addEventListener('pointermove', move);
        ctx.renderer.domElement.addEventListener('pointerup', click);
        ctx.addDispose(() => {
          ctx.renderer.domElement.removeEventListener('pointermove', move);
          ctx.renderer.domElement.removeEventListener('pointerup', click);
        });

        ctx.addUpdate((dt, elapsed) => {
          const s = MOBILITY_SCENARIOS[carState.currentScenario];
          cars.forEach((c) => {
            if (!c.mesh.visible) return;
            const pos = (elapsed * c.speed * s.speed * 8 + c.offset) % 68 - 34;
            if (c.axis === 'x') c.mesh.position.set(pos * c.dir, 0.02, c.lane);
            else c.mesh.position.set(c.lane, 0.02, pos * c.dir);
            if (c.axis === 'x') c.mesh.rotation.y = c.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
            else c.mesh.rotation.y = c.dir > 0 ? 0 : Math.PI;
          });
          pods.forEach((p) => {
            const t = (elapsed * 0.025 + p.offset) % 1;
            const pos = loop.getPointAt(t);
            p.mesh.position.copy(pos);
            p.mesh.position.y = 0.2;
            const tangent = loop.getTangentAt(t);
            p.mesh.rotation.y = Math.atan2(tangent.x, tangent.z);
          });
          train.position.x = -28 + ((elapsed * 4 * s.speed) % 56);
          ferry.position.x = -20 + ((elapsed * 1.2 * s.speed) % 40);
          drones.forEach((d, i) => {
            d.mesh.position.set(-24 + ((elapsed * 3 + i * 8) % 48), 7 + Math.sin(elapsed * 0.8 + i) * 1.2, -5 + (i % 3) * 4);
            d.mesh.rotation.y += dt;
          });
          ring.rotation.z += dt * 0.5;
          if (ring.visible) {
            label.style.transform = 'translate(-50%,-100%) translate(50%,0)';
          }
        });
      }}
    />
  );
}

function edge(mesh: THREE.Mesh, color: number, opacity: number) {
  const e = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }),
  );
  mesh.add(e);
  return e;
}
