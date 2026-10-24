import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import type { LedgerBlock } from '../lib/types';

export interface TrustChainSceneProps {
  blocks: LedgerBlock[];
  selectedHeight: number | null;
  autoRotate?: boolean;
  onSelect?: (height: number) => void;
}

interface TrustApi {
  setSelected: (height: number | null) => void;
}

function blockTexture(block: LedgerBlock) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#06110d';
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = 'rgba(83,240,190,.4)';
  ctx.lineWidth = 3;
  ctx.strokeRect(7, 7, 242, 242);
  ctx.fillStyle = '#53f0be';
  ctx.font = '600 14px "JetBrains Mono", monospace';
  ctx.fillText('OPHYLLA LEDGER', 18, 32);
  ctx.fillStyle = '#eafff8';
  ctx.font = '700 46px "JetBrains Mono", monospace';
  ctx.fillText(`#${block.height}`, 18, 106);
  ctx.fillStyle = '#7fa79e';
  ctx.font = '13px "JetBrains Mono", monospace';
  ctx.fillText(`${block.txCount} TX · ${block.validator}`, 18, 138);
  ctx.fillStyle = '#6f8f87';
  ctx.font = '12px "JetBrains Mono", monospace';
  ctx.fillText(block.hash.slice(0, 22), 18, 172);
  ctx.fillText(block.hash.slice(22, 44), 18, 190);
  ctx.fillStyle = 'rgba(83,240,190,.18)';
  ctx.fillRect(18, 210, 220, 1);
  ctx.fillStyle = '#53f0be';
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.fillText('SHA-256 · FINALISED', 18, 232);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function TrustChainScene({ blocks, selectedHeight, autoRotate = false, onSelect }: TrustChainSceneProps) {
  const apiRef = useRef<TrustApi | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  const dataRef = useRef(blocks);
  dataRef.current = blocks;

  useEffect(() => { apiRef.current?.setSelected(selectedHeight); }, [selectedHeight]);

  return (
    <ThreeStage
      ariaLabel="3D blockchain ledger chain with selectable blocks, hashes and verified links."
      cameraPosition={[10, 7, 15]}
      target={[0, 3.4, 0]}
      fov={38}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.009 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.16}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x89e0cd, 0x030706, 0.9));
        const key = new THREE.DirectionalLight(0xc8fff2, 1.5);
        key.position.set(-10, 20, 16);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x2de0b2, 0.8);
        rim.position.set(14, 8, -12);
        scene.add(rim);

        const floor = new THREE.Mesh(
          new THREE.PlaneGeometry(34, 14),
          new THREE.MeshStandardMaterial({ color: 0x06110d, metalness: 0.65, roughness: 0.5 }),
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        scene.add(floor);
        const grid: THREE.Vector3[] = [];
        for (let x = -17; x <= 17; x += 2) grid.push(new THREE.Vector3(x, 0.01, -7), new THREE.Vector3(x, 0.01, 7));
        for (let z = -7; z <= 7; z += 2) grid.push(new THREE.Vector3(-17, 0.01, z), new THREE.Vector3(17, 0.01, z));
        scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(grid), new THREE.LineBasicMaterial({ color: 0x1a5b4b, transparent: true, opacity: 0.25 })));

        const visible = dataRef.current.slice(-7);
        const records: Array<{ mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; height: number; baseY: number; x: number }> = [];
        const pickables: THREE.Mesh[] = [];
        const nodePositions: THREE.Vector3[] = [];
        visible.forEach((block, i) => {
          const x = (i - (visible.length - 1) / 2) * 4.1;
          const y = 3.1 + Math.sin(i * 1.1) * 0.55;
          const z = Math.cos(i * 0.9) * 0.7;
          const mat = new THREE.MeshStandardMaterial({ color: 0x0b211a, emissive: 0x1f7a5f, emissiveIntensity: 0.3, metalness: 0.55, roughness: 0.35 });
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(2.75, 2.75, 0.42), mat);
          mesh.position.set(x, y, z);
          mesh.rotation.y = -0.18;
          mesh.userData.height = block.height;
          pickables.push(mesh);
          scene.add(mesh);
          const tex = blockTexture(block);
          const faceMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
          const face = new THREE.Mesh(new THREE.PlaneGeometry(2.62, 2.62), faceMat);
          face.position.set(0, 0, 0.23);
          mesh.add(face);
          const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: 0x53f0be, transparent: true, opacity: 0.55 }));
          mesh.add(edges);
          records.push({ mesh, mat, height: block.height, baseY: y, x });
          nodePositions.push(new THREE.Vector3(x, y, z));
        });

        // Chain links and flowing transaction particles.
        const links: THREE.Line[] = [];
        for (let i = 1; i < nodePositions.length; i++) {
          const a = nodePositions[i - 1];
          const b = nodePositions[i];
          const mid = a.clone().add(b).multiplyScalar(0.5);
          mid.y += 0.25;
          const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
          const link = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(24)), new THREE.LineBasicMaterial({ color: 0x53f0be, transparent: true, opacity: 0.45 }));
          scene.add(link);
          links.push(link);
        }
        const particleCount = 90;
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(particleCount * 3);
        const pColors = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
          const c = new THREE.Color(i % 3 === 0 ? 0x51d6ff : 0x53f0be);
          pPos[i * 3] = -14 + (i % 30) * 0.95;
          pPos[i * 3 + 1] = 3.1 + (i % 4) * 0.06;
          pPos[i * 3 + 2] = 0.45;
          pColors[i * 3] = c.r; pColors[i * 3 + 1] = c.g; pColors[i * 3 + 2] = c.b;
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));
        const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.13, vertexColors: true, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }));
        scene.add(particles);

        // Halo + verification sweep.
        const halo = new THREE.Mesh(new THREE.TorusGeometry(11.5, 0.035, 6, 120), new THREE.MeshBasicMaterial({ color: 0x53f0be, transparent: true, opacity: 0.2 }));
        halo.rotation.x = Math.PI / 2;
        halo.position.y = 0.5;
        scene.add(halo);
        const sweep = new THREE.Mesh(new THREE.PlaneGeometry(30, 0.06), new THREE.MeshBasicMaterial({ color: 0x53f0be, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending }));
        sweep.position.set(0, 3.1, 0.7);
        scene.add(sweep);

        const selectedLabel = document.createElement('div');
        selectedLabel.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(selectedLabel);

        let currentSelected = selectedHeight;
        const applySelection = () => {
          records.forEach((r) => {
            const on = r.height === currentSelected;
            r.mesh.scale.setScalar(on ? 1.12 : 1);
            r.mat.emissiveIntensity = on ? 0.95 : 0.3;
            r.mat.emissive.setHex(on ? 0x53f0be : 0x1f7a5f);
          });
          const block = visible.find((b) => b.height === currentSelected);
          if (block) {
            const record = records.find((r) => r.height === block.height);
            selectedLabel.style.display = 'block';
            selectedLabel.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid rgba(83,240,190,.5);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:#53f0be;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">BLOCK #${block.height} · VERIFIED</span><div style="margin-top:2px;font-weight:500">${block.txCount} transactions · ${block.validator}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${block.hash.slice(0, 30)}…</div></div>`;
            void record;
          } else selectedLabel.style.display = 'none';
        };
        apiRef.current = { setSelected: (height) => { currentSelected = height; applySelection(); } };
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
          return hit ? (hit.object.userData.height as number) : null;
        };
        const move = (event: PointerEvent) => { updatePointer(event); ctx.renderer.domElement.style.cursor = pick() ? 'pointer' : 'grab'; };
        const click = (event: PointerEvent) => { updatePointer(event); const h = pick(); if (h) onSelectRef.current(h); };
        ctx.renderer.domElement.addEventListener('pointermove', move);
        ctx.renderer.domElement.addEventListener('pointerup', click);
        ctx.addDispose(() => {
          ctx.renderer.domElement.removeEventListener('pointermove', move);
          ctx.renderer.domElement.removeEventListener('pointerup', click);
        });

        const projected = new THREE.Vector3();
        ctx.addUpdate((dt, elapsed) => {
          const positions = particles.geometry.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < particleCount; i++) {
            let x = positions.getX(i) + dt * (1.4 + (i % 4) * 0.2);
            if (x > 14.5) x = -14.5;
            positions.setX(i, x);
          }
          positions.needsUpdate = true;
          sweep.position.x = Math.sin(elapsed * 0.55) * 13;
          halo.rotation.z += dt * 0.08;
          if (currentSelected != null) {
            const rec = records.find((r) => r.height === currentSelected);
            if (rec) {
              projected.set(rec.x, rec.baseY + 2.35, 0.8).project(ctx.camera);
              const width = ctx.container.clientWidth;
              const height = ctx.container.clientHeight;
              selectedLabel.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
            }
          }
        });
      }}
    />
  );
}
