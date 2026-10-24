import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { PROPTECH_FLOORS, type ProptechFloor } from '../lib/platformData';

export type PropTechMode = 'leasing' | 'occupancy' | 'energy' | 'experience';

export interface PropTechSceneProps {
  mode: PropTechMode;
  exploded: boolean;
  selectedLevel: number | null;
  autoRotate?: boolean;
  onSelect?: (level: number | null) => void;
}

interface PropTechApi {
  setMode: (mode: PropTechMode) => void;
  setExploded: (value: boolean) => void;
  setSelected: (level: number | null) => void;
}

interface FloorRecord {
  data: ProptechFloor;
  group: THREE.Group;
  slab: THREE.Mesh;
  slabMat: THREE.MeshStandardMaterial;
  bandMat: THREE.MeshBasicMaterial;
  baseY: number;
}

const ACCENT = 0x53f0be;
const CYAN = 0x51d6ff;
const AMBER = 0xf4bd72;
const ROSE = 0xff7088;
const VIOLET = 0xa991ff;
const FLOOR_H = 2.35;

function colorForMode(floor: ProptechFloor, mode: PropTechMode) {
  if (mode === 'leasing') {
    if (floor.status === 'vacant') return new THREE.Color(ROSE);
    if (floor.status === 'expiring') return new THREE.Color(AMBER);
    if (floor.status === 'amenity') return new THREE.Color(VIOLET);
    return new THREE.Color(ACCENT);
  }
  if (mode === 'occupancy') {
    if (floor.occupancy >= 88) return new THREE.Color(ACCENT);
    if (floor.occupancy >= 70) return new THREE.Color(AMBER);
    return new THREE.Color(ROSE);
  }
  if (mode === 'energy') {
    if (floor.energy < 80) return new THREE.Color(ACCENT);
    if (floor.energy < 100) return new THREE.Color(AMBER);
    return new THREE.Color(ROSE);
  }
  if (floor.nps >= 60) return new THREE.Color(CYAN);
  if (floor.nps >= 45) return new THREE.Color(ACCENT);
  return new THREE.Color(AMBER);
}

function edge(mesh: THREE.Mesh, color = 0x2b6a6a, opacity = 0.36) {
  const e = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }),
  );
  mesh.add(e);
}

function label(text: string, color: string, pos: [number, number, number], layer: HTMLDivElement) {
  const el = document.createElement('div');
  el.innerHTML = `<span style="display:inline-block;width:4px;height:4px;border-radius:99px;background:${color};box-shadow:0 0 8px ${color};margin-right:5px;vertical-align:1px"></span>${text}`;
  el.style.cssText = 'position:absolute;transform:translate(-50%,-100%);font-family:"JetBrains Mono Variable",monospace;font-size:7.5px;letter-spacing:.12em;color:rgba(218,240,238,.8);white-space:nowrap;padding:3px 6px;border:1px solid rgba(120,200,210,.16);border-radius:3px;background:rgba(4,10,12,.68);backdrop-filter:blur(3px);';
  layer.appendChild(el);
  return { el, pos: new THREE.Vector3(...pos) };
}

export function PropTechScene({ mode, exploded, selectedLevel, autoRotate = false, onSelect }: PropTechSceneProps) {
  const apiRef = useRef<PropTechApi | null>(null);
  const onSelectRef = useRef<(level: number | null) => void>(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});

  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setExploded(exploded); }, [exploded]);
  useEffect(() => { apiRef.current?.setSelected(selectedLevel); }, [selectedLevel]);

  return (
    <ThreeStage
      ariaLabel="Interactive PropTech cutaway of Kai Tak Tower I, with 16 floor plates coloured by leasing, occupancy, energy or tenant experience."
      cameraPosition={[42, 42, 54]}
      target={[0, 16, 0]}
      fov={40}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.005 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.18}
      build={(ctx) => {
        const scene = ctx.scene;
        const hemi = new THREE.HemisphereLight(0x9bd8d2, 0x07100f, 0.9);
        scene.add(hemi);
        const key = new THREE.DirectionalLight(0xd8fbff, 1.8);
        key.position.set(-40, 64, 36);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x37cba8, 0.6);
        rim.position.set(48, 26, -34);
        scene.add(rim);
        const warm = new THREE.PointLight(0xffb86a, 20, 55, 2);
        warm.position.set(-12, 8, 12);
        scene.add(warm);

        // Plinth and plaza.
        const baseGeo = new THREE.BoxGeometry(58, 2, 50);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x050d10, metalness: 0.55, roughness: 0.7 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = -1.2;
        scene.add(base);
        const baseEdge = new THREE.LineSegments(
          new THREE.EdgesGeometry(baseGeo),
          new THREE.LineBasicMaterial({ color: 0x1a4448, transparent: true, opacity: 0.7 }),
        );
        baseEdge.position.y = -1.2;
        scene.add(baseEdge);
        const plaza = new THREE.Mesh(
          new THREE.PlaneGeometry(57, 49),
          new THREE.MeshStandardMaterial({ color: 0x0a1718, roughness: 0.84, metalness: 0.2 }),
        );
        plaza.rotation.x = -Math.PI / 2;
        plaza.position.y = -0.08;
        scene.add(plaza);

        const gridPts: THREE.Vector3[] = [];
        for (let x = -28; x <= 28; x += 4) gridPts.push(new THREE.Vector3(x, 0.01, -24), new THREE.Vector3(x, 0.01, 24));
        for (let z = -24; z <= 24; z += 4) gridPts.push(new THREE.Vector3(-28, 0.01, z), new THREE.Vector3(28, 0.01, z));
        scene.add(new THREE.LineSegments(
          new THREE.BufferGeometry().setFromPoints(gridPts),
          new THREE.LineBasicMaterial({ color: 0x114449, transparent: true, opacity: 0.16 }),
        ));

        // Neighbouring context massing.
        const contextMat = new THREE.MeshStandardMaterial({ color: 0x0b1b1e, roughness: 0.84, metalness: 0.2 });
        const contextSpots: Array<[number, number, number, number, number]> = [
          [-20, -16, 6, 10, 8], [20, -15, 8, 7, 9], [-21, 15, 5, 6, 7], [20, 16, 7, 8, 6],
          [-9, -22, 5, 5, 7], [10, 22, 6, 5, 8],
        ];
        contextSpots.forEach(([x, z, w, h, d]) => {
          const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), contextMat);
          b.position.set(x, h / 2, z);
          edge(b, 0x1f484b, 0.22);
          scene.add(b);
        });
        // Trees around the plaza.
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3a2f27, roughness: 0.9 });
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x1b4535, emissive: 0x0a2a20, emissiveIntensity: 0.3, roughness: 0.88 });
        for (let i = 0; i < 18; i++) {
          const a = (i / 18) * Math.PI * 2;
          const tree = new THREE.Group();
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.8, 5), trunkMat);
          trunk.position.y = 0.4;
          tree.add(trunk);
          const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 0), leafMat);
          crown.position.y = 1.1;
          crown.scale.set(1, 0.8, 1);
          tree.add(crown);
          tree.position.set(Math.cos(a) * 17, 0.02, Math.sin(a) * 15);
          scene.add(tree);
        }

        // Tower cutaway.
        const tower = new THREE.Group();
        tower.position.y = 0.2;
        scene.add(tower);
        const floorRecords: FloorRecord[] = [];
        const floorPickables: THREE.Mesh[] = [];
        const coreMat = new THREE.MeshStandardMaterial({ color: 0x183335, metalness: 0.6, roughness: 0.42 });
        const furnitureMats = [
          new THREE.MeshStandardMaterial({ color: 0x546761, roughness: 0.75 }),
          new THREE.MeshStandardMaterial({ color: 0x8a6d4a, roughness: 0.8 }),
          new THREE.MeshStandardMaterial({ color: 0x2b4447, roughness: 0.7 }),
        ];
        const selectionFrame = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(13.2, 0.06, 10.2)),
          new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false }),
        );
        selectionFrame.visible = false;
        scene.add(selectionFrame);

        PROPTECH_FLOORS.forEach((floor, i) => {
          const isPodium = floor.level <= 2;
          const w = isPodium ? 15 : 12;
          const d = isPodium ? 11 : 9;
          const group = new THREE.Group();
          const baseY = floor.level * FLOOR_H;
          group.position.y = baseY;
          tower.add(group);

          const slabMat = new THREE.MeshStandardMaterial({
            color: 0x8fa59d, roughness: 0.62, metalness: 0.25,
            emissive: 0x1f5f52, emissiveIntensity: 0.32,
          });
          const slab = new THREE.Mesh(new THREE.BoxGeometry(w, 0.22, d), slabMat);
          slab.position.y = 0.11;
          slab.userData.level = floor.level;
          group.add(slab);
          floorPickables.push(slab);
          edge(slab, 0x9bcfc3, 0.52);

          const bandMat = new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.65 });
          const band = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, 0.09, 0.12), bandMat);
          band.position.set(0, 0.28, d / 2 + 0.04);
          group.add(band);

          const core = new THREE.Mesh(new THREE.BoxGeometry(3.1, FLOOR_H - 0.24, 3.1), coreMat);
          core.position.set(-w / 2 + 2.1, (FLOOR_H - 0.24) / 2 + 0.24, -d / 2 + 2.0);
          group.add(core);
          edge(core, 0x3e7674, 0.3);

          // Perimeter structure.
          for (const [x, z] of [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) {
            const col = new THREE.Mesh(new THREE.BoxGeometry(0.18, FLOOR_H - 0.24, 0.18), new THREE.MeshStandardMaterial({ color: 0x34504e, metalness: 0.5, roughness: 0.5 }));
            col.position.set(x, (FLOOR_H - 0.24) / 2 + 0.22, z);
            group.add(col);
          }

          // Workspace islands.
          const islands = isPodium ? 5 : 4;
          for (let n = 0; n < islands; n++) {
            const desk = new THREE.Mesh(
              new THREE.BoxGeometry(1.8 + (n % 2) * 0.6, 0.32, 1.0),
              furnitureMats[n % furnitureMats.length],
            );
            desk.position.set(-w / 2 + 3 + (n % 3) * 3, 0.48, -d / 2 + 3 + Math.floor(n / 3) * 2.8);
            desk.rotation.y = n % 2 ? 0.12 : -0.08;
            group.add(desk);
          }
          if (floor.status === 'vacant') {
            const marker = new THREE.Mesh(
              new THREE.RingGeometry(0.8, 0.9, 24),
              new THREE.MeshBasicMaterial({ color: ROSE, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false }),
            );
            marker.rotation.x = -Math.PI / 2;
            marker.position.set(0, 0.25, 0);
            group.add(marker);
          }

          floorRecords.push({ data: floor, group, slab, slabMat, bandMat, baseY });
        });

        // Lobby and canopy.
        const canopy = new THREE.Mesh(
          new THREE.BoxGeometry(18, 0.3, 13),
          new THREE.MeshStandardMaterial({ color: 0x1d3b3c, metalness: 0.55, roughness: 0.45, emissive: 0x1b5c51, emissiveIntensity: 0.35 }),
        );
        canopy.position.y = 2.55;
        tower.add(canopy);
        const lobby = new THREE.Mesh(
          new THREE.BoxGeometry(16, 2.2, 12),
          new THREE.MeshPhysicalMaterial({ color: 0x8adfd2, transparent: true, opacity: 0.18, roughness: 0.1, metalness: 0.2, side: THREE.DoubleSide, depthWrite: false }),
        );
        lobby.position.y = 1.4;
        tower.add(lobby);

        // Elevator cab.
        const lift = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 1.8, 1.2),
          new THREE.MeshStandardMaterial({ color: 0x9fffe4, emissive: 0x53f0be, emissiveIntensity: 0.9, metalness: 0.3, roughness: 0.3 }),
        );
        lift.position.set(-3.8, 4, -1.5);
        tower.add(lift);

        // People dots on occupied floors.
        const people: THREE.Mesh[] = [];
        for (let i = 0; i < 42; i++) {
          const floor = PROPTECH_FLOORS[i % PROPTECH_FLOORS.length];
          if (floor.occupancy === 0) continue;
          const dot = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 6, 6),
            new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? AMBER : 0xc8fff1 }),
          );
          const w = floor.level <= 2 ? 15 : 12;
          const d = floor.level <= 2 ? 11 : 9;
          dot.position.set((Math.random() - 0.5) * (w - 3), floor.level * FLOOR_H + 0.45, (Math.random() - 0.5) * (d - 3));
          tower.add(dot);
          people.push(dot);
        }

        // Labels.
        const topLabel = label('KAI TAK TOWER I · 42 STOREYS', '#53f0be', [0, 41, 0], ctx.labelLayer);
        const selectedLabel = document.createElement('div');
        selectedLabel.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(selectedLabel);
        const labels = [topLabel];

        // State and API.
        let currentMode: PropTechMode = mode;
        let explodedTarget = exploded ? 1 : 0;
        let explodedValue = explodedTarget;
        let currentSelected: number | null = selectedLevel;
        let hovered: number | null = null;
        const cameraOverview = new THREE.Vector3(42, 42, 54);
        const cameraExploded = new THREE.Vector3(55, 60, 72);
        const targetOverview = new THREE.Vector3(0, 16, 0);
        const targetExploded = new THREE.Vector3(0, 26, 0);

        const applyMode = (next: PropTechMode) => {
          currentMode = next;
          floorRecords.forEach(({ data, slabMat, bandMat }) => {
            const c = colorForMode(data, next);
            slabMat.color.copy(c).multiplyScalar(0.72);
            slabMat.emissive.copy(c);
            slabMat.emissiveIntensity = next === 'leasing' && data.status === 'vacant' ? 0.7 : 0.42;
            bandMat.color.copy(c);
          });
        };

        const applySelected = (level: number | null) => {
          currentSelected = level;
          const record = floorRecords.find((f) => f.data.level === level);
          selectionFrame.visible = !!record;
          selectedLabel.style.display = record ? 'block' : 'none';
          if (record) {
            selectionFrame.position.set(0, record.baseY + (floorRecords.indexOf(record) * 0.95 * explodedValue) + 0.14, 0);
            selectedLabel.innerHTML = `<div style="background:rgba(5,12,15,.94);border:1px solid rgba(83,240,190,.48);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8;box-shadow:0 10px 30px -12px #000;backdrop-filter:blur(10px)"><span style="color:#53f0be;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">● ${record.data.label.toUpperCase()}</span><div style="margin-top:2px;font-weight:500">${record.data.tenant} · ${record.data.occupancy}% occupied</div><div style="margin-top:1px;color:#9fb2b2;font-size:8px">HK$${record.data.rent} / sq ft · ${record.data.expiry}</div></div>`;
          }
          setHover(null);
        };

        const setHover = (level: number | null) => {
          if (hovered === level) return;
          hovered = level;
          floorRecords.forEach((f) => {
            f.group.scale.setScalar(f.data.level === level ? 1.008 : 1);
          });
          ctx.renderer.domElement.style.cursor = level ? 'pointer' : 'grab';
        };

        const api: PropTechApi = {
          setMode: applyMode,
          setExploded: (value) => {
            explodedTarget = value ? 1 : 0;
            ctx.setCamera(
              value ? cameraExploded : cameraOverview,
              value ? targetExploded : targetOverview,
            );
          },
          setSelected: applySelected,
        };
        apiRef.current = api;
        applyMode(mode);
        applySelected(selectedLevel);

        // Picking.
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        const updatePointer = (event: PointerEvent) => {
          const rect = ctx.renderer.domElement.getBoundingClientRect();
          pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        };
        const pick = () => {
          raycaster.setFromCamera(pointer, ctx.camera);
          const hit = raycaster.intersectObjects(floorPickables, false)[0];
          return hit ? (hit.object.userData.level as number) : null;
        };
        const handleMove = (event: PointerEvent) => { updatePointer(event); setHover(pick()); };
        const handleClick = (event: PointerEvent) => { updatePointer(event); onSelectRef.current(pick()); };
        ctx.renderer.domElement.addEventListener('pointermove', handleMove);
        ctx.renderer.domElement.addEventListener('pointerup', handleClick);
        ctx.addDispose(() => {
          ctx.renderer.domElement.removeEventListener('pointermove', handleMove);
          ctx.renderer.domElement.removeEventListener('pointerup', handleClick);
        });

        const projected = new THREE.Vector3();
        ctx.addUpdate((dt, elapsed) => {
          explodedValue += (explodedTarget - explodedValue) * Math.min(1, dt * 3.2);
          floorRecords.forEach((record, i) => {
            record.group.position.y = record.baseY + i * 0.95 * explodedValue;
          });
          const rec = floorRecords.find((f) => f.data.level === currentSelected);
          if (rec) {
            selectionFrame.position.y = rec.baseY + floorRecords.indexOf(rec) * 0.95 * explodedValue + 0.14;
            const p = new THREE.Vector3(0, selectionFrame.position.y + 1.0, 5.4).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            selectedLabel.style.transform = `translate(-50%,-100%) translate(${(p.x * 0.5 + 0.5) * width}px, ${(-p.y * 0.5 + 0.5) * height}px)`;
            selectedLabel.style.opacity = p.z < 1 && width > 620 ? '1' : '0';
          }
          lift.visible = explodedValue < 0.05;
          lift.position.y = 2.5 + ((Math.sin(elapsed * 0.25) + 1) / 2) * (PROPTECH_FLOORS.length * FLOOR_H - 2);
          people.forEach((dot, i) => {
            dot.visible = explodedValue < 0.05;
            dot.position.y += Math.sin(elapsed * 1.6 + i) * 0.0008;
          });
          labels.forEach(({ el, pos }) => {
            projected.copy(pos).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            el.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
            el.style.opacity = projected.z < 1 && width > 620 ? '1' : '0';
          });
        });
      }}
    />
  );
}
