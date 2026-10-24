import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ASSETS, DISTRICTS } from '../lib/data';
import { clamp } from '../lib/utils';

export type TwinScenario = 'baseline' | 'typhoon' | 'heat';

export interface TwinLayers {
  gis: boolean;
  iot: boolean;
  energy: boolean;
  transit: boolean;
}

interface TwinSceneProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  layers: TwinLayers;
  mode: 'day' | 'night';
  autoRotate: boolean;
  exploded: boolean;
  scenario: TwinScenario;
  compact?: boolean;
  onReady?: (fps: number) => void;
}

interface SceneApi {
  setSelected: (id: string | null) => void;
  setLayers: (layers: TwinLayers) => void;
  setMode: (mode: 'day' | 'night') => void;
  setAutoRotate: (value: boolean) => void;
  setExploded: (value: boolean) => void;
  setScenario: (scenario: TwinScenario) => void;
}

interface BuildingRecord {
  id: string;
  group: THREE.Group;
  floors: THREE.Object3D[];
  baseY: number;
  mats: THREE.MeshStandardMaterial[];
  edges: THREE.LineSegments[];
  width: number;
  height: number;
  depth: number;
  energy: number;
  shell?: THREE.Mesh;
  mullions?: THREE.Object3D[];
  crown?: THREE.Object3D[];
  core?: THREE.Mesh;
}

interface CarRecord {
  mesh: THREE.Group;
  axis: 'x' | 'z';
  fixed: number;
  dir: 1 | -1;
  speed: number;
  offset: number;
}

interface ArcRecord {
  curve: THREE.QuadraticBezierCurve3;
  particle: THREE.Mesh;
  speed: number;
  offset: number;
}

const ACCENT = 0x53f0be;
const CYAN = 0x51d6ff;
const WARM = 0xf4bd72;
const ROSE = 0xff7088;

const CX = 740;
const CZ = 370;
const SX = 10.6;
const SZ = 10.2;
const wx = (x: number) => (x - CX) / SX;
const wz = (y: number) => (y - CZ) / SZ;

function glowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.16, 'rgba(193,255,236,.75)');
  g.addColorStop(0.46, 'rgba(83,240,190,.22)');
  g.addColorStop(1, 'rgba(83,240,190,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function windowCanvas(variant: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = variant === 2 ? '#081014' : '#060d10';
  ctx.fillRect(0, 0, 128, 256);

  ctx.fillStyle = 'rgba(0,0,0,.36)';
  for (let x = 0; x < 128; x += 16) ctx.fillRect(x, 0, 1, 256);

  let seed = 29 + variant * 91;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const cool = ['rgba(116,232,224,', 'rgba(102,208,255,', 'rgba(82,240,190,'];
  const warm = ['rgba(255,204,139,', 'rgba(236,173,111,'];
  for (let y = 7; y < 252; y += 9) {
    const floorLit = rand() > 0.34;
    for (let x = 5; x < 124; x += 10) {
      const r = rand();
      if (r > 0.47 && floorLit) {
        const alpha = 0.18 + rand() * 0.72;
        const isWarm = rand() > 0.8;
        const palette = isWarm ? warm : cool;
        ctx.fillStyle = palette[Math.floor(rand() * palette.length)] + alpha.toFixed(2) + ')';
        ctx.fillRect(x, y, 5.2, 4.2);
        if (rand() > 0.72) {
          ctx.fillStyle = `rgba(255,255,255,${(alpha * 0.4).toFixed(2)})`;
          ctx.fillRect(x + 0.8, y + 0.8, 1.5, 1.3);
        }
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

function energyColor(energy: number) {
  const t = clamp((energy - 62) / 48, 0, 1);
  const a = new THREE.Color(0x4cecc4);
  const b = new THREE.Color(0xf4bd72);
  const c = new THREE.Color(0xff7088);
  return t < 0.55 ? a.lerp(b, t / 0.55) : b.lerp(c, (t - 0.55) / 0.45);
}

function lineLoopFromPoints(points: THREE.Vector3[], color: number, opacity: number) {
  const geometry = new THREE.BufferGeometry().setFromPoints([...points, points[0]]);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
  return new THREE.Line(geometry, material);
}

function polygonPoints(polygon: string) {
  return [...polygon.matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)].map((match) => {
    const x = Number(match[1]);
    const y = Number(match[2]);
    return new THREE.Vector3(wx(x), 0.045, wz(y));
  });
}

function makeCrane(color = WARM) {
  const group = new THREE.Group();
  const steel = new THREE.MeshStandardMaterial({ color, emissive: 0x5a370f, emissiveIntensity: 0.3, metalness: 0.5, roughness: 0.5 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x101c20, metalness: 0.6, roughness: 0.5 });

  const mast = new THREE.Mesh(new THREE.BoxGeometry(0.24, 12, 0.24), steel);
  mast.position.y = 6;
  group.add(mast);

  for (let y = 1; y < 12; y += 1.4) {
    const brace = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.045, 0.045), steel);
    brace.position.set(0, y, 0);
    brace.rotation.z = y % 2.8 === 0 ? 0.65 : -0.65;
    group.add(brace);
    const brace2 = brace.clone();
    brace2.rotation.y = Math.PI / 2;
    group.add(brace2);
  }

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.05, 1.1), dark);
  cabin.position.set(0.55, 12, 0);
  group.add(cabin);

  const jib = new THREE.Mesh(new THREE.BoxGeometry(11, 0.16, 0.18), steel);
  jib.position.set(4.7, 12.45, 0);
  group.add(jib);
  const counter = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.18, 0.2), steel);
  counter.position.set(-2.5, 12.45, 0);
  group.add(counter);
  const counterweight = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.62, 0.7), dark);
  counterweight.position.set(-4.0, 11.95, 0);
  group.add(counterweight);

  const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 4.4, 4), new THREE.MeshBasicMaterial({ color: 0xc9d8d7, transparent: true, opacity: 0.6 }));
  cable.position.set(6.2, 10.3, 0);
  group.add(cable);
  const hook = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.12), steel);
  hook.position.set(6.2, 8.0, 0);
  group.add(hook);

  return group;
}

export function TwinScene({ selectedId, onSelect, layers, mode, autoRotate, exploded, scenario, compact = false, onReady }: TwinSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<SceneApi | null>(null);
  const onSelectRef = useRef(onSelect);
  const onReadyRef = useRef(onReady);
  const [error, setError] = useState<string | null>(null);
  onSelectRef.current = onSelect;
  onReadyRef.current = onReady;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    } catch {
      setError('WebGL is unavailable in this browser.');
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x03080a);
    scene.fog = new THREE.FogExp2(0x03080a, 0.0044);

    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 900);
    const aspectNow = container.clientWidth / Math.max(1, container.clientHeight);
    let portrait = aspectNow < 0.95;
    if (portrait) {
      camera.position.set(wx(930) + 43, 43, wz(360) + 66);
    } else if (compact) {
      camera.position.set(56, 43, 76);
    } else {
      camera.position.set(74, 54, 100);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    if (portrait) controls.target.set(wx(930), 8, wz(360));
    else if (compact) controls.target.set(-2, 5, 2);
    else controls.target.set(-2, 6.5, 2);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.minDistance = 32;
    controls.maxDistance = 210;
    controls.maxPolarAngle = Math.PI / 2.06;
    controls.enablePan = false;
    controls.autoRotateSpeed = 0.26;
    controls.update();

    const glowTex = glowTexture();
    const baseTextures = [windowCanvas(0), windowCanvas(1), windowCanvas(2), windowCanvas(3)];

    // Atmosphere -----------------------------------------------------------
    const skyUniforms = {
      uTop: { value: new THREE.Color(0x010406) },
      uHorizon: { value: new THREE.Color(0x092126) },
      uNight: { value: 1 },
    };
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(360, 36, 20),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: skyUniforms,
        vertexShader: `
          varying vec3 vPos;
          void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vPos;
          uniform vec3 uTop;
          uniform vec3 uHorizon;
          uniform float uNight;
          void main() {
            float h = clamp(normalize(vPos).y * 0.5 + 0.5, 0.0, 1.0);
            float horizon = pow(1.0 - h, 3.6);
            vec3 col = mix(uTop, uHorizon, horizon);
            col += vec3(0.02, 0.07, 0.065) * pow(1.0 - h, 8.0) * uNight;
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    );
    sky.renderOrder = -10;
    scene.add(sky);

    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(620 * 3);
    for (let i = 0; i < 620; i++) {
      const radius = 170 + Math.random() * 110;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.48;
      starPositions[i * 3] = Math.cos(theta) * Math.cos(phi) * radius;
      starPositions[i * 3 + 1] = 22 + Math.sin(phi) * radius;
      starPositions[i * 3 + 2] = Math.sin(theta) * Math.cos(phi) * radius;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xb8e9e2, size: 0.55, transparent: true, opacity: 0.52, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }),
    );
    scene.add(stars);

    const moonSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glowTex, color: 0xc7fff0, transparent: true, opacity: 0.34, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }),
    );
    moonSprite.position.set(-132, 94, -212);
    moonSprite.scale.set(52, 52, 1);
    scene.add(moonSprite);

    const horizonGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glowTex, color: 0x247c72, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }),
    );
    horizonGlow.position.set(0, 28, -246);
    horizonGlow.scale.set(310, 72, 1);
    scene.add(horizonGlow);

    const hemi = new THREE.HemisphereLight(0x86c8cc, 0x04080a, 0.72);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xd8f6ff, 1.65);
    key.position.set(-52, 82, 46);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x31a993, 0.72);
    rim.position.set(76, 38, -64);
    scene.add(rim);
    const cameraFill = new THREE.DirectionalLight(0x8dc8c0, 0.62);
    cameraFill.position.set(58, 24, 88);
    scene.add(cameraFill);
    const waterLight = new THREE.PointLight(0x3bd9ae, 22, 110, 2);
    waterLight.position.set(-14, 8, 18);
    scene.add(waterLight);
    const warmLight = new THREE.PointLight(WARM, 14, 82, 2);
    warmLight.position.set(25, 7, 6);
    scene.add(warmLight);
    const heroLight = new THREE.PointLight(0x74ffd9, 26, 34, 2);
    heroLight.position.set(wx(930), 16, wz(360));
    scene.add(heroLight);

    // Diorama --------------------------------------------------------------
    const baseGeometry = new THREE.BoxGeometry(142, 2.6, 92);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x050b0f, metalness: 0.6, roughness: 0.68 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -1.45;
    scene.add(base);

    const surface = new THREE.Mesh(
      new THREE.PlaneGeometry(141, 91),
      new THREE.MeshStandardMaterial({ color: 0x071216, metalness: 0.44, roughness: 0.82 }),
    );
    surface.rotation.x = -Math.PI / 2;
    surface.position.y = -0.1;
    scene.add(surface);

    const baseFrame = new THREE.LineSegments(
      new THREE.EdgesGeometry(baseGeometry),
      new THREE.LineBasicMaterial({ color: 0x1c5058, transparent: true, opacity: 0.75 }),
    );
    baseFrame.position.y = -1.45;
    scene.add(baseFrame);

    const underGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(142, 92),
      new THREE.MeshBasicMaterial({ color: 0x0d3a3d, transparent: true, opacity: 0.16, side: THREE.DoubleSide }),
    );
    underGlow.rotation.x = -Math.PI / 2;
    underGlow.position.y = -2.78;
    scene.add(underGlow);

    const gridPoints: THREE.Vector3[] = [];
    for (let x = -68; x <= 68; x += 4) {
      gridPoints.push(new THREE.Vector3(x, 0.005, -36), new THREE.Vector3(x, 0.005, 23));
    }
    for (let z = -36; z <= 23; z += 4) {
      gridPoints.push(new THREE.Vector3(-68, 0.005, z), new THREE.Vector3(68, 0.005, z));
    }
    const grid = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(gridPoints),
      new THREE.LineBasicMaterial({ color: 0x12424a, transparent: true, opacity: 0.18, depthWrite: false }),
    );
    scene.add(grid);

    const promenade = new THREE.Mesh(
      new THREE.BoxGeometry(138, 0.12, 2.4),
      new THREE.MeshStandardMaterial({ color: 0x183035, emissive: 0x0d3434, emissiveIntensity: 0.42, metalness: 0.3, roughness: 0.62 }),
    );
    promenade.position.set(0, 0.08, 22.4);
    scene.add(promenade);
    const promenadeEdge = new THREE.Mesh(
      new THREE.BoxGeometry(138, 0.06, 0.09),
      new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.42 }),
    );
    promenadeEdge.position.set(0, 0.17, 23.55);
    scene.add(promenadeEdge);

    const waterUniforms = { uTime: { value: 0 }, uNight: { value: 1 } };
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(142, 23, 1, 1),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: waterUniforms,
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          uniform float uTime;
          uniform float uNight;
          void main() {
            float a = sin(vUv.x * 72.0 + uTime * 0.55) * 0.5 + 0.5;
            float b = sin(vUv.y * 118.0 - uTime * 0.8 + vUv.x * 12.0) * 0.5 + 0.5;
            float c = sin((vUv.x + vUv.y) * 160.0 + uTime * 1.4) * 0.5 + 0.5;
            vec3 deep = mix(vec3(0.012, 0.045, 0.055), vec3(0.02, 0.09, 0.11), uNight);
            vec3 crest = mix(vec3(0.06, 0.22, 0.23), vec3(0.035, 0.14, 0.15), uNight);
            float ripple = a * 0.22 + b * 0.16 + c * 0.04;
            vec3 col = mix(deep, crest, ripple);
            float glint = smoothstep(0.955, 1.0, sin(vUv.x * 190.0 + uTime * 0.9) * sin(vUv.y * 130.0 - uTime * 0.5) * 0.5 + 0.5);
            col += vec3(0.3, 0.78, 0.67) * glint * (0.06 + 0.08 * uNight);
            gl_FragColor = vec4(col, 0.94);
          }
        `,
      }),
    );
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, 0.015, 35.2);
    scene.add(water);

    const pierMat = new THREE.MeshStandardMaterial({ color: 0x12262b, metalness: 0.5, roughness: 0.62 });
    const boatMat = new THREE.MeshStandardMaterial({ color: 0xdfeee8, emissive: 0x214f4d, emissiveIntensity: 0.4, roughness: 0.5 });
    for (const px of [-46, -10, 31, 57]) {
      const pier = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.22, 10), pierMat);
      pier.position.set(px, 0.11, 28.1);
      scene.add(pier);
      for (const side of [-1, 1]) {
        const boat = new THREE.Group();
        const hull = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.28, 3.2), boatMat);
        hull.position.y = 0.2;
        boat.add(hull);
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.7, 5), new THREE.MeshBasicMaterial({ color: 0xb9dcd6, transparent: true, opacity: 0.55 }));
        mast.position.y = 1.5;
        boat.add(mast);
        boat.position.set(px + side * 1.9, 0.05, 29.5 + (px % 3));
        boat.rotation.y = side * 0.1;
        scene.add(boat);
      }
    }

    // Streets --------------------------------------------------------------
    const hRoads = [-26, -15, -4, 7, 18];
    const vRoads = [-53, -39, -25, -10, 5, 20, 35, 50];
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x09171c, emissive: 0x0a2024, emissiveIntensity: 0.24, roughness: 0.68, metalness: 0.3 });
    const roadGroup = new THREE.Group();
    for (const z of hRoads) {
      const road = new THREE.Mesh(new THREE.BoxGeometry(142, 0.05, 1.5), roadMat);
      road.position.set(0, 0.035, z);
      roadGroup.add(road);
    }
    for (const x of vRoads) {
      const road = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 60), roadMat);
      road.position.set(x, 0.035, -6.5);
      roadGroup.add(road);
    }
    scene.add(roadGroup);

    const dashGeo = new THREE.BoxGeometry(1, 1, 1);
    const dashMat = new THREE.MeshBasicMaterial({ color: 0x2e7375, transparent: true, opacity: 0.55 });
    const dashTransforms: Array<{ p: THREE.Vector3; s: THREE.Vector3 }> = [];
    for (const z of hRoads) {
      for (let x = -69; x < 70; x += 2.4) dashTransforms.push({ p: new THREE.Vector3(x, 0.068, z), s: new THREE.Vector3(0.55, 0.02, 0.055) });
    }
    for (const x of vRoads) {
      for (let z = -36; z < 22; z += 2.4) dashTransforms.push({ p: new THREE.Vector3(x, 0.068, z), s: new THREE.Vector3(0.055, 0.02, 0.55) });
    }
    const dashes = new THREE.InstancedMesh(dashGeo, dashMat, dashTransforms.length);
    const dummy = new THREE.Object3D();
    dashTransforms.forEach((t, i) => {
      dummy.position.copy(t.p);
      dummy.scale.copy(t.s);
      dummy.updateMatrix();
      dashes.setMatrixAt(i, dummy.matrix);
    });
    scene.add(dashes);

    for (let i = 0; i < 5; i++) {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.02, 1.2),
        new THREE.MeshBasicMaterial({ color: 0xc9e6dd, transparent: true, opacity: 0.42 }),
      );
      stripe.position.set(13.4 + i * 0.28, 0.075, 7);
      scene.add(stripe);
    }

    const carColors = [0xc8f8e8, 0xf3c47b, 0x6ac9e7, 0xdbe9e5, 0xff8f9f];
    const cars: CarRecord[] = [];
    hRoads.forEach((z, ri) => {
      for (let i = 0; i < 3; i++) {
        const g = new THREE.Group();
        const body = new THREE.Mesh(
          new THREE.BoxGeometry(1.1, 0.28, 0.52),
          new THREE.MeshStandardMaterial({ color: carColors[(ri + i) % carColors.length], emissive: carColors[(ri + i) % carColors.length], emissiveIntensity: 0.45, metalness: 0.6, roughness: 0.35 }),
        );
        body.position.y = 0.2;
        g.add(body);
        const roof = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.18, 0.44), new THREE.MeshStandardMaterial({ color: 0x0a1518, metalness: 0.7, roughness: 0.3 }));
        roof.position.y = 0.42;
        g.add(roof);
        const light = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xdffff7, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }));
        light.scale.set(0.9, 0.9, 1);
        light.position.set(0.65, 0.25, 0);
        g.add(light);
        g.position.set(-60, 0.08, z);
        scene.add(g);
        cars.push({ mesh: g, axis: 'x', fixed: z, dir: ri % 2 === 0 ? 1 : -1, speed: 7 + (i % 3) * 1.4, offset: (i * 43 + ri * 11) % 130 });
      }
    });
    vRoads.forEach((x, ri) => {
      for (let i = 0; i < 2; i++) {
        const g = new THREE.Group();
        const body = new THREE.Mesh(
          new THREE.BoxGeometry(0.52, 0.28, 1.1),
          new THREE.MeshStandardMaterial({ color: carColors[(ri + i + 2) % carColors.length], emissive: carColors[(ri + i + 2) % carColors.length], emissiveIntensity: 0.45, metalness: 0.6, roughness: 0.35 }),
        );
        body.position.y = 0.2;
        g.add(body);
        const light = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xdffff7, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }));
        light.scale.set(0.8, 0.8, 1);
        light.position.set(0, 0.25, 0.75);
        g.add(light);
        g.position.set(x, 0.08, -28);
        scene.add(g);
        cars.push({ mesh: g, axis: 'z', fixed: x, dir: ri % 2 === 0 ? 1 : -1, speed: 5.5 + i * 1.6, offset: (i * 27 + ri * 17) % 55 });
      }
    });

    // Greenery -------------------------------------------------------------
    const trunkGeo = new THREE.CylinderGeometry(0.09, 0.13, 0.9, 5);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x392f26, roughness: 0.9 });
    const leafGeo = new THREE.IcosahedronGeometry(0.82, 0);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x173e30, emissive: 0x0b2b23, emissiveIntensity: 0.32, roughness: 0.88 });
    const leafMat2 = new THREE.MeshStandardMaterial({ color: 0x1e4c39, emissive: 0x0d3328, emissiveIntensity: 0.28, roughness: 0.9 });
    const treePositions: Array<[number, number]> = [];
    for (let x = -63; x <= 63; x += 5.2) treePositions.push([x, 20.3]);
    for (let x = -60; x <= 60; x += 7.5) treePositions.push([x, -31.6]);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      treePositions.push([wx(930) + Math.cos(a) * 11.5, wz(360) + Math.sin(a) * 9.8]);
    }
    treePositions.forEach(([x, z], i) => {
      if (Math.abs(x - wx(930)) < 9 && Math.abs(z - wz(360)) < 7) return;
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.45;
      tree.add(trunk);
      const crown = new THREE.Mesh(leafGeo, i % 2 ? leafMat : leafMat2);
      crown.position.y = 1.25;
      crown.scale.set(1.05, 0.86, 1.05);
      tree.add(crown);
      const crown2 = new THREE.Mesh(leafGeo, leafMat);
      crown2.position.set(0.28, 1.65, -0.18);
      crown2.scale.set(0.64, 0.55, 0.64);
      tree.add(crown2);
      tree.position.set(x, 0.02, z);
      tree.rotation.y = i * 1.7;
      scene.add(tree);
    });

    // The diorama is intentionally self-contained. The horizon glow and the
    // star field carry the depth instead of a floating distant skyline.

    // Buildings ------------------------------------------------------------
    const buildings: BuildingRecord[] = [];
    const pickables: THREE.Object3D[] = [];
    const sensorGroup = new THREE.Group();
    const beaconGroup = new THREE.Group();
    const districtGroup = new THREE.Group();
    const transitGroup = new THREE.Group();
    const energyGroup = new THREE.Group();
    scene.add(sensorGroup, beaconGroup, districtGroup, transitGroup, energyGroup);

    const edgeColor = 0x2d5a60;
    const addEdges = (mesh: THREE.Mesh, opacity = 0.36, color = edgeColor) => {
      const edge = new THREE.LineSegments(
        new THREE.EdgesGeometry(mesh.geometry),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }),
      );
      mesh.add(edge);
      return edge;
    };

    ASSETS.forEach((asset, index) => {
      const group = new THREE.Group();
      const volume = Math.sqrt(asset.gfa / 1000);
      const w = asset.kind === 'industrial' ? 6.2 : 3.8 + volume * 0.115;
      const d = asset.kind === 'industrial' ? 4.6 : w * (0.78 + ((index * 7) % 5) * 0.045);
      const h = 2.4 + asset.height * 0.43;
      const isHero = asset.id === 'KT-01';
      const isConstruction = asset.status === 'construction';
      const mats: THREE.MeshStandardMaterial[] = [];
      const floors: THREE.Object3D[] = [];
      const edges: THREE.LineSegments[] = [];

      const makeMat = (textureIndex = index % 4) => {
        const tex = baseTextures[textureIndex].clone();
        tex.needsUpdate = true;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(Math.max(1, Math.round(w / 2.5)), Math.max(2, Math.round(h / 2.8)));
        tex.anisotropy = 4;
        return new THREE.MeshStandardMaterial({
          color: 0xa7b9b8,
          map: tex,
          emissive: 0xffffff,
          emissiveMap: tex,
          emissiveIntensity: 0.7,
          metalness: 0.32,
          roughness: 0.47,
        });
      };

      if (isConstruction) {
        const core = new THREE.Mesh(
          new THREE.BoxGeometry(w * 0.54, h * 0.88, d * 0.54),
          new THREE.MeshStandardMaterial({ color: 0x15282d, metalness: 0.55, roughness: 0.48 }),
        );
        core.position.y = h * 0.44;
        group.add(core);
        addEdges(core, 0.3, 0x4b6c70);
        pickables.push(core);
        core.userData.assetId = asset.id;

        const slabCount = Math.max(4, Math.min(8, asset.floors));
        for (let f = 0; f < slabCount; f++) {
          const slab = new THREE.Mesh(
            new THREE.BoxGeometry(w, 0.16, d),
            new THREE.MeshStandardMaterial({ color: 0x8b9995, emissive: 0x172c2d, emissiveIntensity: 0.25, roughness: 0.72 }),
          );
          slab.position.y = 0.3 + f * (h / slabCount) * 0.84;
          slab.userData.assetId = asset.id;
          slab.userData.baseY = slab.position.y;
          addEdges(slab, 0.28, 0x6d817f);
          group.add(slab);
          pickables.push(slab);
          floors.push(slab);
        }
        const ghost = new THREE.Mesh(
          new THREE.BoxGeometry(w * 0.94, h * 0.9, d * 0.94),
          new THREE.MeshBasicMaterial({ color: 0xf4bd72, wireframe: true, transparent: true, opacity: 0.13 }),
        );
        ghost.position.y = h * 0.45;
        group.add(ghost);

        const crane = makeCrane();
        crane.position.set(w * 0.8, 0, -d * 0.45);
        crane.scale.setScalar(0.78);
        group.add(crane);
      } else if (isHero) {
        const podium = new THREE.Mesh(
          new THREE.BoxGeometry(w * 1.35, 1.25, d * 1.3),
          new THREE.MeshStandardMaterial({ color: 0x10252a, metalness: 0.5, roughness: 0.45, emissive: 0x0c292b, emissiveIntensity: 0.28 }),
        );
        podium.position.y = 0.62;
        podium.userData.assetId = asset.id;
        group.add(podium);
        pickables.push(podium);
        addEdges(podium, 0.44, 0x3e8587);

        const towerH = 15.3;
        const floorCount = 26;
        const gap = 0.43;
        const slabH = 0.13;

        const core = new THREE.Mesh(
          new THREE.BoxGeometry(w * 0.36, towerH, d * 0.32),
          new THREE.MeshStandardMaterial({ color: 0x0d1d22, metalness: 0.7, roughness: 0.38, emissive: 0x133e3e, emissiveIntensity: 0.32 }),
        );
        core.position.y = 1.25 + towerH / 2;
        group.add(core);

        const shell = new THREE.Mesh(
          new THREE.BoxGeometry(w, towerH, d),
          new THREE.MeshPhysicalMaterial({
            color: 0x9fe3d8,
            emissive: 0x1a5a55,
            emissiveIntensity: 0.12,
            transparent: true,
            opacity: 0.12,
            metalness: 0.18,
            roughness: 0.08,
            side: THREE.DoubleSide,
            depthWrite: false,
          }),
        );
        shell.position.y = 1.25 + towerH / 2;
        group.add(shell);

        const mullions: THREE.Object3D[] = [];
        const mullionMat = new THREE.MeshBasicMaterial({ color: 0x78dcc8, transparent: true, opacity: 0.46 });
        const corners: Array<[number, number]> = [
          [-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2],
        ];
        corners.forEach(([x, z]) => {
          const m = new THREE.Mesh(new THREE.BoxGeometry(0.055, towerH, 0.055), mullionMat);
          m.position.set(x, 1.25 + towerH / 2, z);
          group.add(m);
          mullions.push(m);
        });

        for (let f = 0; f < floorCount; f++) {
          const slabMat = makeMat(0);
          const slab = new THREE.Mesh(new THREE.BoxGeometry(w * 0.97, slabH, d * 0.97), slabMat);
          const baseY = 1.35 + f * (slabH + gap);
          slab.position.y = baseY;
          slab.userData.assetId = asset.id;
          slab.userData.baseY = baseY;
          addEdges(slab, 0.42, 0x4b9b92);
          group.add(slab);
          pickables.push(slab);
          mats.push(slabMat);
          floors.push(slab);
        }

        for (const y of [1.35 + (slabH + gap) * 8, 1.35 + (slabH + gap) * 17]) {
          const band = new THREE.Mesh(
            new THREE.BoxGeometry(w * 1.005, 0.075, d * 1.005),
            new THREE.MeshBasicMaterial({ color: 0x7cf5d3, transparent: true, opacity: 0.55 }),
          );
          band.position.y = y;
          group.add(band);
        }

        const top = 1.25 + towerH;
        const crown1 = new THREE.Mesh(
          new THREE.BoxGeometry(w * 0.82, 1.05, d * 0.82),
          new THREE.MeshStandardMaterial({ color: 0x14353a, metalness: 0.6, roughness: 0.34, emissive: 0x1c6c62, emissiveIntensity: 0.5 }),
        );
        crown1.position.y = top + 0.52;
        crown1.userData.assetId = asset.id;
        group.add(crown1);
        pickables.push(crown1);
        addEdges(crown1, 0.5, 0x72d8c3);

        const crown2 = new THREE.Mesh(
          new THREE.BoxGeometry(w * 0.55, 0.95, d * 0.56),
          new THREE.MeshStandardMaterial({ color: 0x0e252b, metalness: 0.7, roughness: 0.3, emissive: 0x2f9383, emissiveIntensity: 0.55 }),
        );
        crown2.position.y = top + 1.52;
        group.add(crown2);
        addEdges(crown2, 0.5, 0x8df5da);

        const spire = new THREE.Mesh(
          new THREE.CylinderGeometry(0.035, 0.07, 2.8, 5),
          new THREE.MeshBasicMaterial({ color: 0xbfffe9, transparent: true, opacity: 0.78 }),
        );
        spire.position.y = top + 3.4;
        group.add(spire);
        const crownGlow = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: glowTex, color: 0x8dffe3, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending }),
        );
        crownGlow.scale.set(5, 5, 1);
        crownGlow.position.y = top + 3.8;
        group.add(crownGlow);

        [crown1, crown2, spire, crownGlow].forEach((part) => {
          part.userData.baseY = part.position.y;
        });

        buildings.push({
          id: asset.id,
          group,
          floors,
          baseY: 0,
          mats,
          edges,
          width: w * 1.25,
          height: top + 3.8,
          depth: d * 1.2,
          energy: asset.energy,
          shell,
          mullions,
          crown: [crown1, crown2, spire, crownGlow],
          core,
        } as BuildingRecord);
        group.userData.assetId = asset.id;
      } else {
        const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), makeMat());
        body.position.y = h / 2;
        body.userData.assetId = asset.id;
        group.add(body);
        pickables.push(body);
        mats.push(body.material as THREE.MeshStandardMaterial);
        edges.push(addEdges(body, 0.32));

        if (asset.height > 17) {
          const upperH = h * 0.22;
          const upper = new THREE.Mesh(new THREE.BoxGeometry(w * 0.82, upperH, d * 0.82), makeMat(index % 4));
          upper.position.y = h + upperH / 2;
          upper.userData.assetId = asset.id;
          group.add(upper);
          pickables.push(upper);
          mats.push(upper.material as THREE.MeshStandardMaterial);
          edges.push(addEdges(upper, 0.34));
          const cap = new THREE.Mesh(
            new THREE.BoxGeometry(w * 0.42, 0.38, d * 0.42),
            new THREE.MeshStandardMaterial({ color: 0x102329, metalness: 0.6, roughness: 0.4, emissive: 0x12413f, emissiveIntensity: 0.3 }),
          );
          cap.position.y = h + upperH + 0.19;
          group.add(cap);
        } else {
          const cap = new THREE.Mesh(
            new THREE.BoxGeometry(w * 0.38, 0.34, d * 0.38),
            new THREE.MeshStandardMaterial({ color: 0x102329, metalness: 0.6, roughness: 0.4, emissive: 0x12413f, emissiveIntensity: 0.3 }),
          );
          cap.position.y = h + 0.17;
          group.add(cap);
        }

        if (asset.height > 18) {
          const finMat = new THREE.MeshBasicMaterial({ color: 0x5fe1c8, transparent: true, opacity: 0.28 });
          [[-w / 2, -d / 2], [w / 2, d / 2]].forEach(([x, z]) => {
            const fin = new THREE.Mesh(new THREE.BoxGeometry(0.035, h * 0.94, 0.035), finMat);
            fin.position.set(x, h * 0.47, z);
            group.add(fin);
          });
        }

        if ((asset.kind === 'civic' || asset.kind === 'industrial' || asset.kind === 'data') && asset.height < 14) {
          const pvMat = new THREE.MeshStandardMaterial({ color: 0x142c3a, emissive: 0x1d6f84, emissiveIntensity: 0.45, metalness: 0.6, roughness: 0.28 });
          for (let px = -1; px <= 1; px++) {
            for (let pz = -1; pz <= 1; pz++) {
              const pv = new THREE.Mesh(new THREE.BoxGeometry(w * 0.18, 0.035, d * 0.17), pvMat);
              pv.position.set(px * w * 0.22, h + 0.05, pz * d * 0.22);
              pv.rotation.x = -0.18;
              group.add(pv);
            }
          }
        }

        if (asset.height >= 26) {
          const mast = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 3.1, 4),
            new THREE.MeshBasicMaterial({ color: 0x9ff8e3, transparent: true, opacity: 0.42 }),
          );
          mast.position.y = h + 1.5;
          group.add(mast);
        }

        buildings.push({ id: asset.id, group, floors, baseY: 0, mats, edges, width: w, height: h, depth: d, energy: asset.energy });
      }

      const disc = new THREE.Mesh(
        new THREE.CircleGeometry(Math.max(w, d) * 0.86, 24),
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false }),
      );
      disc.rotation.x = -Math.PI / 2;
      disc.position.y = 0.012;
      disc.scale.y = 0.7;
      group.add(disc);

      group.position.set(wx(asset.x), 0, wz(asset.y));
      scene.add(group);

      const energyRing = new THREE.Mesh(
        new THREE.RingGeometry(Math.max(w, d) * 0.78, Math.max(w, d) * 0.84, 36),
        new THREE.MeshBasicMaterial({ color: energyColor(asset.energy), transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }),
      );
      energyRing.rotation.x = -Math.PI / 2;
      energyRing.position.set(wx(asset.x), 0.055, wz(asset.y));
      energyGroup.add(energyRing);

      if (asset.status !== 'construction') {
        const top = h + (isHero ? 4.8 : 1.2);
        const beacon = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: glowTex,
            color: asset.risk === 'high' ? ROSE : asset.risk === 'medium' ? WARM : ACCENT,
            transparent: true,
            opacity: isHero ? 0.95 : 0.68,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
        );
        const scale = isHero ? 4.2 : 1.7;
        beacon.scale.set(scale, scale, 1);
        beacon.position.set(wx(asset.x), top, wz(asset.y));
        beacon.userData.phase = index * 0.7;
        beacon.userData.baseScale = scale;
        (isHero ? beaconGroup : sensorGroup).add(beacon);
      }

      if (isConstruction) {
        const beacon = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: glowTex, color: WARM, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending }),
        );
        beacon.scale.set(1.8, 1.8, 1);
        beacon.position.set(wx(asset.x) + 1.5, h + 3.4, wz(asset.y) - 1.2);
        beacon.userData.phase = index;
        beacon.userData.baseScale = 1.8;
        sensorGroup.add(beacon);
      }
    });

    // Context fabric: quiet neighbours that make the precinct feel inhabited.
    const contextGroup = new THREE.Group();
    scene.add(contextGroup);
    let cseed = 41;
    const crand = () => {
      cseed = (cseed * 16807) % 2147483647;
      return cseed / 2147483647;
    };
    const contextSpots: Array<{ x: number; z: number; w: number; d: number; h: number }> = [];
    for (let gx = -60; gx <= 60; gx += 6.2) {
      for (let gz = -30; gz <= 17; gz += 6.2) {
        const x = gx + (crand() - 0.5) * 3.2;
        const z = gz + (crand() - 0.5) * 3.2;
        if (Math.hypot(x - wx(930), z - wz(360)) < 12.5) continue;
        const nearAsset = ASSETS.some((a) => Math.hypot(x - wx(a.x), z - wz(a.y)) < 7.2);
        if (nearAsset) continue;
        if (x < -64 || x > 64 || z < -33 || z > 19) continue;
        const tall = crand() > 0.84;
        const h = tall ? 7.5 + crand() * 3 : 2.4 + crand() * 4.6;
        contextSpots.push({ x, z, w: tall ? 3.2 + crand() * 1.9 : 2.4 + crand() * 2.8, d: 2.2 + crand() * 2.6, h });
      }
    }
    contextSpots.slice(0, 54).forEach((spot, ci) => {
      const tex = baseTextures[ci % 4].clone();
      tex.needsUpdate = true;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(Math.max(1, Math.round(spot.w / 2.4)), Math.max(2, Math.round(spot.h / 2.6)));
      const mat = new THREE.MeshStandardMaterial({
        color: 0x687b7b,
        map: tex,
        emissive: 0xffffff,
        emissiveMap: tex,
        emissiveIntensity: 0.16,
        metalness: 0.28,
        roughness: 0.6,
      });
      const body = new THREE.Mesh(new THREE.BoxGeometry(spot.w, spot.h, spot.d), mat);
      body.position.set(spot.x, spot.h / 2, spot.z);
      const edge = new THREE.LineSegments(
        new THREE.EdgesGeometry(body.geometry),
        new THREE.LineBasicMaterial({ color: 0x1c3b40, transparent: true, opacity: 0.22, depthWrite: false }),
      );
      body.add(edge);
      const cap = new THREE.Mesh(
        new THREE.BoxGeometry(spot.w * 0.3, 0.18, spot.d * 0.3),
        new THREE.MeshBasicMaterial({ color: 0x0d2529 }),
      );
      cap.position.set(spot.x, spot.h + 0.09, spot.z);
      contextGroup.add(body, cap);
      if (ci % 8 === 0) {
        const dot = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x7fe6ca, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
        dot.scale.set(0.9, 0.9, 1);
        dot.position.set(spot.x, spot.h + 0.4, spot.z);
        contextGroup.add(dot);
      }
    });

    const plaza = new THREE.Mesh(
      new THREE.CircleGeometry(10.2, 64),
      new THREE.MeshBasicMaterial({ color: 0x0c3d3d, transparent: true, opacity: 0.18, depthWrite: false }),
    );
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.set(wx(930), 0.02, wz(360));
    scene.add(plaza);
    const plazaRing = new THREE.Mesh(
      new THREE.RingGeometry(9.4, 9.55, 96),
      new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false }),
    );
    plazaRing.rotation.x = -Math.PI / 2;
    plazaRing.position.set(wx(930), 0.04, wz(360));
    scene.add(plazaRing);

    // GIS districts --------------------------------------------------------
    const labelLayer = document.createElement('div');
    labelLayer.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;';
    container.appendChild(labelLayer);
    const labelEls: Array<{ el: HTMLDivElement; pos: THREE.Vector3 }> = [];

    DISTRICTS.forEach((district) => {
      const points = polygonPoints(district.polygon);
      const color = new THREE.Color(district.accent).getHex();
      districtGroup.add(lineLoopFromPoints(points, color, 0.52));
      const shape = new THREE.Shape(points.map((p) => new THREE.Vector2(p.x, p.z)));
      const fill = new THREE.Mesh(
        new THREE.ShapeGeometry(shape),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.035, side: THREE.DoubleSide, depthWrite: false }),
      );
      fill.rotation.x = -Math.PI / 2;
      fill.position.y = 0.03;
      districtGroup.add(fill);

      const el = document.createElement('div');
      el.innerHTML = `<span style="display:inline-block;width:4px;height:4px;border-radius:99px;background:${district.accent};box-shadow:0 0 8px ${district.accent};margin-right:5px;vertical-align:1px"></span>${district.short}`;
      el.style.cssText = 'position:absolute;transform:translate(-50%,-50%);font-family:"JetBrains Mono Variable",monospace;font-size:7.5px;letter-spacing:.18em;color:rgba(190,222,224,.62);white-space:nowrap;padding:3px 6px;border:1px solid rgba(120,200,210,.14);border-radius:3px;background:rgba(4,10,12,.45);backdrop-filter:blur(3px);';
      labelLayer.appendChild(el);
      labelEls.push({ el, pos: new THREE.Vector3(wx(district.labelX), 1.4, wz(district.labelY)) });
    });

    // Transit --------------------------------------------------------------
    const transitPoints = [
      new THREE.Vector3(wx(250), 2.5, wz(420)),
      new THREE.Vector3(wx(470), 2.5, wz(400)),
      new THREE.Vector3(wx(650), 2.5, wz(370)),
      new THREE.Vector3(wx(930), 2.5, wz(330)),
      new THREE.Vector3(wx(1160), 2.5, wz(300)),
      new THREE.Vector3(wx(1320), 2.5, wz(370)),
    ];
    const transitCurve = new THREE.CatmullRomCurve3(transitPoints);
    const transitTube = new THREE.Mesh(
      new THREE.TubeGeometry(transitCurve, 100, 0.055, 5, false),
      new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.6 }),
    );
    transitGroup.add(transitTube);
    const train = new THREE.Group();
    const trainBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 1.15, 4, 8), new THREE.MeshBasicMaterial({ color: 0xd6fbff }));
    trainBody.rotation.z = Math.PI / 2;
    train.add(trainBody);
    const trainGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: CYAN, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending }));
    trainGlow.scale.set(2, 2, 1);
    train.add(trainGlow);
    transitGroup.add(train);
    for (let i = 0; i < 8; i++) {
      const p = transitCurve.getPointAt(i / 8);
      const pylon = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, p.y, 5),
        new THREE.MeshStandardMaterial({ color: 0x16363b, metalness: 0.5, roughness: 0.5 }),
      );
      pylon.position.set(p.x, p.y / 2, p.z);
      transitGroup.add(pylon);
    }
    transitGroup.visible = false;

    // Data arcs + overlays ------------------------------------------------
    const arcs: ArcRecord[] = [];
    const arcTargets = ['KT-02', 'KT-03', 'KE-01', 'CH-01', 'TKO-01'];
    const heroWorld = new THREE.Vector3(wx(930), 16, wz(360));
    arcTargets.forEach((id, i) => {
      const target = ASSETS.find((a) => a.id === id);
      if (!target) return;
      const start = heroWorld.clone().add(new THREE.Vector3(0, 2 + i * 0.5, 0));
      const end = new THREE.Vector3(wx(target.x), 4 + Math.min(target.height, 24) * 0.34, wz(target.y));
      const mid = start.clone().add(end).multiplyScalar(0.5);
      mid.y = Math.max(start.y, end.y) + 7 + i * 1.6;
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      sensorGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(curve.getPoints(38)),
        new THREE.LineBasicMaterial({ color: i % 2 ? CYAN : ACCENT, transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending }),
      ));
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 8, 8),
        new THREE.MeshBasicMaterial({ color: i % 2 ? 0xc8f6ff : 0xc4ffeb }),
      );
      sensorGroup.add(particle);
      arcs.push({ curve, particle, speed: 0.045 + i * 0.005, offset: i * 0.19 });
    });

    const holoRing = new THREE.Mesh(
      new THREE.RingGeometry(7.25, 7.32, 96),
      new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    holoRing.rotation.x = -Math.PI / 2;
    holoRing.position.set(wx(930), 0.09, wz(360));
    scene.add(holoRing);
    const holoRing2 = new THREE.Mesh(
      new THREE.RingGeometry(12.0, 12.05, 96),
      new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    holoRing2.rotation.x = -Math.PI / 2;
    holoRing2.position.set(wx(930), 0.08, wz(360));
    scene.add(holoRing2);

    const radar = new THREE.Mesh(
      new THREE.RingGeometry(26, 26.35, 90, 1, 0, Math.PI * 0.33),
      new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    radar.rotation.x = -Math.PI / 2;
    radar.position.set(wx(930), 0.07, wz(360));
    scene.add(radar);

    const selRing = new THREE.Mesh(
      new THREE.RingGeometry(4.9, 5.15, 72),
      new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    selRing.rotation.x = -Math.PI / 2;
    selRing.visible = false;
    scene.add(selRing);
    const selBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 26, 6, 1, true),
      new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    selBeam.visible = false;
    scene.add(selBeam);

    const selLabel = document.createElement('div');
    selLabel.className = 'twin-selected-label';
    selLabel.style.cssText = 'position:absolute;transform:translate(-50%,-100%);display:none;white-space:nowrap;will-change:transform;';
    labelLayer.appendChild(selLabel);

    // Weather / resilience overlays ---------------------------------------
    const weatherGroup = new THREE.Group();
    scene.add(weatherGroup);

    const rainCount = 900;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = (Math.random() - 0.5) * 132;
      rainPositions[i * 3 + 1] = 4 + Math.random() * 46;
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 72;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rain = new THREE.Points(
      rainGeo,
      new THREE.PointsMaterial({ color: 0x9de8ff, size: 0.1, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    weatherGroup.add(rain);

    const wind = new THREE.Group();
    const windMat = new THREE.MeshBasicMaterial({ color: 0x79dcff, transparent: true, opacity: 0.42, depthWrite: false });
    for (let i = 0; i < 7; i++) {
      const arrow = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 7, 5), windMat);
      shaft.rotation.z = Math.PI / 2;
      arrow.add(shaft);
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.8, 7), windMat);
      head.rotation.z = -Math.PI / 2;
      head.position.x = 3.7;
      arrow.add(head);
      arrow.position.set(-49 + i * 16, 21 + (i % 3) * 5, -18 + (i % 2) * 30);
      wind.add(arrow);
    }
    weatherGroup.add(wind);

    const floodMat = new THREE.MeshBasicMaterial({ color: 0x1a9fd4, transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false });
    const flood = new THREE.Mesh(new THREE.PlaneGeometry(120, 9), floodMat);
    flood.rotation.x = -Math.PI / 2;
    flood.position.set(0, 0.07, 18.8);
    weatherGroup.add(flood);
    const floodEdge = new THREE.Mesh(
      new THREE.BoxGeometry(120, 0.04, 0.12),
      new THREE.MeshBasicMaterial({ color: 0x54d6ff, transparent: true, opacity: 0.55 }),
    );
    floodEdge.position.set(0, 0.12, 23.3);
    weatherGroup.add(floodEdge);

    const heatGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glowTex, color: 0xff8a4c, transparent: true, opacity: 0.08, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    heatGlow.position.set(4, 8, 2);
    heatGlow.scale.set(95, 42, 1);
    weatherGroup.add(heatGlow);

    let currentScenario: TwinScenario = scenario;
    rain.visible = scenario === 'typhoon';
    wind.visible = scenario === 'typhoon';
    flood.visible = scenario === 'typhoon';
    floodEdge.visible = scenario === 'typhoon';
    heatGlow.visible = scenario === 'heat';

    let selected: string | null = selectedId;
    let lastSelected = selectedId;
    let currentLayers = layers;
    let currentMode = mode;
    let explodedTarget = exploded ? 1 : 0;
    let explodedValue = explodedTarget;
    let hovered: string | null = null;
    let disposed = false;
    let frame = 0;
    let fps = 60;
    let lastFpsTime = performance.now();
    let frames = 0;
    let focusTarget: THREE.Vector3 | null = null;
    let focusPosition: THREE.Vector3 | null = null;

    function applyMode(m: 'day' | 'night') {
      currentMode = m;
      const night = m === 'night';
      skyUniforms.uTop.value.setHex(night ? 0x010406 : 0x3d7b86);
      skyUniforms.uHorizon.value.setHex(night ? 0x0b2a2e : 0xcfe3d9);
      skyUniforms.uNight.value = night ? 1 : 0;
      hemi.intensity = night ? 0.78 : 1.9;
      hemi.color.setHex(night ? 0x8bd9d9 : 0xf2fff8);
      hemi.groundColor.setHex(night ? 0x04080a : 0x2c4644);
      key.intensity = night ? 1.7 : 3.15;
      key.color.setHex(night ? 0xd7f6ff : 0xfff4df);
      rim.intensity = night ? 0.8 : 0.42;
      waterLight.intensity = night ? 22 : 9;
      warmLight.intensity = night ? 15 : 3;
      scene.background = new THREE.Color(night ? 0x03080a : 0x74928f);
      scene.fog = new THREE.FogExp2(night ? 0x03080a : 0x95afa9, night ? 0.0044 : 0.0026);
      baseMaterial.color.setHex(night ? 0x050b0f : 0x142629);
      surface.material.color.setHex(night ? 0x071216 : 0x1e3537);
      roadMat.color.setHex(night ? 0x09171c : 0x263d3f);
      (stars.material as THREE.PointsMaterial).opacity = night ? 0.52 : 0.05;
      (moonSprite.material as THREE.SpriteMaterial).opacity = night ? 0.34 : 0;
      waterUniforms.uNight.value = night ? 1 : 0;
      renderer.toneMappingExposure = night ? 1.14 : 1.08;
      buildings.forEach((b) => {
        b.mats.forEach((mat) => {
          mat.emissiveIntensity = night ? 0.7 : 0.07;
          mat.color.setHex(night ? 0xa7b9b8 : 0xe4efeb);
        });
        if (b.shell) {
          const shellMat = b.shell.material as THREE.MeshPhysicalMaterial;
          shellMat.opacity = night ? 0.12 : 0.24;
          shellMat.color.setHex(night ? 0x9fe3d8 : 0xcfeee8);
        }
      });
      if (currentLayers.energy) applyEnergy();
    }

    function applyScenarioVisuals(next: TwinScenario) {
      currentScenario = next;
      rain.visible = next === 'typhoon';
      wind.visible = next === 'typhoon';
      flood.visible = next === 'typhoon';
      floodEdge.visible = next === 'typhoon';
      heatGlow.visible = next === 'heat';
      if (next === 'typhoon') {
        hemi.intensity = 0.5;
        key.intensity = 0.9;
        rim.intensity = 0.45;
        scene.fog = new THREE.FogExp2(0x03080a, 0.007);
        renderer.toneMappingExposure = 0.92;
      } else if (next === 'heat') {
        hemi.intensity = 1.05;
        hemi.color.setHex(0xffd2b0);
        key.intensity = 1.5;
        scene.fog = new THREE.FogExp2(0x1a100b, 0.005);
        renderer.toneMappingExposure = 1.06;
      } else {
        applyMode(currentMode);
      }
    }

    function applyEnergy() {
      buildings.forEach((b) => {
        const c = energyColor(b.energy);
        b.mats.forEach((mat) => {
          mat.emissive.copy(c);
          mat.emissiveIntensity = currentMode === 'night' ? 0.95 : 0.6;
          mat.color.setHex(0x25383a);
        });
        b.edges.forEach((edge) => {
          (edge.material as THREE.LineBasicMaterial).color.copy(c).multiplyScalar(0.92);
          (edge.material as THREE.LineBasicMaterial).opacity = 0.55;
        });
      });
      energyGroup.visible = true;
    }

    function resetEnergy() {
      buildings.forEach((b) => {
        b.mats.forEach((mat) => {
          mat.emissive.setHex(0xffffff);
          mat.emissiveIntensity = currentMode === 'night' ? 0.7 : 0.14;
          mat.color.setHex(currentMode === 'night' ? 0xa7b9b8 : 0xd1dcda);
        });
        b.edges.forEach((edge) => {
          (edge.material as THREE.LineBasicMaterial).color.setHex(edgeColor);
          (edge.material as THREE.LineBasicMaterial).opacity = 0.36;
        });
      });
      energyGroup.visible = false;
    }

    function applyLayers(next: TwinLayers) {
      currentLayers = next;
      sensorGroup.visible = next.iot;
      beaconGroup.visible = true;
      districtGroup.visible = next.gis;
      transitGroup.visible = next.transit;
      labelEls.forEach(({ el }) => { el.style.display = next.gis ? 'block' : 'none'; });
      if (next.energy) applyEnergy(); else resetEnergy();
    }

    function setHover(id: string | null) {
      if (hovered === id) return;
      hovered = id;
      buildings.forEach((b) => {
        const active = b.id === id;
        b.edges.forEach((edge) => {
          const mat = edge.material as THREE.LineBasicMaterial;
          mat.opacity = active ? 0.95 : currentLayers.energy ? 0.55 : 0.36;
          if (!currentLayers.energy) mat.color.setHex(active ? 0xa9ffe3 : edgeColor);
        });
        b.group.scale.setScalar(active ? 1.012 : 1);
      });
      renderer.domElement.style.cursor = id ? 'pointer' : 'grab';
    }

    function focusOn(id: string | null) {
      const record = id ? buildings.find((b) => b.id === id) : null;
      if (!record) {
        focusTarget = new THREE.Vector3(-2, 6.5, 2);
        focusPosition = new THREE.Vector3(74, 54, 100);
        return;
      }
      const p = record.group.position;
      const dir = camera.position.clone().sub(controls.target);
      dir.y = 0;
      if (dir.lengthSq() < 0.001) dir.set(0, 0, 1);
      dir.normalize();
      const target = new THREE.Vector3(p.x, record.height * 0.44, p.z);
      focusTarget = target;
      focusPosition = target.clone().add(dir.multiplyScalar(43)).add(new THREE.Vector3(0, 20, 0));
    }

    function setSelected(id: string | null, allowFocus = true) {
      const changed = id !== lastSelected;
      selected = id;
      lastSelected = id;
      const record = id ? buildings.find((b) => b.id === id) : null;
      selRing.visible = !!record;
      selBeam.visible = !!record;
      selLabel.style.display = record ? 'block' : 'none';
      if (record) {
        const p = record.group.position;
        const radius = Math.max(record.width, record.depth) * 0.62;
        const lift = record.id === 'KT-01' ? record.floors.length * 0.42 * explodedValue : 0;
        selRing.position.set(p.x, 0.14, p.z);
        selRing.scale.setScalar(Math.max(0.7, radius / 5));
        selBeam.position.set(p.x, record.height + 2 + lift, p.z);
        const asset = ASSETS.find((a) => a.id === id);
        selLabel.innerHTML = `<div style="background:rgba(5,12,15,.92);border:1px solid rgba(83,240,190,.42);border-radius:5px;padding:5px 8px;font-family:Inter,sans-serif;font-size:10px;color:#eafff8;box-shadow:0 10px 30px -12px #000;backdrop-filter:blur(10px)"><span style="color:#53f0be;font-family:'JetBrains Mono Variable',monospace;font-size:7px;letter-spacing:.12em">● ${asset?.id ?? 'LIVE'}</span><div style="margin-top:2px;font-weight:500">${asset?.name ?? ''}</div></div>`;
        if (allowFocus && changed) focusOn(id);
      } else if (allowFocus && changed) {
        focusOn(null);
      }
      setHover(null);
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;

    const updatePointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const pick = () => {
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pickables, false);
      for (const hit of hits) {
        const id = hit.object.userData.assetId as string | undefined;
        if (id) return id;
      }
      return null;
    };

    const handleMove = (event: PointerEvent) => {
      updatePointer(event);
      setHover(pick());
    };
    const handleDown = (event: PointerEvent) => {
      downX = event.clientX;
      downY = event.clientY;
    };
    const handleUp = (event: PointerEvent) => {
      if (Math.abs(event.clientX - downX) > 5 || Math.abs(event.clientY - downY) > 5) return;
      updatePointer(event);
      onSelectRef.current(pick());
    };
    const handleLeave = () => setHover(null);

    renderer.domElement.addEventListener('pointermove', handleMove);
    renderer.domElement.addEventListener('pointerdown', handleDown);
    renderer.domElement.addEventListener('pointerup', handleUp);
    renderer.domElement.addEventListener('pointerleave', handleLeave);
    renderer.domElement.style.cursor = 'grab';

    const resize = () => {
      if (!container.clientWidth || !container.clientHeight) return;
      const nextPortrait = container.clientWidth / container.clientHeight < 0.95;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      if (nextPortrait !== portrait) {
        portrait = nextPortrait;
        focusPosition = null;
        focusTarget = null;
        if (portrait) {
          camera.position.set(wx(930) + 43, 43, wz(360) + 66);
          controls.target.set(wx(930), 8, wz(360));
        } else if (compact) {
          camera.position.set(56, 43, 76);
          controls.target.set(-2, 5, 2);
        } else {
          camera.position.set(74, 54, 100);
          controls.target.set(-2, 6.5, 2);
        }
        controls.update();
      }
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    const projected = new THREE.Vector3();
    const clock = new THREE.Clock();

    const renderLoop = () => {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;
      waterUniforms.uTime.value = elapsed;

      frames++;
      const nowMs = performance.now();
      if (nowMs - lastFpsTime > 900) {
        fps = Math.round((frames * 1000) / (nowMs - lastFpsTime));
        frames = 0;
        lastFpsTime = nowMs;
        onReadyRef.current?.(fps);
      }

      sensorGroup.children.forEach((child) => {
        if (!(child instanceof THREE.Sprite)) return;
        const phase = (child.userData.phase as number) ?? 0;
        const base = (child.userData.baseScale as number) ?? 2;
        const scale = base * (1 + Math.sin(elapsed * 1.7 + phase) * 0.15);
        child.scale.set(scale, scale, 1);
        (child.material as THREE.SpriteMaterial).opacity = 0.55 + Math.sin(elapsed * 1.7 + phase) * 0.2;
      });
      beaconGroup.children.forEach((child) => {
        if (!(child instanceof THREE.Sprite)) return;
        const phase = (child.userData.phase as number) ?? 0;
        const base = (child.userData.baseScale as number) ?? 2;
        const scale = base * (1 + Math.sin(elapsed * 1.2 + phase) * 0.08);
        child.scale.set(scale, scale, 1);
      });

      arcs.forEach((arc) => {
        const t = (elapsed * arc.speed + arc.offset) % 1;
        arc.particle.position.copy(arc.curve.getPointAt(t));
        (arc.particle.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(t * Math.PI) * 0.5;
      });

      cars.forEach((car) => {
        if (car.axis === 'x') {
          const p = ((elapsed * car.speed + car.offset) % 130 + 130) % 130;
          car.mesh.position.x = car.dir > 0 ? -66 + p : 66 - p;
          car.mesh.position.z = car.fixed;
          car.mesh.rotation.y = car.dir > 0 ? 0 : Math.PI;
        } else {
          car.mesh.position.z = -34 + ((elapsed * car.speed + car.offset) % 56);
          car.mesh.position.x = car.fixed;
          car.mesh.rotation.y = car.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
        }
      });

      train.position.copy(transitCurve.getPointAt((elapsed * 0.035) % 1));

      explodedValue += (explodedTarget - explodedValue) * Math.min(1, delta * 4);
      buildings.forEach((b) => {
        if (b.floors.length) {
          const spread = b.id === 'KT-01' ? explodedValue * 0.42 : 0;
          b.floors.forEach((f, i) => {
            const baseY = (f.userData.baseY as number) ?? 0;
            f.position.y = baseY + i * spread;
          });
          if (b.shell) b.shell.visible = explodedValue < 0.08;
          if (b.mullions) b.mullions.forEach((m) => { m.visible = explodedValue < 0.08; });
          if (b.crown) {
            const lift = b.id === 'KT-01' ? b.floors.length * 0.42 * explodedValue : 0;
            b.crown.forEach((part) => { part.position.y = (part.userData.baseY as number) + lift; });
          }
        }
      });

      if (selRing.visible) {
        selRing.rotation.z += delta * 0.45;
        const s = 1 + Math.sin(elapsed * 2.2) * 0.035;
        const rec = buildings.find((b) => b.id === selected);
        selRing.scale.setScalar(Math.max(0.7, Math.max(rec?.width ?? 7, rec?.depth ?? 7) * 0.62 / 5) * s);
        (selBeam.material as THREE.MeshBasicMaterial).opacity = 0.13 + Math.sin(elapsed * 2.2) * 0.06;
      }
      radar.rotation.z -= delta * 0.16;
      if (rain.visible) {
        const positions = rain.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < rainCount; i++) {
          let y = positions.getY(i) - delta * 18;
          let x = positions.getX(i) + delta * 2.4;
          if (y < 1.5) {
            y = 42 + Math.random() * 8;
            x = (Math.random() - 0.5) * 132;
          }
          if (x > 66) x = -66;
          positions.setX(i, x);
          positions.setY(i, y);
        }
        positions.needsUpdate = true;
        wind.position.x = Math.sin(elapsed * 0.18) * 2;
      }
      floodMat.opacity = 0.12 + Math.sin(elapsed * 1.4) * 0.03;
      (heatGlow.material as THREE.SpriteMaterial).opacity = 0.06 + Math.sin(elapsed * 0.7) * 0.02;
      holoRing.rotation.z += delta * 0.06;
      holoRing2.rotation.z -= delta * 0.035;

      if (focusTarget && focusPosition) {
        controls.target.lerp(focusTarget, Math.min(1, delta * 2.3));
        camera.position.lerp(focusPosition, Math.min(1, delta * 2.0));
        if (camera.position.distanceTo(focusPosition) < 0.5) {
          focusPosition = null;
          focusTarget = null;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      const width = container.clientWidth;
      const height = container.clientHeight;
      if (currentLayers.gis) {
        labelEls.forEach(({ el, pos }) => {
          projected.copy(pos).project(camera);
          const x = (projected.x * 0.5 + 0.5) * width;
          const y = (-projected.y * 0.5 + 0.5) * height;
          const visible = projected.z < 1 && x > -100 && x < width + 100 && y > -40 && y < height + 40;
          el.style.transform = `translate(-50%,-50%) translate(${x}px, ${y}px)`;
          el.style.opacity = visible ? '1' : '0';
        });
      }
      if (selected) {
        const rec = buildings.find((b) => b.id === selected);
        if (rec) {
          const labelLift = rec.id === 'KT-01' ? rec.floors.length * 0.42 * explodedValue : 0;
          projected.set(rec.group.position.x, rec.height + 3.2 + labelLift, rec.group.position.z).project(camera);
          const x = (projected.x * 0.5 + 0.5) * width;
          const y = (-projected.y * 0.5 + 0.5) * height;
          const visible = projected.z < 1 && x > -60 && x < width + 60 && y > 0 && y < height + 40;
          selLabel.style.transform = `translate(-50%,-100%) translate(${x}px, ${y}px)`;
          selLabel.style.opacity = visible ? '1' : '0';
        }
      }

      frame = requestAnimationFrame(renderLoop);
    };

    const api: SceneApi = {
      setSelected,
      setLayers: applyLayers,
      setMode: (value) => { applyMode(value); applyScenarioVisuals(currentScenario); },
      setAutoRotate: (value) => { controls.autoRotate = value; },
      setExploded: (value) => { explodedTarget = value ? 1 : 0; },
      setScenario: (value) => { applyScenarioVisuals(value); },
    };
    apiRef.current = api;

    applyMode(mode);
    applyScenarioVisuals(scenario);
    applyLayers(layers);
    controls.autoRotate = autoRotate;
    setSelected(selectedId, false);
    renderer.render(scene, camera);
    onReadyRef.current?.(60);
    frame = requestAnimationFrame(renderLoop);

    return () => {
      disposed = true;
      apiRef.current = null;
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener('pointermove', handleMove);
      renderer.domElement.removeEventListener('pointerdown', handleDown);
      renderer.domElement.removeEventListener('pointerup', handleUp);
      renderer.domElement.removeEventListener('pointerleave', handleLeave);
      controls.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Points || obj instanceof THREE.Sprite) {
          (obj as THREE.Mesh).geometry?.dispose?.();
          const mat = (obj as THREE.Mesh).material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat?.dispose?.();
        }
      });
      baseTextures.forEach((t) => t.dispose());
      glowTex.dispose();
      labelLayer.remove();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) container.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);
  useEffect(() => { apiRef.current?.setLayers(layers); }, [layers]);
  useEffect(() => { apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setAutoRotate(autoRotate); }, [autoRotate]);
  useEffect(() => { apiRef.current?.setExploded(exploded); }, [exploded]);
  useEffect(() => { apiRef.current?.setScenario(scenario); }, [scenario]);

  return (
    <div className="twin-canvas" ref={containerRef} role="region" aria-label="Interactive 3D digital twin of the Kai Tak Innovation Mile. Drag to orbit, scroll to zoom, and select a building to inspect its asset record.">
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
          <div className="eyebrow text-[var(--amber)]">Renderer unavailable</div>
          <div className="text-[12px] text-[var(--muted)]">{error} The 2D geospatial view remains fully available.</div>
        </div>
      )}
    </div>
  );
}
