import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { MAINTENANCE_ORDERS, MAINTENANCE_SCENARIOS, type MaintenanceMode, type MaintenanceScenario } from '../lib/maintenanceData';

export interface MaintenanceSelection { id: string; name: string; trade: string; priority: string; sla: string; tech: string; parts: string; status: string }
interface Props { mode: MaintenanceMode; scenario: MaintenanceScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: MaintenanceSelection) => void }
interface Api { setMode: (m: MaintenanceMode) => void; setScenario: (s: MaintenanceScenario) => void; setSelected: (id: string | null) => void }

const CYAN = 0x51d6ff, GREEN = 0x53f0be, AMBER = 0xf4bd72, VIOLET = 0xa991ff, ROSE = 0xff7088;

export function MaintenanceScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D building maintenance model with work orders, technicians, parts, SLA rings and BMS triggers across four floors."
      cameraPosition={[16, 10, 20]}
      target={[0, 4, 0]}
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

        const pins: Array<{ id: string; mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; pos: THREE.Vector3 }> = [];
        const pickables: THREE.Mesh[] = [];
        MAINTENANCE_ORDERS.forEach((o) => {
          const mat = new THREE.MeshBasicMaterial({ color: o.color });
          const pin = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.5, 6), mat);
          pin.position.set(o.x, o.y, o.z);
          pin.rotation.x = Math.PI;
          pin.userData.orderId = o.id;
          scene.add(pin);
          pickables.push(pin);
          pins.push({ id: o.id, mesh: pin, mat, pos: new THREE.Vector3(o.x, o.y, o.z) });
        });

        // Technicians.
        const techs: THREE.Group[] = [];
        for (let i = 0; i < 4; i++) {
          const t = new THREE.Group();
          const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.5, 3, 6), new THREE.MeshStandardMaterial({ color: i % 2 ? VIOLET : CYAN, emissive: i % 2 ? VIOLET : CYAN, emissiveIntensity: 0.3, roughness: 0.6 }));
          body.position.y = 0.55;
          t.add(body);
          t.position.set(-5 + i * 3, 0.1, 7);
          scene.add(t);
          techs.push(t);
        }

        // Parts crates.
        for (let i = 0; i < 4; i++) {
          const c = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), new THREE.MeshStandardMaterial({ color: 0x5b6a4a, roughness: 0.8 }));
          c.position.set(6, 0.4, -5 + i * 1.0);
          scene.add(c);
        }

        // SLA rings.
        const slaRings: THREE.Mesh[] = [];
        for (let i = 0; i < 3; i++) {
          const r = new THREE.Mesh(new THREE.TorusGeometry(1 + i * 1.3, 0.03, 4, 40), new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.3 - i * 0.06 }));
          r.rotation.x = Math.PI / 2;
          r.position.set(0, 0.1, 4);
          scene.add(r);
          slaRings.push(r);
        }

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          pins.forEach((p) => {
            const o = MAINTENANCE_ORDERS.find((x) => x.id === p.id)!;
            const color = currentMode === 'sla' ? (o.priority === 'P1' ? ROSE : o.priority === 'P2' ? AMBER : GREEN) :
              currentMode === 'parts' ? (o.parts === '—' ? GREEN : o.parts === 'Controller' ? AMBER : CYAN) :
                currentMode === 'technicians' ? (o.tech === 'T. Chan' ? VIOLET : CYAN) : new THREE.Color(o.color).getHex();
            p.mat.color.setHex(color);
            p.mesh.scale.setScalar(p.id === currentSelected ? 1.4 : 1);
          });
          techs.forEach((t, i) => { t.visible = currentMode === 'technicians' || i < 2; });
          slaRings.forEach((r) => { r.visible = currentMode === 'sla'; });
          const o = MAINTENANCE_ORDERS.find((x) => x.id === currentSelected);
          if (o) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid ${o.color}88;border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:${o.color};font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${o.id} · ${o.priority} · ${o.sla}</span><div style="margin-top:2px;font-weight:500">${o.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${o.trade} · ${o.tech} · ${o.status}</div></div>`;
          } else label.style.display = 'none';
          void MAINTENANCE_SCENARIOS[currentScenario];
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
          const o = MAINTENANCE_ORDERS.find((x) => x.id === hit.object.userData.orderId);
          return o ? { id: o.id, name: o.name, trade: o.trade, priority: o.priority, sla: o.sla, tech: o.tech, parts: o.parts, status: o.status } : null;
        };
        const move = (event: PointerEvent) => { updatePointer(event); ctx.renderer.domElement.style.cursor = pick() ? 'pointer' : 'grab'; };
        const click = (event: PointerEvent) => { updatePointer(event); const o = pick(); if (o) onSelectRef.current(o); };
        ctx.renderer.domElement.addEventListener('pointermove', move);
        ctx.renderer.domElement.addEventListener('pointerup', click);
        ctx.addDispose(() => {
          ctx.renderer.domElement.removeEventListener('pointermove', move);
          ctx.renderer.domElement.removeEventListener('pointerup', click);
        });

        const projected = new THREE.Vector3();
        ctx.addUpdate((dt, elapsed) => {
          techs.forEach((t, i) => { t.position.x = -5 + ((elapsed * 0.6 + i * 2) % 10); });
          slaRings.forEach((r, i) => { r.scale.setScalar(1 + Math.sin(elapsed * 1.5 + i) * 0.05); });
          if (currentSelected) {
            const p = pins.find((x) => x.id === currentSelected);
            if (p) projected.set(p.pos.x, p.pos.y + 0.8, p.pos.z).project(ctx.camera);
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
