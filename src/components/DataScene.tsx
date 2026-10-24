import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { DATA_DOMAINS, DATA_SCENARIOS, type DataMode, type DataScenario } from '../lib/dataData';

export interface DataSelection { id: string; name: string; products: number; quality: number; owner: string; access: string }
interface Props { mode: DataMode; scenario: DataScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: DataSelection) => void }
interface Api { setMode: (m: DataMode) => void; setScenario: (s: DataScenario) => void; setSelected: (id: string | null) => void }

const CYAN = 0x51d6ff, GREEN = 0x53f0be, AMBER = 0xf4bd72, VIOLET = 0xa991ff, ROSE = 0xff7088;

export function DataScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D data mesh with seven domains, data products, lineage, quality, access policies and AI model nodes."
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

        // Data core.
        const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 1), new THREE.MeshStandardMaterial({ color: 0x18312a, emissive: GREEN, emissiveIntensity: 0.6, metalness: 0.5, roughness: 0.3 }));
        core.position.y = 3.2;
        scene.add(core);
        const coreRing = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.03, 5, 50), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.5 }));
        coreRing.rotation.x = Math.PI / 2;
        coreRing.position.y = 3.2;
        scene.add(coreRing);

        const domains: Array<{ id: string; mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; pos: THREE.Vector3; color: string }> = [];
        const pickables: THREE.Mesh[] = [];
        DATA_DOMAINS.forEach((d, i) => {
          const a = (i / DATA_DOMAINS.length) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(a) * 6.2;
          const z = Math.sin(a) * 6.2;
          const color = new THREE.Color(d.color);
          const mat = new THREE.MeshStandardMaterial({ color: 0x2e4038, emissive: color, emissiveIntensity: 0.35, metalness: 0.35, roughness: 0.5 });
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), mat);
          mesh.position.set(x, 1.4, z);
          mesh.rotation.y = -a;
          mesh.userData.domainId = d.id;
          scene.add(mesh);
          pickables.push(mesh);
          const edge = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 }));
          mesh.add(edge);
          // Product satellites.
          for (let k = 0; k < Math.min(4, Math.ceil(d.products / 6)); k++) {
            const sat = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color }));
            const ba = (k / 4) * Math.PI * 2;
            sat.position.set(x + Math.cos(ba) * 1.2, 1.0, z + Math.sin(ba) * 1.2);
            scene.add(sat);
          }
          const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, 1.4, z), new THREE.Vector3(0, 3.2, 0)]), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.25 }));
          scene.add(line);
          domains.push({ id: d.id, mesh, mat, pos: new THREE.Vector3(x, 1.4, z), color: d.color });
        });

        // Access gates.
        for (let i = 0; i < 3; i++) {
          const gate = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.04, 5, 6), new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.5 }));
          gate.position.set(-4 + i * 4, 4.5, 7.5);
          scene.add(gate);
        }

        // AI model nodes.
        for (let i = 0; i < 3; i++) {
          const ai = new THREE.Mesh(new THREE.OctahedronGeometry(0.4, 0), new THREE.MeshStandardMaterial({ color: 0x1d3b32, emissive: VIOLET, emissiveIntensity: 0.6, metalness: 0.4, roughness: 0.3 }));
          ai.position.set(-3 + i * 3, 6.5, -4);
          scene.add(ai);
        }

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          domains.forEach((d) => {
            const data = DATA_DOMAINS.find((x) => x.id === d.id)!;
            const color = currentMode === 'quality' ? (data.quality >= 96 ? GREEN : data.quality >= 92 ? AMBER : ROSE) :
              currentMode === 'access' ? (data.access === 'Confidential' ? ROSE : data.access === 'Restricted' ? AMBER : GREEN) :
                currentMode === 'lineage' ? (data.id === 'BIM' || data.id === 'ESG' ? VIOLET : CYAN) : new THREE.Color(data.color).getHex();
            d.mat.emissive.setHex(color);
            d.mat.emissiveIntensity = d.id === currentSelected ? 0.9 : 0.35;
            d.mesh.scale.setScalar(d.id === currentSelected ? 1.2 : 1);
          });
          const d = DATA_DOMAINS.find((x) => x.id === currentSelected);
          if (d) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid ${d.color}88;border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:${d.color};font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${d.id} · ${d.quality}% QUALITY</span><div style="margin-top:2px;font-weight:500">${d.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${d.products} products · ${d.owner} · ${d.access}</div></div>`;
          } else label.style.display = 'none';
          void DATA_SCENARIOS[currentScenario];
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
          const d = DATA_DOMAINS.find((x) => x.id === hit.object.userData.domainId);
          return d ? { id: d.id, name: d.name, products: d.products, quality: d.quality, owner: d.owner, access: d.access } : null;
        };
        const move = (event: PointerEvent) => { updatePointer(event); ctx.renderer.domElement.style.cursor = pick() ? 'pointer' : 'grab'; };
        const click = (event: PointerEvent) => { updatePointer(event); const d = pick(); if (d) onSelectRef.current(d); };
        ctx.renderer.domElement.addEventListener('pointermove', move);
        ctx.renderer.domElement.addEventListener('pointerup', click);
        ctx.addDispose(() => {
          ctx.renderer.domElement.removeEventListener('pointermove', move);
          ctx.renderer.domElement.removeEventListener('pointerup', click);
        });

        const projected = new THREE.Vector3();
        ctx.addUpdate((dt, elapsed) => {
          core.rotation.y += dt * 0.2;
          coreRing.rotation.z += dt * 0.25;
          ring.rotation.z += dt * 0.04;
          domains.forEach((d, i) => { d.mesh.position.y = 1.4 + Math.sin(elapsed * 1.2 + i) * 0.05; });
          if (currentSelected) {
            const d = domains.find((x) => x.id === currentSelected);
            if (d) projected.set(d.pos.x, 3.2, d.pos.z).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            label.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
          }
        });
      }}
    />
  );
}
