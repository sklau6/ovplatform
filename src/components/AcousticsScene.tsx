import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { ACOUSTICS_SCENARIOS, ACOUSTICS_ZONES, type AcousticsMode, type AcousticsScenario } from '../lib/acousticsData';

export interface AcousticsSelection { id: string; name: string; rt: string; db: string; stc: string; vibration: string }
interface Props { mode: AcousticsMode; scenario: AcousticsScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: AcousticsSelection) => void }
interface Api { setMode: (m: AcousticsMode) => void; setScenario: (s: AcousticsScenario) => void; setSelected: (id: string | null) => void }

const CYAN = 0x51d6ff, GREEN = 0x53f0be, AMBER = 0xf4bd72, VIOLET = 0xa991ff, ROSE = 0xff7088;

export function AcousticsScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D concert hall and office acoustics model with stage, seating, balcony, ceiling reflectors, sound rays and vibration."
      cameraPosition={[16, 10, 20]}
      target={[0, 2, 0]}
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

        const floor = new THREE.Mesh(new THREE.BoxGeometry(30, 0.4, 26), new THREE.MeshStandardMaterial({ color: 0x1c2a24, roughness: 0.6, metalness: 0.2 }));
        floor.position.y = -0.2;
        scene.add(floor);
        // Hall shell.
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x2c3f39, metalness: 0.25, roughness: 0.6, transparent: true, opacity: 0.55 });
        const back = new THREE.Mesh(new THREE.BoxGeometry(18, 9, 0.3), wallMat);
        back.position.set(0, 4.5, 12);
        scene.add(back);
        for (const x of [-9, 9]) {
          const side = new THREE.Mesh(new THREE.BoxGeometry(0.3, 9, 24), wallMat);
          side.position.set(x, 4.5, 0);
          scene.add(side);
        }
        const ceiling = new THREE.Mesh(new THREE.BoxGeometry(18, 0.3, 24), wallMat);
        ceiling.position.set(0, 9, 0);
        scene.add(ceiling);

        // Stage.
        const stage = new THREE.Mesh(new THREE.BoxGeometry(12, 1, 7), new THREE.MeshStandardMaterial({ color: 0x3f5149, metalness: 0.2, roughness: 0.6 }));
        stage.position.set(0, 0.5, -7);
        scene.add(stage);
        // Seating blocks.
        for (let i = 0; i < 6; i++) {
          for (let j = 0; j < 5; j++) {
            const seat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.8), new THREE.MeshStandardMaterial({ color: 0x7a3f3a, roughness: 0.8 }));
            seat.position.set(-4 + j * 2, 0.75, -2 + i * 1.6);
            scene.add(seat);
          }
        }
        // Balcony.
        const balcony = new THREE.Mesh(new THREE.BoxGeometry(16, 0.4, 4), new THREE.MeshStandardMaterial({ color: 0x3f5149, roughness: 0.6 }));
        balcony.position.set(0, 4.5, 9);
        scene.add(balcony);
        // Reflectors.
        const reflectors: THREE.Group[] = [];
        for (let i = 0; i < 5; i++) {
          const r = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, 2.2), new THREE.MeshStandardMaterial({ color: 0xd8d4c0, metalness: 0.4, roughness: 0.4 }));
          r.position.set(-6 + i * 3, 7.2 - Math.abs(i - 2) * 0.4, -6);
          r.rotation.x = 0.35;
          scene.add(r);
          reflectors.push(r as unknown as THREE.Group);
        }

        // Zones.
        const pickables: THREE.Mesh[] = [];
        const zones: Array<{ id: string; mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; pos: THREE.Vector3; color: string }> = [];
        ACOUSTICS_ZONES.forEach((z) => {
          const color = new THREE.Color(z.color);
          const mat = new THREE.MeshStandardMaterial({ color: 0x18312a, emissive: color, emissiveIntensity: 0.15, transparent: true, opacity: 0.18, depthWrite: false });
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(6, 0.05, 5), mat);
          mesh.position.set(z.x, 0.06, z.z);
          mesh.userData.zoneId = z.id;
          scene.add(mesh);
          pickables.push(mesh);
          zones.push({ id: z.id, mesh, mat, pos: new THREE.Vector3(z.x, 0.06, z.z), color: z.color });
        });

        // Sound rays from stage.
        const rays: THREE.Line[] = [];
        for (let i = 0; i < 14; i++) {
          const a = (i / 14) * Math.PI * 1.2 - Math.PI * 0.6;
          const start = new THREE.Vector3(0, 1.2, -7);
          const end = new THREE.Vector3(Math.sin(a) * 12, 1 + Math.random() * 5, -7 + Math.cos(a) * 16);
          const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([start, end]), new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.35 }));
          scene.add(line);
          rays.push(line);
        }

        // Vibration waves at plant.
        const vibes: THREE.Mesh[] = [];
        for (let i = 0; i < 4; i++) {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(1 + i * 1.2, 0.04, 4, 40), new THREE.MeshBasicMaterial({ color: VIOLET, transparent: true, opacity: 0.3 - i * 0.05 }));
          ring.rotation.x = Math.PI / 2;
          ring.position.set(-7, 0.1, 9);
          scene.add(ring);
          vibes.push(ring);
        }

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          zones.forEach((z) => {
            const data = ACOUSTICS_ZONES.find((x) => x.id === z.id)!;
            const color = currentMode === 'vibration' ? (data.vibration === 'High' ? ROSE : data.vibration === 'Medium' ? AMBER : GREEN) :
              currentMode === 'noise' ? (parseInt(data.db, 10) > 70 ? AMBER : GREEN) :
                currentMode === 'privacy' ? (data.stc !== '—' ? GREEN : CYAN) : new THREE.Color(data.color).getHex();
            z.mat.emissive.setHex(color);
            z.mat.emissiveIntensity = z.id === currentSelected ? 0.9 : 0.15;
            z.mat.opacity = z.id === currentSelected ? 0.45 : 0.18;
          });
          rays.forEach((r) => { r.visible = currentMode === 'room'; });
          vibes.forEach((v) => { v.visible = currentMode === 'vibration'; });
          const z = ACOUSTICS_ZONES.find((x) => x.id === currentSelected);
          if (z) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid ${z.color}88;border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:${z.color};font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${z.id} · RT ${z.rt}</span><div style="margin-top:2px;font-weight:500">${z.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${z.db} · ${z.stc} · vibration ${z.vibration}</div></div>`;
          } else label.style.display = 'none';
          void ACOUSTICS_SCENARIOS[currentScenario];
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
          const z = ACOUSTICS_ZONES.find((x) => x.id === hit.object.userData.zoneId);
          return z ? { id: z.id, name: z.name, rt: z.rt, db: z.db, stc: z.stc, vibration: z.vibration } : null;
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
          reflectors.forEach((r, i) => { r.rotation.z = Math.sin(elapsed * 0.4 + i) * 0.02; });
          vibes.forEach((v, i) => { v.scale.setScalar(1 + Math.sin(elapsed * 2 + i) * 0.06); });
          rays.forEach((r, i) => { (r.material as THREE.LineBasicMaterial).opacity = 0.2 + Math.sin(elapsed * 1.2 + i) * 0.08; });
          if (currentSelected) {
            const z = zones.find((x) => x.id === currentSelected);
            if (z) projected.set(z.pos.x, 2.0, z.pos.z).project(ctx.camera);
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
