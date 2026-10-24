import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { LABS_SCENARIOS, LABS_VENTURES, type LabsMode, type LabsScenario } from '../lib/labsData';

export interface LabsSelection { id: string; name: string; stage: string; trl: number; investment: string; value: string; status: string }
interface Props { mode: LabsMode; scenario: LabsScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: LabsSelection) => void }
interface Api { setMode: (m: LabsMode) => void; setScenario: (s: LabsScenario) => void; setSelected: (id: string | null) => void }

const GREEN = 0x53f0be, CYAN = 0x51d6ff, AMBER = 0xf4bd72, VIOLET = 0xa991ff, ROSE = 0xff7088;

export function LabsScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D innovation lab with central AI core, six venture pods, robot arm, prototype screens and experiment telemetry."
      cameraPosition={[16, 10, 20]}
      target={[0, 3, 0]}
      fov={38}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.012 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.13}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x9de0d0, 0x030706, 0.95));
        const key = new THREE.DirectionalLight(0xd8fff8, 1.6);
        key.position.set(-12, 18, 14);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.7);
        rim.position.set(14, 8, -14);
        scene.add(rim);

        const floor = new THREE.Mesh(new THREE.CylinderGeometry(10, 10.4, 0.4, 64), new THREE.MeshStandardMaterial({ color: 0x071411, metalness: 0.6, roughness: 0.45 }));
        floor.position.y = -0.2;
        scene.add(floor);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(8.4, 0.03, 5, 100), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.22 }));
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.03;
        scene.add(ring);

        // Central AI core.
        const core = new THREE.Group();
        const coreMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 1), new THREE.MeshStandardMaterial({ color: 0x182f2a, emissive: GREEN, emissiveIntensity: 0.7, metalness: 0.5, roughness: 0.3 }));
        coreMesh.position.y = 3.2;
        core.add(coreMesh);
        const halo = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.03, 5, 50), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.6 }));
        halo.rotation.x = Math.PI / 2;
        halo.position.y = 3.2;
        core.add(halo);
        scene.add(core);

        // Screens.
        for (let i = 0; i < 3; i++) {
          const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.5), new THREE.MeshBasicMaterial({ color: 0x0d2f2a, transparent: true, opacity: 0.65, side: THREE.DoubleSide }));
          const a = -0.6 + i * 0.6;
          screen.position.set(Math.cos(a) * 7.8, 3.2, Math.sin(a) * 7.8 + 3);
          screen.rotation.y = -a;
          scene.add(screen);
        }

        // Robot arm.
        const robot = new THREE.Group();
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 1, 12), new THREE.MeshStandardMaterial({ color: 0x2f4f47, metalness: 0.6, roughness: 0.35 }));
        base.position.y = 0.5;
        robot.add(base);
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.2, 0.35), new THREE.MeshStandardMaterial({ color: 0xf4bd72, metalness: 0.5, roughness: 0.35 }));
        arm.position.y = 1.8;
        robot.add(arm);
        const fore = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.6, 0.28), new THREE.MeshStandardMaterial({ color: 0xcfd8da, metalness: 0.5, roughness: 0.35 }));
        fore.position.set(0.5, 3.2, 0);
        fore.rotation.z = -0.8;
        robot.add(fore);
        robot.position.set(6, 0, 5);
        scene.add(robot);

        const pods: Array<{ id: string; mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; pos: THREE.Vector3; color: string }> = [];
        const pickables: THREE.Mesh[] = [];
        LABS_VENTURES.forEach((v, i) => {
          const a = (i / LABS_VENTURES.length) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(a) * 6.4;
          const z = Math.sin(a) * 6.4;
          const color = new THREE.Color(v.color);
          const mat = new THREE.MeshStandardMaterial({ color: 0x15312a, emissive: color, emissiveIntensity: 0.4, metalness: 0.5, roughness: 0.3 });
          const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1), mat);
          mesh.position.set(x, 1.8, z);
          mesh.userData.ventureId = v.id;
          scene.add(mesh);
          pickables.push(mesh);
          const ring = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.02, 5, 40), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 }));
          ring.rotation.x = Math.PI / 2.2;
          mesh.add(ring);
          const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, 0.6, z), new THREE.Vector3(0, 2, 0)]), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.25 }));
          scene.add(line);
          pods.push({ id: v.id, mesh, mat, pos: new THREE.Vector3(x, 1.8, z), color: v.color });
        });

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          pods.forEach((p) => {
            const v = LABS_VENTURES.find((x) => x.id === p.id)!;
            const color = currentMode === 'roi' ? (v.trl >= 7 ? GREEN : AMBER) :
              currentMode === 'patents' ? (v.id === 'CARB' ? VIOLET : CYAN) :
                currentMode === 'experiments' ? (v.trl < 6 ? CYAN : GREEN) : new THREE.Color(v.color).getHex();
            p.mat.emissive.setHex(currentScenario === 'robotics' && v.id === 'ROBO' ? ROSE : color);
            p.mat.emissiveIntensity = p.id === currentSelected ? 1.2 : 0.4;
            p.mesh.scale.setScalar(p.id === currentSelected ? 1.25 : 1);
          });
          const v = LABS_VENTURES.find((x) => x.id === currentSelected);
          if (v) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid ${v.color}88;border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:${v.color};font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${v.stage.toUpperCase()} · TRL ${v.trl}</span><div style="margin-top:2px;font-weight:500">${v.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${v.investment} invested · ${v.value} value</div></div>`;
          } else label.style.display = 'none';
          void currentScenario;
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
          const v = LABS_VENTURES.find((x) => x.id === hit.object.userData.ventureId);
          return v ? { id: v.id, name: v.name, stage: v.stage, trl: v.trl, investment: v.investment, value: v.value, status: v.status } : null;
        };
        const move = (event: PointerEvent) => { updatePointer(event); ctx.renderer.domElement.style.cursor = pick() ? 'pointer' : 'grab'; };
        const click = (event: PointerEvent) => { updatePointer(event); const v = pick(); if (v) onSelectRef.current(v); };
        ctx.renderer.domElement.addEventListener('pointermove', move);
        ctx.renderer.domElement.addEventListener('pointerup', click);
        ctx.addDispose(() => {
          ctx.renderer.domElement.removeEventListener('pointermove', move);
          ctx.renderer.domElement.removeEventListener('pointerup', click);
        });

        const projected = new THREE.Vector3();
        ctx.addUpdate((dt, elapsed) => {
          core.rotation.y += dt * 0.25;
          halo.rotation.z += dt * 0.3;
          pods.forEach((p, i) => { p.mesh.position.y = p.pos.y + Math.sin(elapsed * 1.5 + i) * 0.1; });
          ring.rotation.z += dt * 0.03;
          const v = LABS_VENTURES.find((x) => x.id === currentSelected);
          if (v) {
            const idx = LABS_VENTURES.findIndex((x) => x.id === currentSelected);
            const a = (idx / LABS_VENTURES.length) * Math.PI * 2 - Math.PI / 2;
            projected.set(Math.cos(a) * 6.4, 3.2, Math.sin(a) * 6.4).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            label.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
          }
        });
      }}
    />
  );
}
