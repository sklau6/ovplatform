import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { INSURANCE_POLICIES, INSURANCE_SCENARIOS, type InsuranceMode, type InsuranceScenario } from '../lib/insuranceData';

export interface InsuranceSelection { id: string; name: string; limit: number; premium: number; deductible: string; claims: number; status: string }
interface Props { mode: InsuranceMode; scenario: InsuranceScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: InsuranceSelection) => void }
interface Api { setMode: (m: InsuranceMode) => void; setScenario: (s: InsuranceScenario) => void; setSelected: (id: string | null) => void }

const CYAN = 0x51d6ff, GREEN = 0x53f0be, AMBER = 0xf4bd72, VIOLET = 0xa991ff, ROSE = 0xff7088;

export function InsuranceScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D insurance and risk model with asset, policy shields, coverage, claims, catastrophe rings and premiums."
      cameraPosition={[16, 10, 20]}
      target={[0, 3, 0]}
      fov={38}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.012 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.13}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x9de0d0, 0x030706, 0.95));
        const key = new THREE.DirectionalLight(0xd8fff8, 1.6);
        key.position.set(-12, 18, 14);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.7);
        rim.position.set(14, 8, -14);
        scene.add(rim);

        const floor = new THREE.Mesh(new THREE.CylinderGeometry(10, 10.4, 0.4, 64), new THREE.MeshStandardMaterial({ color: 0x071411, metalness: 0.6, roughness: 0.45 }));
        floor.position.y = -0.2;
        scene.add(floor);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(8.4, 0.03, 5, 100), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.22 }));
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.03;
        scene.add(ring);

        // Asset tower.
        const assetMat = new THREE.MeshStandardMaterial({ color: 0x2a4a40, emissive: GREEN, emissiveIntensity: 0.25, metalness: 0.45, roughness: 0.4 });
        const asset = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 5, 8), assetMat);
        asset.position.y = 2.5;
        scene.add(asset);
        const assetEdge = new THREE.LineSegments(new THREE.EdgesGeometry(asset.geometry), new THREE.LineBasicMaterial({ color: GREEN, transparent: true, opacity: 0.5 }));
        asset.add(assetEdge);

        // Policies as shields around asset.
        const records: Array<{ id: string; mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; pos: THREE.Vector3; color: string }> = [];
        const pickables: THREE.Mesh[] = [];
        INSURANCE_POLICIES.forEach((p, i) => {
          const a = (i / INSURANCE_POLICIES.length) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(a) * 6.2;
          const z = Math.sin(a) * 6.2;
          const color = new THREE.Color(p.color);
          const mat = new THREE.MeshStandardMaterial({ color: 0x2e4038, emissive: color, emissiveIntensity: 0.35, metalness: 0.35, roughness: 0.5 });
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 0.5), mat);
          mesh.position.set(x, 1.2, z);
          mesh.rotation.y = -a;
          mesh.userData.policyId = p.id;
          scene.add(mesh);
          pickables.push(mesh);
          const edge = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 }));
          mesh.add(edge);
          const shield = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.03, 5, 6), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 }));
          shield.position.set(x, 1.2, z);
          shield.rotation.y = -a;
          scene.add(shield);
          records.push({ id: p.id, mesh, mat, pos: new THREE.Vector3(x, 1.2, z), color: p.color });
        });

        // Coverage dome.
        const dome = new THREE.Mesh(new THREE.SphereGeometry(8.2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.05, side: THREE.DoubleSide, depthWrite: false }));
        scene.add(dome);

        // Catastrophe rings.
        const cats: THREE.Mesh[] = [];
        for (let i = 0; i < 3; i++) {
          const c = new THREE.Mesh(new THREE.TorusGeometry(3 + i * 2.2, 0.04, 5, 64), new THREE.MeshBasicMaterial({ color: VIOLET, transparent: true, opacity: 0.3 - i * 0.06 }));
          c.rotation.x = Math.PI / 2;
          c.position.y = 0.1;
          scene.add(c);
          cats.push(c);
        }

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          records.forEach((r) => {
            const p = INSURANCE_POLICIES.find((x) => x.id === r.id)!;
            const color = currentMode === 'claims' ? (p.claims > 0 ? ROSE : GREEN) :
              currentMode === 'premiums' ? (p.premium > 5 ? AMBER : GREEN) :
                currentMode === 'cat' ? (p.id === 'PROP' || p.id === 'CAR' ? VIOLET : CYAN) : new THREE.Color(p.color).getHex();
            r.mat.emissive.setHex(color);
            r.mat.emissiveIntensity = r.id === currentSelected ? 0.9 : 0.35;
            r.mesh.scale.setScalar(r.id === currentSelected ? 1.15 : 1);
          });
          const p = INSURANCE_POLICIES.find((x) => x.id === currentSelected);
          if (p) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid ${p.color}88;border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:${p.color};font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${p.id} · HK$${p.limit}M limit</span><div style="margin-top:2px;font-weight:500">${p.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">HK$${p.premium}M premium · deductible ${p.deductible}</div></div>`;
          } else label.style.display = 'none';
          void INSURANCE_SCENARIOS[currentScenario];
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
          const p = INSURANCE_POLICIES.find((x) => x.id === hit.object.userData.policyId);
          return p ? { id: p.id, name: p.name, limit: p.limit, premium: p.premium, deductible: p.deductible, claims: p.claims, status: p.status } : null;
        };
        const move = (event: PointerEvent) => { updatePointer(event); ctx.renderer.domElement.style.cursor = pick() ? 'pointer' : 'grab'; };
        const click = (event: PointerEvent) => { updatePointer(event); const p = pick(); if (p) onSelectRef.current(p); };
        ctx.renderer.domElement.addEventListener('pointermove', move);
        ctx.renderer.domElement.addEventListener('pointerup', click);
        ctx.addDispose(() => {
          ctx.renderer.domElement.removeEventListener('pointermove', move);
          ctx.renderer.domElement.removeEventListener('pointerup', click);
        });

        const projected = new THREE.Vector3();
        ctx.addUpdate((dt, elapsed) => {
          asset.rotation.y += dt * 0.15;
          cats.forEach((c, i) => { c.rotation.z += dt * (0.02 + i * 0.01); });
          records.forEach((r, i) => { r.mesh.position.y = 1.2 + Math.sin(elapsed * 1.2 + i) * 0.05; });
          if (currentSelected) {
            const r = records.find((x) => x.id === currentSelected);
            if (r) projected.set(r.pos.x, 3.0, r.pos.z).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            label.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
          }
        });
      }}
    />
  );
}
