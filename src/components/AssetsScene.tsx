import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { ASSETS, ASSETS_SCENARIOS, type AssetsMode, type AssetsScenario } from '../lib/assetsData';

export interface AssetsSelection { id: string; name: string; condition: string; life: string; capex: string; criticality: string; status: string }
interface Props { mode: AssetsMode; scenario: AssetsScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: AssetsSelection) => void }
interface Api { setMode: (m: AssetsMode) => void; setScenario: (s: AssetsScenario) => void; setSelected: (id: string | null) => void }

const CYAN = 0x51d6ff, GREEN = 0x53f0be, AMBER = 0xf4bd72, VIOLET = 0xa991ff, ROSE = 0xff7088;

export function AssetsScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D estate asset lifecycle model with six asset classes, condition, remaining life, capex and criticality."
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

        // Estate core.
        const core = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.8, 6, 8), new THREE.MeshStandardMaterial({ color: 0x2a4a40, emissive: GREEN, emissiveIntensity: 0.3, metalness: 0.45, roughness: 0.4 }));
        core.position.y = 3;
        scene.add(core);
        const coreRing = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.03, 5, 50), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.5 }));
        coreRing.rotation.x = Math.PI / 2;
        coreRing.position.y = 3;
        scene.add(coreRing);

        const records: Array<{ id: string; mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; pos: THREE.Vector3; color: string }> = [];
        const pickables: THREE.Mesh[] = [];
        ASSETS.forEach((a, i) => {
          const ang = (i / ASSETS.length) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(ang) * 6.2;
          const z = Math.sin(ang) * 6.2;
          const color = new THREE.Color(a.color);
          const mat = new THREE.MeshStandardMaterial({ color: 0x2e4038, emissive: color, emissiveIntensity: 0.35, metalness: 0.35, roughness: 0.5 });
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 1.2), mat);
          mesh.position.set(x, 1.3, z);
          mesh.rotation.y = -ang;
          mesh.userData.assetId = a.id;
          scene.add(mesh);
          pickables.push(mesh);
          const edge = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 }));
          mesh.add(edge);
          // Condition ring.
          const cond = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.03, 5, 24), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 }));
          cond.position.set(x, 1.3, z);
          cond.rotation.x = Math.PI / 2;
          scene.add(cond);
          records.push({ id: a.id, mesh, mat, pos: new THREE.Vector3(x, 1.3, z), color: a.color });
        });

        // Work order beacons.
        const beacons: THREE.Mesh[] = [];
        for (let i = 0; i < 5; i++) {
          const b = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color: AMBER }));
          b.position.set(-4 + i * 2, 4.5, 7);
          scene.add(b);
          beacons.push(b);
        }

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          records.forEach((r) => {
            const a = ASSETS.find((x) => x.id === r.id)!;
            const color = currentMode === 'condition' ? (a.condition === 'B' ? GREEN : AMBER) :
              currentMode === 'lifecycle' ? (parseInt(a.life, 10) < 10 ? AMBER : GREEN) :
                currentMode === 'capex' ? (parseInt(a.capex.replace(/[^0-9]/g, ''), 10) > 30 ? AMBER : GREEN) :
                  a.criticality === 'Critical' ? ROSE : a.criticality === 'High' ? AMBER : GREEN;
            r.mat.emissive.setHex(color);
            r.mat.emissiveIntensity = r.id === currentSelected ? 0.9 : 0.35;
            r.mesh.scale.setScalar(r.id === currentSelected ? 1.15 : 1);
          });
          const a = ASSETS.find((x) => x.id === currentSelected);
          if (a) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid ${a.color}88;border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:${a.color};font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${a.id} · COND ${a.condition}</span><div style="margin-top:2px;font-weight:500">${a.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${a.life} remaining · ${a.capex} · ${a.criticality}</div></div>`;
          } else label.style.display = 'none';
          void ASSETS_SCENARIOS[currentScenario];
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
          const a = ASSETS.find((x) => x.id === hit.object.userData.assetId);
          return a ? { id: a.id, name: a.name, condition: a.condition, life: a.life, capex: a.capex, criticality: a.criticality, status: a.status } : null;
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
          coreRing.rotation.z += dt * 0.2;
          ring.rotation.z += dt * 0.04;
          records.forEach((r, i) => { r.mesh.position.y = 1.3 + Math.sin(elapsed * 1.2 + i) * 0.05; });
          beacons.forEach((b, i) => { b.position.y = 4.5 + Math.sin(elapsed * 2 + i) * 0.15; });
          if (currentSelected) {
            const r = records.find((x) => x.id === currentSelected);
            if (r) projected.set(r.pos.x, 3.2, r.pos.z).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            label.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
          }
        });
      }}
    />
  );
}
