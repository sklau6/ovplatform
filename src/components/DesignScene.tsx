import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { DESIGN_OPTIONS, type DesignOptionId } from '../lib/designData';

interface Props { selectedId: DesignOptionId; autoRotate?: boolean; onSelect?: (id: DesignOptionId) => void }
interface Api { setSelected: (id: DesignOptionId) => void }

export function DesignScene({ selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D generative design options with three massing schemes: twin towers, stepped terraces and courtyard mid-rise."
      cameraPosition={[32, 19, 36]}
      target={[0, 8, 0]}
      fov={40}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.006 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.13}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0xa0e0d2, 0x030706, 0.95));
        const key = new THREE.DirectionalLight(0xe8fff4, 1.7);
        key.position.set(-20, 26, 20);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.7);
        rim.position.set(22, 10, -20);
        scene.add(rim);

        const base = new THREE.Mesh(new THREE.BoxGeometry(52, 1.2, 30), new THREE.MeshStandardMaterial({ color: 0x06110e, metalness: 0.5, roughness: 0.6 }));
        base.position.y = -0.6;
        scene.add(base);
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(51, 29), new THREE.MeshStandardMaterial({ color: 0x0a1714, roughness: 0.85 }));
        ground.rotation.x = -Math.PI / 2;
        scene.add(ground);
        const grid: THREE.Vector3[] = [];
        for (let x = -25; x <= 25; x += 2.5) grid.push(new THREE.Vector3(x, 0.01, -14), new THREE.Vector3(x, 0.01, 14));
        for (let z = -14; z <= 14; z += 2.5) grid.push(new THREE.Vector3(-25, 0.01, z), new THREE.Vector3(25, 0.01, z));
        scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(grid), new THREE.LineBasicMaterial({ color: 0x1c5d4d, transparent: true, opacity: 0.15 })));

        const groups: Array<{ id: DesignOptionId; group: THREE.Group; color: string }> = [];
        const pickables: THREE.Mesh[] = [];
        const plinthMat = new THREE.MeshStandardMaterial({ color: 0x1d3b33, metalness: 0.4, roughness: 0.55 });

        DESIGN_OPTIONS.forEach((opt, idx) => {
          const x = (idx - 1) * 13;
          const group = new THREE.Group();
          group.position.set(x, 0, 0);
          const plinth = new THREE.Mesh(new THREE.BoxGeometry(10, 0.5, 9), plinthMat);
          plinth.position.y = 0.25;
          group.add(plinth);
          const color = new THREE.Color(opt.color);
          const bodyMat = new THREE.MeshStandardMaterial({ color: 0x476159, metalness: 0.4, roughness: 0.45, emissive: color, emissiveIntensity: 0.18 });
          const addBody = (x2: number, z2: number, w: number, h: number, d: number) => {
            const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bodyMat);
            m.position.set(x2, 0.5 + h / 2, z2);
            m.userData.optionId = opt.id;
            group.add(m);
            pickables.push(m);
            const edges = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.4 }));
            m.add(edges);
            for (let k = 0; k < 4; k++) {
              const strip = new THREE.Mesh(new THREE.BoxGeometry(w * 0.8, 0.05, 0.03), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45 }));
              strip.position.set(0, -h / 2 + h * 0.2 + k * h * 0.18, d / 2 + 0.02);
              m.add(strip);
            }
            const roof = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, 0.08, d * 0.85), new THREE.MeshStandardMaterial({ color: 0x2c6b4a, emissive: 0x153f2b, emissiveIntensity: 0.35, roughness: 0.8 }));
            roof.position.y = h / 2 + 0.05;
            m.add(roof);
          };
          if (opt.id === 'A') {
            addBody(-2.5, -1.5, 4.2, 20, 4.2);
            addBody(2.7, 1.2, 3.8, 15, 3.8);
            addBody(0, 2.7, 8.5, 3, 3);
          } else if (opt.id === 'B') {
            addBody(-2.5, 1.5, 4.2, 8, 4);
            addBody(1.0, 0.5, 4.2, 12, 4);
            addBody(-0.5, -2.5, 4.2, 17, 4);
          } else {
            addBody(-2.8, -2.2, 3.4, 8, 3.2);
            addBody(2.8, -2.2, 3.4, 8, 3.2);
            addBody(-2.8, 2.2, 3.4, 7, 3.2);
            addBody(2.8, 2.2, 3.4, 7, 3.2);
          }
          // Trees around plinth.
          for (let t = 0; t < 5; t++) {
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.7, 5), new THREE.MeshStandardMaterial({ color: 0x5b4632, roughness: 0.9 }));
            trunk.position.set(-4 + t * 2, 0.85, 4.2);
            group.add(trunk);
            const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 0), new THREE.MeshStandardMaterial({ color: 0x2c7047, roughness: 0.85 }));
            crown.position.set(-4 + t * 2, 1.35, 4.2);
            group.add(crown);
          }
          scene.add(group);
          groups.push({ id: opt.id, group, color: opt.color });
        });

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let current: DesignOptionId = selectedId;
        const apply = () => {
          groups.forEach((g) => {
            const on = g.id === current;
            g.group.scale.setScalar(on ? 1.04 : 1);
            g.group.traverse((o) => {
              if ((o as THREE.Mesh).isMesh && (o as THREE.Mesh).material instanceof THREE.MeshStandardMaterial) {
                const mat = (o as THREE.Mesh).material as THREE.MeshStandardMaterial;
                if (mat.emissive && mat.emissive.getHex() !== 0x153f2b) mat.emissiveIntensity = on ? 0.45 : 0.15;
              }
            });
          });
          const opt = DESIGN_OPTIONS.find((o) => o.id === current);
          if (opt) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid ${opt.color}88;border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:${opt.color};font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">OPTION ${opt.id} · ${opt.gfa} m²</span><div style="margin-top:2px;font-weight:500">${opt.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${opt.height} · ${opt.units} units · score ${opt.score}</div></div>`;
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
          return hit ? (hit.object.userData.optionId as DesignOptionId) : null;
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
          groups.forEach((g, i) => { g.group.position.y = Math.sin(elapsed * 0.8 + i) * 0.03; });
          const opt = DESIGN_OPTIONS.find((o) => o.id === current);
          const idx = DESIGN_OPTIONS.findIndex((o) => o.id === current);
          if (opt) {
            projected.set((idx - 1) * 13, 5.2, 4.5).project(ctx.camera);
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
