import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { ENERGY_ASSETS, ENERGY_SCENARIOS, type EnergyScenario } from '../lib/energyData';

export interface EnergySceneProps {
  scenario: EnergyScenario;
  selectedId: string | null;
  autoRotate?: boolean;
  onSelect?: (id: string | null) => void;
}

interface EnergyApi {
  setScenario: (scenario: EnergyScenario) => void;
  setSelected: (id: string | null) => void;
}

interface AssetRecord {
  id: string;
  group: THREE.Group;
  bodyMat: THREE.MeshStandardMaterial;
  baseY: number;
  w: number;
  d: number;
}

interface FlowRecord {
  curve: THREE.QuadraticBezierCurve3;
  line: THREE.Line;
  particle: THREE.Mesh;
  speed: number;
  offset: number;
  color: THREE.Color;
}

const ACCENT = 0x53f0be;
const CYAN = 0x51d6ff;
const AMBER = 0xf4bd72;
const ROSE = 0xff7088;
const VIOLET = 0xa991ff;

function edge(mesh: THREE.Mesh, color = 0x2c6c68, opacity = 0.38) {
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
  el.style.cssText = 'position:absolute;transform:translate(-50%,-100%);font-family:"JetBrains Mono Variable",monospace;font-size:7.5px;letter-spacing:.12em;color:rgba(218,241,235,.8);white-space:nowrap;padding:3px 6px;border:1px solid rgba(120,200,210,.16);border-radius:3px;background:rgba(4,10,12,.68);backdrop-filter:blur(3px);';
  layer.appendChild(el);
  return { el, pos: new THREE.Vector3(...pos) };
}

function box(w: number, h: number, d: number, color: number, mat?: THREE.MeshStandardMaterial) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    mat ?? new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.35 }),
  );
}

export function EnergyScene({ scenario, selectedId, autoRotate = false, onSelect }: EnergySceneProps) {
  const apiRef = useRef<EnergyApi | null>(null);
  const onSelectRef = useRef<(id: string | null) => void>(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});

  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="Interactive energy and microgrid digital twin with grid connection, transformers, switchgear, battery storage, solar, wind, data centre load and island-mode simulation."
      cameraPosition={[52, 36, 66]}
      target={[0, 8, 0]}
      fov={40}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.005 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.16}
      build={(ctx) => {
        const scene = ctx.scene;
        const hemi = new THREE.HemisphereLight(0x9bd6d9, 0x050b0c, 0.8);
        scene.add(hemi);
        const key = new THREE.DirectionalLight(0xd8fbff, 1.6);
        key.position.set(-44, 70, 40);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x31c9a7, 0.7);
        rim.position.set(50, 28, -44);
        scene.add(rim);
        const warm = new THREE.PointLight(0xffb56a, 16, 70, 2);
        warm.position.set(-10, 8, 12);
        scene.add(warm);

        const base = new THREE.Mesh(
          new THREE.BoxGeometry(104, 2.4, 72),
          new THREE.MeshStandardMaterial({ color: 0x050d10, metalness: 0.6, roughness: 0.68 }),
        );
        base.position.y = -1.4;
        scene.add(base);
        const baseEdge = new THREE.LineSegments(
          new THREE.EdgesGeometry(base.geometry),
          new THREE.LineBasicMaterial({ color: 0x1d4e55, transparent: true, opacity: 0.7 }),
        );
        baseEdge.position.y = -1.4;
        scene.add(baseEdge);
        const ground = new THREE.Mesh(
          new THREE.PlaneGeometry(103, 60),
          new THREE.MeshStandardMaterial({ color: 0x081417, roughness: 0.86, metalness: 0.18 }),
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.05;
        scene.add(ground);
        const water = new THREE.Mesh(
          new THREE.PlaneGeometry(104, 16),
          new THREE.MeshPhysicalMaterial({ color: 0x03191c, roughness: 0.18, metalness: 0.7, clearcoat: 0.7, clearcoatRoughness: 0.3 }),
        );
        water.rotation.x = -Math.PI / 2;
        water.position.set(0, 0, 31);
        scene.add(water);
        const shore = new THREE.Mesh(
          new THREE.BoxGeometry(104, 0.1, 0.14),
          new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.4 }),
        );
        shore.position.set(0, 0.03, 23);
        scene.add(shore);

        const gridPts: THREE.Vector3[] = [];
        for (let x = -50; x <= 50; x += 4) gridPts.push(new THREE.Vector3(x, 0.01, -34), new THREE.Vector3(x, 0.01, 22));
        for (let z = -34; z <= 22; z += 4) gridPts.push(new THREE.Vector3(-50, 0.01, z), new THREE.Vector3(50, 0.01, z));
        scene.add(new THREE.LineSegments(
          new THREE.BufferGeometry().setFromPoints(gridPts),
          new THREE.LineBasicMaterial({ color: 0x16434a, transparent: true, opacity: 0.16 }),
        ));

        const concrete = new THREE.MeshStandardMaterial({ color: 0x879892, roughness: 0.78, metalness: 0.12 });
        const steel = new THREE.MeshStandardMaterial({ color: 0x9eada6, roughness: 0.38, metalness: 0.7 });
        const darkSteel = new THREE.MeshStandardMaterial({ color: 0x182729, roughness: 0.45, metalness: 0.6 });
        const records: AssetRecord[] = [];
        const pickables: THREE.Mesh[] = [];

        // Grid connection / pylon.
        const gridGroup = new THREE.Group();
        gridGroup.position.set(-32, 0, -12);
        const mast = new THREE.Mesh(new THREE.BoxGeometry(0.4, 16, 0.4), steel);
        mast.position.y = 8;
        gridGroup.add(mast);
        for (const y of [7, 10.5, 14]) {
          const arm = new THREE.Mesh(new THREE.BoxGeometry(7, 0.18, 0.18), steel);
          arm.position.y = y;
          gridGroup.add(arm);
        }
        const gridBody = new THREE.Mesh(new THREE.BoxGeometry(4, 7, 3), darkSteel);
        gridBody.position.y = 3.5;
        gridBody.userData.assetId = 'GRID';
        gridGroup.add(gridBody);
        pickables.push(gridBody);
        const gridMat = gridBody.material as THREE.MeshStandardMaterial;
        scene.add(gridGroup);
        records.push({ id: 'GRID', group: gridGroup, bodyMat: gridMat, baseY: 0, w: 4, d: 3 });

        // Transformer.
        const transformer = new THREE.Group();
        transformer.position.set(-21, 0, -10);
        const tx = box(4.2, 3.2, 3.2, 0x6f827c);
        tx.position.y = 1.6;
        tx.userData.assetId = 'TX-01';
        transformer.add(tx);
        pickables.push(tx);
        edge(tx, 0x7ca9a2, 0.36);
        const txMat = tx.material as THREE.MeshStandardMaterial;
        for (let i = 0; i < 5; i++) {
          const fin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.2, 3.4), steel);
          fin.position.set(-2.5 + i * 1.25, 1.8, 0);
          transformer.add(fin);
        }
        scene.add(transformer);
        records.push({ id: 'TX-01', group: transformer, bodyMat: txMat, baseY: 0, w: 4.2, d: 3.2 });

        // Switchgear + controller.
        const switchgear = new THREE.Group();
        switchgear.position.set(-10, 0, -8);
        const swg = box(7, 2.6, 2.6, 0x34494b);
        swg.position.y = 1.3;
        swg.userData.assetId = 'SWG-01';
        switchgear.add(swg);
        pickables.push(swg);
        edge(swg, 0x5eaaa3, 0.36);
        const swgMat = swg.material as THREE.MeshStandardMaterial;
        for (let i = 0; i < 5; i++) {
          const door = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.9, 0.04), new THREE.MeshStandardMaterial({ color: 0x142224, roughness: 0.4, metalness: 0.5 }));
          door.position.set(-2.5 + i * 1.25, 1.35, 1.33);
          switchgear.add(door);
        }
        const controller = new THREE.Mesh(
          new THREE.BoxGeometry(1.4, 2.2, 1.4),
          new THREE.MeshStandardMaterial({ color: 0x173b36, emissive: 0x2cdfb2, emissiveIntensity: 0.8, metalness: 0.5, roughness: 0.35 }),
        );
        controller.position.set(4.5, 1.1, 0);
        switchgear.add(controller);
        const controllerGlow = new THREE.Sprite(new THREE.SpriteMaterial({ color: ACCENT, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending }));
        controllerGlow.scale.set(3.4, 3.4, 1);
        controllerGlow.position.set(4.5, 3.0, 0);
        switchgear.add(controllerGlow);
        scene.add(switchgear);
        records.push({ id: 'SWG-01', group: switchgear, bodyMat: swgMat, baseY: 0, w: 7, d: 2.6 });

        // BESS.
        const bess = new THREE.Group();
        bess.position.set(6, 0, -13);
        const bessMat = new THREE.MeshStandardMaterial({ color: 0x22483f, emissive: 0x1c7d68, emissiveIntensity: 0.35, metalness: 0.4, roughness: 0.45 });
        for (let i = 0; i < 2; i++) {
          const container = box(4.1, 3.1, 4.0, 0x22483f, bessMat.clone());
          container.position.set(-2.2 + i * 4.4, 1.6, 0);
          container.userData.assetId = 'BESS-01';
          bess.add(container);
          pickables.push(container);
          edge(container, 0x4fb195, 0.34);
          for (const x of [-1.2, 1.2]) {
            const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.1, 12), darkSteel);
            fan.rotation.z = Math.PI / 2;
            fan.position.set(x, 1.6, 2.05);
            container.add(fan);
          }
          const led = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.06), new THREE.MeshBasicMaterial({ color: ACCENT }));
          led.position.set(0, 2.55, 2.06);
          container.add(led);
        }
        scene.add(bess);
        records.push({ id: 'BESS-01', group: bess, bodyMat: bess.children[0] ? (bess.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial : bessMat, baseY: 0, w: 8.5, d: 4.2 });

        // Solar canopy.
        const solar = new THREE.Group();
        solar.position.set(-1, 0, 9);
        const solarMat = new THREE.MeshStandardMaterial({ color: 0x123848, emissive: 0x1e8eac, emissiveIntensity: 0.7, metalness: 0.7, roughness: 0.22 });
        const canopy = new THREE.Mesh(new THREE.BoxGeometry(15, 0.2, 6.5), solarMat);
        canopy.position.y = 3.4;
        canopy.rotation.x = -0.1;
        canopy.userData.assetId = 'PV-01';
        solar.add(canopy);
        pickables.push(canopy);
        for (const [x, z] of [[-6.5, -2.5], [6.5, -2.5], [-6.5, 2.5], [6.5, 2.5]]) {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 3.4, 6), steel);
          post.position.set(x, 1.7, z);
          solar.add(post);
        }
        scene.add(solar);
        records.push({ id: 'PV-01', group: solar, bodyMat: solarMat, baseY: 0, w: 15, d: 6.5 });

        // Data centre.
        const dc = new THREE.Group();
        dc.position.set(24, 0, -2);
        const dcBody = box(10, 10, 8, 0x1b3034);
        dcBody.position.y = 5;
        dcBody.userData.assetId = 'DC-01';
        dc.add(dcBody);
        pickables.push(dcBody);
        edge(dcBody, 0x4e9d9b, 0.4);
        const dcMat = dcBody.material as THREE.MeshStandardMaterial;
        for (let i = 0; i < 6; i++) {
          const window = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 0.04), new THREE.MeshBasicMaterial({ color: i % 2 ? CYAN : ACCENT, transparent: true, opacity: 0.55 }));
          window.position.set(-3.5 + i * 1.4, 8.8, 4.02);
          dc.add(window);
        }
        for (let i = 0; i < 4; i++) {
          const unit = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 2.0), new THREE.MeshStandardMaterial({ color: 0x415a5a, metalness: 0.6, roughness: 0.4 }));
          unit.position.set(-3 + (i % 2) * 5.8, 10.4, -1.8 + Math.floor(i / 2) * 3.2);
          dc.add(unit);
        }
        scene.add(dc);
        records.push({ id: 'DC-01', group: dc, bodyMat: dcMat, baseY: 0, w: 10, d: 8 });

        // Chiller plant.
        const chiller = new THREE.Group();
        chiller.position.set(12, 0, 3);
        for (let i = 0; i < 3; i++) {
          const ch = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 3.0, 18), new THREE.MeshStandardMaterial({ color: 0x5b7472, metalness: 0.55, roughness: 0.4 }));
          ch.position.set(-2.8 + i * 2.8, 1.5, 0);
          ch.userData.assetId = 'CH-01';
          chiller.add(ch);
          pickables.push(ch);
          edge(ch, 0x78aba5, 0.3);
          const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 6.5, 6), new THREE.MeshStandardMaterial({ color: 0x79c9c0, transparent: true, opacity: 0.45 }));
          pipe.rotation.z = Math.PI / 2;
          pipe.position.set(-2.8 + i * 2.8, 3.15, 0);
          chiller.add(pipe);
        }
        scene.add(chiller);
        records.push({ id: 'CH-01', group: chiller, bodyMat: (chiller.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial, baseY: 0, w: 8, d: 5 });

        // Generators.
        const generators = new THREE.Group();
        generators.position.set(34, 0, 4);
        for (let i = 0; i < 2; i++) {
          const gen = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.6, 2.6), new THREE.MeshStandardMaterial({ color: 0x5d5544, metalness: 0.5, roughness: 0.48 }));
          gen.position.set(-2 + i * 4, 1.3, 0);
          gen.userData.assetId = 'GEN-01';
          generators.add(gen);
          pickables.push(gen);
          edge(gen, 0x8a7b61, 0.3);
          const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 2.1, 8), darkSteel);
          stack.position.set(-2 + i * 4, 3.1, 0.8);
          generators.add(stack);
        }
        scene.add(generators);
        records.push({ id: 'GEN-01', group: generators, bodyMat: (generators.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial, baseY: 0, w: 6, d: 3 });

        // Wind turbines.
        const rotors: THREE.Group[] = [];
        const turbineMat = new THREE.MeshStandardMaterial({ color: 0xdcebe5, metalness: 0.4, roughness: 0.4 });
        ENERGY_ASSETS.filter((a) => a.type === 'Wind').forEach((asset, i) => {
          const turbine = new THREE.Group();
          const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.5, 22, 8), turbineMat);
          mast.position.y = 11;
          turbine.add(mast);
          const hub = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), turbineMat);
          hub.position.y = 22;
          turbine.add(hub);
          const rotor = new THREE.Group();
          rotor.position.y = 22;
          for (let b = 0; b < 3; b++) {
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.22, 5.4, 0.12), turbineMat);
            blade.position.y = 2.7;
            blade.rotation.z = (b / 3) * Math.PI * 2;
            rotor.add(blade);
          }
          turbine.add(rotor);
          turbine.position.set(asset.x, 0, asset.z);
          scene.add(turbine);
          rotors.push(rotor);
          // Pick the base for the turbine.
          const pad = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.2, 0.2, 18), concrete);
          pad.position.set(asset.x, 0.1, asset.z);
          pad.userData.assetId = asset.id;
          scene.add(pad);
          pickables.push(pad);
          records.push({ id: asset.id, group: turbine, bodyMat: turbineMat, baseY: 0, w: 2, d: 2 });
        });

        // EV hub.
        const ev = new THREE.Group();
        ev.position.set(-15, 0, 10);
        for (let i = 0; i < 5; i++) {
          const charger = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 0.8), new THREE.MeshStandardMaterial({ color: 0x1f3a3a, emissive: 0x2aa97e, emissiveIntensity: 0.55, metalness: 0.5, roughness: 0.4 }));
          charger.position.set(-4 + i * 2, 0.9, 1.7);
          charger.userData.assetId = 'EV-01';
          ev.add(charger);
          pickables.push(charger);
          const led = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.04), new THREE.MeshBasicMaterial({ color: ACCENT }));
          led.position.set(-4 + i * 2, 1.5, 2.12);
          ev.add(led);
        }
        for (let i = 0; i < 3; i++) {
          const car = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.65, 3.0), new THREE.MeshStandardMaterial({ color: i % 2 ? 0x7ea99a : 0x48645c, metalness: 0.5, roughness: 0.4 }));
          car.position.set(-3.5 + i * 3.5, 0.5, -1.3);
          ev.add(car);
        }
        scene.add(ev);
        records.push({ id: 'EV-01', group: ev, bodyMat: (ev.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial, baseY: 0, w: 9, d: 5 });

        // Power flows.
        const flows: FlowRecord[] = [];
        const addFlow = (from: [number, number, number], to: [number, number, number], colorHex: number, speed: number, offset: number) => {
          const start = new THREE.Vector3(...from);
          const end = new THREE.Vector3(...to);
          const mid = start.clone().add(end).multiplyScalar(0.5);
          mid.y = Math.max(start.y, end.y) + 4.5;
          const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
          const color = new THREE.Color(colorHex);
          const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(curve.getPoints(36)),
            new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.26, depthWrite: false, blending: THREE.AdditiveBlending }),
          );
          scene.add(line);
          const particle = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), new THREE.MeshBasicMaterial({ color }));
          scene.add(particle);
          flows.push({ curve, line, particle, speed, offset, color });
        };
        addFlow([-32, 6, -12], [-21, 3, -10], AMBER, 0.1, 0.0);
        addFlow([-21, 4, -10], [-10, 2, -8], AMBER, 0.13, 0.4);
        addFlow([6, 3, -13], [-10, 2, -8], ACCENT, 0.15, 0.2);
        addFlow([-1, 3.4, 9], [-10, 2, -8], 0xf4d06a, 0.12, 0.7);
        addFlow([28, 22, 18], [-10, 2, -8], CYAN, 0.08, 0.5);
        addFlow([38, 22, 14], [-10, 2, -8], CYAN, 0.08, 0.9);
        addFlow([34, 3, 4], [-10, 2, -8], ROSE, 0.1, 0.6);
        addFlow([-10, 2, -8], [24, 5, -2], ACCENT, 0.1, 0.3);
        addFlow([-10, 2, -8], [12, 2, 3], CYAN, 0.11, 0.75);
        addFlow([-10, 2, -8], [-15, 2, 10], VIOLET, 0.12, 0.9);

        // Selection.
        const selRing = new THREE.Mesh(
          new THREE.RingGeometry(3.4, 3.55, 56),
          new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false }),
        );
        selRing.rotation.x = -Math.PI / 2;
        selRing.visible = false;
        scene.add(selRing);
        const selectedLabel = document.createElement('div');
        selectedLabel.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(selectedLabel);
        const staticLabels = [
          label('CLP · 11 kV', '#f4bd72', [-32, 18, -12], ctx.labelLayer),
          label('BESS · 2.4 MWh', '#53f0be', [6, 5.6, -13], ctx.labelLayer),
          label('SOLAR · 1.8 MWp', '#f4d06a', [-1, 6, 9], ctx.labelLayer),
          label('DC · 8.4 MW', '#51d6ff', [24, 12, -2], ctx.labelLayer),
        ];

        // State + API.
        let currentScenario: EnergyScenario = scenario;
        let currentSelected: string | null = selectedId;
        let hovered: string | null = null;
        const scenarioData = ENERGY_SCENARIOS[currentScenario];

        const applyScenario = (next: EnergyScenario) => {
          currentScenario = next;
          const s = ENERGY_SCENARIOS[next];
          records.forEach((record) => {
            const asset = ENERGY_ASSETS.find((a) => a.id === record.id)!;
            const active = record.id === 'BESS-01' ? (next === 'island' || next === 'peak' || next === 'carbon' ? 1 : 0.4) :
              record.id === 'GEN-01' ? (next === 'island' ? 1 : 0.2) :
              record.id === 'GRID' ? (next === 'island' ? 0.3 : 1) : 0.8;
            record.bodyMat.emissiveIntensity = active;
            if (record.id === 'GRID') record.bodyMat.emissive.setHex(next === 'island' ? 0x7a3d3d : AMBER);
            if (record.id === 'BESS-01') record.bodyMat.emissive.setHex(ACCENT);
            if (record.id === 'GEN-01') record.bodyMat.emissive.setHex(next === 'island' ? ROSE : 0x3f4a45);
          });
          rotors.forEach((rotor, i) => { rotor.rotation.z += 0.01 * (s.wind > 0.8 ? 1.8 : 1); });
          flows.forEach((flow, i) => {
            const active = next === 'island' && i < 2 ? 0.15 : next === 'carbon' ? 1.25 : 1;
            (flow.line.material as THREE.LineBasicMaterial).opacity = 0.13 + active * 0.2;
            flow.speed = 0.08 + active * 0.04;
          });
          void scenarioData;
        };

        const setSelected = (id: string | null) => {
          currentSelected = id;
          const asset = ENERGY_ASSETS.find((a) => a.id === id);
          const record = records.find((r) => r.id === id);
          selRing.visible = !!record;
          selectedLabel.style.display = record ? 'block' : 'none';
          if (asset && record) {
            selRing.position.set(asset.x, 0.12, asset.z);
            selRing.scale.setScalar(Math.max(1, Math.max(asset.w, asset.d) / 5));
            selectedLabel.innerHTML = `<div style="background:rgba(4,10,12,.94);border:1px solid rgba(83,240,190,.45);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8;box-shadow:0 10px 30px -12px #000;backdrop-filter:blur(10px)"><span style="color:#53f0be;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${asset.short} · ${asset.type.toUpperCase()}</span><div style="margin-top:2px;font-weight:500">${asset.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${asset.load} / ${asset.capacity} MW · ${asset.voltage}</div></div>`;
          }
          setHover(null);
        };

        const setHover = (id: string | null) => {
          if (hovered === id) return;
          hovered = id;
          records.forEach((r) => r.group.scale.setScalar(r.id === id ? 1.012 : 1));
          ctx.renderer.domElement.style.cursor = id ? 'pointer' : 'grab';
        };

        const api: EnergyApi = { setScenario: applyScenario, setSelected };
        apiRef.current = api;
        applyScenario(scenario);
        setSelected(selectedId);

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
          const hit = raycaster.intersectObjects(pickables, false)[0];
          return hit ? (hit.object.userData.assetId as string) : null;
        };
        const move = (event: PointerEvent) => { updatePointer(event); setHover(pick()); };
        const click = (event: PointerEvent) => { updatePointer(event); onSelectRef.current(pick()); };
        ctx.renderer.domElement.addEventListener('pointermove', move);
        ctx.renderer.domElement.addEventListener('pointerup', click);
        ctx.addDispose(() => {
          ctx.renderer.domElement.removeEventListener('pointermove', move);
          ctx.renderer.domElement.removeEventListener('pointerup', click);
        });

        const projected = new THREE.Vector3();
        ctx.addUpdate((dt, elapsed) => {
          rotors.forEach((rotor, i) => {
            rotor.rotation.z += dt * (0.6 + (currentScenario === 'carbon' ? 1.6 : currentScenario === 'peak' ? 0.8 : 0.4)) * (i % 2 ? 1 : 0.8);
          });
          flows.forEach((flow) => {
            const t = (elapsed * flow.speed + flow.offset) % 1;
            flow.particle.position.copy(flow.curve.getPointAt(t));
            (flow.particle.material as THREE.MeshBasicMaterial).opacity = 0.4 + Math.sin(t * Math.PI) * 0.6;
          });
          if (selRing.visible) selRing.rotation.z += dt * 0.45;
          staticLabels.forEach(({ el, pos }) => {
            projected.copy(pos).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            el.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
            el.style.opacity = projected.z < 1 && width > 640 ? '1' : '0';
          });
          const asset = ENERGY_ASSETS.find((a) => a.id === currentSelected);
          if (asset) {
            projected.set(asset.x, asset.h + 2.8, asset.z).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            selectedLabel.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
            selectedLabel.style.opacity = projected.z < 1 && width > 640 ? '1' : '0';
          }
        });
      }}
    />
  );
}
