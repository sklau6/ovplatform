import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { FACTORY_SCENARIOS, FACTORY_STATIONS, type FactoryMode, type FactoryScenario } from '../lib/factoryData';

export interface FactorySelection { id: string; name: string; type: string; status: string; detail: string }
interface Props { mode: FactoryMode; scenario: FactoryScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: FactorySelection) => void }
interface Api { setMode: (m: FactoryMode) => void; setScenario: (s: FactoryScenario) => void; setSelected: (id: string | null) => void }

const CYAN = 0x51d6ff, GREEN = 0x53f0be, AMBER = 0xf4bd72, VIOLET = 0xa991ff, ROSE = 0xff7088;

export function FactoryScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D offsite prefabrication factory with robotic cells, conveyor, modules, AGV, gantry and quality gate."
      cameraPosition={[24, 15, 28]}
      target={[0, 2.5, 0]}
      fov={40}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.007 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.14}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x9edfd2, 0x030706, 0.95));
        const key = new THREE.DirectionalLight(0xd8fff8, 1.6);
        key.position.set(-22, 32, 22);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.7);
        rim.position.set(26, 12, -22);
        scene.add(rim);

        const floor = new THREE.Mesh(new THREE.BoxGeometry(52, 0.8, 34), new THREE.MeshStandardMaterial({ color: 0x0a1714, metalness: 0.55, roughness: 0.55 }));
        floor.position.y = -0.4;
        scene.add(floor);
        const grid: THREE.Vector3[] = [];
        for (let x = -25; x <= 25; x += 2.5) grid.push(new THREE.Vector3(x, 0.02, -16), new THREE.Vector3(x, 0.02, 16));
        for (let z = -16; z <= 16; z += 2.5) grid.push(new THREE.Vector3(-25, 0.02, z), new THREE.Vector3(25, 0.02, z));
        scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(grid), new THREE.LineBasicMaterial({ color: 0x1c5d4d, transparent: true, opacity: 0.17 })));

        // Factory frame.
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x274743, metalness: 0.65, roughness: 0.35 });
        for (const x of [-24, -12, 0, 12, 24]) {
          for (const z of [-15, 15]) {
            const col = new THREE.Mesh(new THREE.BoxGeometry(0.35, 9, 0.35), frameMat);
            col.position.set(x, 4.5, z);
            scene.add(col);
          }
        }
        for (const z of [-15, 0, 15]) {
          const beam = new THREE.Mesh(new THREE.BoxGeometry(49, 0.2, 0.3), frameMat);
          beam.position.set(0, 9, z);
          scene.add(beam);
        }

        // Conveyor.
        const conveyor = new THREE.Mesh(new THREE.BoxGeometry(46, 0.5, 2.4), new THREE.MeshStandardMaterial({ color: 0x1c302c, metalness: 0.6, roughness: 0.4 }));
        conveyor.position.set(0, 0.8, -3);
        scene.add(conveyor);
        const rail = new THREE.Mesh(new THREE.BoxGeometry(46, 0.06, 0.08), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.55 }));
        rail.position.set(0, 1.08, -4.2);
        scene.add(rail);

        // Modules moving along line.
        const modules: THREE.Group[] = [];
        for (let i = 0; i < 5; i++) {
          const mod = new THREE.Group();
          const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.4, 2.0), new THREE.MeshStandardMaterial({ color: 0x59706a, metalness: 0.4, roughness: 0.5 }));
          body.position.y = 1.3;
          mod.add(body);
          edge(body, 0x7db8a8, 0.3);
          const window = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 0.04), new THREE.MeshBasicMaterial({ color: 0x51d6ff, transparent: true, opacity: 0.55 }));
          window.position.set(0, 1.8, 1.02);
          mod.add(window);
          mod.position.set(-18 + i * 8, 1.55, -3);
          mod.userData.module = true;
          scene.add(mod);
          modules.push(mod);
        }

        // Robotic arms.
        const robots: Array<{ base: THREE.Group; upper: THREE.Group; fore: THREE.Group; x: number }> = [];
        for (const [i, x] of [-15, -6, 3].entries()) {
          const base = new THREE.Group();
          base.position.set(x, 1.05, 1.5);
          const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 1.2, 12), new THREE.MeshStandardMaterial({ color: 0x2f4f47, metalness: 0.6, roughness: 0.35 }));
          pedestal.position.y = 0.6;
          base.add(pedestal);
          const shoulder = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.4, 0.5), new THREE.MeshStandardMaterial({ color: 0xe0a84f, metalness: 0.5, roughness: 0.35, emissive: 0x4b2b08, emissiveIntensity: 0.3 }));
          shoulder.position.y = 2.2;
          base.add(shoulder);
          const upper = new THREE.Group();
          upper.position.y = 3.3;
          const upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.2, 0.4), new THREE.MeshStandardMaterial({ color: 0xd8dde0, metalness: 0.5, roughness: 0.35 }));
          upperArm.position.y = 1.0;
          upper.add(upperArm);
          const fore = new THREE.Group();
          fore.position.y = 2.1;
          const foreArm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.8, 0.3), new THREE.MeshStandardMaterial({ color: 0xcfd8da, metalness: 0.5, roughness: 0.35 }));
          foreArm.position.y = 0.8;
          fore.add(foreArm);
          const tool = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 8), new THREE.MeshBasicMaterial({ color: GREEN }));
          tool.position.y = 1.7;
          fore.add(tool);
          upper.add(fore);
          base.add(upper);
          base.userData.stationId = i === 0 ? 'ST-01' : i === 1 ? 'ST-02' : 'ST-03';
          scene.add(base);
          robots.push({ base, upper, fore, x });
        }

        // Quality gate scanner.
        const gate = new THREE.Group();
        const gateFrame = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3, 0.3), new THREE.MeshStandardMaterial({ color: 0x2c4d45, metalness: 0.6, roughness: 0.4 }));
        gateFrame.position.set(12, 2.5, -3);
        gate.add(gateFrame);
        const scan = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.05, 2.4), new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.4 }));
        scan.position.set(12, 2.5, -3);
        gate.add(scan);
        gate.userData.stationId = 'ST-05';
        scene.add(gate);

        // AGV.
        const agv = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 1.4), new THREE.MeshStandardMaterial({ color: 0x3b6b5b, emissive: GREEN, emissiveIntensity: 0.4, metalness: 0.4, roughness: 0.45 }));
        agv.position.set(-12, 0.3, 7);
        agv.userData.stationId = 'ST-06';
        scene.add(agv);

        // Control room screens.
        for (let i = 0; i < 3; i++) {
          const screen = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.6), new THREE.MeshBasicMaterial({ color: 0x0d2f2a, transparent: true, opacity: 0.7, side: THREE.DoubleSide }));
          screen.position.set(19 + i * 3, 4, -14);
          scene.add(screen);
        }

        // Workers.
        const people: THREE.Group[] = [];
        for (let i = 0; i < 8; i++) {
          const p = new THREE.Group();
          const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.55, 3, 6), new THREE.MeshStandardMaterial({ color: 0x47615a, roughness: 0.6 }));
          body.position.y = 0.6;
          p.add(body);
          const hat = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xf4d06a : 0xffffff }));
          hat.position.y = 1.02;
          p.add(hat);
          p.position.set(-20 + (i % 4) * 5, 0, 5 + Math.floor(i / 4) * 4);
          scene.add(p);
          people.push(p);
        }

        const ring = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.1, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }));
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
          const s = FACTORY_SCENARIOS[currentScenario];
          robots.forEach((r, i) => {
            (r.base.children[1] as THREE.Mesh).scale.y = currentScenario === 'automation' ? 1.1 : 1;
            (r.fore.children[0] as THREE.Mesh).material = new THREE.MeshStandardMaterial({ color: 0xcfd8da, metalness: 0.5, roughness: 0.35, emissive: currentMode === 'automation' ? GREEN : 0x000000, emissiveIntensity: currentMode === 'automation' ? 0.3 : 0 });
            void i;
          });
          modules.forEach((m) => {
            const body = m.children[0] as THREE.Mesh;
            (body.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(currentMode === 'carbon' ? VIOLET : currentMode === 'quality' ? AMBER : 0x000000);
            (body.material as THREE.MeshStandardMaterial).emissiveIntensity = currentMode === 'carbon' ? 0.25 : currentMode === 'quality' ? 0.18 : 0;
          });
          (scan.material as THREE.MeshBasicMaterial).opacity = currentMode === 'quality' ? 0.7 : 0.2;
          agv.visible = currentMode !== 'quality';
          const st = FACTORY_STATIONS.find((x) => x.id === currentSelected);
          if (st) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid rgba(83,240,190,.5);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:#53f0be;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${st.id} · ${st.type.toUpperCase()}</span><div style="margin-top:2px;font-weight:500">${st.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${st.metric} · ${st.status}</div></div>`;
          } else label.style.display = 'none';
          void s;
        };
        apiRef.current = {
          setMode: (m) => { currentMode = m; apply(); },
          setScenario: (s) => { currentScenario = s; apply(); },
          setSelected: (id) => {
            currentSelected = id;
            const st = FACTORY_STATIONS.find((x) => x.id === id);
            ring.visible = !!st;
            if (st) ring.position.set(st.x, 1.2, st.z);
            apply();
          },
        };
        apply();

        const pickables: THREE.Object3D[] = [...modules, ...robots.map((r) => r.base), gate, agv];
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
          while (o && !o.userData.stationId && !o.userData.module) o = o.parent;
          const id = o?.userData.stationId as string | undefined;
          const st = FACTORY_STATIONS.find((x) => x.id === id);
          return st ? { id: st.id, name: st.name, type: st.type, status: st.status, detail: `${st.metric} · ${st.status}` } : null;
        };
        const move = (event: PointerEvent) => { updatePointer(event); ctx.renderer.domElement.style.cursor = pick() ? 'pointer' : 'grab'; };
        const click = (event: PointerEvent) => { updatePointer(event); const st = pick(); if (st) onSelectRef.current(st); };
        ctx.renderer.domElement.addEventListener('pointermove', move);
        ctx.renderer.domElement.addEventListener('pointerup', click);
        ctx.addDispose(() => {
          ctx.renderer.domElement.removeEventListener('pointermove', move);
          ctx.renderer.domElement.removeEventListener('pointerup', click);
        });

        const projected = new THREE.Vector3();
        ctx.addUpdate((dt, elapsed) => {
          const s = FACTORY_SCENARIOS[currentScenario];
          const speed = currentScenario === 'automation' ? 1.6 : currentScenario === 'surge' ? 1.25 : 0.9;
          modules.forEach((m, i) => {
            m.position.x = -17 + ((elapsed * 2.4 * speed + i * 8) % 40);
          });
          robots.forEach((r, i) => {
            r.upper.rotation.z = Math.sin(elapsed * 1.2 * speed + i) * 0.5;
            r.fore.rotation.z = Math.cos(elapsed * 1.4 * speed + i) * 0.6;
            r.base.rotation.y = Math.sin(elapsed * 0.4 + i) * 0.4;
          });
          agv.position.x = -18 + ((elapsed * 3 * speed) % 36);
          people.forEach((p, i) => { p.rotation.y = Math.sin(elapsed * 0.5 + i) * 0.4; });
          ring.rotation.z += dt * 0.45;
          const st = FACTORY_STATIONS.find((x) => x.id === currentSelected);
          if (st) {
            projected.set(st.x, 4.2, st.z).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            label.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
          }
          void s;
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
