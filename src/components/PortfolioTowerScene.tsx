import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import type { Project } from '../lib/types';

export interface PortfolioTowerSceneProps {
  projects: Project[];
  selectedId: string | null;
  autoRotate?: boolean;
  onSelect?: (id: string) => void;
}

interface PortfolioApi {
  setSelected: (id: string | null) => void;
}

const COLORS: Record<string, number> = { green: 0x53f0be, amber: 0xf4bd72, red: 0xff7088 };

function edge(mesh: THREE.Mesh, color: number, opacity: number) {
  const e = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }),
  );
  mesh.add(e);
  return e;
}

export function PortfolioTowerScene({ projects, selectedId, autoRotate = false, onSelect }: PortfolioTowerSceneProps) {
  const apiRef = useRef<PortfolioApi | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  const ref = useRef(projects);
  ref.current = projects;

  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D portfolio capital allocation towers, selectable by project."
      cameraPosition={[17, 12, 21]}
      target={[0, 3.4, 0]}
      fov={38}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.011 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.16}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x95e0ce, 0x030706, 0.9));
        const key = new THREE.DirectionalLight(0xd8fff4, 1.6);
        key.position.set(-12, 24, 18);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.7);
        rim.position.set(14, 8, -14);
        scene.add(rim);

        const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 18), new THREE.MeshStandardMaterial({ color: 0x06110e, metalness: 0.6, roughness: 0.55 }));
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);
        const grid: THREE.Vector3[] = [];
        for (let x = -15; x <= 15; x += 2) grid.push(new THREE.Vector3(x, 0.01, -9), new THREE.Vector3(x, 0.01, 9));
        for (let z = -9; z <= 9; z += 2) grid.push(new THREE.Vector3(-15, 0.01, z), new THREE.Vector3(15, 0.01, z));
        scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(grid), new THREE.LineBasicMaterial({ color: 0x1a5d4d, transparent: true, opacity: 0.22 })));

        const records: Array<{ mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; baseH: number; project: Project; x: number; z: number }> = [];
        const pickables: THREE.Mesh[] = [];
        const maxBudget = Math.max(...ref.current.map((p) => p.budget), 1);
        ref.current.slice(0, 8).forEach((project, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const x = (col - 1.5) * 5.8;
          const z = (row - 0.5) * 5.8;
          const h = 1.2 + (project.budget / maxBudget) * 7.5;
          const color = COLORS[project.rag] ?? 0x53f0be;
          const mat = new THREE.MeshStandardMaterial({ color: 0x18322b, emissive: color, emissiveIntensity: 0.25, metalness: 0.55, roughness: 0.38 });
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(2.3, h, 2.3), mat);
          mesh.position.set(x, h / 2 + 0.1, z);
          mesh.userData.projectId = project.id;
          edge(mesh, color, 0.45);
          scene.add(mesh);
          pickables.push(mesh);
          const cap = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.06, 2.45), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 }));
          cap.position.set(x, h + 0.15, z);
          scene.add(cap);
          records.push({ mesh, mat, baseH: h, project, x, z });
        });

        const ring = new THREE.Mesh(new THREE.TorusGeometry(12.5, 0.03, 6, 100), new THREE.MeshBasicMaterial({ color: 0x53f0be, transparent: true, opacity: 0.2 }));
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.3;
        scene.add(ring);
        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentSelected = selectedId;
        const applySelection = () => {
          records.forEach((r) => {
            const on = r.project.id === currentSelected;
            r.mesh.scale.setScalar(on ? 1.06 : 1);
            r.mat.emissiveIntensity = on ? 1 : 0.25;
          });
          const p = records.find((r) => r.project.id === currentSelected);
          if (p) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid rgba(83,240,190,.45);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:#53f0be;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${p.project.id} · ${p.project.gate}</span><div style="margin-top:2px;font-weight:500">${p.project.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">HK$${p.project.budget}M · ${p.project.margin.toFixed(1)}% margin</div></div>`;
          } else label.style.display = 'none';
        };
        apiRef.current = { setSelected: (id) => { currentSelected = id; applySelection(); } };
        applySelection();

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
          return hit ? (hit.object.userData.projectId as string) : null;
        };
        const move = (event: PointerEvent) => { updatePointer(event); ctx.renderer.domElement.style.cursor = pick() ? 'pointer' : 'grab'; };
        const click = (event: PointerEvent) => { updatePointer(event); const id = pick(); if (id) onSelectRef.current(id); };
        ctx.renderer.domElement.addEventListener('pointermove', move);
        ctx.renderer.domElement.addEventListener('pointerup', click);
        ctx.addDispose(() => {
          ctx.renderer.domElement.removeEventListener('pointermove', move);
          ctx.renderer.domElement.removeEventListener('pointerup', click);
        });

        const projected = new THREE.Vector3();
        ctx.addUpdate((_dt, elapsed) => {
          ring.rotation.z += 0.001;
          const p = records.find((r) => r.project.id === currentSelected);
          if (p) {
            p.mesh.scale.setScalar(1.06 + Math.sin(elapsed * 3) * 0.01);
            projected.set(p.x, p.baseH + 1.4, p.z).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            label.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
          }
        });
      }}
    />
  );
}
