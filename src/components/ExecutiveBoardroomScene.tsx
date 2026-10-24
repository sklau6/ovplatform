import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';

export interface ExecPillar { id: string; label: string; metric: string; color: string; detail: string }

interface Props {
  pillars: ExecPillar[];
  selectedId: string;
  autoRotate?: boolean;
  onSelect?: (id: string) => void;
}

export function ExecutiveBoardroomScene({ pillars, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<{ setSelected: (id: string) => void } | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D executive boardroom with a holographic city model and five decision pillars."
      cameraPosition={[12, 8, 15]}
      target={[0, 2.6, 0]}
      fov={38}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.014 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.14}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x94e0d2, 0x030706, 0.9));
        const key = new THREE.DirectionalLight(0xd8fff4, 1.7);
        key.position.set(-10, 18, 14);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.8);
        rim.position.set(12, 8, -12);
        scene.add(rim);

        const floor = new THREE.Mesh(new THREE.PlaneGeometry(26, 22), new THREE.MeshStandardMaterial({ color: 0x06110e, metalness: 0.55, roughness: 0.55 }));
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);
        const grid: THREE.Vector3[] = [];
        for (let x = -13; x <= 13; x += 2) grid.push(new THREE.Vector3(x, 0.01, -11), new THREE.Vector3(x, 0.01, 11));
        for (let z = -11; z <= 11; z += 2) grid.push(new THREE.Vector3(-13, 0.01, z), new THREE.Vector3(13, 0.01, z));
        scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(grid), new THREE.LineBasicMaterial({ color: 0x1a5d4d, transparent: true, opacity: 0.18 })));

        const table = new THREE.Mesh(new THREE.CylinderGeometry(6.2, 6.4, 0.3, 64), new THREE.MeshStandardMaterial({ color: 0x0b1d18, metalness: 0.7, roughness: 0.28 }));
        table.position.y = 0.9;
        scene.add(table);
        const rimRing = new THREE.Mesh(new THREE.TorusGeometry(6.2, 0.05, 8, 100), new THREE.MeshBasicMaterial({ color: 0x53f0be, transparent: true, opacity: 0.5 }));
        rimRing.rotation.x = Math.PI / 2;
        rimRing.position.y = 1.1;
        scene.add(rimRing);

        // Holographic city on the table.
        const city = new THREE.Group();
        city.position.y = 1.15;
        const cityMat = new THREE.MeshStandardMaterial({ color: 0x0e2b25, emissive: 0x2fbf9b, emissiveIntensity: 0.45, metalness: 0.55, roughness: 0.35 });
        for (let i = 0; i < 9; i++) {
          const w = 0.35 + (i % 3) * 0.16;
          const h = 0.4 + ((i * 7) % 9) * 0.22;
          const tower = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), cityMat);
          const a = (i / 9) * Math.PI * 2;
          tower.position.set(Math.cos(a) * (1.2 + (i % 3) * 0.8), h / 2, Math.sin(a) * (1.2 + (i % 2) * 0.7));
          city.add(tower);
        }
        const cityHalo = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.02, 5, 60), new THREE.MeshBasicMaterial({ color: 0x51d6ff, transparent: true, opacity: 0.5 }));
        cityHalo.rotation.x = Math.PI / 2;
        city.add(cityHalo);
        scene.add(city);

        // Chairs.
        const chairMat = new THREE.MeshStandardMaterial({ color: 0x16332a, metalness: 0.4, roughness: 0.6 });
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const chair = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.8), chairMat);
          chair.position.set(Math.cos(a) * 8.1, 0.55, Math.sin(a) * 8.1);
          scene.add(chair);
        }

        // Pillar boards around the table.
        const records: Array<{ p: ExecPillar; mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; baseY: number; angle: number }> = [];
        const pickables: THREE.Mesh[] = [];
        pillars.forEach((p, i) => {
          const a = (i / pillars.length) * Math.PI * 2 - Math.PI / 2;
          const tint = new THREE.Color(p.color);
          const mat = new THREE.MeshStandardMaterial({ color: 0x102820, emissive: tint, emissiveIntensity: 0.25, metalness: 0.45, roughness: 0.35, transparent: true, opacity: 0.92, side: THREE.DoubleSide });
          const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.8), mat);
          mesh.position.set(Math.cos(a) * 5.4, 2.3, Math.sin(a) * 5.4);
          mesh.rotation.y = -a + Math.PI / 2;
          mesh.userData.pillarId = p.id;
          scene.add(mesh);
          pickables.push(mesh);
          const border = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: tint, transparent: true, opacity: 0.8 }));
          mesh.add(border);
          records.push({ p, mesh, mat, baseY: 2.3, angle: a });
        });

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let current = selectedId;
        const apply = () => {
          records.forEach((r) => {
            const on = r.p.id === current;
            r.mat.emissiveIntensity = on ? 1.1 : 0.25;
            r.baseY = on ? 2.65 : 2.3;
          });
          const active = records.find((r) => r.p.id === current);
          if (active) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid ${active.p.color}88;border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:${active.p.color};font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">COO MANDATE</span><div style="margin-top:2px;font-weight:500">${active.p.label} · ${active.p.metric}</div></div>`;
          } else label.style.display = 'none';
        };
        apiRef.current = { setSelected: (id) => { current = id; apply(); } };
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
          return hit ? (hit.object.userData.pillarId as string) : null;
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
        ctx.addUpdate((dt, elapsed) => {
          city.rotation.y += dt * 0.08;
          cityHalo.rotation.z += dt * 0.15;
          rimRing.rotation.z += dt * 0.05;
          records.forEach((r, i) => {
            r.mesh.position.y += (r.baseY - r.mesh.position.y) * Math.min(1, dt * 4);
            if (r.p.id === current) r.mesh.position.y += Math.sin(elapsed * 2 + i) * 0.03;
            projected.set(r.mesh.position.x, r.mesh.position.y + 1.2, r.mesh.position.z).project(ctx.camera);
          });
          const active = records.find((r) => r.p.id === current);
          if (active) {
            projected.set(active.mesh.position.x, active.mesh.position.y + 1.2, active.mesh.position.z).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            label.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
          }
        });
      }}
    />
  );
}
