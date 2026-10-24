import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { WATER_ASSETS, WATER_SCENARIOS, type WaterMode, type WaterScenario } from '../lib/waterData';

export interface WaterSelection { id: string; name: string; type: string; status: string; detail: string }
interface Props { mode: WaterMode; scenario: WaterScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: WaterSelection) => void }
interface Api { setMode: (m: WaterMode) => void; setScenario: (s: WaterScenario) => void; setSelected: (id: string | null) => void }

const GREEN = 0x53f0be, CYAN = 0x51d6ff, BLUE = 0x45c4f5, VIOLET = 0xa991ff, ROSE = 0xff7088;

export function WaterScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D water supply and circularity twin with reservoir, treatment plant, pumps, network, leak detection, water tower and greywater reuse."
      cameraPosition={[25, 18, 30]}
      target={[0, 3, 0]}
      fov={40}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.006 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.14}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x9bdfe8, 0x030706, 0.9));
        const key = new THREE.DirectionalLight(0xd8fff8, 1.6);
        key.position.set(-24, 36, 24);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.7);
        rim.position.set(28, 14, -24);
        scene.add(rim);

        const ground = new THREE.Mesh(new THREE.BoxGeometry(62, 1.2, 44), new THREE.MeshStandardMaterial({ color: 0x06100e, metalness: 0.55, roughness: 0.66 }));
        ground.position.y = -0.7;
        scene.add(ground);
        const surface = new THREE.Mesh(new THREE.PlaneGeometry(61, 40), new THREE.MeshStandardMaterial({ color: 0x091714, roughness: 0.88, metalness: 0.1 }));
        surface.rotation.x = -Math.PI / 2;
        scene.add(surface);

        const steel = new THREE.MeshStandardMaterial({ color: 0x6a8a84, metalness: 0.6, roughness: 0.38 });
        const concrete = new THREE.MeshStandardMaterial({ color: 0x7d9188, roughness: 0.7, metalness: 0.1 });

        // Reservoir.
        const reservoir = new THREE.Mesh(new THREE.CylinderGeometry(4, 4.4, 3.2, 32), new THREE.MeshStandardMaterial({ color: 0x2a5a68, metalness: 0.5, roughness: 0.4 }));
        reservoir.position.set(-14, 1.6, -8);
        reservoir.userData.assetId = 'RES-01';
        scene.add(reservoir);
        edge(reservoir, BLUE, 0.45);
        const waterTop = new THREE.Mesh(new THREE.CylinderGeometry(3.7, 3.7, 0.1, 32), new THREE.MeshPhysicalMaterial({ color: 0x3fa6c9, transparent: true, opacity: 0.6, roughness: 0.1, metalness: 0.3 }));
        waterTop.position.set(-14, 3.2, -8);
        scene.add(waterTop);

        // Treatment basins.
        const treat = new THREE.Group();
        for (let i = 0; i < 3; i++) {
          const basin = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.2, 3.4), new THREE.MeshStandardMaterial({ color: 0x2c4f54, metalness: 0.35, roughness: 0.5 }));
          basin.position.set(-6 + i * 4, 0.7, -6);
          basin.userData.assetId = 'TRT-01';
          treat.add(basin);
          edge(basin, CYAN, 0.35);
          const water = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.08, 3.0), new THREE.MeshPhysicalMaterial({ color: 0x57bcd0, transparent: true, opacity: 0.55, roughness: 0.1 }));
          water.position.set(-6 + i * 4, 1.3, -6);
          treat.add(water);
        }
        scene.add(treat);

        // Pump station.
        const pump = new THREE.Mesh(new THREE.BoxGeometry(4, 2.4, 3), new THREE.MeshStandardMaterial({ color: 0x2b4d46, metalness: 0.5, roughness: 0.4 }));
        pump.position.set(7, 1.2, -3);
        pump.userData.assetId = 'PMP-02';
        scene.add(pump);
        edge(pump, GREEN, 0.4);

        // Water tower.
        const tower = new THREE.Group();
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 6, 8), steel);
        leg.position.y = 3;
        tower.add(leg);
        const tank = new THREE.Mesh(new THREE.SphereGeometry(1.8, 20, 16), new THREE.MeshStandardMaterial({ color: 0x4a7c85, metalness: 0.5, roughness: 0.35 }));
        tank.position.y = 6.6;
        tank.userData.assetId = 'TWR-01';
        tower.add(tank);
        tower.position.set(15, 0, 3);
        scene.add(tower);

        // Recycling plant.
        const rec = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 3.2, 20), new THREE.MeshStandardMaterial({ color: 0x3a5f52, metalness: 0.5, roughness: 0.4, emissive: VIOLET, emissiveIntensity: 0.2 }));
        rec.position.set(-13, 1.6, 8);
        rec.userData.assetId = 'REC-01';
        scene.add(rec);
        edge(rec, VIOLET, 0.45);

        // Pipe network.
        const pipeMat = new THREE.MeshStandardMaterial({ color: 0x3f93a5, metalness: 0.6, roughness: 0.3, emissive: 0x0d3b4a, emissiveIntensity: 0.5 });
        const paths = [
          [[-14, 1.0, -8], [-8, 1.0, -7], [-4, 1.0, -6]],
          [[-2, 1.0, -6], [2, 1.0, -4], [7, 1.0, -3]],
          [[7, 1.0, -3], [11, 1.0, 0], [15, 1.0, 3]],
          [[-13, 1.0, 8], [-8, 1.0, 8], [-2, 1.0, 7], [2, 1.0, 8]],
        ] as const;
        const flows: Array<{ curve: THREE.CatmullRomCurve3; particle: THREE.Mesh }> = [];
        for (const points of paths) {
          const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
          const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 30, 0.13, 6, false), pipeMat);
          scene.add(tube);
          const particle = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color: CYAN }));
          scene.add(particle);
          flows.push({ curve, particle });
        }

        // Leak.
        const leak = new THREE.Group();
        const hydrant = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 1.4, 8), new THREE.MeshStandardMaterial({ color: ROSE, emissive: ROSE, emissiveIntensity: 0.35, metalness: 0.4, roughness: 0.5 }));
        hydrant.position.set(2, 0.8, 8);
        leak.add(hydrant);
        const sprayGeo = new THREE.BufferGeometry();
        const sprayPos = new Float32Array(60 * 3);
        for (let i = 0; i < 60; i++) { sprayPos[i * 3] = (Math.sin(i * 7.1) * 1.2); sprayPos[i * 3 + 1] = 1 + (i % 10) * 0.2; sprayPos[i * 3 + 2] = (Math.cos(i * 3.3) * 1.2); }
        sprayGeo.setAttribute('position', new THREE.BufferAttribute(sprayPos, 3));
        const spray = new THREE.Points(sprayGeo, new THREE.PointsMaterial({ color: 0x9fe8ff, size: 0.12, transparent: true, opacity: 0.65 }));
        leak.add(spray);
        leak.position.set(2, 0, 8);
        leak.userData.assetId = 'LEAK-03';
        scene.add(leak);

        // Sensors.
        for (const [x, z] of [[10, 8], [0, -2], [-8, 3]]) {
          const sensor = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), new THREE.MeshBasicMaterial({ color: GREEN }));
          sensor.position.set(x, 3.6, z);
          sensor.userData.assetId = 'SEN-07';
          scene.add(sensor);
        }

        const ring = new THREE.Mesh(new THREE.RingGeometry(1.4, 1.5, 36), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }));
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
          const s = WATER_SCENARIOS[currentScenario];
          (spray.material as THREE.PointsMaterial).opacity = currentScenario === 'leak' ? 0.9 : 0.15;
          (pipeMat as THREE.MeshStandardMaterial).emissiveIntensity = currentMode === 'supply' ? 0.8 : 0.35;
          (rec.material as THREE.MeshStandardMaterial).emissiveIntensity = currentMode === 'circularity' ? 0.8 : 0.2;
          void s;
          const active = WATER_ASSETS.find((a) => a.id === currentSelected);
          if (active) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid rgba(83,240,190,.5);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:#53f0be;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${active.id} · ${active.type.toUpperCase()}</span><div style="margin-top:2px;font-weight:500">${active.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${active.metric} · ${active.status}</div></div>`;
          } else label.style.display = 'none';
        };
        apiRef.current = {
          setMode: (m) => { currentMode = m; apply(); },
          setScenario: (s) => { currentScenario = s; apply(); },
          setSelected: (id) => {
            currentSelected = id;
            const a = WATER_ASSETS.find((x) => x.id === id);
            ring.visible = !!a;
            if (a) ring.position.set(a.x, 0.2, a.z);
            apply();
          },
        };
        apply();

        const pickables: THREE.Object3D[] = [reservoir, treat, pump, tower, rec, leak];
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
          let o: THREE.Object3D | null = hit.object;
          while (o && !o.userData.assetId) o = o.parent;
          const a = WATER_ASSETS.find((x) => x.id === o?.userData.assetId);
          return a ? { id: a.id, name: a.name, type: a.type, status: a.status, detail: `${a.metric} · ${a.status}` } : null;
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
          flows.forEach((f, i) => {
            const t = (elapsed * 0.08 + i * 0.2) % 1;
            f.particle.position.copy(f.curve.getPointAt(t));
          });
          spray.rotation.y += dt;
          ring.rotation.z += dt * 0.4;
          const a = WATER_ASSETS.find((x) => x.id === currentSelected);
          if (a) {
            projected.set(a.x, 4.2, a.z).project(ctx.camera);
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
