import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage, type StageContext } from './ThreeStage';
import type { LoadCaseId } from '../lib/platformData';

export type EngineeringStudy = 'tower' | 'bridge';

export interface MemberSelection {
  id: string;
  type: string;
  level: string;
  uc: number;
  force: string;
  note: string;
}

export interface EngineeringSceneProps {
  study: EngineeringStudy;
  loadCase: LoadCaseId;
  deflection: boolean;
  foundation: boolean;
  autoRotate?: boolean;
  onSelect?: (member: MemberSelection | null) => void;
}

interface EngineeringApi {
  setStudy: (study: EngineeringStudy) => void;
  setLoadCase: (loadCase: LoadCaseId) => void;
  setDeflection: (value: boolean) => void;
  setFoundation: (value: boolean) => void;
}

interface MemberEntry {
  mesh: THREE.Mesh;
  type: string;
  level: string;
  id: string;
  uc: number;
  base: number;
  force: string;
  note: string;
}

const CYAN = 0x51d6ff;
const ACCENT = 0x53f0be;
const AMBER = 0xf4bd72;
const ROSE = 0xff7088;
const VIOLET = 0xa991ff;

function colorForUtil(uc: number) {
  if (uc < 0.55) return new THREE.Color(0x4cecc4);
  if (uc < 0.75) return new THREE.Color(0xa7e86e);
  if (uc < 0.88) return new THREE.Color(AMBER);
  return new THREE.Color(ROSE);
}

function edge(mesh: THREE.Mesh, color = 0x2b6a6a, opacity = 0.36) {
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
  el.style.cssText = 'position:absolute;transform:translate(-50%,-100%);font-family:"JetBrains Mono Variable",monospace;font-size:7.5px;letter-spacing:.12em;color:rgba(218,240,238,.78);white-space:nowrap;padding:3px 6px;border:1px solid rgba(120,200,210,.16);border-radius:3px;background:rgba(4,10,12,.62);backdrop-filter:blur(3px);';
  layer.appendChild(el);
  return { el, pos: new THREE.Vector3(...pos) };
}

function makeTowerMember(
  parent: THREE.Group,
  mesh: THREE.Mesh,
  entries: MemberEntry[],
  detail: Omit<MemberEntry, 'mesh' | 'uc' | 'base'> & { base?: number },
) {
  parent.add(mesh);
  entries.push({
    mesh,
    type: detail.type,
    level: detail.level,
    id: detail.id,
    force: detail.force,
    note: detail.note,
    base: detail.base ?? 0.52,
    uc: 0.52,
  });
  return mesh;
}

export function EngineeringScene({
  study, loadCase, deflection, foundation, autoRotate = false, onSelect,
}: EngineeringSceneProps) {
  const apiRef = useRef<EngineeringApi | null>(null);
  const onSelectRef = useRef<(member: MemberSelection | null) => void>(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});

  useEffect(() => { apiRef.current?.setStudy(study); }, [study]);
  useEffect(() => { apiRef.current?.setLoadCase(loadCase); }, [loadCase]);
  useEffect(() => { apiRef.current?.setDeflection(deflection); }, [deflection]);
  useEffect(() => { apiRef.current?.setFoundation(foundation); }, [foundation]);

  return (
    <ThreeStage
      ariaLabel="Interactive structural and civil engineering twin with a reinforced concrete tower frame and a cable-stayed harbour bridge."
      cameraPosition={[54, 45, 68]}
      target={[0, 11, 2]}
      fov={40}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.0045 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.16}
      build={(ctx) => {
        const scene = ctx.scene;
        const hemi = new THREE.HemisphereLight(0x9bd4d5, 0x050b0c, 0.8);
        scene.add(hemi);
        const key = new THREE.DirectionalLight(0xd8fbff, 1.7);
        key.position.set(-48, 78, 38);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x2bd0b2, 0.7);
        rim.position.set(50, 30, -46);
        scene.add(rim);
        const warm = new THREE.PointLight(0xffb56a, 18, 70, 2);
        warm.position.set(-26, 16, -8);
        scene.add(warm);
        const cool = new THREE.PointLight(0x4ac8ff, 16, 80, 2);
        cool.position.set(30, 13, 14);
        scene.add(cool);

        const baseGeo = new THREE.BoxGeometry(124, 2.4, 66);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x050d10, metalness: 0.56, roughness: 0.7 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = -1.35;
        scene.add(base);
        const baseEdge = new THREE.LineSegments(
          new THREE.EdgesGeometry(baseGeo),
          new THREE.LineBasicMaterial({ color: 0x1a464a, transparent: true, opacity: 0.7 }),
        );
        baseEdge.position.y = -1.35;
        scene.add(baseEdge);

        // Land and water.
        const land = new THREE.Mesh(
          new THREE.BoxGeometry(62, 0.2, 65),
          new THREE.MeshStandardMaterial({ color: 0x0c1918, roughness: 0.88, metalness: 0.18 }),
        );
        land.position.set(-31, -0.09, 0);
        scene.add(land);
        const gridPts: THREE.Vector3[] = [];
        for (let x = -61; x <= -1; x += 4) gridPts.push(new THREE.Vector3(x, 0.02, -31), new THREE.Vector3(x, 0.02, 31));
        for (let z = -31; z <= 31; z += 4) gridPts.push(new THREE.Vector3(-61, 0.02, z), new THREE.Vector3(-1, 0.02, z));
        scene.add(new THREE.LineSegments(
          new THREE.BufferGeometry().setFromPoints(gridPts),
          new THREE.LineBasicMaterial({ color: 0x114449, transparent: true, opacity: 0.18 }),
        ));

        const waterUniforms = { uTime: { value: 0 } };
        const water = new THREE.Mesh(
          new THREE.PlaneGeometry(62, 65),
          new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            uniforms: waterUniforms,
            vertexShader: `
              varying vec2 vUv;
              void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
            `,
            fragmentShader: `
              varying vec2 vUv;
              uniform float uTime;
              void main() {
                float a = sin(vUv.x * 55.0 + uTime * 0.5) * 0.5 + 0.5;
                float b = sin(vUv.y * 92.0 - uTime * 0.7 + vUv.x * 10.0) * 0.5 + 0.5;
                vec3 deep = vec3(0.012, 0.045, 0.055);
                vec3 crest = vec3(0.03, 0.14, 0.15);
                vec3 col = mix(deep, crest, a * 0.18 + b * 0.16);
                float glint = smoothstep(0.96, 1.0, sin(vUv.x * 140.0 + uTime) * sin(vUv.y * 100.0 - uTime * 0.6) * 0.5 + 0.5);
                col += vec3(0.25, 0.65, 0.6) * glint * 0.12;
                gl_FragColor = vec4(col, 0.95);
              }
            `,
          }),
        );
        water.rotation.x = -Math.PI / 2;
        water.position.set(30, 0, 0);
        scene.add(water);
        const shore = new THREE.Mesh(
          new THREE.BoxGeometry(0.18, 0.22, 65),
          new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.38 }),
        );
        shore.position.set(0, 0.03, 0);
        scene.add(shore);

        // Structural tower -------------------------------------------------
        const tower = new THREE.Group();
        tower.position.set(-27, 0, -8);
        scene.add(tower);
        const towerFloorGroups: THREE.Group[] = [];
        const members: MemberEntry[] = [];
        const memberPickables: THREE.Mesh[] = [];

        const concrete = new THREE.MeshStandardMaterial({ color: 0x93aaa4, roughness: 0.7, metalness: 0.12 });
        const concreteDark = new THREE.MeshStandardMaterial({ color: 0x4e6764, roughness: 0.76 });
        const steel = new THREE.MeshStandardMaterial({ color: 0xa8b9ae, metalness: 0.72, roughness: 0.38 });
        const plateMat = new THREE.MeshPhysicalMaterial({
          color: 0x5fd8c5, transparent: true, opacity: 0.12, metalness: 0.18, roughness: 0.15, side: THREE.DoubleSide, depthWrite: false,
        });

        const pileCap = new THREE.Mesh(new THREE.BoxGeometry(16, 1.2, 13), concreteDark);
        pileCap.position.y = 0.6;
        edge(pileCap, 0x4d8e84, 0.35);
        tower.add(pileCap);

        const floorH = 3.0;
        const floors = 12;
        const colXs = [-5.4, 0, 5.4];
        const colZs = [-4.2, 0, 4.2];
        for (let f = 0; f < floors; f++) {
          const floor = new THREE.Group();
          floor.position.y = f * floorH;
          tower.add(floor);
          towerFloorGroups.push(floor);

          const plate = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.12, 10.2), plateMat);
          plate.position.y = 0.1;
          floor.add(plate);
          const plateEdge = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(12.4, 0.12, 10.2)),
            new THREE.LineBasicMaterial({ color: 0x5fd8c5, transparent: true, opacity: 0.34, depthWrite: false }),
          );
          plateEdge.position.y = 0.1;
          floor.add(plateEdge);

          colXs.forEach((x) => {
            colZs.forEach((z) => {
              if (x === 0 && z === 0) return;
              const col = new THREE.Mesh(new THREE.BoxGeometry(0.48, 2.9, 0.48), concrete);
              col.position.set(x, 1.45, z);
              col.userData.member = true;
              const ucBase = 0.42 + ((f * 5 + Math.abs(x * 3 + z * 2)) % 7) * 0.045;
              makeTowerMember(floor, col, members, {
                id: `C-${String(f + 1).padStart(2, '0')}-${x < 0 ? 'W' : x > 0 ? 'E' : 'C'}${z < 0 ? 'N' : z > 0 ? 'S' : ''}`,
                type: 'Column', level: `L${String(f + 1).padStart(2, '0')}`,
                force: `${(3200 + f * 140 + Math.abs(x * 250)).toLocaleString()} kN`,
                note: f > 7 ? 'Governing wind demand' : 'Gravity-dominated',
                base: ucBase,
              });
              edge(col, 0x7fb1a7, 0.24);
              memberPickables.push(col);
            });
          });

          const core = new THREE.Mesh(new THREE.BoxGeometry(3.3, 2.9, 3.3), concreteDark);
          core.position.set(0, 1.45, 0);
          floor.add(core);
          edge(core, 0x5da29a, 0.3);

          const beams = [
            { geo: new THREE.BoxGeometry(12.2, 0.32, 0.26), pos: [0, 2.72, -4.5], force: `${1400 + f * 55} kNm` },
            { geo: new THREE.BoxGeometry(12.2, 0.32, 0.26), pos: [0, 2.72, 4.5], force: `${1320 + f * 50} kNm` },
            { geo: new THREE.BoxGeometry(0.26, 0.32, 9.8), pos: [-5.4, 2.72, 0], force: `${1180 + f * 40} kNm` },
            { geo: new THREE.BoxGeometry(0.26, 0.32, 9.8), pos: [5.4, 2.72, 0], force: `${1260 + f * 45} kNm` },
          ];
          beams.forEach((b, bi) => {
            const beam = new THREE.Mesh(b.geo, concrete);
            beam.position.set(...(b.pos as [number, number, number]));
            beam.userData.member = true;
            makeTowerMember(floor, beam, members, {
              id: `B-${String(f + 1).padStart(2, '0')}-${bi + 1}`,
              type: 'Beam', level: `L${String(f + 1).padStart(2, '0')}`,
              force: b.force, note: 'Perimeter frame beam',
              base: 0.5 + ((f + bi) % 5) * 0.055,
            });
            edge(beam, 0x7fb1a7, 0.24);
            memberPickables.push(beam);
          });

          if (f >= 3 && f <= 8) {
            const braceLen = Math.sqrt(9 + 81);
            for (const dir of [1, -1]) {
              const brace = new THREE.Mesh(new THREE.BoxGeometry(braceLen, 0.14, 0.14), steel);
              brace.position.set(0, 1.45, -5.15);
              brace.rotation.z = dir * Math.atan2(3, 9);
              brace.userData.member = true;
              makeTowerMember(floor, brace, members, {
                id: `BR-${String(f + 1).padStart(2, '0')}-${dir > 0 ? 'A' : 'B'}`,
                type: 'Brace', level: `L${String(f + 1).padStart(2, '0')}`,
                force: `${(4800 + f * 120).toLocaleString()} kN`,
                note: 'Wind / seismic lateral system',
                base: 0.72,
              });
              edge(brace, 0xa6c7ba, 0.26);
              memberPickables.push(brace);
            }
          }

          if (f === 8) {
            for (const z of [-4.2, 4.2]) {
              const outrigger = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.55, 0.5), steel);
              outrigger.position.set(0, 2.55, z);
              outrigger.userData.member = true;
              makeTowerMember(floor, outrigger, members, {
                id: `OR-09-${z > 0 ? 'S' : 'N'}`, type: 'Outrigger', level: 'L09',
                force: '6,120 kN', note: 'Steel outrigger · wind critical', base: 0.82,
              });
              memberPickables.push(outrigger);
            }
          }
        }
        // Roof plant / crown.
        const crown = new THREE.Mesh(
          new THREE.BoxGeometry(7.4, 1.2, 6.2),
          new THREE.MeshStandardMaterial({ color: 0x29494a, metalness: 0.55, roughness: 0.42, emissive: 0x1f5f59, emissiveIntensity: 0.4 }),
        );
        crown.position.y = floors * floorH + 0.6;
        tower.add(crown);
        edge(crown, 0x6cc9b8, 0.45);

        // Geotechnical inset.
        const foundationGroup = new THREE.Group();
        foundationGroup.position.set(-12, 0, 18);
        foundationGroup.scale.setScalar(0.8);
        const soil = new THREE.Mesh(
          new THREE.BoxGeometry(14, 8.4, 11),
          new THREE.MeshPhysicalMaterial({ color: 0x8a6b4b, transparent: true, opacity: 0.16, roughness: 0.9, metalness: 0.05, side: THREE.DoubleSide }),
        );
        soil.position.y = 4.2;
        foundationGroup.add(soil);
        const soilEdge = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(14, 8.4, 11)),
          new THREE.LineBasicMaterial({ color: 0xc6a774, transparent: true, opacity: 0.36 }),
        );
        soilEdge.position.y = 4.2;
        foundationGroup.add(soilEdge);
        for (let layer = 0; layer < 4; layer++) {
          const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(13.8, 10.8),
            new THREE.MeshBasicMaterial({ color: layer % 2 ? 0x5f4d39 : 0x4a3d2e, transparent: true, opacity: 0.18, side: THREE.DoubleSide }),
          );
          plane.rotation.x = -Math.PI / 2;
          plane.position.y = 0.7 + layer * 2;
          foundationGroup.add(plane);
        }
        const cap = new THREE.Mesh(new THREE.BoxGeometry(9, 0.9, 7), concreteDark);
        cap.position.y = 8.35;
        foundationGroup.add(cap);
        for (let i = 0; i < 6; i++) {
          const pile = new THREE.Mesh(
            new THREE.CylinderGeometry(0.38, 0.5, 6.5, 8),
            new THREE.MeshStandardMaterial({ color: 0x9baba3, roughness: 0.7, metalness: 0.1 }),
          );
          pile.position.set(-4 + (i % 3) * 4, 4.6, -2.8 + Math.floor(i / 3) * 5.6);
          foundationGroup.add(pile);
        }
        scene.add(foundationGroup);
        foundationGroup.visible = foundation;

        // Cable-stayed harbour link ---------------------------------------
        const bridge = new THREE.Group();
        bridge.position.set(0, 0, 14);
        scene.add(bridge);
        const deckMat = new THREE.MeshStandardMaterial({ color: 0x8b9f97, roughness: 0.62, metalness: 0.35 });
        const steelMat = new THREE.MeshStandardMaterial({ color: 0xa7b8b1, roughness: 0.4, metalness: 0.7 });
        const pylonMat = new THREE.MeshStandardMaterial({ color: 0xb6c5bd, roughness: 0.65, metalness: 0.15 });
        const deckSegments: Array<{ mesh: THREE.Mesh; baseY: number; x: number }> = [];
        const segmentCount = 14;
        const segLen = 4.2;
        for (let i = 0; i < segmentCount; i++) {
          const deck = new THREE.Mesh(new THREE.BoxGeometry(segLen - 0.08, 0.55, 6.4), deckMat);
          deck.position.set(-2 + i * segLen + segLen / 2, 7.2, 0);
          deck.userData.bridgePart = true;
          bridge.add(deck);
          deckSegments.push({ mesh: deck, baseY: 7.2, x: deck.position.x });
          const rail = new THREE.Mesh(new THREE.BoxGeometry(segLen - 0.1, 0.08, 0.08), steelMat);
          rail.position.set(deck.position.x, 7.85, 3.2);
          bridge.add(rail);
          const rail2 = rail.clone();
          rail2.position.z = -3.2;
          bridge.add(rail2);
        }
        const pylonXs = [11, 40];
        pylonXs.forEach((px, pi) => {
          const mast = new THREE.Mesh(new THREE.BoxGeometry(1.7, 18, 1.7), pylonMat);
          mast.position.set(px, 16, 0);
          edge(mast, 0x7eb7aa, 0.32);
          bridge.add(mast);
          const cap = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.6, 1.9), pylonMat);
          cap.position.set(px, 25, 0);
          bridge.add(cap);
          const pier = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.7, 7, 12), concreteDark);
          pier.position.set(px, 3.4, 0);
          bridge.add(pier);
          for (const side of [-1, 1]) {
            for (let c = 0; c < 6; c++) {
              const targetX = px + side * (3 + c * 3.2);
              if (targetX < -2 || targetX > 56) continue;
              const top = new THREE.Vector3(px + side * 0.7, 25.4, 0.2);
              const bottom = new THREE.Vector3(targetX, 7.9, 0.2);
              const cable = new THREE.Line(
                new THREE.BufferGeometry().setFromPoints([top, bottom]),
                new THREE.LineBasicMaterial({ color: c === 2 ? AMBER : CYAN, transparent: true, opacity: 0.62, depthWrite: false }),
              );
              bridge.add(cable);
            }
          }
        });
        // Piers at the ends.
        for (const px of [-2, 54]) {
          const abutment = new THREE.Mesh(new THREE.BoxGeometry(4.5, 3, 6.6), concreteDark);
          abutment.position.set(px, 5.6, 0);
          bridge.add(abutment);
        }
        // Deck load-test vehicle.
        const testTruck = new THREE.Group();
        const truckBody = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.2, 2.2), new THREE.MeshStandardMaterial({ color: 0xf4bd72, roughness: 0.45, metalness: 0.4, emissive: 0x4a2a08, emissiveIntensity: 0.4 }));
        truckBody.position.y = 0.8;
        testTruck.add(truckBody);
        const truckCab = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 2), new THREE.MeshStandardMaterial({ color: 0xdfeae4, roughness: 0.35, metalness: 0.4 }));
        truckCab.position.set(2.1, 0.65, 0);
        testTruck.add(truckCab);
        for (const [x, z] of [[-1.1, -1], [1.2, -1], [-1.1, 1], [1.2, 1]]) {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.25, 10), new THREE.MeshStandardMaterial({ color: 0x182326, roughness: 0.9 }));
          wheel.rotation.x = Math.PI / 2;
          wheel.position.set(x, 0.36, z);
          testTruck.add(wheel);
        }
        testTruck.position.set(-2, 7.8, 0);
        bridge.add(testTruck);
        // Bridge sensor sprites.
        const sensorGlow = new THREE.SpriteMaterial({ color: ACCENT, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending });
        for (const sx of [11, 25.5, 40]) {
          const sensor = new THREE.Sprite(sensorGlow);
          sensor.scale.set(1.1, 1.1, 1);
          sensor.position.set(sx, 8.4, 2.4);
          bridge.add(sensor);
        }

        // Wind / seismic load arrows.
        const loadArrows = new THREE.Group();
        const arrowMat = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.7, depthWrite: false });
        for (const y of [6, 12, 18, 24]) {
          const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 9, 6), arrowMat);
          shaft.rotation.z = Math.PI / 2;
          shaft.position.set(-38, y, -8);
          loadArrows.add(shaft);
          const head = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.9, 8), arrowMat);
          head.rotation.z = -Math.PI / 2;
          head.position.set(-33.2, y, -8);
          loadArrows.add(head);
        }
        loadArrows.visible = false;
        scene.add(loadArrows);

        // Exaggerated deflected shape.
        const deflectionGeometry = new THREE.BufferGeometry();
        const deflectionPositions = new Float32Array((floors + 1) * 3);
        deflectionGeometry.setAttribute('position', new THREE.BufferAttribute(deflectionPositions, 3));
        const deflectionLine = new THREE.Line(
          deflectionGeometry,
          new THREE.LineBasicMaterial({ color: AMBER, transparent: true, opacity: 0.8, depthWrite: false }),
        );
        deflectionLine.visible = false;
        scene.add(deflectionLine);

        // Labels ------------------------------------------------------------
        const foundationLabel = label('FOUNDATION INSET', '#c6a774', [-12, 7.4, 18], ctx.labelLayer);
        foundationLabel.el.style.display = foundation ? 'block' : 'none';
        const labels = [
          label('HARBOUR LINK · 68 m', '#51d6ff', [26, 30, 14], ctx.labelLayer),
          label('PYLON P-02', '#a991ff', [40, 27, 14], ctx.labelLayer),
          label('BEARING B-2', '#f4bd72', [27, 9, 17], ctx.labelLayer),
          foundationLabel,
        ];

        // State and API -----------------------------------------------------
        let currentStudy: EngineeringStudy = study;
        let currentLoad: LoadCaseId = loadCase;
        let deflectionOn = deflection;
        let foundationOn = foundation;
        let currentTime = 0;

        const memberBase = (type: string, level: string) => {
          const lvl = Number(level.replace(/\D/g, '')) || 1;
          if (type === 'Brace') return 0.68 + Math.min(0.18, lvl * 0.008);
          if (type === 'Outrigger') return 0.78;
          if (type === 'Beam') return 0.48 + Math.min(0.18, lvl * 0.01);
          return 0.42 + Math.min(0.32, lvl * 0.022);
        };

        const applyLoad = (lc: LoadCaseId) => {
          currentLoad = lc;
          loadArrows.visible = lc === 'wind' || lc === 'seismic';
          members.forEach((m) => {
            const base = memberBase(m.type, m.level);
            let uc = base;
            if (lc === 'live') uc += m.type === 'Beam' ? 0.13 : 0.06;
            if (lc === 'wind') {
              uc += m.type === 'Brace' ? 0.24 : m.type === 'Column' ? 0.12 : 0.06;
              uc += Number(m.level.replace(/\D/g, '')) * 0.006;
            }
            if (lc === 'seismic') {
              uc += m.type === 'Brace' ? 0.28 : m.type === 'Column' ? 0.12 : 0.1;
            }
            m.uc = Math.min(0.98, uc);
            const c = colorForUtil(m.uc);
            const mat = m.mesh.material as THREE.MeshStandardMaterial;
            mat.color.copy(c);
            mat.emissive.copy(c).multiplyScalar(0.36);
            mat.emissiveIntensity = 0.55;
          });
        };

        const setStudy = (next: EngineeringStudy) => {
          currentStudy = next;
          if (next === 'tower') {
            ctx.setCamera([14, 38, 34], [-27, 18, -8]);
          } else {
            ctx.setCamera([68, 40, 70], [25, 11, 14]);
          }
        };

        const resetView = () => {
          if (currentStudy === 'tower') ctx.setCamera([14, 38, 34], [-27, 18, -8]);
          else ctx.setCamera([68, 40, 70], [25, 11, 14]);
        };

        const api: EngineeringApi = {
          setStudy,
          setLoadCase: applyLoad,
          setDeflection: (value) => { deflectionOn = value; deflectionLine.visible = value; },
          setFoundation: (value) => {
            foundationOn = value;
            foundationGroup.visible = value;
            foundationLabel.el.style.display = value ? 'block' : 'none';
            if (currentStudy === 'tower') {
              if (value) ctx.setCamera([18, 34, 46], [-14, 13, 5]);
              else ctx.setCamera([14, 38, 34], [-27, 18, -8]);
            }
          },
        };
        apiRef.current = api;
        applyLoad(loadCase);
        foundationGroup.visible = foundation;
        deflectionLine.visible = deflection;
        foundationLabel.el.style.display = foundation ? 'block' : 'none';
        // Do not jump the camera on first mount; the page shows the overview.
        if (study === 'tower') {
          // The overview is intentional; a study switch focuses the camera.
        }

        // Pick structural members.
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        const handleClick = (event: PointerEvent) => {
          const rect = ctx.renderer.domElement.getBoundingClientRect();
          pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(pointer, ctx.camera);
          const hit = raycaster.intersectObjects(memberPickables, false)[0];
          if (!hit) {
            onSelectRef.current(null);
            return;
          }
          const entry = members.find((m) => m.mesh === hit.object);
          if (!entry) {
            onSelectRef.current(null);
            return;
          }
          onSelectRef.current({
            id: entry.id,
            type: entry.type,
            level: entry.level,
            uc: entry.uc,
            force: entry.force,
            note: entry.note,
          });
        };
        ctx.renderer.domElement.addEventListener('pointerup', handleClick);
        ctx.addDispose(() => ctx.renderer.domElement.removeEventListener('pointerup', handleClick));

        // Frame updates.
        ctx.addUpdate((dt, elapsed) => {
          currentTime = elapsed;
          waterUniforms.uTime.value = elapsed;

          const amplitude = deflectionOn ? 0.9 : 0;
          towerFloorGroups.forEach((floor, i) => {
            const s = Math.sin(elapsed * 1.3) * amplitude * Math.pow((i + 1) / floors, 1.8);
            floor.position.x = s;
          });
          if (deflectionOn) {
            const positions = deflectionLine.geometry.attributes.position as THREE.BufferAttribute;
            for (let i = 0; i <= floors; i++) {
              const sway = i === 0 ? 0 : Math.sin(elapsed * 1.3) * amplitude * Math.pow(i / floors, 1.8);
              positions.setXYZ(i, -27 + sway - 8.4, i * floorH, -8);
            }
            positions.needsUpdate = true;
            deflectionLine.geometry.computeBoundingSphere();
          }

          // The load test truck crosses the deck and deflects it locally.
          const cycle = (elapsed * 0.065) % 1;
          const truckX = -2 + cycle * 56;
          testTruck.position.x = truckX;
          testTruck.position.y = 7.78;
          deckSegments.forEach((seg) => {
            const d = Math.abs(seg.x - truckX);
            const dip = Math.max(0, 1 - d / 5.5) * 0.55;
            seg.mesh.position.y = seg.baseY - dip;
          });

          // A slow pulse through the structural members makes the twin feel live.
          members.forEach((m, i) => {
            const mat = m.mesh.material as THREE.MeshStandardMaterial;
            mat.emissiveIntensity = 0.45 + Math.sin(elapsed * 1.1 + i * 0.03) * 0.1;
          });

          labels.forEach(({ el, pos }) => {
            const p = pos.clone().project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            const x = (p.x * 0.5 + 0.5) * width;
            const y = (-p.y * 0.5 + 0.5) * height;
            el.style.transform = `translate(-50%,-100%) translate(${x}px, ${y}px)`;
            el.style.opacity = p.z < 1 && width > 620 ? '1' : '0';
          });
        });

        // Expose reset for a future page control without changing the stage API.
        (ctx as StageContext & { resetView?: () => void }).resetView = resetView;
      }}
    />
  );
}
