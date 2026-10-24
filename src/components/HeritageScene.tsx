import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { HERITAGE_ELEMENTS, HERITAGE_SCENARIOS, type HeritageMode, type HeritageScenario } from '../lib/heritageData';

export interface HeritageSelection { id: string; name: string; age: string; condition: string; intervention: string; carbon: string }
interface Props { mode: HeritageMode; scenario: HeritageScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: HeritageSelection) => void }
interface Api { setMode: (m: HeritageMode) => void; setScenario: (s: HeritageScenario) => void; setSelected: (id: string | null) => void }

const CYAN = 0x51d6ff, GREEN = 0x53f0be, AMBER = 0xf4bd72, VIOLET = 0xa991ff, ROSE = 0xff7088;

export function HeritageScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D heritage adaptive-reuse model with masonry facade, arches, timber roof, new core and gallery insertions, courtyard and scaffolding."
      cameraPosition={[16, 10, 20]}
      target={[0, 3, 0]}
      fov={40}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.012 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.12}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0x9de0d0, 0x030706, 0.95));
        const key = new THREE.DirectionalLight(0xd8fff8, 1.6);
        key.position.set(-14, 20, 16);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.7);
        rim.position.set(16, 8, -16);
        scene.add(rim);

        const ground = new THREE.Mesh(new THREE.BoxGeometry(24, 0.5, 18), new THREE.MeshStandardMaterial({ color: 0x191c17, roughness: 0.85 }));
        ground.position.y = -0.25;
        scene.add(ground);
        const grid: THREE.Vector3[] = [];
        for (let x = -11; x <= 11; x += 2) grid.push(new THREE.Vector3(x, 0.01, -8), new THREE.Vector3(x, 0.01, 8));
        for (let z = -8; z <= 8; z += 2) grid.push(new THREE.Vector3(-11, 0.01, z), new THREE.Vector3(11, 0.01, z));
        scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(grid), new THREE.LineBasicMaterial({ color: 0x4d4a33, transparent: true, opacity: 0.15 })));

        const stone = new THREE.MeshStandardMaterial({ color: 0x8a7a5b, roughness: 0.9, metalness: 0.05 });
        const glass = new THREE.MeshPhysicalMaterial({ color: 0x2c5f66, transparent: true, opacity: 0.45, metalness: 0.4, roughness: 0.1 });
        const timber = new THREE.MeshStandardMaterial({ color: 0x6b4a32, roughness: 0.85 });
        const records: Array<{ id: string; mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; pos: THREE.Vector3; color: string }> = [];
        const pickables: THREE.Mesh[] = [];

        // Heritage facade with arches.
        const facade = new THREE.Group();
        const wall = new THREE.Mesh(new THREE.BoxGeometry(14, 7, 0.6), stone);
        wall.position.y = 3.5;
        facade.add(wall);
        for (let i = 0; i < 5; i++) {
          const arch = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.18, 6, 18, Math.PI), stone);
          arch.position.set(-4.8 + i * 2.4, 3.2, 0.35);
          arch.rotation.z = Math.PI;
          facade.add(arch);
          const window = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.8), glass);
          window.position.set(-4.8 + i * 2.4, 2.2, 0.34);
          facade.add(window);
        }
        facade.position.set(0, 0, -4);
        scene.add(facade);
        const facadeHit = new THREE.Mesh(new THREE.BoxGeometry(14, 7, 0.8), new THREE.MeshBasicMaterial({ visible: false }));
        facadeHit.position.set(0, 3.5, -4);
        facadeHit.userData.elementId = 'FAC';
        scene.add(facadeHit);
        pickables.push(facadeHit);
        records.push({ id: 'FAC', mesh: facadeHit, mat: stone, pos: new THREE.Vector3(0, 3.5, -4), color: '#f4bd72' });

        // Roof.
        const roof = new THREE.Mesh(new THREE.ConeGeometry(10, 3, 4), timber);
        roof.position.set(0, 8.5, -2);
        roof.rotation.y = Math.PI / 4;
        roof.userData.elementId = 'ROF';
        scene.add(roof);
        pickables.push(roof);
        records.push({ id: 'ROF', mesh: roof, mat: timber, pos: new THREE.Vector3(0, 8.5, -2), color: '#a8794a' });

        // New core.
        const core = new THREE.Mesh(new THREE.BoxGeometry(4, 8, 4), glass);
        core.position.set(4, 4, 2);
        core.userData.elementId = 'COR';
        scene.add(core);
        pickables.push(core);
        records.push({ id: 'COR', mesh: core, mat: glass as unknown as THREE.MeshStandardMaterial, pos: new THREE.Vector3(4, 4, 2), color: '#51d6ff' });

        // Gallery insertion.
        const gallery = new THREE.Mesh(new THREE.BoxGeometry(6, 2.4, 4), glass);
        gallery.position.set(-2, 2.0, 3);
        gallery.userData.elementId = 'GAL';
        scene.add(gallery);
        pickables.push(gallery);
        records.push({ id: 'GAL', mesh: gallery, mat: glass as unknown as THREE.MeshStandardMaterial, pos: new THREE.Vector3(-2, 2.0, 3), color: '#a991ff' });

        // Courtyard.
        const court = new THREE.Mesh(new THREE.BoxGeometry(5, 0.05, 4), new THREE.MeshStandardMaterial({ color: 0x3e4a3a, roughness: 0.9 }));
        court.position.set(-5, 0.03, 3);
        court.userData.elementId = 'CRT';
        scene.add(court);
        pickables.push(court);
        records.push({ id: 'CRT', mesh: court, mat: court.material as THREE.MeshStandardMaterial, pos: new THREE.Vector3(-5, 0.03, 3), color: '#ff9f43' });

        // Scaffolding.
        const scaffoldMat = new THREE.MeshStandardMaterial({ color: 0x8f9a92, metalness: 0.6, roughness: 0.4 });
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 3; j++) {
            const pole = new THREE.Mesh(new THREE.BoxGeometry(0.06, 6, 0.06), scaffoldMat);
            pole.position.set(-6 + i * 4, 3, 0.8 + j * 1.2);
            scene.add(pole);
          }
        }

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          records.forEach((r) => {
            const e = HERITAGE_ELEMENTS.find((x) => x.id === r.id)!;
            const color = currentMode === 'structure' ? (e.condition === 'Poor' ? ROSE : e.condition === 'Fair' ? AMBER : GREEN) :
              currentMode === 'adaptive' ? (e.age === '2026' ? CYAN : AMBER) :
                currentMode === 'carbon' ? (e.carbon === 'Retained' ? GREEN : e.carbon === 'New build' ? AMBER : VIOLET) : new THREE.Color(e.color).getHex();
            if (r.mat.emissive) {
              r.mat.emissive.setHex(color);
              r.mat.emissiveIntensity = r.id === currentSelected ? 0.8 : 0.12;
            }
            r.mesh.scale.setScalar(r.id === currentSelected ? 1.06 : 1);
          });
          const e = HERITAGE_ELEMENTS.find((x) => x.id === currentSelected);
          if (e) {
            label.style.display = 'block';
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid ${e.color}88;border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:${e.color};font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${e.id} · ${e.age}</span><div style="margin-top:2px;font-weight:500">${e.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${e.condition} · ${e.intervention} · ${e.carbon}</div></div>`;
          } else label.style.display = 'none';
          void HERITAGE_SCENARIOS[currentScenario];
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
          const hit = raycaster.intersectObjects(pickables, true)[0];
          if (!hit) return null;
          let o: THREE.Object3D | null = hit.object;
          while (o && !o.userData.elementId) o = o.parent;
          const e = HERITAGE_ELEMENTS.find((x) => x.id === o?.userData.elementId);
          return e ? { id: e.id, name: e.name, age: e.age, condition: e.condition, intervention: e.intervention, carbon: e.carbon } : null;
        };
        const move = (event: PointerEvent) => { updatePointer(event); ctx.renderer.domElement.style.cursor = pick() ? 'pointer' : 'grab'; };
        const click = (event: PointerEvent) => { updatePointer(event); const e = pick(); if (e) onSelectRef.current(e); };
        ctx.renderer.domElement.addEventListener('pointermove', move);
        ctx.renderer.domElement.addEventListener('pointerup', click);
        ctx.addDispose(() => {
          ctx.renderer.domElement.removeEventListener('pointermove', move);
          ctx.renderer.domElement.removeEventListener('pointerup', click);
        });

        const projected = new THREE.Vector3();
        ctx.addUpdate((dt, elapsed) => {
          core.rotation.y += dt * 0.02;
          if (currentSelected) {
            const r = records.find((x) => x.id === currentSelected);
            if (r) projected.set(r.pos.x, r.pos.y + 2.2, r.pos.z).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            label.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
          }
          void elapsed;
        });
      }}
    />
  );
}
