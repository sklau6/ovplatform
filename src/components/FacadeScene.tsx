import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { FACADE_PANELS, FACADE_SCENARIOS, type FacadeMode, type FacadeScenario } from '../lib/facadeData';

export interface FacadeSelection { id: string; name: string; u: string; wind: string; status: string }
interface Props { mode: FacadeMode; scenario: FacadeScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: FacadeSelection) => void }
interface Api { setMode: (m: FacadeMode) => void; setScenario: (s: FacadeScenario) => void; setSelected: (id: string | null) => void }

const CYAN = 0x51d6ff, GREEN = 0x53f0be, AMBER = 0xf4bd72, VIOLET = 0xa991ff, ROSE = 0xff7088;

export function FacadeScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D unitised facade mock-up with glass panels, mullions, brackets, thermal break, wind arrows, rain and solar gain."
      cameraPosition={[14, 10, 18]}
      target={[0, 3, 0]}
      fov={40}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.012 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.13}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x9bdde8, 0x030706, 0.95));
        const key = new THREE.DirectionalLight(0xd8fff8, 1.7);
        key.position.set(-12, 18, 16);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.7);
        rim.position.set(14, 8, -14);
        scene.add(rim);

        const floor = new THREE.Mesh(new THREE.BoxGeometry(22, 0.4, 12), new THREE.MeshStandardMaterial({ color: 0x081613, metalness: 0.5, roughness: 0.6 }));
        floor.position.y = -0.2;
        scene.add(floor);
        const grid: THREE.Vector3[] = [];
        for (let x = -11; x <= 11; x += 2) grid.push(new THREE.Vector3(x, 0.01, -6), new THREE.Vector3(x, 0.01, 6));
        for (let z = -6; z <= 6; z += 2) grid.push(new THREE.Vector3(-11, 0.01, z), new THREE.Vector3(11, 0.01, z));
        scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(grid), new THREE.LineBasicMaterial({ color: 0x1c5d5d, transparent: true, opacity: 0.18 })));

        const alu = new THREE.MeshStandardMaterial({ color: 0x8fa6a0, metalness: 0.7, roughness: 0.3 });
        const panelRecords: Array<{ id: string; mesh: THREE.Mesh; mat: THREE.MeshPhysicalMaterial; pos: THREE.Vector3; color: string }> = [];
        const pickables: THREE.Mesh[] = [];

        // Mullion grid.
        for (let i = 0; i < 4; i++) {
          const m = new THREE.Mesh(new THREE.BoxGeometry(0.16, 8, 0.3), alu);
          m.position.set(-5.4 + i * 3.6, 4, 0.05);
          scene.add(m);
        }
        for (let j = 0; j < 3; j++) {
          const m = new THREE.Mesh(new THREE.BoxGeometry(11, 0.18, 0.3), alu);
          m.position.set(0, 0.9 + j * 3, 0.05);
          scene.add(m);
        }
        // Brackets.
        for (let i = 0; i < 3; i++) {
          const b = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 1.2), alu);
          b.position.set(-3.6 + i * 3.6, 5.6, -0.6);
          scene.add(b);
        }

        for (const p of FACADE_PANELS) {
          const color = new THREE.Color(p.color);
          const mat = new THREE.MeshPhysicalMaterial({ color: 0x2d5b62, emissive: color, emissiveIntensity: 0.22, metalness: 0.55, roughness: 0.12, transparent: true, opacity: 0.78, clearcoat: 1, clearcoatRoughness: 0.08 });
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(3.3, 2.80, 0.08), mat);
          mesh.position.set(p.x, p.y + 0.6, 0.18);
          mesh.userData.panelId = p.id;
          scene.add(mesh);
          pickables.push(mesh);
          const edge = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: 0xd8fff8, transparent: true, opacity: 0.35 }));
          mesh.add(edge);
          panelRecords.push({ id: p.id, mesh, mat, pos: new THREE.Vector3(p.x, p.y + 0.6, 0.18), color: p.color });
          // Spandrel / insulation band.
          const band = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.5, 0.2), new THREE.MeshStandardMaterial({ color: 0x3f5c55, roughness: 0.8 }));
          band.position.set(p.x, p.y - 0.35, 0.0);
          scene.add(band);
        }

        // Section cut: reveal layers.
        const section = new THREE.Group();
        const depthLayers = [
          [0x9fb7b0, 0.2, 'glass'],
          [0x4f7a72, 0.15, 'air'],
          [0xd8b45a, 0.25, 'insulation'],
          [0x6d7b78, 0.2, 'structure'],
        ] as const;
        let z = 0;
        depthLayers.forEach(([color, t]) => {
          const m = new THREE.Mesh(new THREE.BoxGeometry(0.7, 8, t), new THREE.MeshStandardMaterial({ color, metalness: 0.3, roughness: 0.7 }));
          m.position.set(-5.9, 4, -0.9 + z);
          section.add(m);
          z += t;
        });
        scene.add(section);

        // Wind arrows.
        const arrows: THREE.Group[] = [];
        for (let i = 0; i < 5; i++) {
          const a = new THREE.Group();
          const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2, 5), new THREE.MeshBasicMaterial({ color: CYAN }));
          shaft.rotation.z = Math.PI / 2;
          a.add(shaft);
          const head = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.4, 8), new THREE.MeshBasicMaterial({ color: CYAN }));
          head.rotation.z = -Math.PI / 2;
          head.position.x = 1.1;
          a.add(head);
          a.position.set(-2, 1.5 + i * 1.6, -2.5);
          scene.add(a);
          arrows.push(a);
        }

        // Rain.
        const rain: THREE.Line[] = [];
        for (let i = 0; i < 40; i++) {
          const x = -7 + Math.random() * 14;
          const y = Math.random() * 9;
          const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, y, 0.6), new THREE.Vector3(x + 0.15, y - 0.4, 0.6)]), new THREE.LineBasicMaterial({ color: 0x8fd8ff, transparent: true, opacity: 0.5 }));
          scene.add(line);
          rain.push(line);
        }

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          panelRecords.forEach((p) => {
            const panel = FACADE_PANELS.find((x) => x.id === p.id)!;
            const color = currentMode === 'thermal' ? (panel.u <= '1.08' ? GREEN : AMBER) :
              currentMode === 'structural' ? CYAN : currentMode === 'water' ? (panel.status === 'Pass' ? GREEN : ROSE) : VIOLET;
            p.mat.emissive.setHex(color);
            p.mat.emissiveIntensity = p.id === currentSelected ? 0.8 : 0.22;
            p.mesh.scale.setScalar(p.id === currentSelected ? 1.04 : 1);
          });
          arrows.forEach((a) => { a.visible = currentScenario === 'wind'; });
          rain.forEach((r) => { r.visible = currentScenario === 'rain'; });
          const p = FACADE_PANELS.find((x) => x.id === currentSelected);
          if (p) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid ${p.color}88;border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:${p.color};font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${p.id} · U ${p.u}</span><div style="margin-top:2px;font-weight:500">${p.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${p.wind} · ${p.status}</div></div>`;
          } else label.style.display = 'none';
          void FACADE_SCENARIOS[currentScenario];
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
          const p = FACADE_PANELS.find((x) => x.id === hit.object.userData.panelId);
          return p ? { id: p.id, name: p.name, u: p.u, wind: p.wind, status: p.status } : null;
        };
        const move = (event: PointerEvent) => { updatePointer(event); ctx.renderer.domElement.style.cursor = pick() ? 'pointer' : 'grab'; };
        const click = (event: PointerEvent) => { updatePointer(event); const p = pick(); if (p) onSelectRef.current(p); };
        ctx.renderer.domElement.addEventListener('pointermove', move);
        ctx.renderer.domElement.addEventListener('pointerup', click);
        ctx.addDispose(() => {
          ctx.renderer.domElement.removeEventListener('pointermove', move);
          ctx.renderer.domElement.removeEventListener('pointerup', click);
        });

        const projected = new THREE.Vector3();
        ctx.addUpdate((dt, elapsed) => {
          arrows.forEach((a, i) => { a.position.x = -2 + Math.sin(elapsed * 1.5 + i) * 0.15; });
          rain.forEach((r, i) => {
            r.position.y = -((elapsed * 2 + i * 0.4) % 9);
          });
          const p = FACADE_PANELS.find((x) => x.id === currentSelected);
          if (p) {
            projected.set(p.x, p.y + 2.3, 0.4).project(ctx.camera);
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
