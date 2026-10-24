import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { GROUND_BOREHOLES, GROUND_LAYERS, GROUND_PILES, GROUND_SCENARIOS, type GroundMode, type GroundScenario } from '../lib/groundData';

export interface GroundSelection { id: string; name: string; type: string; detail: string }
interface Props { mode: GroundMode; scenario: GroundScenario; selectedId: string | null; autoRotate?: boolean; onSelect?: (s: GroundSelection) => void }
interface Api { setMode: (m: GroundMode) => void; setScenario: (s: GroundScenario) => void; setSelected: (id: string | null) => void }

const CYAN = 0x51d6ff, GREEN = 0x53f0be, AMBER = 0xf4bd72, VIOLET = 0xa991ff, ROSE = 0xff7088;

function latColor(hex: string) { return new THREE.Color(hex); }

export function GroundScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="3D geotechnical ground model with soil strata, boreholes, pile group, groundwater and settlement contours."
      cameraPosition={[18, 9, 26]}
      target={[0, -3, 0]}
      fov={40}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.009 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.12}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.add(new THREE.HemisphereLight(0xa0e0d0, 0x030706, 0.95));
        const key = new THREE.DirectionalLight(0xe8fff4, 1.7);
        key.position.set(-18, 26, 20);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.7);
        rim.position.set(22, 12, -18);
        scene.add(rim);

        const surface = new THREE.Mesh(new THREE.BoxGeometry(40, 0.4, 30), new THREE.MeshStandardMaterial({ color: 0x2e4b3d, roughness: 0.85 }));
        surface.position.y = 0;
        scene.add(surface);
        // Surrounding ground.
        const pad = new THREE.Mesh(new THREE.BoxGeometry(44, 0.2, 34), new THREE.MeshStandardMaterial({ color: 0x14251f, roughness: 0.9 }));
        pad.position.y = -0.15;
        scene.add(pad);

        const layerRecords: Array<{ id: string; mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; y: number; color: string }> = [];
        const pickables: THREE.Mesh[] = [];
        let y = -0.2;
        for (const l of GROUND_LAYERS) {
          const h = Math.min(6, l.thickness * 0.55);
          const mat = new THREE.MeshStandardMaterial({ color: l.color, emissive: new THREE.Color(l.color), emissiveIntensity: 0.16, roughness: 0.9, metalness: 0.06, transparent: true, opacity: 0.92 });
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(34, h, 24), mat);
          mesh.position.set(0, y - h / 2, 0);
          mesh.userData.layerId = l.id;
          scene.add(mesh);
          pickables.push(mesh);
          layerRecords.push({ id: l.id, mesh, mat, y: y - h / 2, color: l.color });
          y -= h;
        }
        // Side cutaway face edges.
        const section = new THREE.Mesh(new THREE.PlaneGeometry(34, Math.abs(y)), new THREE.MeshBasicMaterial({ color: 0x1c3b32, transparent: true, opacity: 0.45, side: THREE.DoubleSide }));
        section.rotation.y = Math.PI / 2;
        section.position.set(17.01, y / 2, 0);
        scene.add(section);
        // Colored front section so the strata read clearly from the camera.
        let sy = -0.2;
        for (const l of GROUND_LAYERS) {
          const h = Math.min(6, l.thickness * 0.55);
          const strip = new THREE.Mesh(new THREE.BoxGeometry(33.8, h * 0.96, 0.06), new THREE.MeshBasicMaterial({ color: l.color, transparent: true, opacity: 0.92 }));
          strip.position.set(0, sy - h / 2, 12.08);
          scene.add(strip);
          sy -= h;
        }

        // Groundwater.
        const water = new THREE.Mesh(new THREE.PlaneGeometry(34, 24), new THREE.MeshPhysicalMaterial({ color: 0x3a9dba, transparent: true, opacity: 0.28, roughness: 0.15, metalness: 0.3, side: THREE.DoubleSide }));
        water.rotation.x = -Math.PI / 2;
        water.position.y = -2.5;
        scene.add(water);

        // Boreholes.
        const boreholes: Array<{ id: string; line: THREE.Line; marker: THREE.Mesh }> = [];
        for (const b of GROUND_BOREHOLES) {
          const pts = [new THREE.Vector3(b.x, 0.2, b.z), new THREE.Vector3(b.x, -b.depth * 0.55, b.z)];
          const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.7 }));
          scene.add(line);
          const marker = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.8, 8), new THREE.MeshBasicMaterial({ color: CYAN }));
          marker.position.set(b.x, 0.6, b.z);
          marker.userData.boreholeId = b.id;
          scene.add(marker);
          pickables.push(marker);
          boreholes.push({ id: b.id, line, marker });
        }

        // Piles.
        const piles: Array<{ id: string; mesh: THREE.Mesh; y: number }> = [];
        for (const p of GROUND_PILES) {
          const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, p.length * 0.55, 8), new THREE.MeshStandardMaterial({ color: 0x7b8c82, metalness: 0.3, roughness: 0.7 }));
          mesh.position.set(p.x, -p.length * 0.28, p.z);
          mesh.userData.pileId = p.id;
          scene.add(mesh);
          pickables.push(mesh);
          piles.push({ id: p.id, mesh, y: mesh.position.y });
        }

        // Building load.
        const building = new THREE.Mesh(new THREE.BoxGeometry(12, 5, 9), new THREE.MeshStandardMaterial({ color: 0x58756b, metalness: 0.4, roughness: 0.5 }));
        building.position.set(0, 2.5, 2);
        building.userData.building = true;
        scene.add(building);
        pickables.push(building);

        // Settlement contours.
        const contours: THREE.Mesh[] = [];
        for (let i = 0; i < 4; i++) {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(3 + i * 2.2, 0.04, 5, 60), new THREE.MeshBasicMaterial({ color: VIOLET, transparent: true, opacity: 0.35 - i * 0.06 }));
          ring.rotation.x = Math.PI / 2;
          ring.position.set(0, 0.25, 2);
          scene.add(ring);
          contours.push(ring);
        }

        const label = document.createElement('div');
        label.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(label);

        let currentMode = mode;
        let currentScenario = scenario;
        let currentSelected = selectedId;
        const apply = () => {
          const s = GROUND_SCENARIOS[currentScenario];
          layerRecords.forEach((l) => {
            l.mat.emissive = new THREE.Color(currentMode === 'strata' ? l.color : 0x000000);
            l.mat.emissiveIntensity = currentMode === 'strata' ? 0.22 : 0;
            l.mat.opacity = l.id === currentSelected ? 1 : 0.88;
          });
          boreholes.forEach((b) => { b.line.visible = currentMode === 'boreholes' || currentMode === 'settlement'; });
          piles.forEach((p) => { p.mesh.visible = currentMode === 'piles' || currentMode === 'settlement'; });
          contours.forEach((c, i) => { c.visible = currentMode === 'settlement'; c.material = new THREE.MeshBasicMaterial({ color: currentScenario === 'excavation' ? ROSE : VIOLET, transparent: true, opacity: 0.36 - i * 0.06 }); });
          water.visible = currentMode === 'strata' || currentScenario === 'groundwater';
          (water.material as THREE.MeshPhysicalMaterial).opacity = currentMode === 'boreholes' ? 0.18 : 0.3;
          const selLayer = GROUND_LAYERS.find((l) => l.id === currentSelected);
          const selBore = GROUND_BOREHOLES.find((b) => b.id === currentSelected);
          const selPile = GROUND_PILES.find((p) => p.id === currentSelected);
          if (selLayer || selBore || selPile) {
            label.style.display = 'block';
            const detail = selLayer ? `${selLayer.name} · ${selLayer.depth} · SPT ${selLayer.spt}` : selBore ? `${selBore.id} · ${selBore.depth} m · water ${selBore.water}` : `${selPile!.id} · ${selPile!.length} m · ${selPile!.capacity}`;
            label.innerHTML = `<div style="background:rgba(3,10,8,.96);border:1px solid rgba(83,240,190,.5);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:#53f0be;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">GEOTECH</span><div style="margin-top:2px;font-weight:500">${detail}</div></div>`;
          } else label.style.display = 'none';
          void s;
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
          while (o && !o.userData.layerId && !o.userData.boreholeId && !o.userData.pileId && !o.userData.building) o = o.parent;
          if (o?.userData.layerId) {
            const l = GROUND_LAYERS.find((x) => x.id === o!.userData.layerId);
            return l ? { id: l.id, name: l.name, type: 'Strata', detail: `${l.depth} · SPT ${l.spt} · ${l.note}` } : null;
          }
          if (o?.userData.boreholeId) {
            const b = GROUND_BOREHOLES.find((x) => x.id === o!.userData.boreholeId);
            return b ? { id: b.id, name: b.id, type: 'Borehole', detail: `${b.depth} m · water ${b.water} · SPT ${b.spt}` } : null;
          }
          if (o?.userData.pileId) {
            const p = GROUND_PILES.find((x) => x.id === o!.userData.pileId);
            return p ? { id: p.id, name: p.id, type: 'Pile', detail: `${p.length} m · ${p.capacity} · ${p.settlement}` } : null;
          }
          return null;
        };
        const move = (event: PointerEvent) => { updatePointer(event); ctx.renderer.domElement.style.cursor = pick() ? 'pointer' : 'grab'; };
        const click = (event: PointerEvent) => { updatePointer(event); const s = pick(); if (s) onSelectRef.current(s); };
        ctx.renderer.domElement.addEventListener('pointermove', move);
        ctx.renderer.domElement.addEventListener('pointerup', click);
        ctx.addDispose(() => {
          ctx.renderer.domElement.removeEventListener('pointermove', move);
          ctx.renderer.domElement.removeEventListener('pointerup', click);
        });

        const projected = new THREE.Vector3();
        ctx.addUpdate((dt, elapsed) => {
          water.position.y = -2.5 + Math.sin(elapsed * 0.5) * 0.03;
          contours.forEach((c, i) => { c.rotation.z = Math.sin(elapsed * 0.2 + i) * 0.05; });
          if (currentSelected) {
            projected.set(0, 2, 2).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            label.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
          }
        });
      }}
    />
  );
}
