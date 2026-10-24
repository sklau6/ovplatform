import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { QUALITY_DEFECTS, QUALITY_SCENARIOS, type QualityMode, type QualityScenario } from '../lib/qualityData';

export interface QualitySelection { id: string; name: string; trade: string; level: string; severity: string; owner: string; due: string; status: string }
interface Props { mode: QualityMode; scenario: QualityScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: QualitySelection) => void }
interface Api { setMode: (m: QualityMode) => void; setScenario: (s: QualityScenario) => void; setSelected: (id: string | null) => void }

const CYAN = 0x51d6ff, GREEN = 0x53f0be, AMBER = 0xf4bd72, VIOLET = 0xa991ff, ROSE = 0xff7088;

export function QualityScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D construction quality inspection model with four floors, defect pins, drone scan, checklists and NCR gate."
      cameraPosition={[16, 12, 20]}
      target={[0, 5, 0]}
      fov={38}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.01 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.12}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x9dd8e8, 0x030706, 0.95));
        const key = new THREE.DirectionalLight(0xd8fff8, 1.6);
        key.position.set(-14, 20, 16);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.7);
        rim.position.set(16, 8, -16);
        scene.add(rim);

        const ground = new THREE.Mesh(new THREE.BoxGeometry(24, 0.5, 18), new THREE.MeshStandardMaterial({ color: 0x0a1714, metalness: 0.3, roughness: 0.8 }));
        ground.position.y = -0.25;
        scene.add(ground);
        const grid: THREE.Vector3[] = [];
        for (let x = -11; x <= 11; x += 2) grid.push(new THREE.Vector3(x, 0.01, -8), new THREE.Vector3(x, 0.01, 8));
        for (let z = -8; z <= 8; z += 2) grid.push(new THREE.Vector3(-11, 0.01, z), new THREE.Vector3(11, 0.01, z));
        scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(grid), new THREE.LineBasicMaterial({ color: 0x1c5d5d, transparent: true, opacity: 0.16 })));

        const slabMat = new THREE.MeshStandardMaterial({ color: 0x6f847b, metalness: 0.3, roughness: 0.55 });
        const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x2c4f58, transparent: true, opacity: 0.18, metalness: 0.4, roughness: 0.15 });
        for (let i = 0; i < 4; i++) {
          const y = 0.6 + i * 2.2;
          const slab = new THREE.Mesh(new THREE.BoxGeometry(10, 0.18, 8), slabMat);
          slab.position.set(0, y, 0);
          scene.add(slab);
          const edge = new THREE.LineSegments(new THREE.EdgesGeometry(slab.geometry), new THREE.LineBasicMaterial({ color: GREEN, transparent: true, opacity: 0.3 }));
          slab.add(edge);
          const glass = new THREE.Mesh(new THREE.BoxGeometry(9.6, 1.9, 7.6), glassMat);
          glass.position.set(0, y + 1.0, 0);
          scene.add(glass);
        }

        // Defect pins.
        const pins: Array<{ id: string; mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; pos: THREE.Vector3 }> = [];
        const pickables: THREE.Mesh[] = [];
        QUALITY_DEFECTS.forEach((d) => {
          const mat = new THREE.MeshBasicMaterial({ color: d.color });
          const pin = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.5, 6), mat);
          pin.position.set(d.x, d.y, d.z);
          pin.rotation.x = Math.PI;
          pin.userData.defectId = d.id;
          scene.add(pin);
          pickables.push(pin);
          pins.push({ id: d.id, mesh: pin, mat, pos: new THREE.Vector3(d.x, d.y, d.z) });
        });

        // Drone.
        const drone = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 0.7), new THREE.MeshStandardMaterial({ color: 0x3f5f6a, metalness: 0.5, roughness: 0.4 }));
        drone.add(body);
        for (let i = 0; i < 4; i++) {
          const arm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.04), new THREE.MeshStandardMaterial({ color: 0xcfd8da, metalness: 0.4, roughness: 0.4 }));
          arm.rotation.y = (i / 4) * Math.PI;
          drone.add(arm);
        }
        drone.position.set(0, 9, 0);
        scene.add(drone);

        // Scan grid.
        const scan = new THREE.Mesh(new THREE.PlaneGeometry(12, 9), new THREE.MeshBasicMaterial({ color: CYAN, wireframe: true, transparent: true, opacity: 0.25 }));
        scan.rotation.x = -Math.PI / 2;
        scan.position.set(0, 9.01, 0);
        scene.add(scan);

        // Quality gate.
        const gate = new THREE.Group();
        for (const x of [-1.8, 1.8]) {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3, 0.2), new THREE.MeshStandardMaterial({ color: AMBER, metalness: 0.5, roughness: 0.35 }));
          leg.position.set(x, 1.5, 0);
          gate.add(leg);
        }
        const top = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.2, 0.2), new THREE.MeshStandardMaterial({ color: AMBER, metalness: 0.5, roughness: 0.35 }));
        top.position.y = 3;
        gate.add(top);
        gate.position.set(6, 0, 4);
        scene.add(gate);

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          pins.forEach((p) => {
            const d = QUALITY_DEFECTS.find((x) => x.id === p.id)!;
            const color = currentMode === 'ncr' ? (d.status === 'NCR' ? ROSE : AMBER) :
              currentMode === 'rework' ? (d.severity === 'Critical' ? ROSE : d.severity === 'Major' ? AMBER : GREEN) :
                currentMode === 'inspections' ? (d.level === 'L2' ? CYAN : GREEN) : new THREE.Color(d.color).getHex();
            p.mat.color.setHex(color);
            p.mesh.scale.setScalar(p.id === currentSelected ? 1.4 : 1);
          });
          const d = QUALITY_DEFECTS.find((x) => x.id === currentSelected);
          if (d) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid ${d.color}88;border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:${d.color};font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${d.id} · ${d.level} · ${d.severity.toUpperCase()}</span><div style="margin-top:2px;font-weight:500">${d.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${d.trade} · ${d.owner} · due ${d.due}</div></div>`;
          } else label.style.display = 'none';
          void QUALITY_SCENARIOS[currentScenario];
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
          const d = QUALITY_DEFECTS.find((x) => x.id === hit.object.userData.defectId);
          return d ? { id: d.id, name: d.name, trade: d.trade, level: d.level, severity: d.severity, owner: d.owner, due: d.due, status: d.status } : null;
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
          drone.position.y = 9 + Math.sin(elapsed * 1.2) * 0.2;
          drone.position.x = Math.sin(elapsed * 0.5) * 3;
          drone.rotation.y += dt * 0.4;
          scan.position.y = 9.01 + Math.sin(elapsed * 1.2) * 0.2;
          pins.forEach((p, i) => { p.mesh.rotation.z = Math.sin(elapsed * 2 + i) * 0.1; });
          if (currentSelected) {
            const p = pins.find((x) => x.id === currentSelected);
            if (p) projected.set(p.pos.x, p.pos.y + 0.8, p.pos.z).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            label.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
          }
        });
      }}
    />
  );
}
