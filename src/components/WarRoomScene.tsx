import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { AGENTS } from '../lib/platformData';
import type { WarScenario } from '../lib/warRoomData';

interface Props {
  scenario: WarScenario;
  selectedId: string | null;
  autoRotate?: boolean;
  onSelect?: (id: string) => void;
}

interface Api { setScenario: (s: WarScenario) => void; setSelected: (id: string | null) => void }

const SCENARIO_COLOR: Record<WarScenario, number> = { incident: 0xff7088, quarter: 0x53f0be, design: 0x51d6ff };

export function WarRoomScene({ scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D agent war room with eight AI specialists around a holographic decision table."
      cameraPosition={[14, 9, 17]}
      target={[0, 3.4, 0]}
      fov={38}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.012 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.12}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x95e0d5, 0x030706, 0.9));
        const key = new THREE.DirectionalLight(0xd8fff8, 1.7);
        key.position.set(-10, 16, 14);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.8);
        rim.position.set(12, 7, -12);
        scene.add(rim);

        const floor = new THREE.Mesh(new THREE.CylinderGeometry(11, 11.4, 0.4, 64), new THREE.MeshStandardMaterial({ color: 0x071411, metalness: 0.65, roughness: 0.42 }));
        floor.position.y = -0.2;
        scene.add(floor);
        const floorRing = new THREE.Mesh(new THREE.TorusGeometry(10.6, 0.035, 6, 100), new THREE.MeshBasicMaterial({ color: 0x53f0be, transparent: true, opacity: 0.28 }));
        floorRing.rotation.x = Math.PI / 2;
        floorRing.position.y = 0.02;
        scene.add(floorRing);
        const gridPts: THREE.Vector3[] = [];
        for (let x = -10; x <= 10; x += 2) gridPts.push(new THREE.Vector3(x, 0.02, -10), new THREE.Vector3(x, 0.02, 10));
        for (let z = -10; z <= 10; z += 2) gridPts.push(new THREE.Vector3(-10, 0.02, z), new THREE.Vector3(10, 0.02, z));
        scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(gridPts), new THREE.LineBasicMaterial({ color: 0x1c5d4d, transparent: true, opacity: 0.14 })));

        // Central table and hologram.
        const table = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 4.0, 0.35, 48), new THREE.MeshStandardMaterial({ color: 0x0b211c, metalness: 0.7, roughness: 0.3 }));
        table.position.y = 1.1;
        scene.add(table);
        const tableRing = new THREE.Mesh(new THREE.TorusGeometry(3.8, 0.035, 6, 80), new THREE.MeshBasicMaterial({ color: 0x53f0be, transparent: true, opacity: 0.5 }));
        tableRing.rotation.x = Math.PI / 2;
        tableRing.position.y = 1.3;
        scene.add(tableRing);
        const holo = new THREE.Group();
        holo.position.y = 1.4;
        const holoMat = new THREE.MeshStandardMaterial({ color: 0x0e2b25, emissive: 0x2fbf9b, emissiveIntensity: 0.55, metalness: 0.5, roughness: 0.35 });
        for (let i = 0; i < 8; i++) {
          const h = 0.4 + (i % 4) * 0.35;
          const t = new THREE.Mesh(new THREE.BoxGeometry(0.3, h, 0.3), holoMat);
          const a = (i / 8) * Math.PI * 2;
          t.position.set(Math.cos(a) * 0.8, h / 2, Math.sin(a) * 0.8);
          holo.add(t);
        }
        const holoHalo = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.018, 5, 60), new THREE.MeshBasicMaterial({ color: 0x51d6ff, transparent: true, opacity: 0.65 }));
        holoHalo.rotation.x = Math.PI / 2;
        holoHalo.position.y = 0.2;
        holo.add(holoHalo);
        scene.add(holo);

        // Wall screens.
        for (let i = 0; i < 3; i++) {
          const a = -Math.PI / 2 + (i - 1) * 0.7;
          const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.8), new THREE.MeshBasicMaterial({ color: 0x0b2a26, transparent: true, opacity: 0.65, side: THREE.DoubleSide }));
          screen.position.set(Math.cos(a) * 9.8, 3.0, Math.sin(a) * 9.8);
          screen.rotation.y = -a + Math.PI / 2;
          scene.add(screen);
        }

        const pods: Array<{ agent: typeof AGENTS[number]; mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; pos: THREE.Vector3; label: HTMLDivElement }> = [];
        const pickables: THREE.Mesh[] = [];
        AGENTS.forEach((agent, i) => {
          const a = (i / AGENTS.length) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(a) * 6.4;
          const z = Math.sin(a) * 6.4;
          const color = new THREE.Color(agent.color);
          const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.5, 12), new THREE.MeshStandardMaterial({ color: 0x14302a, metalness: 0.5, roughness: 0.4 }));
          base.position.set(x, 0.25, z);
          scene.add(base);
          const mat = new THREE.MeshStandardMaterial({ color: 0x173a31, emissive: color, emissiveIntensity: 0.35, metalness: 0.5, roughness: 0.3 });
          const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 1), mat);
          mesh.position.set(x, 1.4, z);
          mesh.userData.agentId = agent.id;
          scene.add(mesh);
          pickables.push(mesh);
          const halo = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.02, 5, 40), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 }));
          halo.rotation.x = Math.PI / 2.4;
          mesh.add(halo);
          const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, 0.55, z), new THREE.Vector3(0, 1.2, 0)]),
            new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending }),
          );
          scene.add(line);
          const label = document.createElement('div');
          label.textContent = agent.name;
          label.style.cssText = `position:absolute;transform:translate(-50%,-50%);font-family:"JetBrains Mono Variable",monospace;font-size:6.5px;letter-spacing:.14em;color:${agent.color};opacity:.7;white-space:nowrap;`;
          ctx.labelLayer.appendChild(label);
          pods.push({ agent, mesh, mat, pos: new THREE.Vector3(x, 1.4, z), label });
        });

        const selectedLabel = document.createElement('div');
        selectedLabel.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(selectedLabel);

        let currentScenario: WarScenario = scenario;
        let currentSelected: string | null = selectedId;
        const apply = () => {
          const scenarioColor = SCENARIO_COLOR[currentScenario];
          (holoMat as THREE.MeshStandardMaterial).emissive.setHex(scenarioColor);
          (holoHalo.material as THREE.MeshBasicMaterial).color.setHex(scenarioColor);
          (tableRing.material as THREE.MeshBasicMaterial).color.setHex(scenarioColor);
          pods.forEach((p) => {
            const on = p.agent.id === currentSelected;
            p.mat.emissiveIntensity = on ? 1.3 : 0.35;
            p.mesh.scale.setScalar(on ? 1.3 : 1);
          });
          const active = pods.find((p) => p.agent.id === currentSelected);
          if (active) {
            selectedLabel.style.display = 'block';
            selectedLabel.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid ${active.agent.color}88;border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:${active.agent.color};font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${active.agent.name} · ${active.agent.function.toUpperCase()}</span><div style="margin-top:2px;font-weight:500">${active.agent.role}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${active.agent.confidence}% confidence</div></div>`;
          } else selectedLabel.style.display = 'none';
        };
        apiRef.current = { setScenario: (s) => { currentScenario = s; apply(); }, setSelected: (id) => { currentSelected = id; apply(); } };
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
          return hit ? (hit.object.userData.agentId as string) : null;
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
          holo.rotation.y += dt * 0.16;
          holoHalo.rotation.z += dt * 0.3;
          tableRing.rotation.z += dt * 0.04;
          pods.forEach((p, i) => {
            p.mesh.rotation.y += dt * 0.25;
            p.mesh.position.y = 1.4 + Math.sin(elapsed * 1.5 + i) * 0.1;
            projected.set(p.pos.x, p.pos.y + 0.8, p.pos.z).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            p.label.style.transform = `translate(-50%,-50%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
            p.label.style.opacity = projected.z < 1 && p.agent.id !== currentSelected ? '0.65' : '0';
          });
          const active = pods.find((p) => p.agent.id === currentSelected);
          if (active) {
            projected.set(active.pos.x, active.pos.y + 1.05, active.pos.z).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            selectedLabel.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
          }
        });
      }}
    />
  );
}
