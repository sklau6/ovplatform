import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import {
  ESG_BUILDING_ASSETS, ESG_BUILDING_SCENARIOS, ESG_FLOORS,
  type EsgBuildingMode, type EsgBuildingScenario, type EsgFloor,
} from '../lib/esgBuildingData';

export type ESGBuildingSelection =
  | { kind: 'floor'; floor: EsgFloor }
  | { kind: 'asset'; id: string; name: string; type: string; metric: string; status: string }
  | null;

export interface ESGBuildingSceneProps {
  mode: EsgBuildingMode;
  scenario: EsgBuildingScenario;
  selected: ESGBuildingSelection;
  autoRotate?: boolean;
  onSelect?: (selection: ESGBuildingSelection) => void;
}

interface ESGBuildingApi {
  setMode: (mode: EsgBuildingMode) => void;
  setScenario: (scenario: EsgBuildingScenario) => void;
  setSelected: (selection: ESGBuildingSelection) => void;
}

const ACCENT = 0x53f0be;
const CYAN = 0x51d6ff;
const AMBER = 0xf4bd72;
const BLUE = 0x45c4f5;
const ROSE = 0xff7088;
const VIOLET = 0xa991ff;
const FLOORS = 12;
const FLOOR_H = 3;

function edge(mesh: THREE.Mesh, color = 0x3f7f7a, opacity = 0.28) {
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
  el.style.cssText = 'position:absolute;transform:translate(-50%,-100%);font-family:"JetBrains Mono Variable",monospace;font-size:7.5px;letter-spacing:.13em;color:rgba(220,242,238,.82);white-space:nowrap;padding:3px 6px;border:1px solid rgba(120,205,195,.18);border-radius:3px;background:rgba(4,11,10,.7);backdrop-filter:blur(3px);';
  layer.appendChild(el);
  return { el, pos: new THREE.Vector3(...pos) };
}

export function ESGBuildingScene({ mode, scenario, selected, autoRotate = false, onSelect }: ESGBuildingSceneProps) {
  const apiRef = useRef<ESGBuildingApi | null>(null);
  const onSelectRef = useRef<(selection: ESGBuildingSelection) => void>(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});

  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selected); }, [selected]);

  return (
    <ThreeStage
      ariaLabel="Interactive 3D ESG building twin with twelve occupied floors, rooftop solar, chiller plant, rainwater harvesting, energy and carbon flows, and wellbeing sensors."
      cameraPosition={[37, 31, 45]}
      target={[0, 17.5, 0]}
      fov={38}
      background={0x030a08}
      fog={{ color: 0x030a08, density: 0.0048 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.16}
      build={(ctx) => {
        const scene = ctx.scene;
        const hemi = new THREE.HemisphereLight(0x9fe0cf, 0x050a08, 0.95);
        scene.add(hemi);
        const key = new THREE.DirectionalLight(0xd8fff5, 1.65);
        key.position.set(-34, 58, 30);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x35d7bd, 0.75);
        rim.position.set(38, 22, -30);
        scene.add(rim);
        const warm = new THREE.PointLight(0xffbd7a, 16, 60, 2);
        warm.position.set(-12, 8, 14);
        scene.add(warm);

        const base = new THREE.Mesh(new THREE.BoxGeometry(34, 1.4, 28), new THREE.MeshStandardMaterial({ color: 0x050e0b, metalness: 0.6, roughness: 0.64 }));
        base.position.y = -0.8;
        scene.add(base);
        scene.add(new THREE.LineSegments(
          new THREE.EdgesGeometry(base.geometry),
          new THREE.LineBasicMaterial({ color: 0x2a6254, transparent: true, opacity: 0.55 }),
        ));
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(33, 27), new THREE.MeshStandardMaterial({ color: 0x081611, roughness: 0.9, metalness: 0.12 }));
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.04;
        scene.add(ground);
        const gridPts: THREE.Vector3[] = [];
        for (let x = -16; x <= 16; x += 2) gridPts.push(new THREE.Vector3(x, 0.01, -13), new THREE.Vector3(x, 0.01, 13));
        for (let z = -13; z <= 13; z += 2) gridPts.push(new THREE.Vector3(-16, 0.01, z), new THREE.Vector3(16, 0.01, z));
        scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(gridPts), new THREE.LineBasicMaterial({ color: 0x1b5f4d, transparent: true, opacity: 0.16 })));

        const concrete = new THREE.MeshStandardMaterial({ color: 0xa5b8ad, roughness: 0.7, metalness: 0.12 });
        const darkConcrete = new THREE.MeshStandardMaterial({ color: 0x58716a, roughness: 0.78, metalness: 0.12 });
        const glass = new THREE.MeshPhysicalMaterial({ color: 0x8ee7d6, transparent: true, opacity: 0.2, roughness: 0.08, metalness: 0.2, side: THREE.DoubleSide, depthWrite: false });
        const mullion = new THREE.MeshStandardMaterial({ color: 0x3b766b, metalness: 0.7, roughness: 0.3 });

        const floorSlabs: THREE.Mesh[] = [];
        const floorMats: THREE.MeshStandardMaterial[] = [];
        const pickables: THREE.Mesh[] = [];
        const assetMeshes: Record<string, THREE.Mesh> = {};

        const podium = new THREE.Mesh(new THREE.BoxGeometry(13, 1.6, 11), darkConcrete);
        podium.position.y = 0.8;
        edge(podium, 0x6a9788, 0.32);
        scene.add(podium);

        const colXs = [-4.6, 0, 4.6];
        const colZs = [-3.8, 0, 3.8];
        for (let f = 0; f < FLOORS; f++) {
          const floor = new THREE.Group();
          floor.position.y = 1.6 + f * FLOOR_H;
          scene.add(floor);
          const slabMat = new THREE.MeshStandardMaterial({ color: 0x7f948b, roughness: 0.62, metalness: 0.2, emissive: 0x000000, emissiveIntensity: 0.4 });
          const slab = new THREE.Mesh(new THREE.BoxGeometry(11, 0.18, 9), slabMat);
          slab.position.y = 0.06;
          slab.userData.level = ESG_FLOORS[f].level;
          slab.userData.selection = { kind: 'floor', level: ESG_FLOORS[f].level };
          edge(slab, 0x7db7a8, 0.32);
          floor.add(slab);
          floorSlabs.push(slab);
          floorMats.push(slabMat);
          pickables.push(slab);

          const core = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.8, 2.6), darkConcrete);
          core.position.set(0, 1.45, 0);
          floor.add(core);
          for (const x of colXs) {
            for (const z of colZs) {
              if (x === 0 && z === 0) continue;
              const col = new THREE.Mesh(new THREE.BoxGeometry(0.32, 2.8, 0.32), concrete);
              col.position.set(x, 1.45, z);
              floor.add(col);
            }
          }
          // Rear and side curtain wall, front left open for the cutaway.
          for (const [x, z, w, d] of [[0, 4.5, 11, 0.06], [-5.5, 0, 0.06, 9], [5.5, 0, 0.06, 9]] as const) {
            const panel = new THREE.Mesh(new THREE.BoxGeometry(w, 2.8, d), glass);
            panel.position.set(x, 1.45, z);
            floor.add(panel);
          }
          for (const x of [-4.4, -2.2, 0, 2.2, 4.4]) {
            const m = new THREE.Mesh(new THREE.BoxGeometry(0.035, 2.8, 0.035), mullion);
            m.position.set(x, 1.45, 4.52);
            floor.add(m);
          }
          // Floor activity strip + ceiling services.
          const strip = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.04, 0.08), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.55 }));
          strip.position.set(0, 2.75, -3.8);
          floor.add(strip);
          const duct = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.22, 0.35), new THREE.MeshStandardMaterial({ color: 0x4f766b, metalness: 0.45, roughness: 0.4 }));
          duct.position.set(-0.4, 2.55, -1.9);
          floor.add(duct);
        }

        // Roof solar, green roof, chillers.
        const roofY = 1.6 + FLOORS * FLOOR_H;
        const solarMat = new THREE.MeshStandardMaterial({ color: 0x123a45, emissive: 0x1d8da3, emissiveIntensity: 0.75, metalness: 0.7, roughness: 0.25 });
        const solarGroup = new THREE.Group();
        for (let i = 0; i < 12; i++) {
          const panel = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.06, 1.2), solarMat);
          panel.position.set(-4.2 + (i % 4) * 2.4, roofY + 0.42, -2.7 + Math.floor(i / 4) * 1.6);
          panel.rotation.x = -0.18;
          solarGroup.add(panel);
        }
        solarGroup.userData.assetId = 'SOLAR-ROOF';
        assetMeshes['SOLAR-ROOF'] = solarGroup.children[0] as THREE.Mesh;
        pickables.push(solarGroup.children[0] as THREE.Mesh);
        scene.add(solarGroup);
        const greenRoof = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.25, 3.0), new THREE.MeshStandardMaterial({ color: 0x2d714a, emissive: 0x16472c, emissiveIntensity: 0.45, roughness: 0.8 }));
        greenRoof.position.set(4.0, roofY + 0.12, 2.3);
        greenRoof.userData.assetId = 'GREEN-ROOF';
        assetMeshes['GREEN-ROOF'] = greenRoof;
        pickables.push(greenRoof);
        edge(greenRoof, 0x4c9c6a, 0.3);
        scene.add(greenRoof);
        const chillerMat = new THREE.MeshStandardMaterial({ color: 0x56736d, metalness: 0.55, roughness: 0.4 });
        const chiller = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 2.2, 16), chillerMat);
        chiller.rotation.z = Math.PI / 2;
        chiller.position.set(-1.0, roofY + 0.75, 3.4);
        chiller.userData.assetId = 'CHILLER-01';
        assetMeshes['CHILLER-01'] = chiller;
        pickables.push(chiller);
        scene.add(chiller);
        const ahu = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.1, 1.8), new THREE.MeshStandardMaterial({ color: 0x3e5c55, metalness: 0.5, roughness: 0.45 }));
        ahu.position.set(-4.4, roofY + 0.8, 3.6);
        ahu.userData.assetId = 'AHU-12';
        assetMeshes['AHU-12'] = ahu;
        pickables.push(ahu);
        scene.add(ahu);

        // Ground water tank and battery.
        const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 2.2, 20), new THREE.MeshStandardMaterial({ color: 0x2e6b73, metalness: 0.5, roughness: 0.4, emissive: 0x0d3b45, emissiveIntensity: 0.4 }));
        tank.position.set(-6.3, 1.2, 5.4);
        tank.userData.assetId = 'WATER-TANK';
        assetMeshes['WATER-TANK'] = tank;
        pickables.push(tank);
        edge(tank, 0x4e9aaa, 0.3);
        scene.add(tank);
        const battery = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.5, 1.5), new THREE.MeshStandardMaterial({ color: 0x245446, metalness: 0.55, roughness: 0.4, emissive: 0x1a7d61, emissiveIntensity: 0.3 }));
        battery.position.set(5.8, 0.9, 5.2);
        battery.userData.assetId = 'BESS-01';
        assetMeshes['BESS-01'] = battery;
        pickables.push(battery);
        edge(battery, 0x54b78d, 0.3);
        scene.add(battery);

        // Vertical energy, water and sensor systems.
        const energyRiser = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, FLOORS * FLOOR_H, 7), new THREE.MeshStandardMaterial({ color: AMBER, emissive: 0x6a3c0d, emissiveIntensity: 0.55, metalness: 0.5, roughness: 0.35 }));
        energyRiser.position.set(4.2, 1.6 + (FLOORS * FLOOR_H) / 2, -3.2);
        scene.add(energyRiser);
        const waterRiser = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, FLOORS * FLOOR_H, 7), new THREE.MeshStandardMaterial({ color: BLUE, emissive: 0x0c4056, emissiveIntensity: 0.55, metalness: 0.5, roughness: 0.35 }));
        waterRiser.position.set(-4.2, 1.6 + (FLOORS * FLOOR_H) / 2, -3.2);
        scene.add(waterRiser);
        const wellbeingSensors = new THREE.Group();
        for (let f = 0; f < FLOORS; f++) {
          for (const x of [-3.2, 3.2]) {
            const sensor = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.65 }));
            sensor.position.set(x, 1.6 + f * FLOOR_H + 2.35, -2.8);
            wellbeingSensors.add(sensor);
          }
        }
        scene.add(wellbeingSensors);

        // Carbon plume.
        const carbonCount = 280;
        const carbonGeo = new THREE.BufferGeometry();
        const carbonPos = new Float32Array(carbonCount * 3);
        const carbonColors = new Float32Array(carbonCount * 3);
        for (let i = 0; i < carbonCount; i++) {
          carbonPos[i * 3] = (Math.sin(i * 12.9898) * 43758.5453 % 11) - 1.5;
          carbonPos[i * 3 + 1] = 3 + (i % 12) * 2.8;
          carbonPos[i * 3 + 2] = (Math.cos(i * 78.233) * 43758.5453 % 9) - 2.5;
          const c = new THREE.Color(i % 3 === 0 ? 0xff8a70 : 0xf4bd72);
          carbonColors[i * 3] = c.r; carbonColors[i * 3 + 1] = c.g; carbonColors[i * 3 + 2] = c.b;
        }
        carbonGeo.setAttribute('position', new THREE.BufferAttribute(carbonPos, 3));
        carbonGeo.setAttribute('color', new THREE.BufferAttribute(carbonColors, 3));
        const carbon = new THREE.Points(carbonGeo, new THREE.PointsMaterial({ size: 0.2, vertexColors: true, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
        scene.add(carbon);

        // Selection.
        const selRing = new THREE.Mesh(
          new THREE.RingGeometry(6.0, 6.15, 56),
          new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }),
        );
        selRing.rotation.x = -Math.PI / 2;
        selRing.visible = false;
        scene.add(selRing);
        const selectedLabel = document.createElement('div');
        selectedLabel.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(selectedLabel);
        const staticLabels = [
          label('BEAM PLUS PLATINUM', '#53f0be', [0, roofY + 3.2, 0], ctx.labelLayer),
          label('NET ZERO 2040', '#51d6ff', [-6.2, 4, 5.8], ctx.labelLayer),
          label('SOLAR · 386 kWp', '#f4bd72', [2, roofY + 2.2, 3], ctx.labelLayer),
        ];

        let currentMode: EsgBuildingMode = mode;
        let currentScenario: EsgBuildingScenario = scenario;
        let currentSelected = selected;

        const applyMode = () => {
          const s = ESG_BUILDING_SCENARIOS[currentScenario];
          floorMats.forEach((mat, i) => {
            const floor = ESG_FLOORS[i];
            const value = currentMode === 'energy' ? floor.energy : currentMode === 'carbon' ? floor.carbon : currentMode === 'water' ? floor.water * 25 : floor.comfort;
            const color = currentMode === 'energy'
              ? value > 100 ? ROSE : value > 85 ? AMBER : ACCENT
              : currentMode === 'carbon' ? value > 33 ? ROSE : value > 27 ? AMBER : ACCENT
                : currentMode === 'water' ? BLUE : value > 80 ? ACCENT : value > 74 ? AMBER : CYAN;
            mat.emissive.setHex(color);
            mat.emissiveIntensity = currentMode === 'carbon' ? 0.55 : 0.4;
            mat.color.setHex(currentMode === 'water' ? 0x315d66 : 0x7f948b);
          });
          energyRiser.visible = currentMode !== 'water' && currentMode !== 'wellbeing';
          waterRiser.visible = currentMode === 'water';
          wellbeingSensors.visible = currentMode === 'wellbeing';
          carbon.visible = currentMode === 'carbon' || currentScenario !== 'now';
          (carbon.material as THREE.PointsMaterial).opacity = currentScenario === 'now' ? 0.5 : currentScenario === 'retrofit' ? 0.24 : 0.08;
          carbon.geometry.setDrawRange(0, currentScenario === 'now' ? carbonCount : currentScenario === 'retrofit' ? Math.floor(carbonCount * 0.5) : Math.floor(carbonCount * 0.15));
          (solarMat as THREE.MeshStandardMaterial).emissiveIntensity = currentScenario === 'now' ? 0.7 : currentScenario === 'retrofit' ? 1.05 : 1.4;
          void s;
        };

        const setSelected = (next: ESGBuildingSelection) => {
          currentSelected = next;
          if (!next) {
            selRing.visible = false;
            selectedLabel.style.display = 'none';
            return;
          }
          if (next.kind === 'floor') {
            const floor = ESG_FLOORS.find((f) => f.level === next.floor.level);
            if (!floor) return;
            const idx = ESG_FLOORS.findIndex((f) => f.level === floor.level);
            selRing.visible = true;
            selRing.position.set(0, 1.6 + idx * FLOOR_H + 0.12, 0);
            selectedLabel.style.display = 'block';
            selectedLabel.innerHTML = `<div style="background:rgba(4,11,10,.96);border:1px solid rgba(83,240,190,.48);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:#53f0be;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">L${String(floor.level).padStart(2, '0')} · ${floor.cert}</span><div style="margin-top:2px;font-weight:500">${floor.use}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">Occupancy ${floor.occupancy}% · ${floor.comfort} comfort index</div></div>`;
          } else {
            const mesh = assetMeshes[next.id];
            selRing.visible = true;
            if (mesh) selRing.position.set(mesh.position.x, 0.2, mesh.position.z);
            selectedLabel.style.display = 'block';
            selectedLabel.innerHTML = `<div style="background:rgba(4,11,10,.96);border:1px solid rgba(81,214,255,.48);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8"><span style="color:#51d6ff;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${next.id} · ${next.type}</span><div style="margin-top:2px;font-weight:500">${next.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${next.metric} · ${next.status}</div></div>`;
          }
        };

        const api: ESGBuildingApi = {
          setMode: (value) => { currentMode = value; applyMode(); },
          setScenario: (value) => { currentScenario = value; applyMode(); },
          setSelected,
        };
        apiRef.current = api;
        applyMode();
        setSelected(selected);

        // Picking.
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        const updatePointer = (event: PointerEvent) => {
          const rect = ctx.renderer.domElement.getBoundingClientRect();
          pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        };
        const pick = (): ESGBuildingSelection => {
          raycaster.setFromCamera(pointer, ctx.camera);
          const hit = raycaster.intersectObjects(pickables, false)[0];
          if (!hit) return null;
          const data = hit.object.userData.selection;
          if (data?.kind === 'floor') {
            const floor = ESG_FLOORS.find((f) => f.level === data.level);
            return floor ? { kind: 'floor', floor } : null;
          }
          const id = hit.object.userData.assetId as string | undefined;
          const asset = ESG_BUILDING_ASSETS.find((a) => a.id === id);
          return asset ? { kind: 'asset', ...asset } : null;
        };
        const move = (event: PointerEvent) => {
          updatePointer(event);
          ctx.renderer.domElement.style.cursor = pick() ? 'pointer' : 'grab';
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
          const pos = carbon.geometry.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < carbonCount; i++) {
            let y = pos.getY(i) + dt * (1.2 + (i % 4) * 0.3);
            if (y > roofY + 14) y = 2 + (i % 12) * 2.8;
            pos.setY(i, y);
          }
          pos.needsUpdate = true;
          wellbeingSensors.children.forEach((sensor, i) => {
            const mesh = sensor as THREE.Mesh;
            mesh.scale.setScalar(1 + Math.sin(elapsed * 2 + i) * 0.18);
          });
          if (selRing.visible) selRing.rotation.z += dt * 0.4;
          staticLabels.forEach(({ el, pos: p }) => {
            projected.copy(p).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            el.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
            el.style.opacity = projected.z < 1 && width > 680 ? '1' : '0';
          });
          const selectedNow = currentSelected;
          if (selectedNow?.kind === 'floor') {
            const idx = ESG_FLOORS.findIndex((f) => f.level === selectedNow.floor.level);
            projected.set(0, 1.6 + idx * FLOOR_H + 2.8, 4.6).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            selectedLabel.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
          }
        });
      }}
    />
  );
}
