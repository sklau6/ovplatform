import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { CAPITAL_INVESTORS, CAPITAL_LAYERS, CAPITAL_SCENARIOS, type CapitalMode, type CapitalScenario } from '../lib/capitalData';

export interface CapitalSelection { id: string; name: string; amount: number; rate: string; note: string }
interface Props { mode: CapitalMode; scenario: CapitalScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: CapitalSelection) => void }
interface Api { setMode: (m: CapitalMode) => void; setScenario: (s: CapitalScenario) => void; setSelected: (id: string | null) => void }

const CYAN = 0x51d6ff, GREEN = 0x53f0be, AMBER = 0xf4bd72, VIOLET = 0xa991ff, ROSE = 0xff7088;

export function CapitalScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D capital stack with senior debt, mezzanine, equity and green grant layers, investor nodes and cash flows."
      cameraPosition={[16, 10, 20]}
      target={[0, 3.4, 0]}
      fov={38}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.012 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.13}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x9de0e0, 0x030706, 0.95));
        const key = new THREE.DirectionalLight(0xd8fff8, 1.6);
        key.position.set(-12, 18, 14);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.7);
        rim.position.set(14, 8, -14);
        scene.add(rim);

        const floor = new THREE.Mesh(new THREE.CircleGeometry(10, 64), new THREE.MeshStandardMaterial({ color: 0x071411, metalness: 0.6, roughness: 0.5 }));
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(8.4, 0.03, 5, 100), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.2 }));
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.2;
        scene.add(ring);

        const layers: Array<{ id: string; mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; color: string; y: number }> = [];
        const pickables: THREE.Mesh[] = [];
        CAPITAL_LAYERS.forEach((l, i) => {
          const color = new THREE.Color(l.color);
          const mat = new THREE.MeshStandardMaterial({ color: 0x15312a, emissive: color, emissiveIntensity: 0.3, metalness: 0.55, roughness: 0.35 });
          const h = Math.max(0.5, l.amount / 160);
          const mesh = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.7, h, 32), mat);
          mesh.position.y = 0.5 + i * 1.5 + h / 2;
          mesh.userData.layerId = l.id;
          scene.add(mesh);
          pickables.push(mesh);
          const torus = new THREE.Mesh(new THREE.TorusGeometry(2.75, 0.03, 5, 50), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55 }));
          torus.rotation.x = Math.PI / 2;
          torus.position.y = mesh.position.y;
          scene.add(torus);
          layers.push({ id: l.id, mesh, mat, color: l.color, y: mesh.position.y });
        });

        // Asset ring.
        const assetRing = new THREE.Mesh(new THREE.TorusGeometry(5.4, 0.04, 5, 80), new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.25 }));
        assetRing.rotation.x = Math.PI / 2;
        assetRing.position.y = 4.4;
        scene.add(assetRing);

        // Investor nodes.
        const investors = CAPITAL_INVESTORS.map((inv, i) => {
          const a = (i / CAPITAL_INVESTORS.length) * Math.PI * 2;
          const pos = new THREE.Vector3(Math.cos(a) * 6.6, 3.2, Math.sin(a) * 6.6);
          const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), new THREE.MeshStandardMaterial({ color: 0x15312a, emissive: VIOLET, emissiveIntensity: 0.6, metalness: 0.5, roughness: 0.3 }));
          mesh.position.copy(pos);
          scene.add(mesh);
          const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([pos, new THREE.Vector3(0, 3.6, 0)]), new THREE.LineBasicMaterial({ color: 0x2f8d80, transparent: true, opacity: 0.3 }));
          scene.add(line);
          return { pos, mesh };
        });

        const particles: THREE.Mesh[] = [];
        for (let i = 0; i < 20; i++) {
          const p = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.7 }));
          scene.add(p);
          particles.push(p);
        }

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          const s = CAPITAL_SCENARIOS[currentScenario];
          layers.forEach((l) => {
            const layer = CAPITAL_LAYERS.find((x) => x.id === l.id)!;
            const color = currentMode === 'risk' ? (l.id === 'DEBT' ? CYAN : currentScenario === 'downside' ? ROSE : AMBER) :
              currentMode === 'returns' ? GREEN : new THREE.Color(layer.color).getHex();
            l.mat.emissive.setHex(color);
            l.mat.emissiveIntensity = l.id === currentSelected ? 1.1 : 0.3;
            l.mesh.scale.setScalar(l.id === currentSelected ? 1.06 : 1);
          });
          investors.forEach((i) => { i.mesh.scale.setScalar(currentMode === 'investors' ? 1.3 : 1); });
          const layer = CAPITAL_LAYERS.find((x) => x.id === currentSelected);
          if (layer) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid ${layer.color}88;border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:${layer.color};font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${layer.id} · HK$${layer.amount}M</span><div style="margin-top:2px;font-weight:500">${layer.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${layer.rate} · ${layer.note}</div></div>`;
          } else label.style.display = 'none';
          void s;
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
          const l = CAPITAL_LAYERS.find((x) => x.id === hit.object.userData.layerId);
          return l ? { id: l.id, name: l.name, amount: l.amount, rate: l.rate, note: l.note } : null;
        };
        const move = (event: PointerEvent) => { updatePointer(event); ctx.renderer.domElement.style.cursor = pick() ? 'pointer' : 'grab'; };
        const click = (event: PointerEvent) => { updatePointer(event); const l = pick(); if (l) onSelectRef.current(l); };
        ctx.renderer.domElement.addEventListener('pointermove', move);
        ctx.renderer.domElement.addEventListener('pointerup', click);
        ctx.addDispose(() => {
          ctx.renderer.domElement.removeEventListener('pointermove', move);
          ctx.renderer.domElement.removeEventListener('pointerup', click);
        });

        const projected = new THREE.Vector3();
        ctx.addUpdate((dt, elapsed) => {
          assetRing.rotation.z += dt * 0.06;
          ring.rotation.z += dt * 0.04;
          investors.forEach((i, idx) => { i.mesh.position.y = 3.2 + Math.sin(elapsed * 1.4 + idx) * 0.1; });
          particles.forEach((p, i) => {
            const t = (elapsed * 0.12 + i / 20) % 1;
            p.position.set(Math.cos(t * Math.PI * 2) * 5, 1 + t * 5, Math.sin(t * Math.PI * 2) * 5);
          });
          const layer = CAPITAL_LAYERS.find((x) => x.id === currentSelected);
          if (layer) {
            const idx = CAPITAL_LAYERS.findIndex((x) => x.id === currentSelected);
            projected.set(0, 1.4 + idx * 1.5 + Math.max(0.5, layer.amount / 160), 3.2).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            label.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
          }
        });
      }}
    />
  );
}
