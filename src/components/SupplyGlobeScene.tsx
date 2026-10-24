import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { SUPPLY_NODES, SUPPLY_ROUTES, type SupplyMode, type SupplyScenario } from '../lib/supplyData';

export interface SupplySelection { id: string; name: string; type: string; detail: string }

interface Props {
  mode: SupplyMode;
  scenario: SupplyScenario;
  selectedId: string | null;
  autoRotate?: boolean;
  onSelect?: (s: SupplySelection) => void;
}

interface Api { setMode: (m: SupplyMode) => void; setScenario: (s: SupplyScenario) => void; setSelected: (id: string | null) => void }

const R = 7.2;
const green = 0x53f0be, cyan = 0x51d6ff, amber = 0xf4bd72, rose = 0xff7088, violet = 0xa991ff;

function latLon(lat: number, lon: number, r = R) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

export function SupplyGlobeScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D globe of the construction supply chain with supplier nodes, shipping routes, logistics and carbon intensity."
      cameraPosition={[15, 10, 18]}
      target={[0, 0, 0]}
      fov={38}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.006 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.18}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x9ce0da, 0x030706, 1.0));
        const key = new THREE.DirectionalLight(0xd8fff8, 1.8);
        key.position.set(-14, 18, 14);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x30d9c0, 0.9);
        rim.position.set(14, 8, -14);
        scene.add(rim);

        const globe = new THREE.Group();
        scene.add(globe);
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(R, 48, 32),
          new THREE.MeshStandardMaterial({ color: 0x061b17, emissive: 0x08251f, emissiveIntensity: 0.5, metalness: 0.4, roughness: 0.6, transparent: true, opacity: 0.92 }),
        );
        globe.add(sphere);
        const wire = new THREE.Mesh(
          new THREE.SphereGeometry(R + 0.02, 32, 20),
          new THREE.MeshBasicMaterial({ color: 0x2c8f7c, wireframe: true, transparent: true, opacity: 0.13 }),
        );
        globe.add(wire);
        const atmosphere = new THREE.Mesh(
          new THREE.SphereGeometry(R + 0.25, 40, 24),
          new THREE.MeshBasicMaterial({ color: 0x3ee0c2, transparent: true, opacity: 0.045, side: THREE.BackSide }),
        );
        globe.add(atmosphere);

        const starsGeo = new THREE.BufferGeometry();
        const starsPos = new Float32Array(400 * 3);
        for (let i = 0; i < 400; i++) {
          const v = new THREE.Vector3().randomDirection().multiplyScalar(20 + Math.random() * 20);
          starsPos[i * 3] = v.x; starsPos[i * 3 + 1] = v.y; starsPos[i * 3 + 2] = v.z;
        }
        starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
        scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0xa9d8d0, size: 0.07, transparent: true, opacity: 0.5 })));

        const nodePos = new Map<string, THREE.Vector3>();
        const nodeRecords: Array<{ id: string; mesh: THREE.Mesh; halo: THREE.Sprite; base: number; type: string; risk: string }> = [];
        const pickables: THREE.Mesh[] = [];
        for (const n of SUPPLY_NODES) {
          const pos = latLon(n.lat, n.lon, R + 0.12);
          nodePos.set(n.id, pos);
          const isHub = n.id === 'HKG';
          const mesh = new THREE.Mesh(new THREE.SphereGeometry(isHub ? 0.22 : 0.13, 12, 12), new THREE.MeshBasicMaterial({ color: isHub ? 0xffffff : green }));
          mesh.position.copy(pos);
          mesh.userData.nodeId = n.id;
          globe.add(mesh);
          pickables.push(mesh);
          const halo = new THREE.Sprite(new THREE.SpriteMaterial({ color: isHub ? 0xffffff : green, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
          halo.scale.setScalar(isHub ? 1.2 : 0.65);
          halo.position.copy(pos);
          globe.add(halo);
          nodeRecords.push({ id: n.id, mesh, halo, base: isHub ? 0.22 : 0.13, type: n.type, risk: n.risk });
        }

        const flows: Array<{ curve: THREE.QuadraticBezierCurve3; line: THREE.Line; particle: THREE.Mesh; offset: number; risk: string }> = [];
        for (const route of SUPPLY_ROUTES) {
          const a = nodePos.get(route.from);
          const b = nodePos.get(route.to);
          if (!a || !b) continue;
          const mid = a.clone().add(b).normalize().multiplyScalar(R + 2.6);
          const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
          const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(curve.getPoints(40)),
            new THREE.LineBasicMaterial({ color: cyan, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }),
          );
          globe.add(line);
          const particle = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), new THREE.MeshBasicMaterial({ color: cyan, transparent: true, opacity: 0.8 }));
          globe.add(particle);
          flows.push({ curve, line, particle, offset: Math.random(), risk: route.risk });
        }

        const ring = new THREE.Mesh(new THREE.TorusGeometry(R + 1.4, 0.02, 5, 120), new THREE.MeshBasicMaterial({ color: green, transparent: true, opacity: 0.25 }));
        ring.rotation.x = Math.PI / 2.3;
        globe.add(ring);

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let current: string | null = selectedId;
        let currentMode: SupplyMode = mode;
        const apply = () => {
          nodeRecords.forEach((r) => {
            const n = SUPPLY_NODES.find((x) => x.id === r.id)!;
            const color = currentMode === 'risk' ? (n.risk === 'High' ? rose : n.risk === 'Medium' ? amber : green) :
              currentMode === 'carbon' ? (n.carbon > 45 ? rose : n.carbon > 25 ? amber : green) :
                currentMode === 'inventory' ? (n.spend > 150 ? amber : green) : currentMode === 'logistics' ? cyan : green;
            (r.mesh.material as THREE.MeshBasicMaterial).color.setHex(r.id === 'HKG' ? 0xffffff : color);
            (r.halo.material as THREE.SpriteMaterial).color.setHex(r.id === 'HKG' ? 0xffffff : color);
            r.mesh.scale.setScalar(r.id === current ? 1.6 : 1);
            r.halo.scale.setScalar((r.id === 'HKG' ? 1.2 : 0.65) * (r.id === current ? 1.5 : 1));
          });
          flows.forEach((f) => {
            const color = currentMode === 'carbon' ? (f.risk === 'High' ? rose : f.risk === 'Medium' ? amber : green) : currentMode === 'risk' ? (f.risk === 'High' ? rose : cyan) : cyan;
            (f.line.material as THREE.LineBasicMaterial).color.setHex(color);
            (f.particle.material as THREE.MeshBasicMaterial).color.setHex(color);
          });
          ring.rotation.z = 0;
        };
        const setSelected = (id: string | null) => {
          current = id;
          apply();
          const n = SUPPLY_NODES.find((x) => x.id === id);
          if (n) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid rgba(83,240,190,.5);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:#53f0be;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${n.id} · ${n.type}</span><div style="margin-top:2px;font-weight:500">${n.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${n.city} · OTIF ${n.otif}%</div></div>`;
          } else label.style.display = 'none';
        };
        apiRef.current = {
          setMode: (m) => { currentMode = m; apply(); },
          setScenario: (s) => { currentMode = currentMode; void s; apply(); },
          setSelected,
        };
        apply();
        setSelected(selectedId);

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
          const id = hit.object.userData.nodeId as string;
          const n = SUPPLY_NODES.find((x) => x.id === id);
          return n ? { id: n.id, name: n.name, type: n.type, detail: `${n.city} · OTIF ${n.otif}% · risk ${n.risk}` } : null;
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
          globe.rotation.y += dt * 0.055;
          ring.rotation.z += dt * 0.08;
          flows.forEach((f, i) => {
            const t = (elapsed * 0.08 + f.offset + i * 0.01) % 1;
            f.particle.position.copy(f.curve.getPointAt(t));
            (f.particle.material as THREE.MeshBasicMaterial).opacity = 0.2 + Math.sin(t * Math.PI) * 0.7;
          });
          nodeRecords.forEach((r, i) => {
            (r.halo.material as THREE.SpriteMaterial).opacity = 0.22 + Math.sin(elapsed * 2 + i) * 0.12;
            if (r.id === current) {
              const p = r.mesh.getWorldPosition(new THREE.Vector3());
              p.y += 0.8;
              projected.copy(p).project(ctx.camera);
              const width = ctx.container.clientWidth;
              const height = ctx.container.clientHeight;
              label.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
            }
          });
          void dt;
        });
      }}
    />
  );
}
