import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { ESG_ASSETS, type EsgMode, type EsgScenario } from '../lib/esgData';

export interface ESGSceneProps {
  mode: EsgMode;
  scenario: EsgScenario;
  selectedId: string | null;
  autoRotate?: boolean;
  onSelect?: (id: string | null) => void;
}

interface ESGSceneApi {
  setMode: (mode: EsgMode) => void;
  setScenario: (scenario: EsgScenario) => void;
  setSelected: (id: string | null) => void;
}

interface AssetRecord {
  id: string;
  group: THREE.Group;
  bodyMat: THREE.MeshStandardMaterial;
  roof: THREE.Mesh;
  solar: THREE.Group;
  baseY: number;
  carbon: number;
}

const ACCENT = 0x53f0be;
const CYAN = 0x51d6ff;
const AMBER = 0xf4bd72;
const ROSE = 0xff7088;
const VIOLET = 0xa991ff;

function windowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 192;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#081110';
  ctx.fillRect(0, 0, 96, 192);
  for (let x = 4; x < 92; x += 8) {
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.fillRect(x, 0, 1, 192);
  }
  for (let y = 7; y < 188; y += 9) {
    for (let x = 5; x < 92; x += 9) {
      if (Math.random() > 0.45) {
        const alpha = 0.16 + Math.random() * 0.55;
        ctx.fillStyle = Math.random() > 0.82 ? `rgba(244,189,114,${alpha})` : `rgba(119,232,198,${alpha})`;
        ctx.fillRect(x, y, 4, 3.5);
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function energyColor(value: number) {
  if (value < 80) return new THREE.Color(ACCENT);
  if (value < 100) return new THREE.Color(AMBER);
  return new THREE.Color(ROSE);
}

function label(text: string, color: string, pos: [number, number, number], layer: HTMLDivElement) {
  const el = document.createElement('div');
  el.innerHTML = `<span style="display:inline-block;width:4px;height:4px;border-radius:99px;background:${color};box-shadow:0 0 8px ${color};margin-right:5px;vertical-align:1px"></span>${text}`;
  el.style.cssText = 'position:absolute;transform:translate(-50%,-100%);font-family:"JetBrains Mono Variable",monospace;font-size:7.5px;letter-spacing:.12em;color:rgba(220,244,235,.8);white-space:nowrap;padding:3px 6px;border:1px solid rgba(120,210,190,.16);border-radius:3px;background:rgba(4,12,10,.68);backdrop-filter:blur(3px);';
  layer.appendChild(el);
  return { el, pos: new THREE.Vector3(...pos) };
}

export function ESGScene({ mode, scenario, selectedId, autoRotate = false, onSelect }: ESGSceneProps) {
  const apiRef = useRef<ESGSceneApi | null>(null);
  const onSelectRef = useRef<(id: string | null) => void>(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});

  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);
  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);

  return (
    <ThreeStage
      ariaLabel="Interactive ESG twin of a low-carbon district with buildings, solar arrays, wind turbines, carbon particles and nature-based infrastructure."
      cameraPosition={[68, 50, 84]}
      target={[0, 8, 0]}
      fov={40}
      background={0x040907}
      fog={{ color: 0x040907, density: 0.005 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.18}
      build={(ctx) => {
        const scene = ctx.scene;
        const hemi = new THREE.HemisphereLight(0x9bdfc8, 0x06100c, 0.9);
        scene.add(hemi);
        const key = new THREE.DirectionalLight(0xd8fbff, 1.65);
        key.position.set(-48, 72, 40);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x2bd9aa, 0.7);
        rim.position.set(52, 30, -44);
        scene.add(rim);
        const warm = new THREE.PointLight(0xffb86a, 18, 70, 2);
        warm.position.set(-12, 10, 14);
        scene.add(warm);

        // Base land + harbour.
        const base = new THREE.Mesh(
          new THREE.BoxGeometry(96, 2.2, 68),
          new THREE.MeshStandardMaterial({ color: 0x06100c, metalness: 0.55, roughness: 0.7 }),
        );
        base.position.y = -1.3;
        scene.add(base);
        const baseEdge = new THREE.LineSegments(
          new THREE.EdgesGeometry(base.geometry),
          new THREE.LineBasicMaterial({ color: 0x245a4d, transparent: true, opacity: 0.65 }),
        );
        baseEdge.position.y = -1.3;
        scene.add(baseEdge);
        const land = new THREE.Mesh(
          new THREE.PlaneGeometry(95, 49),
          new THREE.MeshStandardMaterial({ color: 0x091b12, roughness: 0.9, metalness: 0.12 }),
        );
        land.rotation.x = -Math.PI / 2;
        land.position.set(0, -0.06, -8);
        scene.add(land);
        const water = new THREE.Mesh(
          new THREE.PlaneGeometry(95, 18),
          new THREE.MeshPhysicalMaterial({ color: 0x031d20, roughness: 0.2, metalness: 0.65, clearcoat: 0.7, clearcoatRoughness: 0.3 }),
        );
        water.rotation.x = -Math.PI / 2;
        water.position.set(0, 0, 27);
        scene.add(water);
        const shore = new THREE.Mesh(
          new THREE.BoxGeometry(95, 0.08, 0.12),
          new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.38 }),
        );
        shore.position.set(0, 0.04, 18);
        scene.add(shore);

        const gridPts: THREE.Vector3[] = [];
        for (let x = -46; x <= 46; x += 4) gridPts.push(new THREE.Vector3(x, 0.01, -32), new THREE.Vector3(x, 0.01, 17));
        for (let z = -32; z <= 17; z += 4) gridPts.push(new THREE.Vector3(-46, 0.01, z), new THREE.Vector3(46, 0.01, z));
        scene.add(new THREE.LineSegments(
          new THREE.BufferGeometry().setFromPoints(gridPts),
          new THREE.LineBasicMaterial({ color: 0x1a5c4b, transparent: true, opacity: 0.16 }),
        ));

        // Park / biodiversity.
        const parkMat = new THREE.MeshStandardMaterial({ color: 0x123b28, emissive: 0x0b2b1c, emissiveIntensity: 0.25, roughness: 0.9 });
        for (const [x, z, w, d] of [[-36, 14, 12, 7], [-6, 15, 10, 5], [30, 12, 14, 8]] as const) {
          const park = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, d), parkMat);
          park.position.set(x, 0.03, z);
          scene.add(park);
        }
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3b2b, roughness: 0.9 });
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x1d5a3b, emissive: 0x0e3522, emissiveIntensity: 0.4, roughness: 0.84 });
        const leafMat2 = new THREE.MeshStandardMaterial({ color: 0x2d7a4d, emissive: 0x13442a, emissiveIntensity: 0.35, roughness: 0.86 });
        const trees: THREE.Group[] = [];
        for (let i = 0; i < 42; i++) {
          const angle = (i / 42) * Math.PI * 2;
          const radius = 20 + (i % 4) * 4;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius * 0.62 + 2;
          if (z > 15.5) continue;
          const tree = new THREE.Group();
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.9, 5), trunkMat);
          trunk.position.y = 0.45;
          tree.add(trunk);
          const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.72, 0), i % 2 ? leafMat : leafMat2);
          crown.position.y = 1.2;
          crown.scale.set(1, 0.9, 1);
          tree.add(crown);
          tree.position.set(x, 0, z);
          tree.userData.baseX = x;
          tree.userData.phase = i * 0.7;
          scene.add(tree);
          trees.push(tree);
        }

        // Green buildings.
        const baseTex = windowTexture();
        const records: AssetRecord[] = [];
        const pickables: THREE.Mesh[] = [];
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x1d5b39, emissive: 0x0e3322, emissiveIntensity: 0.5, roughness: 0.8 });
        const solarMat = new THREE.MeshStandardMaterial({ color: 0x113a4b, emissive: 0x1b7890, emissiveIntensity: 0.55, metalness: 0.7, roughness: 0.24 });
        const concrete = new THREE.MeshStandardMaterial({ color: 0x93a89e, roughness: 0.7, metalness: 0.15 });

        ESG_ASSETS.forEach((asset, index) => {
          const group = new THREE.Group();
          group.position.set(asset.x, 0, asset.z);
          const tex = baseTex.clone();
          tex.needsUpdate = true;
          tex.repeat.set(Math.max(1, Math.round(asset.w / 2.4)), Math.max(2, Math.round(asset.h / 2.4)));
          const bodyMat = new THREE.MeshStandardMaterial({
            color: 0xa8beb2, map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.5, metalness: 0.3, roughness: 0.46,
          });
          const body = new THREE.Mesh(new THREE.BoxGeometry(asset.w, asset.h, asset.d), bodyMat);
          body.position.y = asset.h / 2;
          body.userData.assetId = asset.id;
          group.add(body);
          pickables.push(body);
          const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(body.geometry),
            new THREE.LineBasicMaterial({ color: 0x3f8b73, transparent: true, opacity: 0.28, depthWrite: false }),
          );
          body.add(edges);

          // Terraces / green bands.
          for (let y = 3.2; y < asset.h - 1.2; y += 4.2) {
            const band = new THREE.Mesh(
              new THREE.BoxGeometry(asset.w + 0.5, 0.28, asset.d + 0.5),
              new THREE.MeshStandardMaterial({ color: 0x2a6c45, emissive: 0x174d2e, emissiveIntensity: 0.45, roughness: 0.8 }),
            );
            band.position.y = y;
            group.add(band);
          }

          const roof = new THREE.Mesh(new THREE.BoxGeometry(asset.w * 0.92, 0.22, asset.d * 0.92), roofMat);
          roof.position.y = asset.h + 0.12;
          group.add(roof);

          const solar = new THREE.Group();
          const panelCount = Math.max(1, Math.round(asset.solar / 8));
          for (let i = 0; i < panelCount; i++) {
            const panel = new THREE.Mesh(new THREE.BoxGeometry(asset.w * 0.18, 0.05, asset.d * 0.18), solarMat);
            panel.position.set(-asset.w * 0.28 + (i % 3) * asset.w * 0.28, asset.h + 0.3, -asset.d * 0.22 + Math.floor(i / 3) * asset.d * 0.24);
            panel.rotation.x = -0.22;
            solar.add(panel);
          }
          group.add(solar);
          solar.visible = asset.solar > 10;

          // Rooftop crown / plant.
          const cap = new THREE.Mesh(
            new THREE.BoxGeometry(asset.w * 0.32, 0.5, asset.d * 0.32),
            new THREE.MeshStandardMaterial({ color: 0x2b4a40, metalness: 0.55, roughness: 0.4, emissive: 0x1a513d, emissiveIntensity: 0.4 }),
          );
          cap.position.y = asset.h + 0.55;
          group.add(cap);

          scene.add(group);
          records.push({ id: asset.id, group, bodyMat, roof, solar, baseY: 0, carbon: asset.carbon });

          if (index === 0) {
            // Hero vertical garden + crown.
            for (let i = 0; i < 5; i++) {
              const garden = new THREE.Mesh(
                new THREE.BoxGeometry(asset.w * 0.16, asset.h * 0.1, asset.d * 0.94),
                new THREE.MeshStandardMaterial({ color: 0x2f7a4c, emissive: 0x1a5b36, emissiveIntensity: 0.45, roughness: 0.8 }),
              );
              garden.position.set(-asset.w * 0.42 + i * asset.w * 0.21, asset.h * 0.5, 0);
              group.add(garden);
            }
            const crown = new THREE.Mesh(
              new THREE.ConeGeometry(asset.w * 0.32, 3.2, 4),
              new THREE.MeshStandardMaterial({ color: 0x3c7e5b, emissive: 0x1f6b49, emissiveIntensity: 0.5, metalness: 0.3, roughness: 0.5 }),
            );
            crown.position.y = asset.h + 2.3;
            crown.rotation.y = Math.PI / 4;
            group.add(crown);
          }
        });

        // Solar canopy over the plaza.
        const canopy = new THREE.Group();
        for (let x = -6; x <= 6; x += 2.4) {
          for (let z = -3; z <= 3; z += 2.0) {
            const panel = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 2.0), solarMat);
            panel.position.set(x, 3.4, z);
            panel.rotation.x = -0.18;
            canopy.add(panel);
          }
        }
        for (const [x, z] of [[-6, -3], [6, -3], [-6, 3], [6, 3]]) {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.4, 6), concrete);
          post.position.set(x, 1.7, z);
          canopy.add(post);
        }
        canopy.position.set(0, 0, 10.5);
        scene.add(canopy);

        // Wind turbines.
        const rotors: THREE.Group[] = [];
        const turbineMat = new THREE.MeshStandardMaterial({ color: 0xd9ece4, metalness: 0.4, roughness: 0.4 });
        for (const [i, x] of [-34, -12, 28].entries()) {
          const turbine = new THREE.Group();
          const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.55, 22, 8), turbineMat);
          mast.position.y = 11;
          turbine.add(mast);
          const hub = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), turbineMat);
          hub.position.y = 22;
          turbine.add(hub);
          const rotor = new THREE.Group();
          rotor.position.y = 22;
          for (let b = 0; b < 3; b++) {
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.25, 5.8, 0.14), turbineMat);
            blade.position.y = 2.9;
            blade.rotation.z = (b / 3) * Math.PI * 2;
            blade.position.applyAxisAngle(new THREE.Vector3(0, 0, 1), (b / 3) * Math.PI * 2);
            blade.rotation.z = (b / 3) * Math.PI * 2;
            rotor.add(blade);
          }
          turbine.add(rotor);
          turbine.position.set(x, 0, 22 + (i % 2) * 2);
          scene.add(turbine);
          rotors.push(rotor);
        }

        // Carbon plume particles.
        const carbonCount = 520;
        const carbonGeo = new THREE.BufferGeometry();
        const carbonPos = new Float32Array(carbonCount * 3);
        const carbonColor = new Float32Array(carbonCount * 3);
        const carbonBaseY = new Float32Array(carbonCount);
        let cseed = 19;
        const crand = () => { cseed = (cseed * 16807) % 2147483647; return cseed / 2147483647; };
        for (let i = 0; i < carbonCount; i++) {
          const asset = ESG_ASSETS[i % ESG_ASSETS.length];
          carbonPos[i * 3] = asset.x + (crand() - 0.5) * asset.w;
          carbonPos[i * 3 + 1] = asset.h + crand() * 12;
          carbonPos[i * 3 + 2] = asset.z + (crand() - 0.5) * asset.d;
          carbonBaseY[i] = asset.h + 0.5;
          const c = i % 3 === 0 ? new THREE.Color(0xff8a70) : new THREE.Color(0xf4bd72);
          carbonColor[i * 3] = c.r; carbonColor[i * 3 + 1] = c.g; carbonColor[i * 3 + 2] = c.b;
        }
        carbonGeo.setAttribute('position', new THREE.BufferAttribute(carbonPos, 3));
        carbonGeo.setAttribute('color', new THREE.BufferAttribute(carbonColor, 3));
        const carbon = new THREE.Points(
          carbonGeo,
          new THREE.PointsMaterial({ size: 0.24, vertexColors: true, transparent: true, opacity: 0.65, depthWrite: false, blending: THREE.AdditiveBlending }),
        );
        scene.add(carbon);

        // Clean energy particles.
        const cleanCount = 160;
        const cleanGeo = new THREE.BufferGeometry();
        const cleanPos = new Float32Array(cleanCount * 3);
        for (let i = 0; i < cleanCount; i++) {
          cleanPos[i * 3] = (crand() - 0.5) * 74;
          cleanPos[i * 3 + 1] = 2 + crand() * 22;
          cleanPos[i * 3 + 2] = 22 + (crand() - 0.5) * 10;
        }
        cleanGeo.setAttribute('position', new THREE.BufferAttribute(cleanPos, 3));
        const clean = new THREE.Points(
          cleanGeo,
          new THREE.PointsMaterial({ color: 0x71f5c7, size: 0.18, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }),
        );
        scene.add(clean);

        // Nature fireflies.
        const fireflyGeo = new THREE.BufferGeometry();
        const fireflyPos = new Float32Array(120 * 3);
        for (let i = 0; i < 120; i++) {
          fireflyPos[i * 3] = (crand() - 0.5) * 78;
          fireflyPos[i * 3 + 1] = 0.4 + crand() * 4;
          fireflyPos[i * 3 + 2] = (crand() - 0.5) * 30;
        }
        fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPos, 3));
        const fireflies = new THREE.Points(
          fireflyGeo,
          new THREE.PointsMaterial({ color: 0xffe28a, size: 0.12, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }),
        );
        scene.add(fireflies);

        // Labels.
        const selectedLabel = document.createElement('div');
        selectedLabel.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;';
        ctx.labelLayer.appendChild(selectedLabel);
        const staticLabels = [
          label('KT-01 · 18.2 kgCO₂e/m²', '#53f0be', [0, 25, -2], ctx.labelLayer),
          label('TKO · 42.8 kgCO₂e/m²', '#ff7088', [30, 11, -9], ctx.labelLayer),
          label('OFFSHORE WIND · 38%', '#51d6ff', [-12, 25, 22], ctx.labelLayer),
        ];

        // Selection.
        const selRing = new THREE.Mesh(
          new THREE.RingGeometry(5, 5.18, 64),
          new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }),
        );
        selRing.rotation.x = -Math.PI / 2;
        selRing.visible = false;
        scene.add(selRing);

        // State.
        let currentMode: EsgMode = mode;
        let currentScenario: EsgScenario = scenario;
        let currentSelected: string | null = selectedId;
        let hovered: string | null = null;
        let exploded = 0;
        const currentColor = new THREE.Color();

        const apply = () => {
          records.forEach((record) => {
            const asset = ESG_ASSETS.find((a) => a.id === record.id)!;
            if (currentMode === 'nature') {
              currentColor.setHex(0x4fae79);
              record.bodyMat.emissiveIntensity = 0.36;
            } else {
              const base = currentScenario === 'baseline' ? energyColor(asset.energy) : currentScenario === 'transition' ? energyColor(asset.energy * 0.78) : new THREE.Color(ACCENT);
              currentColor.copy(base);
              record.bodyMat.emissiveIntensity = currentScenario === 'netzero' ? 0.8 : 0.48;
            }
            record.bodyMat.color.copy(currentColor).multiplyScalar(0.7);
            record.bodyMat.emissive.copy(currentColor);
            record.roof.visible = currentMode === 'nature' || currentScenario !== 'baseline';
            record.solar.visible = asset.solar > 10 && (currentScenario !== 'baseline' || currentMode === 'carbon');
            record.solar.children.forEach((panel) => {
              const mat = (panel as THREE.Mesh).material as THREE.MeshStandardMaterial;
              mat.emissiveIntensity = currentScenario === 'baseline' ? 0.25 : currentScenario === 'transition' ? 0.6 : 1.15;
            });
          });
          carbon.material = new THREE.PointsMaterial({
            size: currentMode === 'nature' ? 0.12 : 0.24,
            vertexColors: true,
            transparent: true,
            opacity: currentScenario === 'netzero' ? 0.12 : currentScenario === 'transition' ? 0.38 : 0.65,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          });
          carbon.geometry.setDrawRange(0, currentScenario === 'baseline' ? carbonCount : currentScenario === 'transition' ? Math.floor(carbonCount * 0.5) : Math.floor(carbonCount * 0.16));
          clean.visible = currentScenario !== 'baseline' || currentMode === 'nature';
          fireflies.visible = currentMode === 'nature';
          const sun = currentScenario === 'netzero' ? 1.9 : currentScenario === 'transition' ? 1.3 : 0.8;
          solarMat.emissiveIntensity = sun;
        };

        const setSelected = (id: string | null) => {
          currentSelected = id;
          const asset = ESG_ASSETS.find((a) => a.id === id);
          selRing.visible = !!asset;
          selectedLabel.style.display = asset ? 'block' : 'none';
          if (asset) {
            selRing.position.set(asset.x, 0.1, asset.z);
            selRing.scale.setScalar(Math.max(1, Math.max(asset.w, asset.d) / 8));
            selectedLabel.innerHTML = `<div style="background:rgba(4,12,10,.94);border:1px solid rgba(83,240,190,.45);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8;box-shadow:0 10px 30px -12px #000;backdrop-filter:blur(10px)"><span style="color:#53f0be;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">${asset.short} · ${asset.rating} RATING</span><div style="margin-top:2px;font-weight:500">${asset.name}</div><div style="margin-top:1px;color:#9fb2aa;font-size:8px">${asset.carbon} kgCO₂e/m² · ${asset.cert}</div></div>`;
          }
          setHover(null);
        };

        const setHover = (id: string | null) => {
          if (hovered === id) return;
          hovered = id;
          records.forEach((record) => {
            record.group.scale.setScalar(record.id === id ? 1.015 : 1);
          });
          ctx.renderer.domElement.style.cursor = id ? 'pointer' : 'grab';
        };

        const api: ESGSceneApi = {
          setMode: (value) => { currentMode = value; apply(); },
          setScenario: (value) => { currentScenario = value; apply(); },
          setSelected,
        };
        apiRef.current = api;
        setSelected(selectedId);
        apply();

        // Raycast.
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
            rotor.rotation.z += dt * (currentScenario === 'netzero' ? 1.5 : currentScenario === 'transition' ? 0.9 : 0.45) * (i % 2 ? 1 : 0.8);
          });
          trees.forEach((tree) => {
            tree.rotation.z = Math.sin(elapsed * 0.7 + (tree.userData.phase as number)) * 0.012;
          });
          const positions = carbon.geometry.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < carbonCount; i++) {
            let y = positions.getY(i) + dt * (currentScenario === 'baseline' ? 1.8 : 1.0);
            if (y > carbonBaseY[i] + 16) y = carbonBaseY[i];
            positions.setY(i, y);
            if (currentMode === 'nature') {
              const c = i % 4 === 0 ? new THREE.Color(0x71f5c7) : new THREE.Color(0x3ee0a1);
              carbon.geometry.attributes.color.setXYZ(i, c.r, c.g, c.b);
            }
          }
          positions.needsUpdate = true;
          (carbon.geometry.attributes.color as THREE.BufferAttribute).needsUpdate = true;
          clean.rotation.y = elapsed * 0.03;
          fireflies.rotation.y = -elapsed * 0.015;
          if (selRing.visible) {
            selRing.rotation.z += dt * 0.45;
            selRing.scale.setScalar((1 + Math.sin(elapsed * 2.2) * 0.04) * Math.max(1, (ESG_ASSETS.find((a) => a.id === currentSelected)?.w ?? 8) / 8));
          }
          staticLabels.forEach(({ el, pos }) => {
            projected.copy(pos).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            el.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
            el.style.opacity = projected.z < 1 && width > 640 ? '1' : '0';
          });
          const asset = ESG_ASSETS.find((a) => a.id === currentSelected);
          if (asset) {
            projected.set(asset.x, asset.h + 3.8, asset.z).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            selectedLabel.style.transform = `translate(-50%,-100%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`;
            selectedLabel.style.opacity = projected.z < 1 && width > 640 ? '1' : '0';
          }
          void exploded;
        });
      }}
    />
  );
}
