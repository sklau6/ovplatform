import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { createVehicle } from '../lib/vehicleModels';
import { SITE_CLASHES, type SiteDiscipline, type SiteView } from '../lib/bimSiteData';

interface Props {
  progress: number;
  disciplines: Record<SiteDiscipline, boolean>;
  showClashes: boolean;
  view: SiteView;
  selectedClash: string | null;
  autoRotate: boolean;
  timeOfDay: 'day' | 'dusk';
}

interface SiteApi {
  setProgress: (p: number) => void;
  setDisciplines: (d: Record<SiteDiscipline, boolean>) => void;
  setClashes: (v: boolean) => void;
  setView: (v: SiteView) => void;
  setSelected: (id: string | null) => void;
  setTimeOfDay: (t: 'day' | 'dusk') => void;
}

const FLOORS = 12;
const FLOOR_H = 3;
const BASE_Y = 9;

const DISC_COLORS: Record<SiteDiscipline, number> = {
  structure: 0x76c9c9,
  architecture: 0xa991ff,
  mep: 0x53f0be,
  facade: 0xf4bd72,
  civil: 0x8aa6a0,
  temporary: 0xff7088,
};

export function BimSiteScene({ progress, disciplines, showClashes, view, selectedClash, autoRotate, timeOfDay }: Props) {
  const apiRef = useRef<SiteApi | null>(null);

  useEffect(() => { apiRef.current?.setProgress(progress); }, [progress]);
  useEffect(() => { apiRef.current?.setDisciplines(disciplines); }, [disciplines]);
  useEffect(() => { apiRef.current?.setClashes(showClashes); }, [showClashes]);
  useEffect(() => { apiRef.current?.setView(view); }, [view]);
  useEffect(() => { apiRef.current?.setSelected(selectedClash); }, [selectedClash]);
  useEffect(() => { apiRef.current?.setTimeOfDay(timeOfDay); }, [timeOfDay]);

  return (
    <ThreeStage
      ariaLabel="Professional BIM demo on a live Kai Tak construction site: tower structure, tower cranes, site logistics, federated disciplines, clashes and 4D progress."
      cameraPosition={[54, 31, 66]}
      target={[0, 13, 0]}
      fov={42}
      background={0x081318}
      fog={{ color: 0x081318, density: 0.0065 }}
      exposure={1.05}
      autoRotate={autoRotate}
      autoRotateSpeed={0.25}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.fog = new THREE.Fog(0xc3d8e1, 85, 210);
        const hemi = new THREE.HemisphereLight(0xe5f4ff, 0x8a8a7a, 2.6);
        scene.add(hemi);

        const sun = new THREE.DirectionalLight(0xfff4e0, 3.8);
        sun.position.set(-38, 52, 24);
        sun.castShadow = true;
        sun.shadow.mapSize.set(2048, 2048);
        sun.shadow.camera.left = -55;
        sun.shadow.camera.right = 55;
        sun.shadow.camera.top = 55;
        sun.shadow.camera.bottom = -55;
        sun.shadow.camera.far = 160;
        sun.shadow.bias = -0.0002;
        scene.add(sun);
        const fill = new THREE.DirectionalLight(0xcfe6ff, 1.7);
        fill.position.set(38, 28, 44);
        scene.add(fill);

        // Day / dusk sky dome.
        const skyMaterial = new THREE.ShaderMaterial({
            side: THREE.BackSide,
            depthWrite: false,
            uniforms: {
              top: { value: new THREE.Color(0x5fa7dd) },
              horizon: { value: new THREE.Color(0xd9e9f0) },
              bottom: { value: new THREE.Color(0xa9c2cd) },
            },
            vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
            fragmentShader: 'uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom; varying vec3 vP; void main(){ float h = normalize(vP).y; vec3 c = h > 0.0 ? mix(horizon, top, pow(clamp(h,0.0,1.0),0.55)) : mix(horizon, bottom, clamp(-h*4.0,0.0,1.0)); gl_FragColor = vec4(c,1.0); }',
          });
        const sky = new THREE.Mesh(new THREE.SphereGeometry(220, 48, 32), skyMaterial);
        scene.add(sky);

        const materials = {
          concrete: new THREE.MeshStandardMaterial({ color: 0x8b8d88, roughness: 0.9, metalness: 0.03 }),
          concreteDark: new THREE.MeshStandardMaterial({ color: 0x5f625e, roughness: 0.92 }),
          steel: new THREE.MeshStandardMaterial({ color: 0x7d8a8c, metalness: 0.8, roughness: 0.35 }),
          steelDark: new THREE.MeshStandardMaterial({ color: 0x3e4a4d, metalness: 0.8, roughness: 0.4 }),
          glass: new THREE.MeshPhysicalMaterial({ color: 0x3b6f80, metalness: 0.2, roughness: 0.08, transparent: true, opacity: 0.58, clearcoat: 1 }),
          glassDark: new THREE.MeshPhysicalMaterial({ color: 0x1a2c35, metalness: 0.5, roughness: 0.12, transparent: true, opacity: 0.72 }),
          asphalt: new THREE.MeshStandardMaterial({ color: 0x232725, roughness: 0.96 }),
          hoarding: new THREE.MeshStandardMaterial({ color: 0x1f5a4b, roughness: 0.75 }),
          accent: new THREE.MeshStandardMaterial({ color: 0x53f0be, emissive: 0x1a7a5e, emissiveIntensity: 0.4, metalness: 0.4, roughness: 0.4 }),
          amber: new THREE.MeshStandardMaterial({ color: 0xf4bd72, metalness: 0.4, roughness: 0.45 }),
          red: new THREE.MeshStandardMaterial({ color: 0xff5060, emissive: 0x5a1018, emissiveIntensity: 0.5, roughness: 0.5 }),
          white: new THREE.MeshStandardMaterial({ color: 0xd9e2df, roughness: 0.6 }),
          dark: new THREE.MeshStandardMaterial({ color: 0x14191a, roughness: 0.8 }),
          soil: new THREE.MeshStandardMaterial({ color: 0x4a3b2e, roughness: 1 }),
        };

        const building = new THREE.Group();
        const site = new THREE.Group();
        scene.add(building, site);

        const staged: Array<{ mesh: THREE.Object3D; threshold: number; discipline: SiteDiscipline }> = [];
        const pickables: THREE.Object3D[] = [];
        const markers: Array<{ group: THREE.Group; id: string }> = [];

        const add = (
          parent: THREE.Group,
          geometry: THREE.BufferGeometry,
          material: THREE.Material,
          position: [number, number, number],
          discipline: SiteDiscipline,
          threshold = 0,
          rotation?: [number, number, number],
        ) => {
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(...position);
          if (rotation) mesh.rotation.set(...rotation);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.userData.discipline = discipline;
          mesh.userData.baseMaterial = material;
          mesh.userData.bimMaterial = new THREE.MeshStandardMaterial({
            color: DISC_COLORS[discipline],
            emissive: DISC_COLORS[discipline],
            emissiveIntensity: 0.16,
            roughness: 0.55,
            metalness: 0.25,
            transparent: true,
            opacity: 0.9,
          });
          parent.add(mesh);
          staged.push({ mesh, threshold, discipline });
          return mesh;
        };

        const box = (
          parent: THREE.Group,
          size: [number, number, number],
          material: THREE.Material,
          position: [number, number, number],
          discipline: SiteDiscipline,
          threshold = 0,
          rotation?: [number, number, number],
        ) => add(parent, new THREE.BoxGeometry(...size), material, position, discipline, threshold, rotation);

        // Ground, roads and site slab.
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(220, 190), new THREE.MeshStandardMaterial({ color: 0x171c1b, roughness: 1 }));
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.05;
        ground.receiveShadow = true;
        scene.add(ground);

        const slab = new THREE.Mesh(new THREE.BoxGeometry(76, 0.22, 58), materials.concreteDark);
        slab.position.set(0, 0.05, 0);
        slab.receiveShadow = true;
        scene.add(slab);

        for (const z of [-22, 22]) {
          box(site, [76, 0.05, 5.5], materials.asphalt, [0, 0.16, z], 'civil');
          for (let x = -34; x < 34; x += 6) {
            box(site, [3, 0.02, 0.16], materials.white, [x, 0.2, z], 'civil');
          }
        }
        for (let i = 0; i < 8; i++) {
          const x = -30 + i * 8.5;
          box(site, [0.18, 0.02, 6], materials.white, [x, 0.2, 22], 'civil');
        }

        // Hoarding and site gate.
        for (const [x, z, w, d] of [[0, -28.5, 78, 0.22], [0, 28.5, 78, 0.22], [-38.5, 0, 0.22, 58], [38.5, 0, 0.22, 58]] as const) {
          box(site, [w, 2.4, d], materials.hoarding, [x, 1.2, z], 'temporary');
        }
        box(site, [10, 2.4, 0.3], materials.dark, [-12, 1.2, 28.5], 'temporary');
        const gateSign = document.createElement('canvas');
        gateSign.width = 768;
        gateSign.height = 192;
        const gsc = gateSign.getContext('2d')!;
        gsc.fillStyle = '#08211b';
        gsc.fillRect(0, 0, 768, 192);
        gsc.strokeStyle = '#53f0be';
        gsc.lineWidth = 4;
        gsc.strokeRect(8, 8, 752, 176);
        gsc.fillStyle = '#e8fff7';
        gsc.font = 'bold 52px Arial';
        gsc.fillText('KAI TAK · SITE 4B', 30, 78);
        gsc.fillStyle = '#8fd8c1';
        gsc.font = '28px Arial';
        gsc.fillText('OPHYLLA CONSTRUCTION · TOWER A', 30, 124);
        gsc.fillStyle = '#53f0be';
        gsc.font = '22px monospace';
        gsc.fillText('ISO 19650 · IFC 4.3 · LOD 350', 30, 162);
        const signTexture = new THREE.CanvasTexture(gateSign);
        signTexture.colorSpace = THREE.SRGBColorSpace;
        const sign = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.5), new THREE.MeshBasicMaterial({ map: signTexture }));
        sign.position.set(-12, 3.9, 28.39);
        site.add(sign);

        // Podium: three levels, columns and slabs.
        for (let level = 0; level < 3; level++) {
          const y = level * 3 + 0.16;
          box(building, [26, 0.28, 18], materials.concrete, [0, y, 0], 'structure', 0);
          for (let ix = -2; ix <= 2; ix++) for (let iz = -1; iz <= 1; iz++) {
            box(building, [0.55, 3, 0.55], materials.concrete, [ix * 6, y + 1.5, iz * 6], 'structure', 0);
          }
          if (level === 1) {
            box(building, [24, 2.7, 0.3], materials.glassDark, [0, y + 1.5, 9], 'facade', 0);
            box(building, [0.3, 2.7, 16], materials.glassDark, [13, y + 1.5, 0], 'facade', 0);
          }
        }
        box(building, [26.4, 0.35, 18.4], materials.steelDark, [0, 9.05, 0], 'structure', 0);

        // Tower core, columns, slabs and beams.
        const towerW = 15;
        const towerD = 13;
        box(building, [5.4, FLOORS * FLOOR_H, 4.6], materials.concrete, [0, BASE_Y + (FLOORS * FLOOR_H) / 2, -2.2], 'structure', 0);
        for (let level = 0; level < FLOORS; level++) {
          const y = BASE_Y + level * FLOOR_H;
          const threshold = (level / FLOORS) * 88;
          box(building, [towerW, 0.26, towerD], materials.concrete, [0, y + 0.2, 0], 'structure', threshold);
          for (const x of [-6.6, -2.6, 2.6, 6.6]) for (const z of [-5.6, 0, 5.6]) {
            box(building, [0.42, 2.9, 0.42], materials.concrete, [x, y + 1.65, z], 'structure', threshold);
          }
          box(building, [towerW - 1, 0.32, 0.32], materials.steelDark, [0, y + 2.75, 5.7], 'structure', threshold);
          box(building, [0.32, 0.32, towerD - 1], materials.steelDark, [7.2, y + 2.75, 0], 'structure', threshold);
          // Facade panels are installed behind the structure.
          if (level < 7) {
            const panelThreshold = 52 + level * 3.5;
            for (let p = -2; p <= 2; p++) {
              box(building, [2.7, 2.55, 0.12], materials.glass, [p * 3.0, y + 1.65, 6.55], 'facade', panelThreshold);
              box(building, [0.12, 2.55, 2.7], materials.glass, [7.55, y + 1.65, p * 2.6], 'facade', panelThreshold);
            }
          }
          // MEP risers and plant.
          if (level < 8) {
            const mepThreshold = 48 + level * 3;
            box(building, [0.4, 2.4, 0.4], materials.accent, [1.8, y + 1.4, -4.2], 'mep', mepThreshold);
            box(building, [1.1, 0.5, 0.8], materials.steelDark, [-1.9, y + 0.65, -3.6], 'mep', mepThreshold);
          }
        }
        // Tower crown / plant enclosure.
        box(building, [9, 2.4, 8], materials.concreteDark, [0, BASE_Y + FLOORS * FLOOR_H + 1.2, 0], 'structure', 95);
        box(building, [0.3, 7, 0.3], materials.steel, [0, BASE_Y + FLOORS * FLOOR_H + 1.2, 3.8], 'temporary', 95);

        // Scaffolding on the east face.
        for (let level = 0; level < 8; level++) {
          const y = BASE_Y + level * FLOOR_H;
          for (let z = -5; z <= 5; z += 2.5) {
            box(building, [0.09, 2.8, 0.09], materials.steel, [7.8, y + 1.4, z], 'temporary', 58 + level * 3);
          }
          box(building, [0.09, 0.09, 11], materials.steel, [7.8, y + 2.7, 0], 'temporary', 58 + level * 3);
        }

        // Tower cranes.
        const craneTop = new THREE.Group();
        const crane = new THREE.Group();
        const mast = new THREE.Group();
        for (const [x, z] of [[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]] as const) {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 42, 0.16), materials.amber);
          leg.position.set(x, 21, z);
          mast.add(leg);
        }
        for (let y = 1.5; y < 42; y += 3) {
          for (const [x, z, w, d] of [[0, -1.1, 2.4, 0.09], [0, 1.1, 2.4, 0.09], [-1.1, 0, 0.09, 2.4], [1.1, 0, 0.09, 2.4]] as const) {
            const brace = new THREE.Mesh(new THREE.BoxGeometry(w, 0.07, d), materials.amber);
            brace.position.set(x, y, z);
            mast.add(brace);
          }
        }
        crane.add(mast);
        const cab = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2, 2.4), materials.white);
        cab.position.set(1.4, 41.5, 0);
        craneTop.add(cab);
        const jib = new THREE.Mesh(new THREE.BoxGeometry(34, 0.7, 1.2), materials.amber);
        jib.position.set(17.5, 42, 0);
        craneTop.add(jib);
        const counterJib = new THREE.Mesh(new THREE.BoxGeometry(10, 0.6, 1.4), materials.amber);
        counterJib.position.set(-6, 42, 0);
        craneTop.add(counterJib);
        const counterweight = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.8, 2.2), materials.concreteDark);
        counterweight.position.set(-9.5, 41, 0);
        craneTop.add(counterweight);
        const towerTop = new THREE.Mesh(new THREE.BoxGeometry(0.18, 5, 0.18), materials.amber);
        towerTop.position.set(0, 45, 0);
        craneTop.add(towerTop);
        const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 12, 5), materials.dark);
        cable.position.set(22, 35.5, 0);
        craneTop.add(cable);
        const hook = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), materials.red);
        hook.position.set(22, 29.2, 0);
        craneTop.add(hook);
        craneTop.position.set(-16, 0, -6);
        crane.add(craneTop);
        crane.position.set(-16, 0, -6);
        craneTop.position.set(0, 0, 0);
        site.add(crane);

        // Second crane, static, smaller.
        const crane2 = new THREE.Group();
        for (const [x, z] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]] as const) {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.13, 32, 0.13), materials.amber);
          leg.position.set(x, 16, z);
          crane2.add(leg);
        }
        for (let y = 2; y < 32; y += 3) {
          for (const [x, z, w, d] of [[0, -0.7, 1.5, 0.07], [0, 0.7, 1.5, 0.07], [-0.7, 0, 0.07, 1.5], [0.7, 0, 0.07, 1.5]] as const) {
            const brace = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, d), materials.amber);
            brace.position.set(x, y, z);
            crane2.add(brace);
          }
        }
        const jib2 = new THREE.Mesh(new THREE.BoxGeometry(24, 0.5, 0.9), materials.amber);
        jib2.position.set(12, 32, 0);
        crane2.add(jib2);
        const cw2 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.4, 1.8), materials.concreteDark);
        cw2.position.set(-6, 31, 0);
        crane2.add(cw2);
        crane2.position.set(20, 0, -14);
        site.add(crane2);

        // Site offices and welfare.
        for (let i = 0; i < 4; i++) {
          box(site, [4.8, 2.6, 2.4], materials.white, [-25 + i * 5.2, 1.35, 16], 'temporary');
          box(site, [0.7, 1.9, 0.06], materials.glassDark, [-25 + i * 5.2, 1.2, 17.22], 'temporary');
        }
        box(site, [11, 0.2, 3.2], materials.steel, [-21, 2.8, 16], 'temporary');
        box(site, [5.2, 2.6, 2.4], materials.white, [27, 1.35, 15], 'temporary');

        // Material laydown: rebar, pipes, precast.
        for (let i = 0; i < 7; i++) {
          const rebar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 7, 6), materials.steelDark);
          rebar.rotation.x = Math.PI / 2;
          rebar.position.set(20 + i * 0.15, 0.35 + i * 0.12, 8);
          site.add(rebar);
        }
        for (let i = 0; i < 5; i++) {
          box(site, [1.8, 0.45, 4.8], materials.concrete, [23 + (i % 3) * 2.1, 0.3 + Math.floor(i / 3) * 0.5, 3], 'temporary');
        }
        for (let i = 0; i < 4; i++) {
          const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 6, 12), materials.white);
          pipe.rotation.x = Math.PI / 2;
          pipe.position.set(13, 0.4 + i * 0.7, 12);
          site.add(pipe);
        }

        // Excavator.
        const excavator = new THREE.Group();
        const tracks = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.7, 1.8), materials.dark);
        tracks.position.y = 0.4;
        excavator.add(tracks);
        const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.4, 1.9), materials.amber);
        body.position.set(-0.3, 1.4, 0);
        excavator.add(body);
        const cabEx = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.5), materials.glassDark);
        cabEx.position.set(0.6, 2.1, 0.1);
        excavator.add(cabEx);
        const boom = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.4, 0.5), materials.amber);
        boom.position.set(2.6, 1.9, 0);
        boom.rotation.z = -0.5;
        excavator.add(boom);
        const arm = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.32, 0.4), materials.amber);
        arm.position.set(4.6, 1.1, 0);
        arm.rotation.z = 0.55;
        excavator.add(arm);
        const bucket = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 1.1), materials.steelDark);
        bucket.position.set(6.2, 0.45, 0);
        excavator.add(bucket);
        excavator.position.set(-8, 0.1, 12);
        excavator.rotation.y = -0.6;
        site.add(excavator);

        // Delivery truck at the gate.
        const truck = createVehicle('truck', 0xcfd8da);
        truck.position.set(-12, 0.12, 25);
        truck.rotation.y = -Math.PI / 2;
        truck.scale.setScalar(0.8);
        site.add(truck);

        // Workers with high-vis.
        for (let i = 0; i < 14; i++) {
          const worker = new THREE.Group();
          const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.55, 3, 6), new THREE.MeshStandardMaterial({ color: i % 3 ? 0xe1b33a : 0xff7a3d, roughness: 0.8 }));
          torso.position.y = 0.9;
          worker.add(torso);
          const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), materials.white);
          helmet.position.y = 1.45;
          worker.add(helmet);
          const legs = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.55, 0.25), materials.dark);
          legs.position.y = 0.35;
          worker.add(legs);
          worker.position.set(-20 + (i * 5.3) % 42, 0.1, -14 + (i * 7.1) % 36);
          worker.rotation.y = i * 0.8;
          site.add(worker);
        }

        // Neighbouring city and harbour.
        const neighbourMeshes: THREE.Mesh[] = [];
        for (let i = 0; i < 16; i++) {
          const w = 6 + (i % 4) * 4;
          const h = 10 + ((i * 7) % 26);
          const d = 6 + (i % 3) * 5;
          const bx = -75 + (i % 8) * 21;
          const bz = -62 - Math.floor(i / 8) * 24;
          const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: 0x1c2a2e, roughness: 0.7, metalness: 0.3 }));
          b.position.set(bx, h / 2, bz);
          neighbourMeshes.push(b);
          scene.add(b);
          for (let f = 1; f < Math.floor(h / 3); f++) {
            const strip = new THREE.Mesh(new THREE.BoxGeometry(w * 0.86, 0.08, d + 0.04), new THREE.MeshBasicMaterial({ color: 0x9fd8d0, transparent: true, opacity: 0.26 }));
            strip.position.set(bx, f * 3, bz);
            scene.add(strip);
          }
        }
        const water = new THREE.Mesh(new THREE.PlaneGeometry(260, 90), new THREE.MeshPhysicalMaterial({ color: 0x0a222b, metalness: 0.5, roughness: 0.18, clearcoat: 1 }));
        water.rotation.x = -Math.PI / 2;
        water.position.set(0, -0.02, 75);
        scene.add(water);

        const lampLights: THREE.PointLight[] = [];
        const lampMaterial = new THREE.MeshStandardMaterial({ color: 0xfff4d8, emissive: 0xffe4b0, emissiveIntensity: 0.15, roughness: 0.4 });
        // Floodlights and site lighting.
        for (const [x, z] of [[-30, -20], [30, -20], [-30, 14], [30, 14]] as const) {
          const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 8, 8), materials.steelDark);
          pole.position.set(x, 4, z);
          site.add(pole);
          const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.3, 0.6), lampMaterial);
          lamp.position.set(x, 8, z);
          site.add(lamp);
          const light = new THREE.PointLight(0xffe3b0, 180, 28, 2);
          light.position.set(x, 7.8, z);
          light.intensity = 24;
          lampLights.push(light);
          site.add(light);
        }

        // Clash markers.
        for (const clash of SITE_CLASHES) {
          const group = new THREE.Group();
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.07, 8, 28), materials.red);
          ring.rotation.x = Math.PI / 2;
          group.add(ring);
          const core = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), materials.red);
          group.add(core);
          group.position.set(...clash.position);
          group.visible = false;
          scene.add(group);
          markers.push({ group, id: clash.id });
        }

        // As-built scan point cloud.
        const pointCount = 1800;
        const positions = new Float32Array(pointCount * 3);
        for (let i = 0; i < pointCount; i++) {
          const side = i % 4;
          const t = Math.random();
          const y = 1 + Math.random() * 45;
          const x = side < 2 ? (side === 0 ? -7.6 : 7.6) : (Math.random() - 0.5) * 15;
          const z = side < 2 ? (Math.random() - 0.5) * 13 : (side === 2 ? -6.6 : 6.6);
          positions[i * 3] = x;
          positions[i * 3 + 1] = y;
          positions[i * 3 + 2] = z + t * 0.01;
        }
        const cloudGeometry = new THREE.BufferGeometry();
        cloudGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const cloud = new THREE.Points(cloudGeometry, new THREE.PointsMaterial({ color: 0x53f0be, size: 0.06, transparent: true, opacity: 0.5, depthWrite: false }));
        cloud.visible = false;
        scene.add(cloud);

        // Label for the building.
        const title = document.createElement('div');
        title.innerHTML = '<span style="color:#53f0be">●</span> KAI TAK · TOWER A <span style="color:#7f9a95">· L21 / 34</span>';
        title.style.cssText = 'position:absolute;transform:translate(-50%,-100%);font-family:"JetBrains Mono Variable",monospace;font-size:8px;letter-spacing:.12em;padding:4px 7px;border:1px solid rgba(120,205,190,.25);border-radius:4px;background:rgba(4,12,15,.78);color:#d9f4ec;white-space:nowrap;backdrop-filter:blur(4px);';
        ctx.labelLayer.appendChild(title);
        const titlePos = new THREE.Vector3(0, 48, 0);

        let currentTime = timeOfDay as 'day' | 'dusk';
        let currentProgress = progress;
        let currentDisciplines = disciplines;
        let currentView = view;
        let selected = selectedClash;

        const applyVisibility = () => {
          staged.forEach(({ mesh, threshold, discipline }) => {
            mesh.visible = currentProgress >= threshold && currentDisciplines[discipline];
          });
        };

        const applyView = () => {
          site.visible = currentView !== 'bim';
          cloud.visible = currentView === 'asbuilt';
          staged.forEach(({ mesh }) => {
            const data = mesh.userData;
            (mesh as THREE.Mesh).material = currentView === 'bim' ? data.bimMaterial : data.baseMaterial;
          });
          applyVisibility();
        };

        const applyTime = () => {
          const day = currentTime === 'day';
          skyMaterial.uniforms.top.value.setHex(day ? 0x5fa7dd : 0x06131d);
          skyMaterial.uniforms.horizon.value.setHex(day ? 0xd9e9f0 : 0x344a52);
          skyMaterial.uniforms.bottom.value.setHex(day ? 0xa9c2cd : 0x0a1013);
          sun.color.setHex(day ? 0xfff4e0 : 0xffe3bb);
          sun.intensity = day ? 3.8 : 2.1;
          fill.intensity = day ? 1.7 : 0.25;
          hemi.color.setHex(day ? 0xdcefff : 0xa8d4e8);
          hemi.groundColor.setHex(day ? 0x6a6a5e : 0x10100e);
          hemi.intensity = day ? 2.6 : 1.1;
          (scene.fog as THREE.Fog).color.setHex(day ? 0xc3d8e1 : 0x081318);
          ctx.renderer.toneMappingExposure = day ? 1.25 : 1.05;
          lampLights.forEach((l) => { l.intensity = day ? 15 : 180; });
          lampMaterial.emissiveIntensity = day ? 0.1 : 0.9;
          neighbourMeshes.forEach((n) => { (n.material as THREE.MeshStandardMaterial).color.setHex(day ? 0x42565c : 0x1c2a2e); });
        };

        const applyMarkers = () => {
          markers.forEach(({ group, id }) => {
            group.visible = showClashes;
            const isSelected = id === selected;
            group.scale.setScalar(isSelected ? 1.6 : 1);
          });
        };

        apiRef.current = {
          setProgress: (p) => { currentProgress = p; applyVisibility(); },
          setDisciplines: (d) => { currentDisciplines = d; applyVisibility(); },
          setView: (v) => { currentView = v; applyView(); },
          setClashes: (v) => {
            markers.forEach(({ group }) => { group.visible = v; });
          },
          setSelected: (id) => { selected = id; applyMarkers(); },
          setTimeOfDay: (t) => { currentTime = t; applyTime(); },
        };
        applyView();
        applyTime();
        applyMarkers();

        ctx.addUpdate((dt, elapsed) => {
          craneTop.rotation.y = Math.sin(elapsed * 0.12) * 0.6 + 0.3;
          hook.position.y = 29.2 + Math.sin(elapsed * 0.5) * 1.2;
          cable.scale.y = 1 + Math.sin(elapsed * 0.5) * 0.08;
          markers.forEach(({ group, id }, i) => {
            if (!group.visible) return;
            const pulse = 1 + Math.sin(elapsed * 2.4 + i) * 0.12;
            group.scale.setScalar((id === selected ? 1.6 : 1) * pulse);
            group.rotation.y += dt * 0.6;
          });
          const width = ctx.container.clientWidth;
          const height = ctx.container.clientHeight;
          titlePos.project(ctx.camera);
          title.style.transform = `translate(-50%,-100%) translate(${(titlePos.x * 0.5 + 0.5) * width}px, ${(-titlePos.y * 0.5 + 0.5) * height}px)`;
        });
      }}
    />
  );
}
