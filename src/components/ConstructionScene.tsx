import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage, type StageContext } from './ThreeStage';
import type { ConstructionLayerId } from '../lib/platformData';

export interface ConstructionSceneProps {
  progress: number;
  layers: Record<ConstructionLayerId, boolean>;
  autoRotate?: boolean;
}

interface ConstructionApi {
  setProgress: (value: number) => void;
  setLayers: (layers: Record<ConstructionLayerId, boolean>) => void;
  resetView: () => void;
}

const ACCENT = 0x53f0be;
const AMBER = 0xf4bd72;
const ROSE = 0xff7088;
const CYAN = 0x51d6ff;

function edge(mesh: THREE.Mesh, color = 0x2f6769, opacity = 0.45) {
  const e = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }),
  );
  mesh.add(e);
  return e;
}

function signTexture(title: string, subtitle: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#071215';
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = 'rgba(83,240,190,.55)';
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, 492, 236);
  ctx.fillStyle = '#53f0be';
  ctx.font = '600 26px "Space Grotesk", sans-serif';
  ctx.fillText('OPHYLLA  /  SITE CONTROL', 32, 58);
  ctx.fillStyle = '#f4efe4';
  ctx.font = '600 38px "Space Grotesk", sans-serif';
  ctx.fillText(title, 32, 122);
  ctx.fillStyle = '#8fa8a0';
  ctx.font = '500 20px "JetBrains Mono", monospace';
  ctx.fillText(subtitle, 32, 168);
  ctx.fillStyle = 'rgba(83,240,190,.8)';
  ctx.fillRect(32, 196, 150, 4);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function ConstructionScene({ progress, layers, autoRotate = true }: ConstructionSceneProps) {
  const apiRef = useRef<ConstructionApi | null>(null);

  useEffect(() => {
    apiRef.current?.setProgress(progress);
  }, [progress]);
  useEffect(() => {
    apiRef.current?.setLayers(layers);
  }, [layers]);

  return (
    <ThreeStage
      ariaLabel="Interactive 3D construction site twin showing the tower crane, structural frame, excavation, safety zones and drone scan."
      cameraPosition={[60, 46, 76]}
      target={[0, 11, 0]}
      fov={40}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.006 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.22}
      build={(ctx) => {
        const scene = ctx.scene;
        const hemi = new THREE.HemisphereLight(0x9bd8d2, 0x07100f, 0.9);
        scene.add(hemi);
        const key = new THREE.DirectionalLight(0xd8fbff, 1.8);
        key.position.set(-38, 62, 34);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x3bd0a8, 0.55);
        rim.position.set(48, 26, -30);
        scene.add(rim);
        const warm = new THREE.PointLight(0xffb86a, 24, 60, 2);
        warm.position.set(-18, 8, 8);
        scene.add(warm);

        const baseGeo = new THREE.BoxGeometry(84, 2.2, 64);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x050d10, metalness: 0.55, roughness: 0.72 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = -1.25;
        scene.add(base);
        const baseEdge = new THREE.LineSegments(
          new THREE.EdgesGeometry(baseGeo),
          new THREE.LineBasicMaterial({ color: 0x1a4448, transparent: true, opacity: 0.7 }),
        );
        baseEdge.position.y = -1.25;
        scene.add(baseEdge);

        const ground = new THREE.Mesh(
          new THREE.PlaneGeometry(83, 63),
          new THREE.MeshStandardMaterial({ color: 0x0a1715, roughness: 0.88, metalness: 0.15 }),
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.08;
        scene.add(ground);

        const gridPts: THREE.Vector3[] = [];
        for (let x = -40; x <= 40; x += 4) gridPts.push(new THREE.Vector3(x, 0.01, -30), new THREE.Vector3(x, 0.01, 30));
        for (let z = -30; z <= 30; z += 4) gridPts.push(new THREE.Vector3(-40, 0.01, z), new THREE.Vector3(40, 0.01, z));
        scene.add(new THREE.LineSegments(
          new THREE.BufferGeometry().setFromPoints(gridPts),
          new THREE.LineBasicMaterial({ color: 0x114449, transparent: true, opacity: 0.18 }),
        ));

        // Site perimeter and gate.
        const fenceMat = new THREE.MeshStandardMaterial({ color: 0x18323a, metalness: 0.55, roughness: 0.55 });
        const fenceRailMat = new THREE.MeshBasicMaterial({ color: 0x2f7e7c, transparent: true, opacity: 0.36 });
        for (let x = -40; x <= 40; x += 4) {
          for (const z of [-30, 30]) {
            if (z === 30 && x > 2 && x < 10) continue;
            const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.1, 0.1), fenceMat);
            post.position.set(x, 1.0, z);
            scene.add(post);
          }
        }
        for (let z = -30; z <= 30; z += 4) {
          for (const x of [-40, 40]) {
            const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.1, 0.1), fenceMat);
            post.position.set(x, 1.0, z);
            scene.add(post);
          }
        }
        for (const z of [-30, 30]) {
          const rail = new THREE.Mesh(new THREE.BoxGeometry(80, 0.06, 0.06), fenceRailMat);
          rail.position.set(0, 1.9, z);
          scene.add(rail);
        }
        for (const x of [-40, 40]) {
          const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 60), fenceRailMat);
          rail.position.set(x, 1.9, 0);
          scene.add(rail);
        }
        const gateSign = new THREE.Mesh(
          new THREE.PlaneGeometry(10, 5),
          new THREE.MeshBasicMaterial({ map: signTexture('KAI TAK TOWER II', 'SITE 02  ·  GATE 3  ·  IFC 4.3') }),
        );
        gateSign.position.set(25, 3.1, 29.9);
        gateSign.rotation.y = 0;
        scene.add(gateSign);

        // Access road and marshalling.
        const roadMat = new THREE.MeshStandardMaterial({ color: 0x0b1b1e, roughness: 0.62, metalness: 0.3 });
        const road = new THREE.Mesh(new THREE.BoxGeometry(82, 0.04, 6), roadMat);
        road.position.set(0, 0.015, 24.5);
        scene.add(road);
        const roadLineMat = new THREE.MeshBasicMaterial({ color: 0x2b7776, transparent: true, opacity: 0.42 });
        for (let x = -38; x < 40; x += 4) {
          const line = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.02, 0.08), roadLineMat);
          line.position.set(x, 0.05, 24.5);
          scene.add(line);
        }

        // Site objects -----------------------------------------------------
        const offices = new THREE.Group();
        const officeMat = new THREE.MeshStandardMaterial({ color: 0xd3ddd6, roughness: 0.6, metalness: 0.2 });
        const officeDark = new THREE.MeshStandardMaterial({ color: 0x1b3033, roughness: 0.7 });
        for (let i = 0; i < 3; i++) {
          const container = new THREE.Mesh(new THREE.BoxGeometry(8, 2.3, 3.6), i === 1 ? officeDark : officeMat);
          container.position.set(-27 + (i % 2) * 1.2, 1.25 + i * 2.4, -22);
          edge(container, 0x6c9c92, 0.3);
          offices.add(container);
          const windows = new THREE.Mesh(
            new THREE.BoxGeometry(7.2, 0.42, 0.04),
            new THREE.MeshBasicMaterial({ color: i === 1 ? 0xf4bd72 : 0x5ad8c2, transparent: true, opacity: 0.7 }),
          );
          windows.position.set(container.position.x, container.position.y + 0.3, -20.18);
          offices.add(windows);
        }
        scene.add(offices);

        const laydown = new THREE.Group();
        const pipeMat = new THREE.MeshStandardMaterial({ color: 0x6e817e, metalness: 0.6, roughness: 0.4 });
        for (let i = 0; i < 12; i++) {
          const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 7.5, 7), pipeMat);
          pipe.rotation.z = Math.PI / 2;
          pipe.position.set(24 + (i % 3) * 0.62, 0.3 + Math.floor(i / 3) * 0.46, 8);
          laydown.add(pipe);
        }
        for (let i = 0; i < 8; i++) {
          const pallet = new THREE.Mesh(
            new THREE.BoxGeometry(2.2, 0.7, 1.5),
            new THREE.MeshStandardMaterial({ color: i % 2 ? 0x9b8059 : 0x5f6f66, roughness: 0.85 }),
          );
          pallet.position.set(20 + (i % 4) * 2.6, 0.36, 15.5 + Math.floor(i / 4) * 2);
          laydown.add(pallet);
        }
        scene.add(laydown);

        const materialPile = new THREE.Group();
        for (let i = 0; i < 5; i++) {
          const pile = new THREE.Mesh(
            new THREE.ConeGeometry(1.4 + i * 0.16, 1.2, 9),
            new THREE.MeshStandardMaterial({ color: i % 2 ? 0x5b513f : 0x494f42, roughness: 0.98 }),
          );
          pile.position.set(-17 + i * 2.1, 0.55, 12 + (i % 2) * 1.4);
          materialPile.add(pile);
        }
        scene.add(materialPile);

        // Excavation.
        const excavation = new THREE.Group();
        const pit = new THREE.Mesh(
          new THREE.BoxGeometry(21, 1.6, 16),
          new THREE.MeshStandardMaterial({ color: 0x120e0a, roughness: 0.98 }),
        );
        pit.position.y = 0.7;
        excavation.add(pit);
        const pitEdge = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(21, 0.1, 16)),
          new THREE.LineBasicMaterial({ color: AMBER, transparent: true, opacity: 0.55 }),
        );
        pitEdge.position.y = 1.52;
        excavation.add(pitEdge);
        for (const [x, z, rot] of [[-10.5, 0, 0], [10.5, 0, 0], [0, -8, Math.PI / 2], [0, 8, Math.PI / 2]] as const) {
          const slope = new THREE.Mesh(
            new THREE.BoxGeometry(21, 0.1, 2.8),
            new THREE.MeshStandardMaterial({ color: 0x3a2d22, roughness: 1 }),
          );
          slope.position.set(x, 0.2, z);
          slope.rotation.z = x === 0 ? 0 : x < 0 ? -0.18 : 0.18;
          slope.rotation.x = x === 0 ? (z < 0 ? 0.18 : -0.18) : 0;
          slope.rotation.y = rot;
          excavation.add(slope);
        }
        scene.add(excavation);

        // Tower under construction.
        const tower = new THREE.Group();
        scene.add(tower);
        const floorGroups: THREE.Group[] = [];
        const floorMaterials: THREE.MeshStandardMaterial[] = [];
        const envelopePanels: THREE.Object3D[] = [];
        const fitoutGroup = new THREE.Group();
        scene.add(fitoutGroup);
        const scaffoldGroup = new THREE.Group();
        scene.add(scaffoldGroup);

        const concrete = new THREE.MeshStandardMaterial({ color: 0x9caaa4, roughness: 0.72, metalness: 0.1 });
        const concreteDark = new THREE.MeshStandardMaterial({ color: 0x52635f, roughness: 0.8 });
        const glass = new THREE.MeshPhysicalMaterial({
          color: 0x8adfd2, transparent: true, opacity: 0.2, metalness: 0.15, roughness: 0.08, side: THREE.DoubleSide, depthWrite: false,
        });
        const fitoutMat = new THREE.MeshStandardMaterial({ color: 0xbc9c73, roughness: 0.7, emissive: 0x4a2b12, emissiveIntensity: 0.4 });
        const fitoutMat2 = new THREE.MeshStandardMaterial({ color: 0x33494b, roughness: 0.7 });
        const scaffoldMat = new THREE.MeshStandardMaterial({ color: 0xc0a45d, metalness: 0.55, roughness: 0.45 });

        const floorH = 3.05;
        const footprintX = 14;
        const footprintZ = 10;
        for (let f = 0; f < 12; f++) {
          const floor = new THREE.Group();
          floor.position.y = f * floorH;
          floor.userData.floor = f;
          tower.add(floor);
          floorGroups.push(floor);

          const slabMat = new THREE.MeshStandardMaterial({
            color: f < 7 ? 0x8fa59d : f === 7 ? 0xb4a06e : 0x74867f,
            emissive: f < 7 ? 0x1f5f52 : f === 7 ? 0x6b4917 : 0x1c2b2b,
            emissiveIntensity: 0.34,
            roughness: 0.7,
            metalness: 0.22,
          });
          floorMaterials.push(slabMat);
          const slab = new THREE.Mesh(new THREE.BoxGeometry(footprintX, 0.2, footprintZ), slabMat);
          slab.position.y = 0.1;
          edge(slab, 0x88c9bc, 0.5);
          floor.add(slab);

          const core = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.9, 3.4), concreteDark);
          core.position.y = 1.45;
          edge(core, 0x4d8e84, 0.35);
          floor.add(core);

          const colPositions = [
            [-6.1, -4.2], [6.1, -4.2], [-6.1, 4.2], [6.1, 4.2],
            [-2.4, -4.4], [2.4, -4.4], [-2.4, 4.4], [2.4, 4.4],
          ];
          colPositions.forEach(([x, z]) => {
            const col = new THREE.Mesh(new THREE.BoxGeometry(0.42, 2.85, 0.42), concrete);
            col.position.set(x, 1.42, z);
            edge(col, 0x7caa9e, 0.28);
            floor.add(col);
          });

          const beamGeoX = new THREE.BoxGeometry(footprintX, 0.34, 0.28);
          const beamGeoZ = new THREE.BoxGeometry(0.28, 0.34, footprintZ);
          for (const z of [-4.95, 4.95]) {
            const beam = new THREE.Mesh(beamGeoX, concrete);
            beam.position.set(0, 2.72, z);
            floor.add(beam);
          }
          for (const x of [-6.85, 6.85]) {
            const beam = new THREE.Mesh(beamGeoZ, concrete);
            beam.position.set(x, 2.72, 0);
            floor.add(beam);
          }

          // Unitised envelope panels.
          if (f > 1) {
            const panelFront = new THREE.Mesh(new THREE.BoxGeometry(footprintX, 2.7, 0.07), glass);
            panelFront.position.set(0, 1.55, footprintZ / 2 + 0.05);
            floor.add(panelFront);
            envelopePanels.push(panelFront);
            const panelBack = panelFront.clone();
            panelBack.position.z = -footprintZ / 2 - 0.05;
            floor.add(panelBack);
            envelopePanels.push(panelBack);
            const panelSide = new THREE.Mesh(new THREE.BoxGeometry(0.07, 2.7, footprintZ), glass);
            panelSide.position.set(footprintX / 2 + 0.05, 1.55, 0);
            floor.add(panelSide);
            envelopePanels.push(panelSide);
            const panelSide2 = panelSide.clone();
            panelSide2.position.x = -footprintX / 2 - 0.05;
            floor.add(panelSide2);
            envelopePanels.push(panelSide2);
          }

          // Fit-out islands.
          for (let i = 0; i < 4; i++) {
            const desk = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.28, 0.9), i % 2 ? fitoutMat : fitoutMat2);
            desk.position.set(-4.2 + i * 2.7, f * floorH + 0.52, -2.2 + (i % 2) * 4.4);
            desk.visible = false;
            fitoutGroup.add(desk);
            desk.userData.floor = f;
          }

          // Perimeter scaffold at the active work fronts.
          if (f > 1 && f < 10) {
            const sgroup = new THREE.Group();
            for (const [sx, sz] of [[-7.4, -5.4], [7.4, -5.4], [-7.4, 5.4], [7.4, 5.4]]) {
              const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.0, 0.08), scaffoldMat);
              post.position.set(sx, 1.5, sz);
              sgroup.add(post);
            }
            for (const y of [0.8, 2.2]) {
              const rail = new THREE.Mesh(new THREE.BoxGeometry(15, 0.06, 0.06), scaffoldMat);
              rail.position.set(0, y, -5.4);
              sgroup.add(rail);
              const rail2 = rail.clone();
              rail2.position.z = 5.4;
              sgroup.add(rail2);
            }
            for (const [x, z] of [[-7.4, 0], [7.4, 0]]) {
              const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 11), scaffoldMat);
              rail.position.set(x, 2.2, z);
              sgroup.add(rail);
            }
            sgroup.position.y = f * floorH;
            scaffoldGroup.add(sgroup);
          }
        }

        // BIM level overlay: the planned structural grid remains visible
        // independently of physical progress.
        const bimGroup = new THREE.Group();
        for (let f = 0; f < 12; f++) {
          const box = new THREE.BoxGeometry(footprintX + 0.5, 0.02, footprintZ + 0.5);
          const outline = new THREE.LineSegments(
            new THREE.EdgesGeometry(box),
            new THREE.LineBasicMaterial({ color: 0x51d6ff, transparent: true, opacity: 0.18, depthWrite: false }),
          );
          outline.position.y = f * floorH + 0.13;
          bimGroup.add(outline);
          box.dispose();
        }
        scene.add(bimGroup);

        // Core jump-form cap.
        const jumpForm = new THREE.Mesh(
          new THREE.BoxGeometry(5.4, 1.0, 4.2),
          new THREE.MeshStandardMaterial({ color: 0x354a49, metalness: 0.6, roughness: 0.4, emissive: 0x1a3e3a, emissiveIntensity: 0.3 }),
        );
        jumpForm.position.y = 12 * floorH + 0.6;
        tower.add(jumpForm);
        edge(jumpForm, 0x5ba89a, 0.45);

        // Tower crane.
        const crane = new THREE.Group();
        crane.position.set(16, 0, -9);
        const craneSteel = new THREE.MeshStandardMaterial({ color: 0xe1a84f, metalness: 0.55, roughness: 0.44, emissive: 0x5c340a, emissiveIntensity: 0.32 });
        const craneDark = new THREE.MeshStandardMaterial({ color: 0x182326, metalness: 0.55, roughness: 0.5 });
        const mast = new THREE.Mesh(new THREE.BoxGeometry(0.55, 33, 0.55), craneSteel);
        mast.position.y = 16.5;
        crane.add(mast);
        for (let y = 2; y < 33; y += 2.2) {
          const brace = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 1.2), craneSteel);
          brace.position.set(0, y, 0);
          brace.rotation.x = y % 4.4 === 0 ? 0.75 : -0.75;
          crane.add(brace);
        }
        const slew = new THREE.Group();
        slew.position.y = 33;
        crane.add(slew);
        const cab = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.0, 2.2), craneDark);
        cab.position.set(1.1, 0.8, 0);
        slew.add(cab);
        const cabGlass = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 0.04), new THREE.MeshBasicMaterial({ color: 0x79d9ce, transparent: true, opacity: 0.7 }));
        cabGlass.position.set(1.1, 1.05, 1.12);
        slew.add(cabGlass);
        const jib = new THREE.Mesh(new THREE.BoxGeometry(24, 0.28, 0.38), craneSteel);
        jib.position.set(9, 1.6, 0);
        slew.add(jib);
        const counterJib = new THREE.Mesh(new THREE.BoxGeometry(7, 0.3, 0.4), craneSteel);
        counterJib.position.set(-4.4, 1.6, 0);
        slew.add(counterJib);
        const counterweight = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.3, 1.0), craneDark);
        counterweight.position.set(-7.2, 0.9, 0);
        slew.add(counterweight);
        const trolley = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.28, 0.7), craneSteel);
        trolley.position.set(14, 1.45, 0);
        slew.add(trolley);
        const cable = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.025, 10, 4),
          new THREE.MeshBasicMaterial({ color: 0xc5d8d4, transparent: true, opacity: 0.55 }),
        );
        cable.position.set(14, -3.5, 0);
        slew.add(cable);
        const hook = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.4), craneSteel);
        hook.position.set(14, -8.6, 0);
        slew.add(hook);
        const craneLight = new THREE.PointLight(0xffb45e, 16, 26, 2);
        craneLight.position.set(14, 0, 0);
        slew.add(craneLight);
        scene.add(crane);

        // Excavator.
        const excavator = new THREE.Group();
        excavator.position.set(-15, 0, 7);
        excavator.rotation.y = -0.4;
        const trackMat = new THREE.MeshStandardMaterial({ color: 0x202a2b, roughness: 0.9 });
        for (const z of [-1.2, 1.2]) {
          const track = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.6, 0.8), trackMat);
          track.position.set(0, 0.4, z);
          excavator.add(track);
        }
        const body = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.5, 2.6), new THREE.MeshStandardMaterial({ color: 0xd8a347, metalness: 0.4, roughness: 0.55 }));
        body.position.y = 1.3;
        edge(body, 0x5f4515, 0.3);
        excavator.add(body);
        const excavatorCab = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.6, 1.6), new THREE.MeshStandardMaterial({ color: 0x263b3b, metalness: 0.5, roughness: 0.4 }));
        excavatorCab.position.set(-0.7, 2.2, 0.5);
        excavator.add(excavatorCab);
        const boom = new THREE.Group();
        boom.position.set(1.6, 1.9, 0);
        const boomArm = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.45, 0.55), new THREE.MeshStandardMaterial({ color: 0xd8a347, roughness: 0.6 }));
        boomArm.position.set(2.1, 0.6, 0);
        boomArm.rotation.z = 0.5;
        boom.add(boomArm);
        const dipper = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.35, 0.45), new THREE.MeshStandardMaterial({ color: 0xe2b35a, roughness: 0.55 }));
        dipper.position.set(4.3, -0.1, 0);
        dipper.rotation.z = -0.85;
        boom.add(dipper);
        const bucket = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 1.2), new THREE.MeshStandardMaterial({ color: 0x454d48, roughness: 0.7 }));
        bucket.position.set(6.1, -1.2, 0);
        boom.add(bucket);
        excavator.add(boom);
        scene.add(excavator);

        // Trucks on the access road.
        const trucks: Array<{ group: THREE.Group; offset: number; dir: 1 | -1 }> = [];
        for (let i = 0; i < 2; i++) {
          const truck = new THREE.Group();
          const body = new THREE.Mesh(new THREE.BoxGeometry(6, 2.4, 2.5), new THREE.MeshStandardMaterial({ color: i ? 0x8aa49b : 0xb97845, metalness: 0.4, roughness: 0.6 }));
          body.position.y = 1.4;
          truck.add(body);
          const cab = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.1, 2.3), new THREE.MeshStandardMaterial({ color: 0xd7e4dd, metalness: 0.4, roughness: 0.42 }));
          cab.position.set(3.7, 1.25, 0);
          truck.add(cab);
          for (const [x, z] of [[-2.2, -1.1], [2.1, -1.1], [-2.2, 1.1], [2.1, 1.1]]) {
            const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.4, 10), trackMat);
            wheel.rotation.x = Math.PI / 2;
            wheel.position.set(x, 0.55, z);
            truck.add(wheel);
          }
          truck.position.set(-30 + i * 26, 0.04, 24.5);
          scene.add(truck);
          trucks.push({ group: truck, offset: i * 30, dir: i === 0 ? 1 : -1 });
        }

        // Workers.
        const workers: THREE.Group[] = [];
        const helmetMat = new THREE.MeshStandardMaterial({ color: 0xf4bd72, roughness: 0.5 });
        const hiVisMat = new THREE.MeshStandardMaterial({ color: 0xe8cc43, emissive: 0x6b4f08, emissiveIntensity: 0.22, roughness: 0.7 });
        for (let i = 0; i < 12; i++) {
          const worker = new THREE.Group();
          const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.7, 3, 6), hiVisMat);
          torso.position.y = 1.0;
          worker.add(torso);
          const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshStandardMaterial({ color: 0xb58a68, roughness: 0.8 }));
          head.position.y = 1.65;
          worker.add(head);
          const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.23, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), helmetMat);
          helmet.position.y = 1.72;
          worker.add(helmet);
          const angle = (i / 12) * Math.PI * 2;
          worker.position.set(Math.cos(angle) * (10 + (i % 3) * 3), 0.02, Math.sin(angle) * (8 + (i % 2) * 4));
          worker.userData.phase = i * 0.8;
          scene.add(worker);
          workers.push(worker);
        }

        // Safety zones.
        const safety = new THREE.Group();
        const craneZone = new THREE.Mesh(
          new THREE.CylinderGeometry(11, 11, 0.08, 48, 1, true),
          new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false }),
        );
        craneZone.position.set(16, 0.05, -9);
        safety.add(craneZone);
        const craneRing = new THREE.Mesh(
          new THREE.RingGeometry(10.9, 11.1, 64),
          new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false }),
        );
        craneRing.rotation.x = -Math.PI / 2;
        craneRing.position.set(16, 0.07, -9);
        safety.add(craneRing);
        const digZone = new THREE.Mesh(
          new THREE.CylinderGeometry(7, 7, 0.06, 40, 1, true),
          new THREE.MeshBasicMaterial({ color: ROSE, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false }),
        );
        digZone.position.set(-15, 0.05, 7);
        safety.add(digZone);
        const digRing = new THREE.Mesh(
          new THREE.RingGeometry(6.9, 7.1, 48),
          new THREE.MeshBasicMaterial({ color: ROSE, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }),
        );
        digRing.rotation.x = -Math.PI / 2;
        digRing.position.set(-15, 0.07, 7);
        safety.add(digRing);
        scene.add(safety);

        // Drone point cloud.
        const scanGroup = new THREE.Group();
        const scanCount = 1600;
        const scanPos = new Float32Array(scanCount * 3);
        let sseed = 19;
        const srand = () => {
          sseed = (sseed * 16807) % 2147483647;
          return sseed / 2147483647;
        };
        for (let i = 0; i < scanCount; i++) {
          const side = Math.floor(srand() * 4);
          const u = srand() * 2 - 1;
          const v = srand() * 26;
          const w = srand() * 2 - 1;
          const x = side < 2 ? u * 7 : (side === 2 ? -7 : 7);
          const z = side < 2 ? (side === 0 ? -5 : 5) : u * 5;
          scanPos[i * 3] = x + (srand() - 0.5) * 0.5;
          scanPos[i * 3 + 1] = 0.4 + v + (srand() - 0.5) * 0.5;
          scanPos[i * 3 + 2] = z + w * 0.5;
        }
        const scanGeo = new THREE.BufferGeometry();
        scanGeo.setAttribute('position', new THREE.BufferAttribute(scanPos, 3));
        const scanPoints = new THREE.Points(
          scanGeo,
          new THREE.PointsMaterial({ color: 0x8dffe3, size: 0.1, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }),
        );
        scanGroup.add(scanPoints);
        scene.add(scanGroup);

        // Drone.
        const drone = new THREE.Group();
        const droneBody = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.5), new THREE.MeshStandardMaterial({ color: 0x15282b, metalness: 0.7, roughness: 0.3 }));
        drone.add(droneBody);
        for (const [x, z] of [[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]]) {
          const arm = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 0.06), new THREE.MeshBasicMaterial({ color: 0x79b9b1 }));
          arm.position.set(x * 0.5, 0, z * 0.5);
          arm.rotation.y = Math.atan2(z, x);
          drone.add(arm);
        }
        const droneLamp = new THREE.Sprite(new THREE.SpriteMaterial({ color: ACCENT, transparent: true, opacity: 0.8, depthWrite: false }));
        droneLamp.scale.set(1.2, 1.2, 1);
        drone.add(droneLamp);
        drone.position.set(9, 19, 6);
        scene.add(drone);

        // Labels.
        const labels: Array<{ el: HTMLDivElement; pos: THREE.Vector3 }> = [];
        const addLabel = (text: string, color: string, pos: [number, number, number]) => {
          const el = document.createElement('div');
          el.innerHTML = `<span style="display:inline-block;width:4px;height:4px;border-radius:99px;background:${color};box-shadow:0 0 8px ${color};margin-right:5px;vertical-align:1px"></span>${text}`;
          el.style.cssText = 'position:absolute;transform:translate(-50%,-100%);font-family:"JetBrains Mono Variable",monospace;font-size:7.5px;letter-spacing:.12em;color:rgba(220,241,234,.78);white-space:nowrap;padding:3px 6px;border:1px solid rgba(120,200,190,.18);border-radius:3px;background:rgba(4,10,12,.62);backdrop-filter:blur(3px);';
          ctx.labelLayer.appendChild(el);
          labels.push({ el, pos: new THREE.Vector3(...pos) });
        };
        addLabel('TC-02 · TOWER CRANE', '#f4bd72', [16, 35, -9]);
        addLabel('GATE 3 · LOGISTICS', '#53f0be', [25, 5.5, 30]);
        addLabel('CORE · JUMP FORM', '#51d6ff', [0, 39, 0]);
        addLabel('LAYDOWN · PRECAST', '#a991ff', [24, 3.4, 9]);

        // Progress state and API.
        let currentProgress = Math.max(0, Math.min(1, progress));
        let targetProgress = currentProgress;
        let currentLayers = layers;
        let currentFloor = -1;
        const clockLabel = new THREE.Vector3();

        const applyProgress = (p: number, elapsed: number) => {
          const visibleFloors = p < 0.15 ? 0 : Math.round(((p - 0.1) / 0.9) * 12);
          floorGroups.forEach((floor, i) => {
            const visible = i < visibleFloors;
            floor.visible = visible;
            if (visible) {
              const isCurrent = i === visibleFloors - 1;
              const mat = floorMaterials[i];
              mat.emissiveIntensity = isCurrent ? 0.8 + Math.sin(elapsed * 3) * 0.2 : 0.34;
              floor.position.y = i * floorH;
            }
          });
          currentFloor = visibleFloors - 1;
          jumpForm.position.y = Math.max(0, visibleFloors) * floorH + 0.6;
          excavation.visible = p < 0.42;
          envelopePanels.forEach((panel, i) => {
            panel.visible = p > 0.7 && Math.floor(i / 4) < visibleFloors;
          });
          fitoutGroup.children.forEach((child) => {
            child.visible = p > 0.85 && (child.userData.floor as number) < visibleFloors;
          });
          scaffoldGroup.children.forEach((child, i) => {
            child.visible = p > 0.5 && p < 0.88 && i < visibleFloors;
          });
          crane.visible = p > 0.08;
          excavator.visible = p > 0.04 && p < 0.55;
          safety.visible = currentLayers.safety;
        };

        const api: ConstructionApi = {
          setProgress: (value) => { targetProgress = Math.max(0, Math.min(1, value)); },
          setLayers: (next) => {
            currentLayers = next;
            safety.visible = next.safety;
            bimGroup.visible = next.bim;
            scanGroup.visible = next.scan;
            drone.visible = next.scan;
            laydown.visible = next.logistics;
            trucks.forEach((t) => { t.group.visible = next.logistics; });
          },
          resetView: () => ctx.setCamera([60, 46, 76], [0, 11, 0]),
        };
        apiRef.current = api;
        api.setLayers(layers);

        ctx.addUpdate((dt, elapsed) => {
          currentProgress += (targetProgress - currentProgress) * Math.min(1, dt * 2.2);
          applyProgress(currentProgress, elapsed);
          crane.visible = currentProgress > 0.08;
          if (crane.visible) {
            slew.rotation.y = Math.sin(elapsed * 0.16) * 0.8 + 0.2;
            trolley.position.x = 11 + Math.sin(elapsed * 0.23) * 5;
            cable.position.x = trolley.position.x;
            hook.position.x = trolley.position.x;
            cable.scale.y = 0.82 + Math.sin(elapsed * 0.29) * 0.25;
            hook.position.y = -8.6 - Math.sin(elapsed * 0.29) * 1.7;
          }
          if (excavator.visible) {
            boom.rotation.z = Math.sin(elapsed * 0.6) * 0.16;
            excavator.rotation.y = -0.4 + Math.sin(elapsed * 0.12) * 0.2;
          }
          trucks.forEach((truck) => {
            if (!truck.group.visible) return;
            const span = 72;
            const pos = ((elapsed * 4.2 + truck.offset) % span + span) % span;
            truck.group.position.x = truck.dir > 0 ? -36 + pos : 36 - pos;
            truck.group.rotation.y = truck.dir > 0 ? 0 : Math.PI;
          });
          workers.forEach((worker) => {
            const phase = (worker.userData.phase as number) ?? 0;
            worker.position.y = 0.02 + Math.abs(Math.sin(elapsed * 2.4 + phase)) * 0.06;
            worker.rotation.y = Math.sin(elapsed * 0.3 + phase) * 0.4;
          });
          if (scanGroup.visible) {
            scanGroup.rotation.y = elapsed * 0.04;
            drone.position.x = Math.cos(elapsed * 0.18) * 15;
            drone.position.z = Math.sin(elapsed * 0.18) * 11;
            drone.position.y = 19 + Math.sin(elapsed * 0.8) * 1.2;
            drone.rotation.y = -elapsed * 0.18;
          }
          labels.forEach(({ el, pos }) => {
            clockLabel.copy(pos).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            const x = (clockLabel.x * 0.5 + 0.5) * width;
            const y = (-clockLabel.y * 0.5 + 0.5) * height;
            el.style.transform = `translate(-50%,-100%) translate(${x}px, ${y}px)`;
            el.style.opacity = clockLabel.z < 1 && width > 620 ? '1' : '0';
          });
        });
      }}
    />
  );
}
