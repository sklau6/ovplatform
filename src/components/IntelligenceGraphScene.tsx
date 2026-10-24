import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { GRAPH_LINKS, GRAPH_NODES, GRAPH_TYPE_META, type GraphNode } from '../lib/intelligenceGraphData';

export interface IntelligenceGraphSceneProps {
  selectedId: string | null;
  autoRotate?: boolean;
  onSelect?: (id: string) => void;
}

interface GraphApi { setSelected: (id: string | null) => void }

export function IntelligenceGraphScene({ selectedId, autoRotate = false, onSelect }: IntelligenceGraphSceneProps) {
  const apiRef = useRef<GraphApi | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D intelligence decision graph linking data sources, AI models, agents, decisions and human approval gates."
      cameraPosition={[15, 12, 22]}
      target={[0, 7, 0]}
      fov={40}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.01 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.12}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x94e0d6, 0x030706, 0.85));
        const key = new THREE.DirectionalLight(0xd8fff8, 1.5);
        key.position.set(-12, 22, 16);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x36dfc4, 0.8);
        rim.position.set(14, 10, -16);
        scene.add(rim);

        const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 22), new THREE.MeshStandardMaterial({ color: 0x06120f, metalness: 0.6, roughness: 0.55 }));
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);
        const grid: THREE.Vector3[] = [];
        for (let x = -15; x <= 15; x += 2) grid.push(new THREE.Vector3(x, 0.01, -11), new THREE.Vector3(x, 0.01, 11));
        for (let z = -11; z <= 11; z += 2) grid.push(new THREE.Vector3(-15, 0.01, z), new THREE.Vector3(15, 0.01, z));
        scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(grid), new THREE.LineBasicMaterial({ color: 0x1a5d4d, transparent: true, opacity: 0.2 })));

        const records: Array<{ node: GraphNode; mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; pos: THREE.Vector3 }> = [];
        const pickables: THREE.Mesh[] = [];
        const posById = new Map<string, THREE.Vector3>();
        for (const node of GRAPH_NODES) {
          const color = new THREE.Color(GRAPH_TYPE_META[node.type].color);
          const size = node.type === 'gate' ? 0.9 : node.type === 'decision' ? 0.72 : node.type === 'agent' ? 0.62 : 0.5;
          const geo = node.type === 'gate' ? new THREE.BoxGeometry(size * 1.5, size * 1.5, size * 1.5) :
            node.type === 'decision' ? new THREE.OctahedronGeometry(size, 0) :
              node.type === 'agent' ? new THREE.IcosahedronGeometry(size, 1) : new THREE.SphereGeometry(size, 18, 18);
          const mat = new THREE.MeshStandardMaterial({ color: 0x102820, emissive: color, emissiveIntensity: 0.55, metalness: 0.5, roughness: 0.3 });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(node.x, node.y, node.z);
          mesh.userData.nodeId = node.id;
          scene.add(mesh);
          pickables.push(mesh);
          const halo = new THREE.Mesh(new THREE.TorusGeometry(size * 1.7, 0.018, 5, 40), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45 }));
          halo.rotation.x = Math.PI / 2.5;
          mesh.add(halo);
          records.push({ node, mesh, mat, pos: mesh.position.clone() });
          posById.set(node.id, mesh.position.clone());
        }

        const linkRecords: Array<{ line: THREE.Line; particle: THREE.Mesh; start: THREE.Vector3; end: THREE.Vector3; offset: number }> = [];
        for (const [aId, bId] of GRAPH_LINKS) {
          const a = posById.get(aId);
          const b = posById.get(bId);
          if (!a || !b) continue;
          const mid = a.clone().add(b).multiplyScalar(0.5);
          mid.y += 0.8;
          const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
          const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(curve.getPoints(20)),
            new THREE.LineBasicMaterial({ color: 0x2f8d7a, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false }),
          );
          scene.add(line);
          const target = GRAPH_NODES.find((n) => n.id === bId)!;
          const color = new THREE.Color(GRAPH_TYPE_META[target.type].color);
          const particle = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }));
          scene.add(particle);
          linkRecords.push({ line, particle, start: a, end: b, offset: Math.random() });
        }

        const ring = new THREE.Mesh(new THREE.TorusGeometry(13.5, 0.03, 6, 100), new THREE.MeshBasicMaterial({ color: 0x53f0be, transparent: true, opacity: 0.16 }));
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.25;
        scene.add(ring);

        const labels = [
          { text: 'DATA', y: 0.8, color: '#51d6ff' },
          { text: 'MODELS', y: 4.4, color: '#a991ff' },
          { text: 'AGENTS', y: 7.8, color: '#53f0be' },
          { text: 'DECISIONS', y: 11.4, color: '#f4bd72' },
          { text: 'HUMAN GATE', y: 14.4, color: '#ff7088' },
        ];
        const layerLabels = labels.map((l) => {
          const el = document.createElement('div');
          el.textContent = l.text;
          el.style.cssText = `position:absolute;transform:translate(0,-50%);font-family:"JetBrains Mono Variable",monospace;font-size:7px;letter-spacing:.14em;color:${l.color};opacity:.55;white-space:nowrap;`;
          ctx.labelLayer.appendChild(el);
          return { el, pos: new THREE.Vector3(-14.5, l.y, 0) };
        });

        const selectedLabel = document.createElement('div');
        selectedLabel.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(selectedLabel);

        let current = selectedId;
        const applySelection = () => {
          records.forEach((r) => {
            const on = r.node.id === current;
            r.mesh.scale.setScalar(on ? 1.25 : 1);
            r.mat.emissiveIntensity = on ? 1.2 : 0.55;
          });
          const node = GRAPH_NODES.find((n) => n.id === current);
          if (node) {
            selectedLabel.style.display = 'block';
            selectedLabel.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid rgba(83,240,190,.45);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:${GRAPH_TYPE_META[node.type].color};font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${node.type.toUpperCase()} · ${node.metric}</span><div style="margin-top:2px;font-weight:500">${node.label}</div></div>`;
          } else selectedLabel.style.display = 'none';
        };
        apiRef.current = { setSelected: (id) => { current = id; applySelection(); } };
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
          return hit ? (hit.object.userData.nodeId as string) : null;
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
          records.forEach((r, i) => {
            const on = r.node.id === current;
            r.mesh.rotation.y += dt * (on ? 0.6 : 0.15);
            if (r.node.type === 'agent') r.mesh.position.y = r.pos.y + Math.sin(elapsed * 1.5 + i) * 0.14;
          });
          linkRecords.forEach((l, i) => {
            const t = (elapsed * 0.18 + l.offset + i * 0.01) % 1;
            l.particle.position.lerpVectors(l.start, l.end, t);
            (l.particle.material as THREE.MeshBasicMaterial).opacity = 0.15 + Math.sin(t * Math.PI) * 0.7;
          });
          ring.rotation.z += dt * 0.05;
          layerLabels.forEach(({ el, pos: p }) => {
            projected.copy(p).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            el.style.transform = `translate(0,-50%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
            el.style.opacity = projected.z < 1 && width > 700 ? '0.55' : '0';
          });
          if (current) {
            const rec = records.find((r) => r.node.id === current);
            if (rec) {
              projected.set(rec.node.x, rec.node.y + 0.9, rec.node.z).project(ctx.camera);
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
