import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { PLACE_SCENARIOS, PLACE_ZONES, type PlaceMode, type PlaceScenario } from '../lib/placeData';

export interface PlaceSelection { id: string; name: string; type: string; detail: string }
interface Props { mode: PlaceMode; scenario: PlaceScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: PlaceSelection) => void }
interface Api { setMode: (m: PlaceMode) => void; setScenario: (s: PlaceScenario) => void; setSelected: (id: string | null) => void }

const GREEN = 0x53f0be, CYAN = 0x51d6ff, AMBER = 0xf4bd72, VIOLET = 0xa991ff, BLUE = 0x45c4f5;

export function PlaceScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D public realm with lawns, market square, water garden, event stage, play area, trees, paths and people."
      cameraPosition={[22, 16, 26]}
      target={[0, 1.5, 0]}
      fov={40}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.006 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.14}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0xa4e0c8, 0x030706, 1.0));
        const key = new THREE.DirectionalLight(0xe8fff4, 1.7);
        key.position.set(-20, 28, 22);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.6);
        rim.position.set(24, 12, -20);
        scene.add(rim);

        const base = new THREE.Mesh(new THREE.BoxGeometry(50, 1.2, 38), new THREE.MeshStandardMaterial({ color: 0x07130f, metalness: 0.4, roughness: 0.65 }));
        base.position.y = -0.6;
        scene.add(base);
        const paving = new THREE.Mesh(new THREE.PlaneGeometry(49, 37), new THREE.MeshStandardMaterial({ color: 0x27352e, roughness: 0.85, metalness: 0.1 }));
        paving.rotation.x = -Math.PI / 2;
        paving.position.y = 0.01;
        scene.add(paving);

        // Lawns.
        const lawnMat = new THREE.MeshStandardMaterial({ color: 0x245c3d, emissive: 0x0f3522, emissiveIntensity: 0.25, roughness: 0.9 });
        for (const [x, z, w, d] of [[-8, -4, 13, 9], [6, -5, 10, 8], [-9, 7, 9, 6]] as const) {
          const lawn = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, d), lawnMat);
          lawn.position.set(x, 0.06, z);
          scene.add(lawn);
        }
        // Paths.
        const pathMat = new THREE.MeshStandardMaterial({ color: 0x5c625b, roughness: 0.8 });
        for (const [x, z, w, d] of [[0, 1, 44, 2.2], [1, -2, 2.2, 28], [12, 1, 2.0, 24]] as const) {
          const path = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, d), pathMat);
          path.position.set(x, 0.05, z);
          scene.add(path);
        }

        // Trees.
        const trees: THREE.Group[] = [];
        for (let i = 0; i < 26; i++) {
          const tree = new THREE.Group();
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.9, 5), new THREE.MeshStandardMaterial({ color: 0x5b4632, roughness: 0.9 }));
          trunk.position.y = 0.45;
          tree.add(trunk);
          const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75, 0), new THREE.MeshStandardMaterial({ color: i % 3 === 0 ? 0x3b8a55 : 0x2c7047, emissive: 0x123f27, emissiveIntensity: 0.3, roughness: 0.85 }));
          crown.position.y = 1.25;
          tree.add(crown);
          const x = -20 + (i % 7) * 6 + (i % 3) * 0.8;
          const z = -14 + Math.floor(i / 7) * 9 + (i % 2) * 1.2;
          tree.position.set(x, 0.02, z);
          scene.add(tree);
          trees.push(tree);
        }

        // Water garden.
        const water = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, 0.3, 32), new THREE.MeshPhysicalMaterial({ color: 0x2e8fa8, transparent: true, opacity: 0.7, roughness: 0.1, metalness: 0.4 }));
        water.position.set(-9, 0.2, 7);
        scene.add(water);
        const waterHalo = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.04, 5, 40), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.45 }));
        waterHalo.rotation.x = Math.PI / 2;
        waterHalo.position.set(-9, 0.36, 7);
        scene.add(waterHalo);

        // Stage.
        const stage = new THREE.Mesh(new THREE.BoxGeometry(7, 0.8, 4), new THREE.MeshStandardMaterial({ color: 0x3b3f3d, roughness: 0.6, metalness: 0.3 }));
        stage.position.set(5, 0.4, 7);
        scene.add(stage);
        const backdrop = new THREE.Mesh(new THREE.BoxGeometry(7, 3, 0.2), new THREE.MeshStandardMaterial({ color: 0x1c2a26, metalness: 0.5, roughness: 0.4 }));
        backdrop.position.set(5, 2.2, 8.9);
        scene.add(backdrop);
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(5, 2.2), new THREE.MeshBasicMaterial({ color: 0x1d5d63, transparent: true, opacity: 0.7 }));
        screen.position.set(5, 2.3, 8.78);
        scene.add(screen);

        // Market stalls.
        for (let i = 0; i < 5; i++) {
          const stall = new THREE.Group();
          const table = new THREE.Mesh(new THREE.BoxGeometry(2, 0.7, 1.2), new THREE.MeshStandardMaterial({ color: 0x6b5c43, roughness: 0.7 }));
          table.position.y = 0.4;
          stall.add(table);
          const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 1.5), new THREE.MeshStandardMaterial({ color: i % 2 ? 0x53a77d : 0x8a6a45, roughness: 0.7 }));
          canopy.position.y = 1.9;
          stall.add(canopy);
          stall.position.set(2 + i * 2.3, 0, -5 + (i % 2) * 1.2);
          scene.add(stall);
        }

        // Benches and lights.
        for (let i = 0; i < 8; i++) {
          const bench = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.5), new THREE.MeshStandardMaterial({ color: 0x7a5b3a, roughness: 0.8 }));
          bench.position.set(-16 + (i % 4) * 7, 0.45, 3 + Math.floor(i / 4) * 7);
          scene.add(bench);
          const lightPost = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 5), new THREE.MeshStandardMaterial({ color: 0x7b8b83 }));
          lightPost.position.set(-14 + (i % 4) * 8, 1.2, 0 + Math.floor(i / 4) * 10);
          scene.add(lightPost);
          const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffd08a }));
          bulb.position.set(-14 + (i % 4) * 8, 2.45, 0 + Math.floor(i / 4) * 10);
          scene.add(bulb);
        }

        // People.
        const people: THREE.Group[] = [];
        for (let i = 0; i < 24; i++) {
          const p = new THREE.Group();
          const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.5, 3, 6), new THREE.MeshStandardMaterial({ color: i % 4 === 0 ? 0xc79b6a : i % 3 === 0 ? 0x456b5b : 0x35515b, roughness: 0.7 }));
          body.position.y = 0.55;
          p.add(body);
          p.position.set(-18 + (i % 8) * 4.6 + (i % 3) * 0.6, 0, -10 + Math.floor(i / 8) * 7 + (i % 2) * 1.4);
          scene.add(p);
          people.push(p);
        }

        // Zones.
        const zones: Array<{ id: string; mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial }> = [];
        const pickables: THREE.Mesh[] = [];
        for (const z of PLACE_ZONES) {
          const mat = new THREE.MeshStandardMaterial({ color: 0x1a3a2e, emissive: new THREE.Color(z.id === 'P-01' ? GREEN : z.id === 'P-02' ? AMBER : z.id === 'P-03' ? BLUE : z.id === 'P-04' ? 0xff9f43 : VIOLET), emissiveIntensity: 0.12, transparent: true, opacity: 0.28, depthWrite: false, roughness: 0.8 });
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(z.w, 0.03, z.d), mat);
          mesh.position.set(z.x, 0.11, z.z);
          mesh.userData.zoneId = z.id;
          scene.add(mesh);
          pickables.push(mesh);
          zones.push({ id: z.id, mesh, mat });
        }

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          const s = PLACE_SCENARIOS[currentScenario];
          zones.forEach((z) => {
            const zone = PLACE_ZONES.find((x) => x.id === z.id)!;
            const color = currentMode === 'green' ? (zone.canopy > 45 ? GREEN : AMBER) :
              currentMode === 'activation' ? (zone.footfall > 800 ? CYAN : GREEN) :
                currentMode === 'access' ? (zone.access >= 96 ? GREEN : AMBER) :
                  zone.comfort > 78 ? GREEN : AMBER;
            z.mat.emissive.setHex(color);
            z.mat.emissiveIntensity = z.id === currentSelected ? 0.9 : 0.16;
            z.mat.opacity = z.id === currentSelected ? 0.5 : 0.24;
          });
          people.forEach((p, i) => { p.visible = i < Math.round((parseInt(s.footfall.replace(/[^0-9]/g, ''), 10) / 8200) * 24); });
          const zone = PLACE_ZONES.find((z) => z.id === currentSelected);
          if (zone) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid rgba(83,240,190,.5);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:#53f0be;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${zone.id} · ${zone.type.toUpperCase()}</span><div style="margin-top:2px;font-weight:500">${zone.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${zone.footfall} visits · ${zone.comfort} comfort · ${zone.canopy}% canopy</div></div>`;
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
          const z = PLACE_ZONES.find((x) => x.id === hit.object.userData.zoneId);
          return z ? { id: z.id, name: z.name, type: z.type, detail: `${z.footfall} visits · ${z.comfort} comfort · ${z.canopy}% canopy` } : null;
        };
        const move = (event: PointerEvent) => { updatePointer(event); ctx.renderer.domElement.style.cursor = pick() ? 'pointer' : 'grab'; };
        const click = (event: PointerEvent) => { updatePointer(event); const z = pick(); if (z) onSelectRef.current(z); };
        ctx.renderer.domElement.addEventListener('pointermove', move);
        ctx.renderer.domElement.addEventListener('pointerup', click);
        ctx.addDispose(() => {
          ctx.renderer.domElement.removeEventListener('pointermove', move);
          ctx.renderer.domElement.removeEventListener('pointerup', click);
        });

        const projected = new THREE.Vector3();
        ctx.addUpdate((dt, elapsed) => {
          trees.forEach((t, i) => { t.rotation.z = Math.sin(elapsed * 0.6 + i) * 0.012; });
          people.forEach((p, i) => { p.position.y = Math.sin(elapsed * 2 + i) * 0.015; });
          waterHalo.rotation.z += dt * 0.3;
          const z = PLACE_ZONES.find((x) => x.id === currentSelected);
          if (z) {
            projected.set(z.x, 2.4, z.z).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            label.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
          }
        });
      }}
    />
  );
}
