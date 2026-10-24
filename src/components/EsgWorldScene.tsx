import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { WORLD_LAYERS, type WorldLayer } from '../lib/esgWorldData';

interface Props {
  year: number;
  layers: Record<WorldLayer, boolean>;
  levers: string[];
  selected: string | null;
  autoRotate: boolean;
  onSelect: (id: string | null) => void;
}

interface Api {
  setYear: (y: number) => void;
  setLayers: (l: Record<WorldLayer, boolean>) => void;
  setLevers: (l: string[]) => void;
  setSelected: (s: string | null) => void;
}

const AMBER = 0xf4bd72;
const ROSE = 0xff7088;
const MINT = 0x53f0be;
const BLUE = 0x45c4f5;
const VIOLET = 0xa991ff;

function labelSprite(title: string, sub: string, color: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'rgba(4,12,15,.82)';
  ctx.strokeStyle = 'rgba(150,220,210,.22)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(2, 18, 508, 92, 14); ctx.fill(); ctx.stroke();
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(30, 64, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e9f8f3'; ctx.font = 'bold 27px Arial'; ctx.fillText(title, 48, 58);
  ctx.fillStyle = '#8fb7b0'; ctx.font = '20px Arial'; ctx.fillText(sub, 48, 90);
  const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sprite.scale.set(3.8, 0.95, 1);
  return sprite;
}

export function EsgWorldScene({ year, layers, levers, selected, autoRotate, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const selectRef = useRef(onSelect); selectRef.current = onSelect;

  useEffect(() => { apiRef.current?.setYear(year); }, [year]);
  useEffect(() => { apiRef.current?.setLayers(layers); }, [layers]);
  useEffect(() => { apiRef.current?.setLevers(levers); }, [levers]);
  useEffect(() => { apiRef.current?.setSelected(selected); }, [selected]);

  return (
    <ThreeStage
      ariaLabel="ESG world model: precinct buildings, construction site, embodied and operational carbon, climate hazard and social value layers."
      cameraPosition={[58, 43, 70]}
      target={[0, 11, 0]}
      fov={42}
      background={0x06131a}
      fog={{ color: 0x06131a, density: 0.008 }}
      exposure={1.05}
      autoRotate={autoRotate}
      autoRotateSpeed={0.25}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.fog = new THREE.Fog(0x06131a, 65, 155);
        scene.add(new THREE.HemisphereLight(0xb9dff0, 0x22302a, 1.8));
        const sun = new THREE.DirectionalLight(0xffe5c2, 2.6);
        sun.position.set(-34, 46, 20); scene.add(sun);

        const sky = new THREE.Mesh(
          new THREE.SphereGeometry(210, 40, 24),
          new THREE.ShaderMaterial({
            side: THREE.BackSide, depthWrite: false,
            uniforms: { top: { value: new THREE.Color(0x264d66) }, horizon: { value: new THREE.Color(0xaebfbd) }, low: { value: new THREE.Color(0x172629) } },
            vertexShader: 'varying vec3 vP; void main(){vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
            fragmentShader: 'uniform vec3 top, horizon, low; varying vec3 vP; void main(){float h=normalize(vP).y; vec3 c=h>0.0?mix(horizon,top,pow(clamp(h,0.0,1.0),0.45)):mix(horizon,low,clamp(-h*4.0,0.0,1.0)); gl_FragColor=vec4(c,1.0);}',
          }),
        );
        scene.add(sky);

        const mat = {
          concrete: new THREE.MeshStandardMaterial({ color: 0x9b9c93, roughness: 0.9 }),
          dark: new THREE.MeshStandardMaterial({ color: 0x293033, roughness: 0.85 }),
          glass: new THREE.MeshPhysicalMaterial({ color: 0x2f6474, metalness: 0.25, roughness: 0.08, transparent: true, opacity: 0.62, clearcoat: 1 }),
          oldGlass: new THREE.MeshPhysicalMaterial({ color: 0x7b6b58, metalness: 0.2, roughness: 0.3, transparent: true, opacity: 0.55 }),
          steel: new THREE.MeshStandardMaterial({ color: 0x8fa6a5, metalness: 0.8, roughness: 0.3 }),
          solar: new THREE.MeshStandardMaterial({ color: 0x16344e, metalness: 0.6, roughness: 0.2, emissive: 0x0b2c4a, emissiveIntensity: 0.35 }),
          green: new THREE.MeshStandardMaterial({ color: 0x3f7a52, roughness: 0.9 }),
          soil: new THREE.MeshStandardMaterial({ color: 0x3f3529, roughness: 1 }),
          white: new THREE.MeshStandardMaterial({ color: 0xd6dfd8, roughness: 0.6 }),
          crane: new THREE.MeshStandardMaterial({ color: 0xe0a83f, metalness: 0.5, roughness: 0.4 }),
        };

        const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 130), new THREE.MeshStandardMaterial({ color: 0x1b2624, roughness: 0.98 }));
        ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
        const slab = new THREE.Mesh(new THREE.BoxGeometry(74, 0.2, 56), new THREE.MeshStandardMaterial({ color: 0x303a37, roughness: 0.95 }));
        slab.position.y = 0.05; slab.receiveShadow = true; scene.add(slab);
        const water = new THREE.Mesh(new THREE.PlaneGeometry(260, 100), new THREE.MeshPhysicalMaterial({ color: 0x0b2831, metalness: 0.5, roughness: 0.15, clearcoat: 1 }));
        water.rotation.x = -Math.PI / 2; water.position.set(0, -0.02, 78); scene.add(water);

        const towers = new THREE.Group(); scene.add(towers);
        // Tower A: 12 levels, podium.
        const tower = new THREE.Group();
        const towerBase = 1.2;
        for (let l = 0; l < 12; l++) {
          const slab = new THREE.Mesh(new THREE.BoxGeometry(15, 0.24, 13), mat.concrete);
          slab.position.set(0, towerBase + l * 2.8, 0); tower.add(slab);
          for (const x of [-6.8, -2.2, 2.2, 6.8]) for (const z of [-5.6, 0, 5.6]) {
            const col = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.7, 0.3), mat.concrete);
            col.position.set(x, towerBase + l * 2.8 + 1.4, z); tower.add(col);
          }
          const panel = new THREE.Mesh(new THREE.BoxGeometry(15.1, 2.5, 13.1), mat.oldGlass);
          panel.position.set(0, towerBase + l * 2.8 + 1.35, 0); panel.userData.panel = l; tower.add(panel);
        }
        const core = new THREE.Mesh(new THREE.BoxGeometry(5, 33.6, 4.5), mat.concrete);
        core.position.set(0, 18, -2); tower.add(core);
        const roof = new THREE.Mesh(new THREE.BoxGeometry(9, 2.2, 8), mat.dark);
        roof.position.set(0, 35.5, 0); tower.add(roof);
        towers.add(tower);
        // Podium.
        for (let l = 0; l < 2; l++) {
          const slab = new THREE.Mesh(new THREE.BoxGeometry(30, 0.3, 20), mat.concrete);
          slab.position.set(-16, 3.2 + l * 3, 8); towers.add(slab);
          const glass = new THREE.Mesh(new THREE.BoxGeometry(29, 2.7, 19), mat.glass);
          glass.position.set(-16, 4.7 + l * 3, 8); towers.add(glass);
        }
        // Neighbouring blocks.
        for (let i = 0; i < 8; i++) {
          const h = 8 + ((i * 5) % 18);
          const b = new THREE.Mesh(new THREE.BoxGeometry(7 + (i % 3) * 4, h, 7 + (i % 2) * 4), new THREE.MeshStandardMaterial({ color: 0x263438, roughness: 0.8 }));
          b.position.set(-58 + (i % 4) * 18, h / 2, -34 - Math.floor(i / 4) * 18); scene.add(b);
        }
        // Construction plot and crane (before 2030).
        const site = new THREE.Group();
        const craneMast = new THREE.Mesh(new THREE.BoxGeometry(1.4, 28, 1.4), mat.crane); craneMast.position.set(24, 14, -12); site.add(craneMast);
        const jib = new THREE.Mesh(new THREE.BoxGeometry(22, 0.5, 0.8), mat.crane); jib.position.set(35, 28, -12); site.add(jib);
        const frame = new THREE.Group();
        for (let l = 0; l < 5; l++) {
          const slab = new THREE.Mesh(new THREE.BoxGeometry(13, 0.25, 10), mat.concrete); slab.position.set(22, 1 + l * 2.6, -10); frame.add(slab);
          for (const x of [-5.8, 5.8]) for (const z of [-4.2, 4.2]) {
            const col = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.5, 0.3), mat.concrete); col.position.set(22 + x, 2.25 + l * 2.6, -10 + z); frame.add(col);
          }
        }
        site.add(frame); scene.add(site);

        // Solar canopy and retrofit rooftop.
        const solar = new THREE.Group();
        for (let i = 0; i < 8; i++) {
          const panel = new THREE.Mesh(new THREE.BoxGeometry(4, 0.12, 3.2), mat.solar);
          panel.position.set(-10 + i * 2.7, 7.8, 8); panel.rotation.z = -0.12; solar.add(panel);
        }
        for (let i = 0; i < 5; i++) {
          const p = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 2.4), mat.solar);
          p.position.set(-6 + i * 3, 37.1, 1); p.rotation.z = -0.14; solar.add(p);
        }
        scene.add(solar);

        // Trees and social realm.
        const trees = new THREE.Group();
        for (let i = 0; i < 26; i++) {
          const t = new THREE.Group();
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.6, 6), mat.soil); trunk.position.y = 0.8; t.add(trunk);
          const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.3 + (i % 3) * 0.25, 1), mat.green); crown.position.y = 2.3; t.add(crown);
          t.position.set(-32 + (i * 5.3) % 60, 0.1, -20 + (i * 7.1) % 40);
          trees.add(t);
        }
        scene.add(trees);
        for (let i = 0; i < 18; i++) {
          const p = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.45, 3, 5), new THREE.MeshStandardMaterial({ color: i % 3 ? 0xd6a23c : 0x5f9c86, roughness: 0.8 }));
          p.position.set(-28 + (i * 4.1) % 58, 0.55, -12 + (i * 6.3) % 34); scene.add(p);
        }

        // Energy arcs and carbon particles.
        const energyCurves: THREE.CatmullRomCurve3[] = [];
        for (const [x, z] of [[-16, 8], [0, 0], [22, -10]]) {
          const start = new THREE.Vector3(32, 0.5, 16);
          const end = new THREE.Vector3(x, 13, z);
          energyCurves.push(new THREE.CatmullRomCurve3([start, new THREE.Vector3((start.x + end.x) / 2, 12, (start.z + end.z) / 2), end]));
        }
        const energyDots: THREE.Mesh[] = [];
        for (const curve of energyCurves) {
          const line = new THREE.Mesh(new THREE.TubeGeometry(curve, 22, 0.025, 4, false), new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.5 }));
          scene.add(line);
          for (let i = 0; i < 4; i++) {
            const dot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), new THREE.MeshBasicMaterial({ color: AMBER }));
            scene.add(dot); energyDots.push(dot);
          }
        }
        const particleCount = 70;
        const particles: THREE.Mesh[] = [];
        const particleSeeds: Array<{ x: number; z: number; phase: number; speed: number; color: number }> = [];
        for (let i = 0; i < particleCount; i++) {
          const color = i % 3 === 0 ? MINT : i % 3 === 1 ? ROSE : AMBER;
          const p = new THREE.Mesh(new THREE.SphereGeometry(0.07, 5, 5), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 }));
          scene.add(p); particles.push(p);
          particleSeeds.push({ x: -30 + Math.random() * 60, z: -22 + Math.random() * 44, phase: Math.random() * 20, speed: 0.6 + Math.random() * 0.8, color });
        }

        // Climate hazard planes.
        const flood = new THREE.Mesh(new THREE.PlaneGeometry(150, 100), new THREE.MeshPhysicalMaterial({ color: 0x247e9e, transparent: true, opacity: 0.28, metalness: 0.3, roughness: 0.1, side: THREE.DoubleSide }));
        flood.rotation.x = -Math.PI / 2; flood.position.set(0, 0.4, 0); flood.visible = false; scene.add(flood);
        const heat = new THREE.Mesh(new THREE.SphereGeometry(30, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff4f4f, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false }));
        heat.position.set(0, 0.2, 0); heat.visible = false; scene.add(heat);

        // Embodied carbon hotspots.
        const hotspots: Array<{ id: string; mesh: THREE.Mesh; label: THREE.Sprite }> = [];
        const addHotspot = (id: string, pos: [number, number, number], color: number, title: string, sub: string) => {
          const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 2), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.9, roughness: 0.3 }));
          mesh.position.set(...pos); mesh.userData.id = id; scene.add(mesh);
          const label = labelSprite(title, sub, `#${color.toString(16).padStart(6, '0')}`);
          label.position.set(pos[0], pos[1] + 1.3, pos[2]); scene.add(label);
          hotspots.push({ id, mesh, label });
        };
        addHotspot('concrete', [0, 12, 0], ROSE, 'Concrete core', '13,076 tCO₂e · 31%');
        addHotspot('steel', [7, 20, 0], AMBER, 'Structural steel', '4,401 tCO₂e · 10%');
        addHotspot('facade', [-7, 27, 0], VIOLET, 'Curtain wall', '7,736 tCO₂e · 18%');
        addHotspot('mep', [22, 12, -10], MINT, 'MEP & fit-out', '12,662 tCO₂e · 30%');

        const marker = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.05, 8, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }));
        marker.rotation.x = Math.PI / 2; marker.visible = false; scene.add(marker);

        let currentYear = year;
        let currentLayers = layers;
        let currentLevers = levers;
        let currentSelected = selected;

        const apply = () => {
          const retrofit = currentLevers.includes('facadeRetrofit') || currentYear >= 2032;
          tower.children.forEach((child) => {
            if (child instanceof THREE.Mesh && child.userData.panel !== undefined) {
              child.material = retrofit ? mat.glass : mat.oldGlass;
            }
          });
          solar.visible = currentLevers.includes('onsiteSolar') || currentYear >= 2035;
          site.visible = currentYear < 2030;
          trees.scale.setScalar(0.75 + Math.min(0.5, (currentYear - 2026) / 48));
          flood.visible = currentLayers.climate;
          heat.visible = currentLayers.climate;
          energyDots.forEach((d) => { d.visible = currentLayers.operational; });
          hotspots.forEach((h) => {
            h.mesh.visible = currentLayers.embodied;
            h.label.visible = currentLayers.embodied;
            const isSelected = h.id === currentSelected;
            h.mesh.scale.setScalar(isSelected ? 1.5 : 1);
            (h.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = isSelected ? 1.6 : 0.9;
          });
          marker.visible = !!currentSelected;
          if (currentSelected) {
            const h = hotspots.find((x) => x.id === currentSelected);
            if (h) { marker.position.copy(h.mesh.position); marker.position.y -= 0.55; marker.scale.setScalar(h.mesh.scale.x); }
          }
        };

        apiRef.current = {
          setYear: (y) => { currentYear = y; apply(); },
          setLayers: (l) => { currentLayers = l; apply(); },
          setLevers: (l) => { currentLevers = l; apply(); },
          setSelected: (s) => { currentSelected = s; apply(); },
        };
        apply();

        // Click hotspots.
        const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2();
        const click = (e: PointerEvent) => {
          const rect = ctx.renderer.domElement.getBoundingClientRect();
          pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(pointer, ctx.camera);
          const hit = raycaster.intersectObjects(hotspots.map((h) => h.mesh), false)[0];
          selectRef.current(hit ? String(hit.object.userData.id) : null);
        };
        ctx.renderer.domElement.addEventListener('pointerup', click);
        ctx.addDispose(() => ctx.renderer.domElement.removeEventListener('pointerup', click));

        ctx.addUpdate((dt, elapsed) => {
          particles.forEach((p, i) => {
            const seed = particleSeeds[i];
            const t = (elapsed * 0.08 * seed.speed + seed.phase * 0.05) % 1;
            p.position.set(seed.x + Math.sin(elapsed * 0.4 + i) * 0.7, 0.8 + t * 28, seed.z + Math.cos(elapsed * 0.3 + i) * 0.5);
            (p.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.6;
            const layerOn = seed.color === MINT ? currentLayers.social : seed.color === AMBER ? currentLayers.operational : currentLayers.embodied;
            p.visible = layerOn;
          });
          energyDots.forEach((d, i) => {
            const curve = energyCurves[i % energyCurves.length];
            const t = (elapsed * 0.15 + i * 0.17) % 1;
            d.position.copy(curve.getPointAt(t));
          });
          marker.rotation.z += dt * 0.8;
          heat.scale.setScalar(1 + Math.sin(elapsed * 0.6) * 0.02);
        });
      }}
    />
  );
}
