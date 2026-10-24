import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { RESILIENCE_ASSETS, RESILIENCE_SCENARIOS, type ResilienceMode, type ResilienceScenario } from '../lib/resilienceData';

export interface ResilienceSelection { id: string; name: string; type: string; status: string; detail: string }

interface Props { mode: ResilienceMode; scenario: ResilienceScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: ResilienceSelection) => void }
interface Api { setMode: (m: ResilienceMode) => void; setScenario: (s: ResilienceScenario) => void; setSelected: (id: string | null) => void }

const GREEN = 0x53f0be, CYAN = 0x51d6ff, AMBER = 0xf4bd72, ROSE = 0xff7088, BLUE = 0x45c4f5;

export function ResilienceScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D city resilience command with flood extent, typhoon wind, power outages, shelters, pumps and emergency response routes."
      cameraPosition={[28, 20, 34]}
      target={[0, 3, 0]}
      fov={40}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.006 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.14}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x9bdfe5, 0x030706, 0.9));
        const key = new THREE.DirectionalLight(0xd8fff8, 1.5);
        key.position.set(-28, 40, 26);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.6);
        rim.position.set(32, 16, -28);
        scene.add(rim);

        const ground = new THREE.Mesh(new THREE.BoxGeometry(70, 1.2, 50), new THREE.MeshStandardMaterial({ color: 0x06100e, metalness: 0.55, roughness: 0.66 }));
        ground.position.y = -0.7;
        scene.add(ground);
        const land = new THREE.Mesh(new THREE.PlaneGeometry(69, 36), new THREE.MeshStandardMaterial({ color: 0x091714, roughness: 0.88, metalness: 0.1 }));
        land.rotation.x = -Math.PI / 2;
        land.position.set(0, 0, -6);
        scene.add(land);
        const water = new THREE.Mesh(new THREE.PlaneGeometry(69, 15), new THREE.MeshPhysicalMaterial({ color: 0x031a20, roughness: 0.2, metalness: 0.7, clearcoat: 0.7 }));
        water.rotation.x = -Math.PI / 2;
        water.position.set(0, 0, 16);
        scene.add(water);

        // City blocks.
        const cityMat = new THREE.MeshStandardMaterial({ color: 0x152923, metalness: 0.4, roughness: 0.55, emissive: 0x0b1f1a, emissiveIntensity: 0.35 });
        const buildings: THREE.Mesh[] = [];
        for (let i = 0; i < 18; i++) {
          const x = -28 + (i % 6) * 11;
          const z = -14 + Math.floor(i / 6) * 8;
          const h = 3 + ((i * 7) % 9);
          const b = new THREE.Mesh(new THREE.BoxGeometry(5 + (i % 3), h, 4 + (i % 2)), cityMat);
          b.position.set(x, h / 2, z);
          scene.add(b);
          buildings.push(b);
        }
        // Roads.
        const roadMat = new THREE.MeshStandardMaterial({ color: 0x192a27, roughness: 0.7, metalness: 0.3 });
        for (const z of [-10, -2, 6]) {
          const r = new THREE.Mesh(new THREE.BoxGeometry(64, 0.05, 2.4), roadMat);
          r.position.set(0, 0.03, z);
          scene.add(r);
        }

        // Flood plane.
        const flood = new THREE.Mesh(new THREE.PlaneGeometry(69, 40), new THREE.MeshPhysicalMaterial({ color: 0x2b8fba, transparent: true, opacity: 0.22, roughness: 0.15, metalness: 0.5, side: THREE.DoubleSide }));
        flood.rotation.x = -Math.PI / 2;
        flood.position.set(0, 0.12, -4);
        scene.add(flood);

        // Wind arrows.
        const windGroup = new THREE.Group();
        for (let i = 0; i < 9; i++) {
          const arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0.1, 0.2).normalize(), new THREE.Vector3(-30 + i * 7, 8 + (i % 3) * 2, -16 + (i % 4) * 8), 5, 0x9fe8ff, 1.2, 0.6);
          windGroup.add(arrow);
        }
        scene.add(windGroup);

        // Rain.
        const rainCount = 500;
        const rainGeo = new THREE.BufferGeometry();
        const rainPos = new Float32Array(rainCount * 3);
        for (let i = 0; i < rainCount; i++) {
          rainPos[i * 3] = (Math.sin(i * 12.9898) * 43758.5453 % 60) - 30;
          rainPos[i * 3 + 1] = (i % 30) * 1.2;
          rainPos[i * 3 + 2] = (Math.cos(i * 78.233) * 43758.5453 % 44) - 22;
        }
        rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
        const rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({ color: 0x9fe8ff, size: 0.11, transparent: true, opacity: 0.45, depthWrite: false }));
        scene.add(rain);

        // Assets.
        const assetMeshes: Record<string, THREE.Mesh> = {};
        const pickables: THREE.Mesh[] = [];
        for (const a of RESILIENCE_ASSETS) {
          const color = a.type === 'Shelter' ? GREEN : a.type === 'Hospital' ? ROSE : a.type === 'Pump' ? BLUE : a.type === 'Power' ? AMBER : a.type === 'Response' ? CYAN : AMBER;
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(a.type === 'Response' ? 1.6 : 2.2, a.type === 'Response' ? 0.8 : 2.4, a.type === 'Response' ? 1.0 : 2.2), new THREE.MeshStandardMaterial({ color: 0x1a2f2a, emissive: color, emissiveIntensity: 0.45, metalness: 0.4, roughness: 0.45 }));
          mesh.position.set(a.x, a.type === 'Response' ? 0.7 : 1.2, a.z);
          mesh.userData.assetId = a.id;
          scene.add(mesh);
          assetMeshes[a.id] = mesh;
          pickables.push(mesh);
          const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), new THREE.MeshBasicMaterial({ color }));
          beacon.position.set(a.x, a.type === 'Response' ? 2 : 3.1, a.z);
          scene.add(beacon);
        }

        // Response route.
        const route = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.3, 5), new THREE.Vector3(-4, 0.3, 3), new THREE.Vector3(-8, 0.3, 2)]);
        const routeLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(route.getPoints(30)), new THREE.LineDashedMaterial({ color: CYAN, transparent: true, opacity: 0.7, dashSize: 0.5, gapSize: 0.3 }));
        routeLine.computeLineDistances();
        scene.add(routeLine);
        const vehicle = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.5), new THREE.MeshStandardMaterial({ color: 0xe8f4f1, emissive: CYAN, emissiveIntensity: 0.5, metalness: 0.4, roughness: 0.4 }));
        scene.add(vehicle);

        const ring = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.3, 36), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }));
        ring.rotation.x = -Math.PI / 2;
        ring.visible = false;
        scene.add(ring);
        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          const s = RESILIENCE_SCENARIOS[currentScenario];
          (flood.material as THREE.MeshPhysicalMaterial).opacity = currentMode === 'flood' || currentScenario !== 't8' ? (currentScenario === 'surge' ? 0.4 : 0.22) : 0.08;
          rain.visible = currentScenario !== 'blackout';
          windGroup.visible = currentMode === 'wind' || currentScenario !== 'blackout';
          routeLine.visible = currentMode === 'response' || currentScenario === 'surge';
          vehicle.visible = routeLine.visible;
          buildings.forEach((b) => { (b.material as THREE.MeshStandardMaterial).emissiveIntensity = currentMode === 'power' ? 0.1 : 0.35; });
          Object.entries(assetMeshes).forEach(([id, m]) => {
            const a = RESILIENCE_ASSETS.find((x) => x.id === id)!;
            m.visible = currentMode !== 'power' || a.type !== 'Power' || currentScenario === 'blackout';
          });
          const active = RESILIENCE_ASSETS.find((a) => a.id === currentSelected);
          if (active) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid rgba(83,240,190,.5);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:#53f0be;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${active.id} · ${active.type.toUpperCase()}</span><div style="margin-top:2px;font-weight:500">${active.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${active.status} · ${active.capacity}</div></div>`;
          } else label.style.display = 'none';
          void s;
        };
        apiRef.current = {
          setMode: (m) => { currentMode = m; apply(); },
          setScenario: (s) => { currentScenario = s; apply(); },
          setSelected: (id) => {
            currentSelected = id;
            const a = RESILIENCE_ASSETS.find((x) => x.id === id);
            ring.visible = !!a;
            if (a) ring.position.set(a.x, 0.2, a.z);
            apply();
          },
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
          const a = RESILIENCE_ASSETS.find((x) => x.id === hit.object.userData.assetId);
          return a ? { id: a.id, name: a.name, type: a.type, status: a.status, detail: `${a.capacity} · ${a.status}` } : null;
        };
        const move = (event: PointerEvent) => { updatePointer(event); ctx.renderer.domElement.style.cursor = pick() ? 'pointer' : 'grab'; };
        const click = (event: PointerEvent) => { updatePointer(event); const a = pick(); if (a) onSelectRef.current(a); };
        ctx.renderer.domElement.addEventListener('pointermove', move);
        ctx.renderer.domElement.addEventListener('pointerup', click);
        ctx.addDispose(() => {
          ctx.renderer.domElement.removeEventListener('pointermove', move);
          ctx.renderer.domElement.removeEventListener('pointerup', click);
        });

        const projected = new THREE.Vector3();
        ctx.addUpdate((dt, elapsed) => {
          const s = RESILIENCE_SCENARIOS[currentScenario];
          const positions = rain.geometry.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < rainCount; i++) {
            let y = positions.getY(i) - dt * 22;
            if (y < 0) y = 26;
            positions.setY(i, y);
          }
          positions.needsUpdate = true;
          const t = (elapsed * 0.05 * (s.wind / 100)) % 1;
          vehicle.position.copy(route.getPointAt(t));
          vehicle.rotation.y = Math.atan2(route.getTangentAt(t).x, route.getTangentAt(t).z);
          ring.rotation.z += dt * 0.45;
          const a = RESILIENCE_ASSETS.find((x) => x.id === currentSelected);
          if (a) {
            projected.set(a.x, 3.8, a.z).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            label.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
          }
        });
      }}
    />
  );
}
