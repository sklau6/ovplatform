import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { PEOPLE_LINKS, PEOPLE_NODES, PEOPLE_SCENARIOS, type PeopleMode, type PeopleScenario } from '../lib/peopleData';

export interface PeopleSelection { id: string; name: string; role: string; headcount: number; open: number; skills: string; succession: string }
interface Props { mode: PeopleMode; scenario: PeopleScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: PeopleSelection) => void }
interface Api { setMode: (m: PeopleMode) => void; setScenario: (s: PeopleScenario) => void; setSelected: (id: string | null) => void }

const GREEN = 0x53f0be, CYAN = 0x51d6ff, AMBER = 0xf4bd72, ROSE = 0xff7088, VIOLET = 0xa991ff;

export function PeopleScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D people and talent organisation graph with COO, functions, team capacity, skills, hiring and succession."
      cameraPosition={[14, 10, 18]}
      target={[0, 3.2, 0]}
      fov={38}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.013 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.13}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x9de0d5, 0x030706, 0.95));
        const key = new THREE.DirectionalLight(0xd8fff8, 1.7);
        key.position.set(-10, 18, 14);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.8);
        rim.position.set(12, 8, -12);
        scene.add(rim);

        const floor = new THREE.Mesh(new THREE.CircleGeometry(11, 64), new THREE.MeshStandardMaterial({ color: 0x071411, metalness: 0.6, roughness: 0.5 }));
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);
        const gridPts: THREE.Vector3[] = [];
        for (let x = -10; x <= 10; x += 2) gridPts.push(new THREE.Vector3(x, 0.01, -10), new THREE.Vector3(x, 0.01, 10));
        for (let z = -10; z <= 10; z += 2) gridPts.push(new THREE.Vector3(-10, 0.01, z), new THREE.Vector3(10, 0.01, z));
        scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(gridPts), new THREE.LineBasicMaterial({ color: 0x1c5d4d, transparent: true, opacity: 0.15 })));
        const ring = new THREE.Mesh(new THREE.TorusGeometry(8.5, 0.03, 5, 100), new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.22 }));
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.2;
        scene.add(ring);

        const pos = new Map<string, THREE.Vector3>();
        const records: Array<{ id: string; mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; pos: THREE.Vector3; open: THREE.Mesh; headcount: number; color: string }> = [];
        const pickables: THREE.Mesh[] = [];
        for (const n of PEOPLE_NODES) {
          const color = new THREE.Color(n.color);
          const mat = new THREE.MeshStandardMaterial({ color: 0x12302a, emissive: color, emissiveIntensity: 0.35, metalness: 0.5, roughness: 0.35 });
          const size = n.id === 'COO' ? 0.8 : 0.55;
          const mesh = new THREE.Mesh(n.id === 'COO' ? new THREE.IcosahedronGeometry(size, 1) : new THREE.SphereGeometry(size, 16, 16), mat);
          mesh.position.set(n.x, n.y, n.z);
          mesh.userData.nodeId = n.id;
          scene.add(mesh);
          pickables.push(mesh);
          const halo = new THREE.Mesh(new THREE.TorusGeometry(size * 2.0, 0.015, 5, 40), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 }));
          halo.rotation.x = Math.PI / 2.4;
          mesh.add(halo);
          const open = new THREE.Mesh(new THREE.TorusGeometry(size * 2.8, 0.025, 5, 44), new THREE.MeshBasicMaterial({ color: VIOLET, transparent: true, opacity: 0.65 }));
          open.rotation.x = Math.PI / 2;
          open.position.set(n.x, 0.5, n.z);
          scene.add(open);
          pos.set(n.id, new THREE.Vector3(n.x, n.y, n.z));
          records.push({ id: n.id, mesh, mat, pos: new THREE.Vector3(n.x, n.y, n.z), open, headcount: n.headcount, color: n.color });
        }

        const links: THREE.Line[] = [];
        for (const [a, b] of PEOPLE_LINKS) {
          const from = pos.get(a);
          const to = pos.get(b);
          if (!from || !to) continue;
          const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([from, to]), new THREE.LineBasicMaterial({ color: 0x2f8d7a, transparent: true, opacity: 0.3 }));
          scene.add(line);
          links.push(line);
        }

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          const s = PEOPLE_SCENARIOS[currentScenario];
          records.forEach((r) => {
            const n = PEOPLE_NODES.find((x) => x.id === r.id)!;
            const color = currentMode === 'capacity' ? (n.headcount > 70 ? AMBER : GREEN) :
              currentMode === 'hiring' ? (n.open > 5 ? VIOLET : GREEN) :
                currentMode === 'skills' ? (n.skills.includes('AI') || n.skills.includes('Cloud') ? CYAN : GREEN) :
                  new THREE.Color(n.color).getHex();
            r.mat.emissive.setHex(currentScenario === 'attrition' && (r.id === 'TEC' || r.id === 'DEL') ? ROSE : color);
            r.mat.emissiveIntensity = r.id === currentSelected ? 1.3 : 0.35;
            r.mesh.scale.setScalar(r.id === currentSelected ? 1.3 : 1);
            r.open.visible = currentMode === 'hiring' && n.open > 0;
            r.open.scale.setScalar(1 + Math.sin(performance.now() * 0.002) * 0.05);
            void s;
          });
          const n = PEOPLE_NODES.find((x) => x.id === currentSelected);
          if (n) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid ${n.color}88;border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:${n.color};font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${n.name} · ${n.headcount} people</span><div style="margin-top:2px;font-weight:500">${n.role}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${n.open} open roles · succession ${n.succession}</div></div>`;
          } else label.style.display = 'none';
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
          const n = PEOPLE_NODES.find((x) => x.id === hit.object.userData.nodeId);
          return n ? { id: n.id, name: n.name, role: n.role, headcount: n.headcount, open: n.open, skills: n.skills, succession: n.succession } : null;
        };
        const move = (event: PointerEvent) => { updatePointer(event); ctx.renderer.domElement.style.cursor = pick() ? 'pointer' : 'grab'; };
        const click = (event: PointerEvent) => { updatePointer(event); const n = pick(); if (n) onSelectRef.current(n); };
        ctx.renderer.domElement.addEventListener('pointermove', move);
        ctx.renderer.domElement.addEventListener('pointerup', click);
        ctx.addDispose(() => {
          ctx.renderer.domElement.removeEventListener('pointermove', move);
          ctx.renderer.domElement.removeEventListener('pointerup', click);
        });

        const projected = new THREE.Vector3();
        ctx.addUpdate((dt, elapsed) => {
          records.forEach((r, i) => {
            r.mesh.position.y = r.pos.y + Math.sin(elapsed * 1.4 + i) * 0.08;
          });
          ring.rotation.z += dt * 0.04;
          const n = PEOPLE_NODES.find((x) => x.id === currentSelected);
          if (n) {
            projected.set(n.x, n.y + 1.2, n.z).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            label.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
          }
        });
      }}
    />
  );
}
