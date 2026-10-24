import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import {
  BIM_ASSETS, BIM_CLASHES, BIM_DISCIPLINES,
  type BimDiscipline, type BimStage, type LodLevel, type BimClash, type BimAsset,
} from '../lib/bimData';

export type BimSelection =
  | { kind: 'clash'; clash: BimClash }
  | { kind: 'asset'; asset: BimAsset }
  | { kind: 'element'; id: string; discipline: string; level: string; type: string };

export interface BIMSceneProps {
  stage: BimStage;
  lod: LodLevel;
  filters: Record<BimDiscipline, boolean>;
  selected: BimSelection | null;
  autoRotate?: boolean;
  onSelect?: (selection: BimSelection | null) => void;
}

interface BimApi {
  setStage: (stage: BimStage) => void;
  setLod: (lod: LodLevel) => void;
  setFilters: (filters: Record<BimDiscipline, boolean>) => void;
  setSelected: (selection: BimSelection | null) => void;
}

const STAGE_ORDER: BimStage[] = ['mobilise', 'foundation', 'structure', 'mep', 'facade', 'handover'];
const FLOORS = 9;
const FLOOR_H = 3.0;
const W = 12;
const D = 9;
const ACCENT = 0x53f0be;
const MEP = 0x53f0be;
const FIRE = 0xff7088;
const ARCH = 0xa991ff;
const STRUCT = 0x76c9c9;
const AMBER = 0xf4bd72;

function edge(mesh: THREE.Mesh, color = 0x3f7f82, opacity = 0.32) {
  const e = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }),
  );
  mesh.add(e);
  return e;
}

function label(text: string, color: string, pos: [number, number, number], layer: HTMLDivElement) {
  const el = document.createElement('div');
  el.innerHTML = `<span style="display:inline-block;width:4px;height:4px;border-radius:99px;background:${color};box-shadow:0 0 8px ${color};margin-right:5px;vertical-align:1px"></span>${text}`;
  el.style.cssText = 'position:absolute;transform:translate(-50%,-100%);font-family:"JetBrains Mono Variable",monospace;font-size:7.5px;letter-spacing:.12em;color:rgba(222,242,241,.82);white-space:nowrap;padding:3px 6px;border:1px solid rgba(130,205,215,.16);border-radius:3px;background:rgba(4,11,14,.7);backdrop-filter:blur(3px);';
  layer.appendChild(el);
  return { el, pos: new THREE.Vector3(...pos) };
}

export function BIMScene({ stage, lod, filters, selected, autoRotate = false, onSelect }: BIMSceneProps) {
  const apiRef = useRef<BimApi | null>(null);
  const onSelectRef = useRef<(selection: BimSelection | null) => void>(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});

  useEffect(() => { apiRef.current?.setStage(stage); }, [stage]);
  useEffect(() => { apiRef.current?.setLod(lod); }, [lod]);
  useEffect(() => { apiRef.current?.setFilters(filters); }, [filters]);
  useEffect(() => { apiRef.current?.setSelected(selected); }, [selected]);

  return (
    <ThreeStage
      ariaLabel="Interactive construction site BIM coordination model with architecture, structure, MEP, fire protection, clashes, 4D sequence and COBie asset data."
      cameraPosition={[39, 31, 51]}
      target={[0, 12, 0]}
      fov={40}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.0055 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.16}
      build={(ctx) => {
        const scene = ctx.scene;
        const hemi = new THREE.HemisphereLight(0x9ed6d8, 0x050b0c, 0.85);
        scene.add(hemi);
        const key = new THREE.DirectionalLight(0xd8fbff, 1.7);
        key.position.set(-42, 72, 38);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x2ed4b2, 0.55);
        rim.position.set(48, 24, -40);
        scene.add(rim);
        const warm = new THREE.PointLight(0xffb36b, 18, 65, 2);
        warm.position.set(-12, 8, 12);
        scene.add(warm);

        const base = new THREE.Mesh(
          new THREE.BoxGeometry(78, 2.2, 58),
          new THREE.MeshStandardMaterial({ color: 0x050d10, metalness: 0.55, roughness: 0.7 }),
        );
        base.position.y = -1.3;
        scene.add(base);
        scene.add(new THREE.LineSegments(
          new THREE.EdgesGeometry(base.geometry),
          new THREE.LineBasicMaterial({ color: 0x1c4b52, transparent: true, opacity: 0.65 }),
        ));
        const ground = new THREE.Mesh(
          new THREE.PlaneGeometry(77, 57),
          new THREE.MeshStandardMaterial({ color: 0x081416, roughness: 0.88, metalness: 0.14 }),
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.05;
        scene.add(ground);
        const gridPts: THREE.Vector3[] = [];
        for (let x = -36; x <= 36; x += 4) gridPts.push(new THREE.Vector3(x, 0.01, -27), new THREE.Vector3(x, 0.01, 27));
        for (let z = -27; z <= 27; z += 4) gridPts.push(new THREE.Vector3(-36, 0.01, z), new THREE.Vector3(36, 0.01, z));
        scene.add(new THREE.LineSegments(
          new THREE.BufferGeometry().setFromPoints(gridPts),
          new THREE.LineBasicMaterial({ color: 0x14434a, transparent: true, opacity: 0.17 }),
        ));

        const concrete = new THREE.MeshStandardMaterial({ color: 0x9aa9a2, roughness: 0.72, metalness: 0.12 });
        const concreteDark = new THREE.MeshStandardMaterial({ color: 0x4d625f, roughness: 0.78, metalness: 0.12 });
        const steel = new THREE.MeshStandardMaterial({ color: 0x8fa7a0, metalness: 0.65, roughness: 0.38 });
        const glass = new THREE.MeshPhysicalMaterial({ color: 0x8adfd2, transparent: true, opacity: 0.24, roughness: 0.08, metalness: 0.2, side: THREE.DoubleSide, depthWrite: false });
        const mullionMat = new THREE.MeshStandardMaterial({ color: 0x3f7b75, metalness: 0.7, roughness: 0.32 });

        const structureGroup = new THREE.Group();
        const architectureGroup = new THREE.Group();
        const facadeGroup = new THREE.Group();
        const mepGroup = new THREE.Group();
        const fireGroup = new THREE.Group();
        const detailGroup = new THREE.Group();
        const siteGroup = new THREE.Group();
        const clashGroup = new THREE.Group();
        scene.add(structureGroup, architectureGroup, facadeGroup, mepGroup, fireGroup, detailGroup, siteGroup, clashGroup);

        const pickables: THREE.Mesh[] = [];
        const floorStructure: THREE.Group[] = [];
        const floorMep: THREE.Group[] = [];
        const floorFire: THREE.Group[] = [];
        const assetMeshes: Record<string, THREE.Mesh> = {};

        // Podium / foundation.
        const podium = new THREE.Mesh(new THREE.BoxGeometry(W + 2, 1.4, D + 2), concreteDark);
        podium.position.y = 0.7;
        edge(podium, 0x5f8883, 0.34);
        structureGroup.add(podium);
        const pileCap = new THREE.Mesh(new THREE.BoxGeometry(W + 3, 0.5, D + 3), concrete);
        pileCap.position.y = -0.1;
        structureGroup.add(pileCap);

        // Structure levels.
        const colXs = [-5.3, -2.1, 2.1, 5.3];
        const colZs = [-3.7, 0, 3.7];
        for (let f = 0; f < FLOORS; f++) {
          const floor = new THREE.Group();
          floor.position.y = f * FLOOR_H + 1.4;
          structureGroup.add(floor);
          floorStructure.push(floor);

          const slab = new THREE.Mesh(new THREE.BoxGeometry(W, 0.2, D), concrete);
          slab.position.y = 0.08;
          slab.userData.selection = { kind: 'element', id: `S-L${String(f + 1).padStart(2, '0')}-01`, discipline: 'Structure', level: `L${String(f + 1).padStart(2, '0')}`, type: 'Slab' };
          edge(slab, 0x7bb3aa, 0.35);
          floor.add(slab);
          pickables.push(slab);

          for (const x of colXs) {
            for (const z of colZs) {
              if (x === 0 && z === 0) continue;
              const col = new THREE.Mesh(new THREE.BoxGeometry(0.42, 2.85, 0.42), concrete);
              col.position.set(x, 1.48, z);
              col.userData.selection = { kind: 'element', id: `C-L${String(f + 1).padStart(2, '0')}-${Math.abs(x * 3 + z)}`, discipline: 'Structure', level: `L${String(f + 1).padStart(2, '0')}`, type: 'Column' };
              edge(col, 0x7cb1a8, 0.25);
              floor.add(col);
              pickables.push(col);
              if (f === 6 && x === -5.3 && z === -3.7) {
                col.userData.assetId = 'C-L07-04';
                assetMeshes['C-L07-04'] = col;
              }
            }
          }
          const beamMat = concrete;
          for (const z of [-4.45, 4.45]) {
            const beam = new THREE.Mesh(new THREE.BoxGeometry(W, 0.32, 0.24), beamMat);
            beam.position.set(0, 2.75, z);
            beam.userData.selection = { kind: 'element', id: `B-L${String(f + 1).padStart(2, '0')}-0${z < 0 ? 1 : 2}`, discipline: 'Structure', level: `L${String(f + 1).padStart(2, '0')}`, type: 'Beam' };
            floor.add(beam);
            pickables.push(beam);
          }
          for (const x of [-5.9, 5.9]) {
            const beam = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, D), beamMat);
            beam.position.set(x, 2.75, 0);
            floor.add(beam);
            pickables.push(beam);
          }
          const core = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.85, 3.2), concreteDark);
          core.position.set(0, 1.48, 0);
          edge(core, 0x5d928b, 0.32);
          floor.add(core);
        }

        // Architecture: core walls, partitions, façade.
        for (let f = 0; f < FLOORS; f++) {
          const archFloor = new THREE.Group();
          archFloor.position.y = f * FLOOR_H + 1.4;
          architectureGroup.add(archFloor);
          const coreWall = new THREE.Mesh(new THREE.BoxGeometry(3.25, 2.85, 3.25), new THREE.MeshStandardMaterial({ color: 0x6b7e80, transparent: true, opacity: 0.76, roughness: 0.7 }));
          coreWall.position.y = 1.45;
          archFloor.add(coreWall);
          for (const [x, z, w, d] of [[-4.2, -2.7, 0.1, 2.4], [4.2, 2.5, 0.1, 2.2], [-2.3, 3.3, 3.4, 0.1]] as const) {
            const wall = new THREE.Mesh(new THREE.BoxGeometry(w, 2.5, d), new THREE.MeshStandardMaterial({ color: 0x6e8380, transparent: true, opacity: 0.45, roughness: 0.8 }));
            wall.position.set(x, 1.3, z);
            archFloor.add(wall);
          }
          const facade = new THREE.Group();
          facade.position.y = f * FLOOR_H + 1.4;
          facadeGroup.add(facade);
          for (const [x, z, w, d] of [[0, -D / 2, W, 0.08], [0, D / 2, W, 0.08], [-W / 2, 0, 0.08, D], [W / 2, 0, 0.08, D]] as const) {
            const panel = new THREE.Mesh(new THREE.BoxGeometry(w, 2.8, d), glass);
            panel.position.set(x, 1.45, z);
            facade.add(panel);
            // Curtain-wall mullions make the envelope legible at construction scale.
            const verticals = w > d ? [-5.7, -2.85, 0, 2.85, 5.7] : [-3.9, -1.95, 0, 1.95, 3.9];
            for (const v of verticals) {
              const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.055, 2.8, 0.055), mullionMat);
              mullion.position.set(x + (w > d ? v : 0), 1.45, z + (w > d ? 0 : v));
              facade.add(mullion);
            }
            for (const y of [0.08, 2.82]) {
              const rail = new THREE.Mesh(new THREE.BoxGeometry(w > d ? w : 0.055, 0.06, w > d ? 0.055 : d), mullionMat);
              rail.position.set(x, y, z);
              facade.add(rail);
            }
          }
          if (f === 6) {
            const panel = facade.children[0];
            if (panel) {
              panel.userData.assetId = 'CW-L07-01';
              assetMeshes['CW-L07-01'] = panel as THREE.Mesh;
              pickables.push(panel as THREE.Mesh);
            }
          }
        }

        // MEP systems.
        const riserMat = new THREE.MeshStandardMaterial({ color: MEP, emissive: 0x1d8e75, emissiveIntensity: 0.45, metalness: 0.55, roughness: 0.36 });
        const ductMat = new THREE.MeshStandardMaterial({ color: 0x4dc7b8, metalness: 0.5, roughness: 0.32, emissive: 0x134c45, emissiveIntensity: 0.35 });
        const pipeMat = new THREE.MeshStandardMaterial({ color: 0xf0b35d, metalness: 0.5, roughness: 0.36, emissive: 0x4c2b0a, emissiveIntensity: 0.3 });
        const trayMat = new THREE.MeshStandardMaterial({ color: 0xa991ff, metalness: 0.5, roughness: 0.38, emissive: 0x2d1f5b, emissiveIntensity: 0.3 });
        for (let f = 0; f < FLOORS; f++) {
          const mepFloor = new THREE.Group();
          mepFloor.position.y = f * FLOOR_H + 1.4;
          mepGroup.add(mepFloor);
          floorMep.push(mepFloor);
          const duct = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.62, 0.95), ductMat);
          duct.position.set(0, 2.42, -4.0);
          duct.userData.selection = { kind: 'element', id: `SA-L${String(f + 1).padStart(2, '0')}`, discipline: 'MEP', level: `L${String(f + 1).padStart(2, '0')}`, type: 'Supply duct' };
          mepFloor.add(duct);
          pickables.push(duct);
          const chw = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 8.5, 7), pipeMat);
          chw.rotation.z = Math.PI / 2;
          chw.position.set(0, 2.25, 3.9);
          mepFloor.add(chw);
          const tray = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.12, 0.55), trayMat);
          tray.position.set(0, 2.55, 4.35);
          tray.userData.selection = { kind: 'element', id: `CT-L${String(f + 1).padStart(2, '0')}-03`, discipline: 'MEP', level: `L${String(f + 1).padStart(2, '0')}`, type: 'Cable tray' };
          mepFloor.add(tray);
          pickables.push(tray);
          if (f === 8) {
            tray.userData.assetId = 'CT-L09-03';
            assetMeshes['CT-L09-03'] = tray;
          }
          if (f === 6) {
            const ahu = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 1.2), new THREE.MeshStandardMaterial({ color: 0x395d58, metalness: 0.55, roughness: 0.4 }));
            ahu.position.set(-4.1, 1.1, 0.2);
            ahu.userData.assetId = 'AHU-07';
            assetMeshes['AHU-07'] = ahu;
            mepFloor.add(ahu);
            pickables.push(ahu);
            edge(ahu, 0x65a59a, 0.3);
          }
          if (f === 11) {
            // only 9 floors; kept for clarity
          }
        }
        // Vertical risers.
        for (const [x, z, color] of [[5.2, -4.15, MEP], [5.45, -4.15, 0x51d6ff], [5.7, -4.15, 0xa991ff]] as const) {
          const riser = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, FLOORS * FLOOR_H, 6), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.45, metalness: 0.5, roughness: 0.35 }));
          riser.position.set(x, (FLOORS * FLOOR_H) / 2 + 1.4, z);
          mepGroup.add(riser);
        }

        // Fire protection.
        const fireMat = new THREE.MeshStandardMaterial({ color: FIRE, emissive: 0x641b26, emissiveIntensity: 0.4, metalness: 0.45, roughness: 0.4 });
        for (let f = 0; f < FLOORS; f++) {
          const fireFloor = new THREE.Group();
          fireFloor.position.y = f * FLOOR_H + 1.4;
          fireGroup.add(fireFloor);
          floorFire.push(fireFloor);
          const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 9.5, 6), fireMat);
          pipe.rotation.z = Math.PI / 2;
          pipe.position.set(0, 2.65, 4.15);
          fireFloor.add(pipe);
          for (let i = 0; i < 4; i++) {
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), fireMat);
            head.position.set(-3.5 + i * 2.3, 2.58, 4.15);
            fireFloor.add(head);
            if (f === 6 && i === 0) head.userData.assetId = 'SPR-L07-04';
            if (f === 6 && i === 0) assetMeshes['SPR-L07-04'] = head as THREE.Mesh;
            pickables.push(head as THREE.Mesh);
          }
        }
        const fireRiser = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, FLOORS * FLOOR_H, 7), fireMat);
        fireRiser.position.set(-5.3, (FLOORS * FLOOR_H) / 2 + 1.4, -4.15);
        fireRiser.userData.assetId = 'FP-RISER-02';
        assetMeshes['FP-RISER-02'] = fireRiser;
        fireGroup.add(fireRiser);
        pickables.push(fireRiser);

        // Detailed COBie assets / LOD 500.
        for (let f = 0; f < FLOORS; f++) {
          if (f === 11) continue;
        }
        for (const asset of BIM_ASSETS) {
          const floor = Number(asset.level.replace(/\D/g, '')) || 1;
          const y = Math.max(1, (floor - 1) * FLOOR_H + 2.2);
          const tag = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.24, 0.05), new THREE.MeshBasicMaterial({ color: 0x8dffe3 }));
          tag.position.set(4.4, y, -3.9);
          tag.userData.assetId = asset.id;
          detailGroup.add(tag);
          if (!assetMeshes[asset.id]) assetMeshes[asset.id] = tag;
          pickables.push(tag);
        }

        // Roof plant and service risers.
        const roofPlant = new THREE.Group();
        for (let i = 0; i < 3; i++) {
          const unit = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 1.6), new THREE.MeshStandardMaterial({ color: 0x3b5f59, metalness: 0.55, roughness: 0.4 }));
          unit.position.set(-3.4 + i * 3.1, FLOORS * FLOOR_H + 2.0, -1.8);
          roofPlant.add(unit);
          edge(unit, 0x64a99c, 0.3);
          const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.08, 14), new THREE.MeshStandardMaterial({ color: 0x1a2829, metalness: 0.6, roughness: 0.35 }));
          fan.rotation.x = Math.PI / 2;
          fan.position.set(-3.4 + i * 3.1, FLOORS * FLOOR_H + 2.52, -1.8);
          roofPlant.add(fan);
        }
        mepGroup.add(roofPlant);
        const roofChiller = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 3.0, 18), new THREE.MeshStandardMaterial({ color: 0x5c7773, metalness: 0.55, roughness: 0.42 }));
        roofChiller.rotation.z = Math.PI / 2;
        roofChiller.position.set(2.6, FLOORS * FLOOR_H + 1.6, 2.6);
        mepGroup.add(roofChiller);

        // Site context.
        const siteMat = new THREE.MeshStandardMaterial({ color: 0x172b2c, metalness: 0.5, roughness: 0.55 });
        for (let i = 0; i < 3; i++) {
          const office = new THREE.Mesh(new THREE.BoxGeometry(7, 2.2, 3.2), i === 1 ? siteMat : new THREE.MeshStandardMaterial({ color: 0xbfcbc4, roughness: 0.65 }));
          office.position.set(-24 + (i % 2) * 1.5, 1.2 + i * 2.3, -17);
          edge(office, 0x7c9e94, 0.3);
          siteGroup.add(office);
        }
        const crane = new THREE.Group();
        crane.position.set(-18, 0, -22);
        const craneMat = new THREE.MeshStandardMaterial({ color: 0xe0a84f, metalness: 0.55, roughness: 0.42, emissive: 0x4c2b08, emissiveIntensity: 0.3 });
        const craneMast = new THREE.Mesh(new THREE.BoxGeometry(0.5, 38, 0.5), craneMat);
        craneMast.position.y = 19;
        crane.add(craneMast);
        const jib = new THREE.Mesh(new THREE.BoxGeometry(17, 0.22, 0.25), craneMat);
        jib.position.set(6, 37, 0);
        crane.add(jib);
        const counter = new THREE.Mesh(new THREE.BoxGeometry(5, 0.25, 0.3), craneMat);
        counter.position.set(-4, 37, 0);
        crane.add(counter);
        const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 9, 4), new THREE.MeshBasicMaterial({ color: 0xc5d8d4, transparent: true, opacity: 0.5 }));
        cable.position.set(9, 32, 0);
        crane.add(cable);
        siteGroup.add(crane);
        const laydown = new THREE.Group();
        for (let i = 0; i < 6; i++) {
          const p = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.3, 1.2), new THREE.MeshStandardMaterial({ color: i % 2 ? 0x8b6d48 : 0x687b70, roughness: 0.8 }));
          p.position.set(20 + (i % 3) * 3.5, 0.2, 7 + Math.floor(i / 3) * 1.8);
          laydown.add(p);
        }
        siteGroup.add(laydown);
        const fenceMat = new THREE.MeshBasicMaterial({ color: 0x3e8d83, transparent: true, opacity: 0.3 });
        for (const z of [-26, 26]) {
          const rail = new THREE.Mesh(new THREE.BoxGeometry(70, 0.05, 0.05), fenceMat);
          rail.position.set(0, 2, z);
          siteGroup.add(rail);
        }

        // Clash markers.
        const clashMarkers: THREE.Mesh[] = [];
        for (const clash of BIM_CLASHES) {
          const marker = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.5, 0),
            new THREE.MeshBasicMaterial({ color: clash.status === 'Resolved' ? 0x53f0be : clash.severity === 'High' ? 0xff7088 : 0xf4bd72, transparent: true, opacity: 0.9 }),
          );
          marker.position.set(...clash.position);
          marker.userData.clashId = clash.id;
          clashGroup.add(marker);
          clashMarkers.push(marker);
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(0.85, 0.95, 24),
            new THREE.MeshBasicMaterial({ color: clash.status === 'Resolved' ? 0x53f0be : 0xff7088, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false }),
          );
          ring.rotation.x = -Math.PI / 2;
          ring.position.copy(marker.position);
          clashGroup.add(ring);
        }

        // Selection ring + label.
        const selRing = new THREE.Mesh(
          new THREE.RingGeometry(1.2, 1.34, 40),
          new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }),
        );
        selRing.rotation.x = -Math.PI / 2;
        selRing.visible = false;
        scene.add(selRing);
        const selectedLabel = document.createElement('div');
        selectedLabel.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(selectedLabel);
        const staticLabels = [
          label('COBie · ASSET DATA', '#a991ff', [0, 30.8, 0], ctx.labelLayer),
        ];

        let currentStage: BimStage = stage;
        let currentLod: LodLevel = lod;
        let currentFilters = filters;
        let currentSelected = selected;
        let hovered: string | null = null;
        const lodDetail = detailGroup;

        const stageIndex = () => STAGE_ORDER.indexOf(currentStage);
        const updateVisibility = () => {
          const si = stageIndex();
          const floors = si === 0 ? 0 : si === 1 ? 1 : si === 2 ? 7 : 9;
          floorStructure.forEach((f, i) => { f.visible = i < floors; });
          floorMep.forEach((f, i) => { f.visible = currentFilters.mep && si >= 3 && i < floors; });
          floorFire.forEach((f, i) => { f.visible = currentFilters.fire && si >= 3 && i < floors; });
          facadeGroup.visible = currentFilters.architecture && si >= 4;
          architectureGroup.visible = currentFilters.architecture && si >= 2 && currentLod !== 200;
          structureGroup.visible = currentFilters.structure;
          mepGroup.visible = currentFilters.mep && si >= 3;
          fireGroup.visible = currentFilters.fire && si >= 3;
          siteGroup.visible = currentFilters.site;
          clashGroup.visible = currentFilters.clashes;
          lodDetail.visible = currentLod === 500;
          clashMarkers.forEach((m) => { m.visible = currentFilters.clashes; });
        };

        const applySelection = (next: BimSelection | null) => {
          currentSelected = next;
          const pos = next?.kind === 'clash' ? next.clash.position : next?.kind === 'asset' ? [0, 0, 0] as [number, number, number] : null;
          selRing.visible = !!pos;
          selectedLabel.style.display = pos ? 'block' : 'none';
          if (next?.kind === 'clash') {
            selRing.position.set(next.clash.position[0], 0.15, next.clash.position[2]);
            selectedLabel.innerHTML = `<div style="background:rgba(4,10,12,.95);border:1px solid rgba(255,112,136,.55);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:#ff7088;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${next.clash.id} · ${next.clash.severity.toUpperCase()}</span><div style="margin-top:2px;font-weight:500">${next.clash.title}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${next.clash.left} ↔ ${next.clash.right}</div></div>`;
          } else if (next?.kind === 'asset') {
            selRing.position.set(4.4, 0.15, -3.9);
            selectedLabel.innerHTML = `<div style="background:rgba(4,10,12,.95);border:1px solid rgba(83,240,190,.5);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:#53f0be;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${next.asset.id} · COBie</span><div style="margin-top:2px;font-weight:500">${next.asset.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${next.asset.manufacturer} · ${next.asset.level}</div></div>`;
          } else if (next?.kind === 'element') {
            selRing.position.set(0, 0.15, 0);
            selectedLabel.innerHTML = `<div style="background:rgba(4,10,12,.95);border:1px solid rgba(81,214,255,.5);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:#51d6ff;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${next.id} · ${next.discipline.toUpperCase()}</span><div style="margin-top:2px;font-weight:500">${next.type} · ${next.level}</div></div>`;
          }
          setHover(null);
        };

        const setHover = (id: string | null) => {
          if (hovered === id) return;
          hovered = id;
          ctx.renderer.domElement.style.cursor = id ? 'pointer' : 'grab';
        };

        const api: BimApi = {
          setStage: (value) => { currentStage = value; updateVisibility(); },
          setLod: (value) => { currentLod = value; updateVisibility(); },
          setFilters: (value) => { currentFilters = value; updateVisibility(); },
          setSelected: (value) => { applySelection(value); },
        };
        apiRef.current = api;
        updateVisibility();
        applySelection(selected);

        // Picking.
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        const updatePointer = (event: PointerEvent) => {
          const rect = ctx.renderer.domElement.getBoundingClientRect();
          pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        };
        const pick = (): BimSelection | null => {
          raycaster.setFromCamera(pointer, ctx.camera);
          const hits = raycaster.intersectObjects([...pickables, ...clashMarkers], false);
          for (const hit of hits) {
            const obj = hit.object;
            if (obj.userData.clashId) {
              const clash = BIM_CLASHES.find((c) => c.id === obj.userData.clashId);
              if (clash) return { kind: 'clash', clash };
            }
            if (obj.userData.assetId) {
              const asset = BIM_ASSETS.find((a) => a.id === obj.userData.assetId);
              if (asset) return { kind: 'asset', asset };
            }
            if (obj.userData.selection) return obj.userData.selection as BimSelection;
          }
          return null;
        };
        const move = (event: PointerEvent) => {
          updatePointer(event);
          setHover(pick() ? 'hover' : null);
        };
        const click = (event: PointerEvent) => { updatePointer(event); onSelectRef.current(pick()); };
        ctx.renderer.domElement.addEventListener('pointermove', move);
        ctx.renderer.domElement.addEventListener('pointerup', click);
        ctx.addDispose(() => {
          ctx.renderer.domElement.removeEventListener('pointermove', move);
          ctx.renderer.domElement.removeEventListener('pointerup', click);
        });

        const projected = new THREE.Vector3();
        ctx.addUpdate((dt, elapsed) => {
          clashMarkers.forEach((m, i) => {
            m.rotation.y += dt * 0.8;
            m.scale.setScalar(1 + Math.sin(elapsed * 2 + i) * 0.12);
          });
          if (selRing.visible) selRing.rotation.z += dt * 0.5;
          jib.rotation.y = Math.sin(elapsed * 0.12) * 0.5;
          staticLabels.forEach(({ el, pos }) => {
            projected.copy(pos).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            el.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
            el.style.opacity = projected.z < 1 && width > 700 ? '1' : '0';
          });
          if (currentSelected?.kind === 'clash') {
            const p = new THREE.Vector3(...currentSelected.clash.position);
            p.y += 1.2;
            projected.copy(p).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            selectedLabel.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
          } else if (currentSelected?.kind === 'asset') {
            projected.set(4.4, 4, -3.9).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            selectedLabel.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
          }
        });
      }}
    />
  );
}
