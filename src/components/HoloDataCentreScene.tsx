import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import {
  HOLO_ASSET_LIST, HOLO_RACKS, type HoloLayout, type HoloMode, type HoloRack,
} from '../lib/holoBimData';

export type HoloSelection =
  | { kind: 'rack'; rack: HoloRack }
  | { kind: 'asset'; id: string; name: string; type: string; metric: string; status: string }
  | null;

export interface HoloSceneProps {
  mode: HoloMode;
  layout: HoloLayout;
  explode: number;
  selected: HoloSelection;
  autoRotate?: boolean;
  onSelect?: (selection: HoloSelection) => void;
}

interface HoloApi {
  setMode: (mode: HoloMode) => void;
  setLayout: (layout: HoloLayout) => void;
  setExplode: (value: number) => void;
  setSelected: (selection: HoloSelection) => void;
}

interface RackRecord {
  group: THREE.Group;
  bodyMat: THREE.MeshStandardMaterial;
  ledMats: THREE.MeshBasicMaterial[];
  baseY: number;
  rack: HoloRack;
}

const CYAN = 0x51d6ff;
const GREEN = 0x53f0be;
const AMBER = 0xf4bd72;
const VIOLET = 0xa991ff;
const ORANGE = 0xff9f43;
const BLUE = 0x45c4f5;
const ROSE = 0xff7088;

function edge(mesh: THREE.Mesh, color = 0x2e6b75, opacity = 0.35) {
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
  el.style.cssText = 'position:absolute;transform:translate(-50%,-100%);font-family:"JetBrains Mono Variable",monospace;font-size:7.5px;letter-spacing:.14em;color:rgba(218,244,248,.82);white-space:nowrap;padding:3px 6px;border:1px solid rgba(120,200,215,.18);border-radius:3px;background:rgba(3,10,14,.7);backdrop-filter:blur(3px);';
  layer.appendChild(el);
  return { el, pos: new THREE.Vector3(...pos) };
}

function glowSprite(color: number, size: number) {
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ color, transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending }));
  sprite.scale.set(size, size, 1);
  return sprite;
}

export function HoloDataCentreScene({ mode, layout, explode, selected, autoRotate = false, onSelect }: HoloSceneProps) {
  const apiRef = useRef<HoloApi | null>(null);
  const onSelectRef = useRef<(selection: HoloSelection) => void>(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});

  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setLayout(layout); }, [layout]);
  useEffect(() => { apiRef.current?.setExplode(explode); }, [explode]);
  useEffect(() => { apiRef.current?.setSelected(selected); }, [selected]);

  return (
    <ThreeStage
      ariaLabel="Holographic BIM data centre digital twin with 32 IT racks, containment, cable trays, power, cooling, scan plane, live telemetry and exploded view."
      cameraPosition={[30, 22, 38]}
      target={[0, 3.2, 0]}
      fov={38}
      background={0x020509}
      fog={{ color: 0x020509, density: 0.0045 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.22}
      build={(ctx) => {
        const scene = ctx.scene;
        const hemi = new THREE.HemisphereLight(0x8fd9e5, 0x030608, 1.05);
        scene.add(hemi);
        const key = new THREE.DirectionalLight(0xc8f5ff, 1.95);
        key.position.set(-30, 42, 30);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x27d8c6, 1.15);
        rim.position.set(36, 18, -34);
        scene.add(rim);
        const warm = new THREE.PointLight(0xffa65c, 20, 60, 2);
        warm.position.set(-18, 8, 0);
        scene.add(warm);
        const blue = new THREE.PointLight(0x48b9ff, 16, 60, 2);
        blue.position.set(20, 10, -4);
        scene.add(blue);

        // Stage floor and holo platform.
        const platform = new THREE.Mesh(
          new THREE.BoxGeometry(66, 1.0, 44),
          new THREE.MeshStandardMaterial({ color: 0x040b0e, metalness: 0.7, roughness: 0.55 }),
        );
        platform.position.y = -0.6;
        scene.add(platform);
        const platformEdge = new THREE.LineSegments(
          new THREE.EdgesGeometry(platform.geometry),
          new THREE.LineBasicMaterial({ color: 0x2ed8ff, transparent: true, opacity: 0.55 }),
        );
        platformEdge.position.y = -0.1;
        scene.add(platformEdge);

        const floor = new THREE.Group();
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x071216, metalness: 0.65, roughness: 0.4 });
        const raised = new THREE.Mesh(new THREE.BoxGeometry(52, 0.18, 30), floorMat);
        raised.position.y = 0.12;
        floor.add(raised);
        const floorGrid: THREE.Vector3[] = [];
        for (let x = -25; x <= 25; x += 2) floorGrid.push(new THREE.Vector3(x, 0.23, -14.6), new THREE.Vector3(x, 0.23, 14.6));
        for (let z = -14; z <= 14; z += 2) floorGrid.push(new THREE.Vector3(-25.5, 0.23, z), new THREE.Vector3(25.5, 0.23, z));
        floor.add(new THREE.LineSegments(
          new THREE.BufferGeometry().setFromPoints(floorGrid),
          new THREE.LineBasicMaterial({ color: 0x1c8c9d, transparent: true, opacity: 0.2 }),
        ));
        const floorEdge = new THREE.Mesh(new THREE.BoxGeometry(52.6, 0.05, 30.6), new THREE.MeshBasicMaterial({ color: 0x2bd8ff, transparent: true, opacity: 0.35 }));
        floorEdge.position.y = 0.06;
        floor.add(floorEdge);
        scene.add(floor);

        const rackGroup = new THREE.Group();
        const containmentGroup = new THREE.Group();
        const trayGroup = new THREE.Group();
        const powerGroup = new THREE.Group();
        const coolingGroup = new THREE.Group();
        const structureGroup = new THREE.Group();
        const liquidGroup = new THREE.Group();
        scene.add(rackGroup, containmentGroup, trayGroup, powerGroup, coolingGroup, structureGroup, liquidGroup);

        const rackRecords: RackRecord[] = [];
        const pickables: THREE.Mesh[] = [];
        const rackBodyMat = new THREE.MeshStandardMaterial({ color: 0x20393f, metalness: 0.7, roughness: 0.34 });
        const rackFaceMat = new THREE.MeshStandardMaterial({ color: 0x0a1418, metalness: 0.5, roughness: 0.42 });

        for (const rack of HOLO_RACKS) {
          const group = new THREE.Group();
          group.position.set(rack.x, 0.2, rack.z);
          const bodyMat = rackBodyMat.clone();
          const body = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.35, 1.15), bodyMat);
          body.position.y = 1.2;
          body.userData.selection = { kind: 'rack', id: rack.id };
          group.add(body);
          pickables.push(body);
          edge(body, 0x3a8a92, 0.3);
          const face = new THREE.Mesh(new THREE.BoxGeometry(1.62, 2.22, 0.04), rackFaceMat);
          face.position.set(0, 1.2, 0.6);
          group.add(face);
          const ledMats: THREE.MeshBasicMaterial[] = [];
          const ledColors = rack.status === 'maintenance' ? [0xff9f43] : rack.status === 'warm' ? [0xf4bd72, 0x53f0be] : [0x53f0be, 0x51d6ff];
          for (let i = 0; i < 6; i++) {
            const mat = new THREE.MeshBasicMaterial({ color: ledColors[i % ledColors.length], transparent: true, opacity: 0.9 });
            ledMats.push(mat);
            const led = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.18, 0.035), mat);
            led.position.set(-0.62 + (i % 3) * 0.62, 0.55 + Math.floor(i / 3) * 1.25, 0.625);
            group.add(led);
          }
          const badge = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.02), new THREE.MeshBasicMaterial({ color: rack.type === 'GPU' ? ORANGE : rack.type === 'Storage' ? VIOLET : CYAN, transparent: true, opacity: 0.8 }));
          badge.position.set(0, 2.3, 0.62);
          group.add(badge);
          rackGroup.add(group);
          rackRecords.push({ group, bodyMat, ledMats, baseY: 0.2, rack });
        }

        // Cold aisle containment roofs.
        for (const z of [-6, 6]) {
          const roof = new THREE.Mesh(
            new THREE.BoxGeometry(43, 0.06, 3.1),
            new THREE.MeshPhysicalMaterial({ color: 0x4cd9ea, transparent: true, opacity: 0.12, roughness: 0.05, metalness: 0.2, side: THREE.DoubleSide, depthWrite: false }),
          );
          roof.position.set(0, 2.8, z);
          containmentGroup.add(roof);
          const rail = new THREE.Mesh(new THREE.BoxGeometry(43.2, 0.04, 0.05), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.65 }));
          rail.position.set(0, 2.84, z);
          containmentGroup.add(rail);
        }

        // Cold aisle floor light strips.
        for (const z of [-6, 6]) {
          const strip = new THREE.Mesh(new THREE.BoxGeometry(42, 0.04, 0.1), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.55 }));
          strip.position.set(0, 0.25, z);
          containmentGroup.add(strip);
        }

        // Overhead cable trays, busways and data particles.
        const trayMat = new THREE.MeshStandardMaterial({ color: 0x6d5ba8, metalness: 0.55, roughness: 0.35, emissive: 0x2b1f55, emissiveIntensity: 0.5 });
        const busMat = new THREE.MeshStandardMaterial({ color: 0x7a5b2d, metalness: 0.6, roughness: 0.35, emissive: 0x4b2b0b, emissiveIntensity: 0.4 });
        for (const z of [-9, -3, 3, 9]) {
          const tray = new THREE.Mesh(new THREE.BoxGeometry(42, 0.12, 0.65), trayMat);
          tray.position.set(0, 3.9, z);
          trayGroup.add(tray);
          const bus = new THREE.Mesh(new THREE.BoxGeometry(42, 0.18, 0.24), busMat);
          bus.position.set(0, 3.55, z + 0.75);
          powerGroup.add(bus);
          const hangerPts: THREE.Vector3[] = [];
          for (const x of [-20, -10, 0, 10, 20]) hangerPts.push(new THREE.Vector3(x, 3.9, z), new THREE.Vector3(x, 6.6, z));
          structureGroup.add(new THREE.LineSegments(
            new THREE.BufferGeometry().setFromPoints(hangerPts),
            new THREE.LineBasicMaterial({ color: 0x335a63, transparent: true, opacity: 0.35 }),
          ));
        }
        const particleCount = 260;
        const particlePos = new Float32Array(particleCount * 3);
        const particleColors = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
          particlePos[i * 3] = -21 + (i % 84) * 0.5;
          particlePos[i * 3 + 1] = 3.75 + (i % 3) * 0.12;
          particlePos[i * 3 + 2] = [-9, -3, 3, 9][i % 4];
          const c = new THREE.Color(i % 4 === 0 ? CYAN : i % 3 === 0 ? VIOLET : GREEN);
          particleColors[i * 3] = c.r; particleColors[i * 3 + 1] = c.g; particleColors[i * 3 + 2] = c.b;
        }
        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
        particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
        const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ size: 0.12, vertexColors: true, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending }));
        trayGroup.add(particles);

        // CRAC units, UPS, switchgear and chillers.
        const assetMeshes: Record<string, THREE.Mesh> = {};
        for (const [i, z] of [-9, -3, 3, 9].entries()) {
          for (const x of [-26.5, 26.5]) {
            const crac = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.0, 2.2), new THREE.MeshStandardMaterial({ color: 0x2a4b4e, metalness: 0.55, roughness: 0.4 }));
            crac.position.set(x, 1.5, z);
            crac.userData.selection = { kind: 'asset', id: i % 2 === 0 ? 'CRAC-01' : 'CRAC-02' };
            assetMeshes[i % 2 === 0 ? 'CRAC-01' : 'CRAC-02'] = crac;
            edge(crac, 0x57a8a0, 0.3);
            coolingGroup.add(crac);
            pickables.push(crac);
            const glow = glowSprite(0x53f0be, 3.4);
            glow.position.set(x, 3.4, z);
            coolingGroup.add(glow);
            const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.08, 16), new THREE.MeshStandardMaterial({ color: 0x142426, metalness: 0.6, roughness: 0.35 }));
            fan.rotation.x = Math.PI / 2;
            fan.position.set(x, 3.05, z);
            coolingGroup.add(fan);
          }
        }
        for (const [x, id, labelText] of [[-21, 'UPS-A', 'UPS A'], [-21, 'UPS-B', 'UPS B'], [21, 'PDU-03', 'PDU 03']] as const) {
          const box = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.6, 2.0), new THREE.MeshStandardMaterial({ color: 0x4b4230, metalness: 0.55, roughness: 0.4 }));
          box.position.set(x, 1.3, -13.2);
          box.userData.selection = { kind: 'asset', id };
          edge(box, 0x99865e, 0.35);
          powerGroup.add(box);
          pickables.push(box);
          assetMeshes[id] = box;
          const tag = label(labelText, '#f4bd72', [x, 3.7, -13.2], ctx.labelLayer);
          void tag;
        }
        const chiller = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 4.0, 20), new THREE.MeshStandardMaterial({ color: 0x40636a, metalness: 0.55, roughness: 0.4 }));
        chiller.rotation.z = Math.PI / 2;
        chiller.position.set(0, 1.1, -16.5);
        chiller.userData.selection = { kind: 'asset', id: 'CHILLER-01' };
        coolingGroup.add(chiller);
        pickables.push(chiller);
        assetMeshes['CHILLER-01'] = chiller;

        // Cooling loops.
        const pipeMat = new THREE.MeshStandardMaterial({ color: 0x2fb7d8, metalness: 0.55, roughness: 0.3, emissive: 0x0b4b61, emissiveIntensity: 0.55 });
        for (const x of [-23.5, 23.5]) {
          const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 29, 8), pipeMat);
          pipe.rotation.x = Math.PI / 2;
          pipe.position.set(x, 0.65, 0);
          coolingGroup.add(pipe);
        }
        // Liquid manifold for AI layout.
        for (const z of [-12, 12]) {
          const manifold = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 44, 10), new THREE.MeshStandardMaterial({ color: 0x37e0c5, metalness: 0.6, roughness: 0.28, emissive: 0x0b6c5b, emissiveIntensity: 0.5 }));
          manifold.rotation.z = Math.PI / 2;
          manifold.position.set(0, 3.0, z);
          liquidGroup.add(manifold);
          for (let x = -20; x <= 20; x += 5) {
            const drop = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.6, 6), pipeMat);
            drop.position.set(x, 2.2, z);
            liquidGroup.add(drop);
          }
        }

        // Structural frame / roof grid.
        for (const x of [-25.5, 25.5]) {
          for (const z of [-14.5, 14.5]) {
            const col = new THREE.Mesh(new THREE.BoxGeometry(0.45, 7.2, 0.45), new THREE.MeshStandardMaterial({ color: 0x2d4b51, metalness: 0.65, roughness: 0.35 }));
            col.position.set(x, 3.6, z);
            structureGroup.add(col);
          }
        }
        for (const z of [-14, -7, 0, 7, 14]) {
          const beam = new THREE.Mesh(new THREE.BoxGeometry(53, 0.2, 0.22), new THREE.MeshStandardMaterial({ color: 0x28474d, metalness: 0.65, roughness: 0.35 }));
          beam.position.set(0, 6.9, z);
          structureGroup.add(beam);
        }

        // Holographic rings and scan plane.
        const rings: THREE.Mesh[] = [];
        for (const r of [29, 33]) {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.035, 6, 120), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.22 }));
          ring.rotation.x = Math.PI / 2;
          ring.position.y = 0.35;
          scene.add(ring);
          rings.push(ring);
        }
        const scanMat = new THREE.MeshBasicMaterial({ color: 0x51d6ff, transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
        const scan = new THREE.Mesh(new THREE.PlaneGeometry(54, 32), scanMat);
        scan.rotation.x = -Math.PI / 2;
        scan.position.y = 0.5;
        scene.add(scan);
        const scanEdge = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.PlaneGeometry(54, 32)),
          new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.35 }),
        );
        scanEdge.rotation.x = -Math.PI / 2;
        scene.add(scanEdge);

        // Selection.
        const selRing = new THREE.Mesh(
          new THREE.RingGeometry(1.2, 1.32, 40),
          new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }),
        );
        selRing.rotation.x = -Math.PI / 2;
        selRing.visible = false;
        scene.add(selRing);
        const selectedLabel = document.createElement('div');
        selectedLabel.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(selectedLabel);
        const staticLabels = [
          label('DC-03 · AI HALL', '#51d6ff', [0, 8.4, 0], ctx.labelLayer),
          label('PUE · LIVE', '#53f0be', [-25, 6.2, -12], ctx.labelLayer),
          label('IT LOAD · LIVE', '#ff9f43', [25, 6.2, 12], ctx.labelLayer),
        ];

        const setHover = (id: string | null) => {
          ctx.renderer.domElement.style.cursor = id ? 'pointer' : 'grab';
        };

        let currentMode: HoloMode = mode;
        let currentLayout: HoloLayout = layout;
        let currentExplode = explode;
        let targetExplode = explode;
        let currentSelected = selected;
        const modeColor: Record<HoloMode, number> = { overview: CYAN, power: AMBER, cooling: BLUE, network: VIOLET, ai: ORANGE };

        const applyMode = () => {
          rackRecords.forEach((record, i) => {
            const hot = record.rack.status === 'warm' || record.rack.status === 'maintenance';
            const color = currentMode === 'power' ? (record.rack.load > 34 ? ROSE : record.rack.load > 26 ? AMBER : GREEN) :
              currentMode === 'cooling' ? BLUE :
              currentMode === 'network' ? VIOLET :
              currentMode === 'ai' ? (i % 3 === 0 ? ORANGE : GREEN) : CYAN;
            record.bodyMat.color.setHex(currentMode === 'power' && hot ? 0x422a23 : 0x20393f);
            record.bodyMat.emissive.setHex(color);
            record.bodyMat.emissiveIntensity = currentMode === 'overview' ? 0.12 : currentMode === 'power' && hot ? 0.5 : 0.28;
            record.ledMats.forEach((m) => m.color.setHex(color));
          });
          (trayMat as THREE.MeshStandardMaterial).emissive.setHex(currentMode === 'network' ? 0x522f9e : 0x2b1f55);
          (pipeMat as THREE.MeshStandardMaterial).emissiveIntensity = currentMode === 'cooling' ? 1.1 : 0.4;
          liquidGroup.visible = currentLayout === 'ai';
        };

        const setSelected = (next: HoloSelection) => {
          currentSelected = next;
          if (!next) {
            selRing.visible = false;
            selectedLabel.style.display = 'none';
            return;
          }
          if (next.kind === 'rack') {
            const rec = rackRecords.find((r) => r.rack.id === next.rack.id);
            if (!rec) return;
            selRing.visible = true;
            selRing.position.set(rec.rack.x, 0.27, rec.rack.z);
            selectedLabel.style.display = 'block';
            selectedLabel.innerHTML = `<div style="background:rgba(3,10,14,.96);border:1px solid rgba(81,214,255,.5);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eaffff"><span style="color:#51d6ff;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${rec.rack.id} · ${rec.rack.type}</span><div style="margin-top:2px;font-weight:500">IT rack · row ${rec.rack.row + 1}</div><div style="margin-top:1px;color:#93b2b8;font-size:8px">${rec.rack.load} kW · ${rec.rack.temp}°C · ${rec.rack.status}</div></div>`;
          } else {
            selRing.visible = true;
            const mesh = assetMeshes[next.id];
            if (mesh) selRing.position.set(mesh.position.x, 0.27, mesh.position.z);
            selectedLabel.style.display = 'block';
            selectedLabel.innerHTML = `<div style="background:rgba(3,10,14,.96);border:1px solid rgba(83,240,190,.45);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eaffff"><span style="color:#53f0be;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${next.id} · ${next.type}</span><div style="margin-top:2px;font-weight:500">${next.name}</div><div style="margin-top:1px;color:#93b2b8;font-size:8px">${next.metric} · ${next.status}</div></div>`;
          }
        };

        const api: HoloApi = {
          setMode: (value) => { currentMode = value; applyMode(); },
          setLayout: (value) => { currentLayout = value; applyMode(); },
          setExplode: (value) => { targetExplode = value; },
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
        const pick = (): HoloSelection => {
          raycaster.setFromCamera(pointer, ctx.camera);
          const hit = raycaster.intersectObjects(pickables, false)[0];
          if (!hit) return null;
          const data = hit.object.userData.selection;
          if (!data) return null;
          if (data.kind === 'rack') {
            const rack = HOLO_RACKS.find((r) => r.id === data.id);
            return rack ? { kind: 'rack', rack } : null;
          }
          const asset = HOLO_ASSET_LIST.find((a) => a.id === data.id);
          return asset ? { kind: 'asset', ...asset } : null;
        };
        const move = (event: PointerEvent) => { updatePointer(event); setHover(pick() ? 'hover' : null); };
        const click = (event: PointerEvent) => { updatePointer(event); onSelectRef.current(pick()); };
        ctx.renderer.domElement.addEventListener('pointermove', move);
        ctx.renderer.domElement.addEventListener('pointerup', click);
        ctx.addDispose(() => {
          ctx.renderer.domElement.removeEventListener('pointermove', move);
          ctx.renderer.domElement.removeEventListener('pointerup', click);
        });

        const projected = new THREE.Vector3();
        ctx.addUpdate((dt, elapsed) => {
          currentExplode += (targetExplode - currentExplode) * Math.min(1, dt * 3.5);
          rackGroup.position.y = currentExplode * 1.0;
          trayGroup.position.y = currentExplode * 4.2;
          containmentGroup.position.y = currentExplode * 2.4;
          coolingGroup.position.y = currentExplode * 1.5;
          structureGroup.position.y = currentExplode * 5.2;
          floor.position.y = -currentExplode * 1.0;
          liquidGroup.position.y = currentExplode * 1.2;
          scan.position.y = 0.5 + ((elapsed * 0.9) % 6.5);
          scanEdge.position.y = scan.position.y + 0.01;
          (scan.material as THREE.MeshBasicMaterial).opacity = 0.035 + Math.sin(elapsed * 2) * 0.012;
          rings[0].rotation.z += dt * 0.12;
          rings[1].rotation.z -= dt * 0.08;
          particles.rotation.y = 0;
          const pp = particles.geometry.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < particleCount; i++) {
            let x = pp.getX(i) + dt * (2 + (i % 4) * 0.6);
            if (x > 21) x = -21;
            pp.setX(i, x);
          }
          pp.needsUpdate = true;
          rackRecords.forEach((r, i) => {
            r.ledMats.forEach((m, j) => { m.opacity = 0.55 + Math.sin(elapsed * 3 + i + j) * 0.35; });
          });
          rackRecords.forEach((r) => {
            const selectedRack = currentSelected?.kind === 'rack' && currentSelected.rack.id === r.rack.id;
            r.group.scale.setScalar(selectedRack ? 1.025 : 1);
          });
          if (selRing.visible) selRing.rotation.z += dt * 0.55;
          staticLabels.forEach(({ el, pos }) => {
            projected.copy(pos).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            el.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
            el.style.opacity = projected.z < 1 && width > 680 ? '1' : '0';
          });
          const selectedNow = currentSelected;
          if (selectedNow?.kind === 'rack') {
            const rec = rackRecords.find((r) => r.rack.id === selectedNow.rack.id);
            if (rec) {
              projected.set(rec.rack.x, 3.2 + rackGroup.position.y, rec.rack.z).project(ctx.camera);
              const width = ctx.container.clientWidth;
              const height = ctx.container.clientHeight;
              selectedLabel.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
            }
          } else if (selectedNow?.kind === 'asset') {
            const mesh = assetMeshes[selectedNow.id];
            if (mesh) {
              projected.set(mesh.position.x, mesh.position.y + 2.2, mesh.position.z).project(ctx.camera);
              const width = ctx.container.clientWidth;
              const height = ctx.container.clientHeight;
              selectedLabel.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
            }
          }
        });
      }}
    />
  );
}
