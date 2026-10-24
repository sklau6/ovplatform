import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';

export interface ArchLayer {
  id: string;
  name: string;
  color: string;
  summary: string;
}

interface Props {
  layers: ArchLayer[];
  selectedId: string;
  autoRotate?: boolean;
  onSelect?: (id: string) => void;
}

export function ArchitectureStackScene({ layers, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<{ setSelected: (id: string) => void } | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D layered platform architecture with data, integration, twin, applications, experience and trust layers."
      cameraPosition={[13, 10, 19]}
      target={[0, 3.4, 0]}
      fov={38}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.012 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.14}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x94e0d2, 0x030706, 0.9));
        const key = new THREE.DirectionalLight(0xd8fff4, 1.6);
        key.position.set(-12, 22, 16);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.8);
        rim.position.set(14, 10, -16);
        scene.add(rim);

        const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 20), new THREE.MeshStandardMaterial({ color: 0x06110e, metalness: 0.6, roughness: 0.55 }));
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);
        const grid: THREE.Vector3[] = [];
        for (let x = -12; x <= 12; x += 2) grid.push(new THREE.Vector3(x, 0.01, -10), new THREE.Vector3(x, 0.01, 10));
        for (let z = -10; z <= 10; z += 2) grid.push(new THREE.Vector3(-12, 0.01, z), new THREE.Vector3(12, 0.01, z));
        scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(grid), new THREE.LineBasicMaterial({ color: 0x1a5d4d, transparent: true, opacity: 0.2 })));

        const ordered = [...layers].sort((a, b) => a.id.localeCompare(b.id));
        const records: Array<{ layer: ArchLayer; mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; y: number }> = [];
        const pickables: THREE.Mesh[] = [];
        ordered.forEach((layer, i) => {
          const y = 1.3 + i * 1.05;
          const color = new THREE.Color(layer.color);
          const mat = new THREE.MeshStandardMaterial({ color: 0x0e211b, emissive: color, emissiveIntensity: 0.22, metalness: 0.55, roughness: 0.32, transparent: true, opacity: 0.86 });
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.22, 5.4), mat);
          mesh.position.set(0, y, 0);
          mesh.userData.layerId = layer.id;
          scene.add(mesh);
          pickables.push(mesh);
          const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.75 }));
          mesh.add(edges);
          for (let k = 0; k < 3; k++) {
            const chip = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.06, 0.6), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.32 }));
            chip.position.set(-3 + k * 3, 0, 0);
            chip.position.y = 0.17;
            mesh.add(chip);
          }
          records.push({ layer, mesh, mat, y });
        });

        const particles = (() => {
          const count = 180;
          const pos = new Float32Array(count * 3);
          const col = new Float32Array(count * 3);
          for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.sin(i * 12.9898) * 43758.5453 % 9) - 4.5;
            pos[i * 3 + 1] = 0.5 + (i % 30) * 0.3;
            pos[i * 3 + 2] = (Math.cos(i * 78.233) * 43758.5453 % 5) - 2.5;
            const c = new THREE.Color(i % 2 ? 0x53f0be : 0x51d6ff);
            col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
          }
          const geo = new THREE.BufferGeometry();
          geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
          geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
          return new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.1, vertexColors: true, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }));
        })();
        scene.add(particles);

        const ring = new THREE.Mesh(new THREE.TorusGeometry(10, 0.03, 6, 100), new THREE.MeshBasicMaterial({ color: 0x53f0be, transparent: true, opacity: 0.2 }));
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.3;
        scene.add(ring);

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let current = selectedId;
        const apply = () => {
          records.forEach((r) => {
            const on = r.layer.id === current;
            r.mat.emissiveIntensity = on ? 0.95 : 0.22;
            r.mat.opacity = on ? 1 : 0.8;
            r.mesh.position.x = on ? 0.4 : 0;
          });
          const active = records.find((r) => r.layer.id === current);
          if (active) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid ${active.layer.color}88;border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:${active.layer.color};font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${active.layer.id} · PLATFORM LAYER</span><div style="margin-top:2px;font-weight:500">${active.layer.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${active.layer.summary}</div></div>`;
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
          return hit ? (hit.object.userData.layerId as string) : null;
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
          const pos = particles.geometry.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < 180; i++) {
            let y = pos.getY(i) + dt * (0.5 + (i % 4) * 0.2);
            if (y > 7.8) y = 0.4;
            pos.setY(i, y);
          }
          pos.needsUpdate = true;
          ring.rotation.z += dt * 0.04;
          const active = records.find((r) => r.layer.id === current);
          if (active) {
            projected.set(0.4, active.y + 0.8, 2.2).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            label.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
          }
        });
      }}
    />
  );
}
