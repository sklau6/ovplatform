import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { HAZARDS, SAFETY_SCENARIOS, type SafetyMode, type SafetyScenario } from '../lib/safetyData';

export interface SafetySelection { id: string; name: string; type: string; status: string; detail: string }

interface Props {
  mode: SafetyMode;
  scenario: SafetyScenario;
  selectedId: string | null;
  autoRotate?: boolean;
  onSelect?: (selection: SafetySelection) => void;
}

interface Api {
  setMode: (m: SafetyMode) => void;
  setScenario: (s: SafetyScenario) => void;
  setSelected: (id: string | null) => void;
}

const ACCENT = 0x53f0be;
const AMBER = 0xf4bd72;
const ROSE = 0xff7088;
const CYAN = 0x51d6ff;
const VIOLET = 0xa991ff;

export function SafetyScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D construction site safety twin with crane exclusion zone, workers, fire points, evacuation route, typhoon rain and hazard zones."
      cameraPosition={[29, 20, 35]}
      target={[0, 5.5, 0]}
      fov={40}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.0065 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.14}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x9edfd2, 0x030706, 0.9));
        const key = new THREE.DirectionalLight(0xd8fff4, 1.6);
        key.position.set(-28, 42, 26);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.7);
        rim.position.set(34, 18, -28);
        scene.add(rim);

        const ground = new THREE.Mesh(new THREE.BoxGeometry(60, 1.2, 44), new THREE.MeshStandardMaterial({ color: 0x06100d, metalness: 0.55, roughness: 0.68 }));
        ground.position.y = -0.7;
        scene.add(ground);
        const surface = new THREE.Mesh(new THREE.PlaneGeometry(58, 42), new THREE.MeshStandardMaterial({ color: 0x0a1713, roughness: 0.88, metalness: 0.12 }));
        surface.rotation.x = -Math.PI / 2;
        scene.add(surface);
        const grid: THREE.Vector3[] = [];
        for (let x = -28; x <= 28; x += 3) grid.push(new THREE.Vector3(x, 0.01, -20), new THREE.Vector3(x, 0.01, 20));
        for (let z = -20; z <= 20; z += 3) grid.push(new THREE.Vector3(-28, 0.01, z), new THREE.Vector3(28, 0.01, z));
        scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(grid), new THREE.LineBasicMaterial({ color: 0x1a5d4d, transparent: true, opacity: 0.18 })));

        // Tower frame under construction.
        const tower = new THREE.Group();
        const concrete = new THREE.MeshStandardMaterial({ color: 0x8da39a, roughness: 0.7, metalness: 0.12 });
        const darkConcrete = new THREE.MeshStandardMaterial({ color: 0x4d655d, roughness: 0.75, metalness: 0.12 });
        for (let f = 0; f < 5; f++) {
          const slab = new THREE.Mesh(new THREE.BoxGeometry(11, 0.2, 9), concrete);
          slab.position.set(-4, 1 + f * 3, 0);
          scene.add(slab);
          for (const x of [-9, -4, 1]) for (const z of [-4, 0, 4]) {
            const col = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.8, 0.35), concrete);
            col.position.set(x, 2.4 + f * 3, z);
            scene.add(col);
          }
          if (f === 4) {
            const core = new THREE.Mesh(new THREE.BoxGeometry(3, 2.8, 3), darkConcrete);
            core.position.set(-4, 2.4 + f * 3, 0);
            scene.add(core);
          }
        }
        tower.position.set(0, 0, 0);
        scene.add(tower);

        // Site offices and laydown.
        const officeMat = new THREE.MeshStandardMaterial({ color: 0xb5c2ba, roughness: 0.65 });
        for (let i = 0; i < 3; i++) {
          const office = new THREE.Mesh(new THREE.BoxGeometry(6, 2.2, 3), officeMat);
          office.position.set(-22, 1.2 + i * 2.3, 13);
          scene.add(office);
        }
        for (let i = 0; i < 6; i++) {
          const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 2.6, 8), new THREE.MeshStandardMaterial({ color: 0x6c7d70, roughness: 0.7 }));
          pipe.rotation.z = Math.PI / 2;
          pipe.position.set(15 + (i % 3) * 2.4, 0.4, -14 + Math.floor(i / 3) * 1.8);
          scene.add(pipe);
        }
        const fenceMat = new THREE.MeshBasicMaterial({ color: 0x3f8f7c, transparent: true, opacity: 0.35 });
        for (const z of [-20, 20]) {
          const rail = new THREE.Mesh(new THREE.BoxGeometry(56, 0.05, 0.06), fenceMat);
          rail.position.set(0, 2, z);
          scene.add(rail);
        }

        // Crane.
        const crane = new THREE.Group();
        crane.position.set(14, 0, -9);
        const craneMat = new THREE.MeshStandardMaterial({ color: 0xe0a84f, metalness: 0.55, roughness: 0.4, emissive: 0x4c2b08, emissiveIntensity: 0.3 });
        const mast = new THREE.Mesh(new THREE.BoxGeometry(0.5, 28, 0.5), craneMat);
        mast.position.y = 14;
        crane.add(mast);
        const jib = new THREE.Group();
        jib.position.y = 27.5;
        const arm = new THREE.Mesh(new THREE.BoxGeometry(18, 0.25, 0.3), craneMat);
        arm.position.x = 7;
        jib.add(arm);
        const counter = new THREE.Mesh(new THREE.BoxGeometry(5, 0.3, 0.35), craneMat);
        counter.position.x = -4;
        jib.add(counter);
        const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 7, 4), new THREE.MeshBasicMaterial({ color: 0xc5d8d4, transparent: true, opacity: 0.55 }));
        cable.position.set(13, -3.5, 0);
        jib.add(cable);
        const load = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 1.0), new THREE.MeshStandardMaterial({ color: 0x8b6d48, roughness: 0.7 }));
        load.position.set(13, -7.2, 0);
        jib.add(load);
        crane.add(jib);
        scene.add(crane);
        const craneRing = new THREE.Mesh(new THREE.RingGeometry(15.5, 15.8, 64), new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
        craneRing.rotation.x = -Math.PI / 2;
        craneRing.position.set(14, 0.1, -9);
        scene.add(craneRing);

        // Zone rings: excavation, laydown, assembly.
        const zone = (x: number, z: number, r: number, color: number, opacity: number) => {
          const m = new THREE.Mesh(new THREE.RingGeometry(r * 0.96, r, 56), new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false }));
          m.rotation.x = -Math.PI / 2;
          m.position.set(x, 0.12, z);
          scene.add(m);
          return m;
        };
        const digZone = zone(-16, -6, 6, ROSE, 0.25);
        const liftZone = zone(14, -9, 6.5, AMBER, 0.22);
        const assembly = zone(20, 12, 5, ACCENT, 0.3);
        const assemblyLabel = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.2, 8), new THREE.MeshBasicMaterial({ color: ACCENT }));
        assemblyLabel.position.set(20, 0.6, 12);
        scene.add(assemblyLabel);

        // Fire points.
        const fires: THREE.Mesh[] = [];
        for (const [x, z] of [[-9, 6], [2, -6], [17, 4]]) {
          const point = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.5), new THREE.MeshStandardMaterial({ color: 0x6b1f28, emissive: ROSE, emissiveIntensity: 0.35, metalness: 0.4, roughness: 0.5 }));
          point.position.set(x, 0.4, z);
          scene.add(point);
          fires.push(point);
        }

        // Workers with hard hats and movement paths.
        const workers: Array<{ group: THREE.Group; phase: number; x: number; z: number; color: THREE.Color }> = [];
        for (let i = 0; i < 12; i++) {
          const w = new THREE.Group();
          const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.7, 3, 6), new THREE.MeshStandardMaterial({ color: 0x3c6b5c, roughness: 0.6 }));
          body.position.y = 0.8;
          w.add(body);
          const hat = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), new THREE.MeshStandardMaterial({ color: i % 3 === 0 ? 0xf4d06a : 0xffffff, roughness: 0.5 }));
          hat.position.y = 1.35;
          w.add(hat);
          const x = -15 + (i % 6) * 5;
          const z = -13 + Math.floor(i / 6) * 13;
          w.position.set(x, 0, z);
          scene.add(w);
          workers.push({ group: w, phase: i * 0.8, x, z, color: new THREE.Color(ACCENT) });
        }

        // Evacuation route points.
        const evacCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-4, 0.2, 0), new THREE.Vector3(0, 0.2, 6), new THREE.Vector3(8, 0.2, 9), new THREE.Vector3(20, 0.2, 12),
        ]);
        const evacLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(evacCurve.getPoints(40)), new THREE.LineDashedMaterial({ color: ACCENT, transparent: true, opacity: 0.65, dashSize: 0.4, gapSize: 0.3 }));
        evacLine.computeLineDistances();
        scene.add(evacLine);

        // Rain + flood.
        const rainCount = 420;
        const rainGeo = new THREE.BufferGeometry();
        const rainPos = new Float32Array(rainCount * 3);
        for (let i = 0; i < rainCount; i++) {
          rainPos[i * 3] = (Math.sin(i * 12.9898) * 43758.5453 % 50) - 25;
          rainPos[i * 3 + 1] = (i % 20) * 1.3;
          rainPos[i * 3 + 2] = (Math.cos(i * 78.233) * 43758.5453 % 40) - 20;
        }
        rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
        const rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({ color: 0x9fe8ff, size: 0.12, transparent: true, opacity: 0.5, depthWrite: false }));
        scene.add(rain);
        const flood = new THREE.Mesh(new THREE.PlaneGeometry(58, 42), new THREE.MeshPhysicalMaterial({ color: 0x1a6f8a, transparent: true, opacity: 0.0, roughness: 0.2, metalness: 0.5 }));
        flood.rotation.x = -Math.PI / 2;
        flood.position.y = 0.04;
        scene.add(flood);

        // Selection + label.
        const selRing = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.3, 36), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }));
        selRing.rotation.x = -Math.PI / 2;
        selRing.visible = false;
        scene.add(selRing);
        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          craneRing.visible = currentMode === 'crane' || currentMode === 'hazards';
          digZone.visible = currentMode === 'hazards' || currentMode === 'fire';
          liftZone.visible = currentMode === 'crane' || currentMode === 'hazards';
          assembly.visible = currentMode === 'fire' || currentScenario === 'fire';
          evacLine.visible = currentMode === 'fire' || currentScenario === 'fire';
          fires.forEach((f) => { f.visible = currentMode === 'fire' || currentMode === 'hazards'; });
          rain.visible = currentScenario === 'typhoon';
          (flood.material as THREE.MeshPhysicalMaterial).opacity = currentScenario === 'typhoon' ? 0.18 : 0;
          workers.forEach((w) => { w.color.setHex(currentScenario === 'fire' ? ACCENT : 0x3c6b5c); });
        };
        const setSelected = (id: string | null) => {
          currentSelected = id;
          const hazard = HAZARDS.find((h) => h.id === id);
          if (!hazard) { selRing.visible = false; label.style.display = 'none'; return; }
          selRing.visible = true;
          selRing.position.set(0, 0.15, 0);
          label.style.display = 'block';
          const z = HAZARDS.findIndex((h) => h.id === id);
          label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid rgba(255,112,136,.5);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:#ff7088;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${hazard.id} · ${hazard.severity.toUpperCase()}</span><div style="margin-top:2px;font-weight:500">${hazard.title}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${hazard.zone} · ${z >= 0 ? 'live' : 'site'}</div></div>`;
        };
        apiRef.current = {
          setMode: (m) => { currentMode = m; apply(); },
          setScenario: (s) => { currentScenario = s; apply(); },
          setSelected,
        };
        apply();
        setSelected(selectedId);

        // Picking.
        const pickables: THREE.Object3D[] = [crane, assemblyLabel, digZone, liftZone, ...fires, ...workers.map((w) => w.group)];
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        const updatePointer = (event: PointerEvent) => {
          const rect = ctx.renderer.domElement.getBoundingClientRect();
          pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        };
        const click = (event: PointerEvent) => {
          updatePointer(event);
          raycaster.setFromCamera(pointer, ctx.camera);
          const hit = raycaster.intersectObjects(pickables, true)[0];
          if (hit) onSelectRef.current({ id: 'H-01', name: 'Crane / lift exclusion zone', type: 'Hazard zone', status: 'Controlled', detail: 'Suspended load and slew envelope controlled by lift supervisor.' });
        };
        ctx.renderer.domElement.addEventListener('pointerup', click);
        ctx.addDispose(() => ctx.renderer.domElement.removeEventListener('pointerup', click));

        const projected = new THREE.Vector3();
        ctx.addUpdate((dt, elapsed) => {
          jib.rotation.y = currentScenario === 'lift' ? Math.sin(elapsed * 0.4) * 0.9 : Math.sin(elapsed * 0.12) * 0.25;
          workers.forEach((w, i) => {
            const t = elapsed * 0.12 + w.phase;
            const targetX = currentScenario === 'fire' ? 20 : w.x;
            const targetZ = currentScenario === 'fire' ? 12 : w.z;
            w.group.position.x += (targetX - w.group.position.x) * Math.min(1, dt * 0.35);
            w.group.position.z += (targetZ - w.group.position.z) * Math.min(1, dt * 0.35);
            w.group.position.x += Math.sin(t) * 0.002;
            w.group.position.y = 0;
            w.group.rotation.y = Math.atan2(targetX - w.group.position.x, targetZ - w.group.position.z);
            w.group.scale.setScalar(currentScenario === 'typhoon' ? 0.85 : 1);
            void i;
          });
          const positions = rain.geometry.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < rainCount; i++) {
            let y = positions.getY(i) - dt * 18;
            if (y < 0) y = 24;
            positions.setY(i, y);
          }
          positions.needsUpdate = true;
          selRing.rotation.z += dt * 0.5;
          if (currentSelected) {
            projected.set(0, 3, 4).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            label.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
          }
        });
      }}
    />
  );
}
