import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export interface StageContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  container: HTMLDivElement;
  labelLayer: HTMLDivElement;
  addUpdate: (fn: (dt: number, elapsed: number) => void) => void;
  addDispose: (fn: () => void) => void;
  setCamera: (position: THREE.Vector3 | [number, number, number], target: THREE.Vector3 | [number, number, number], immediate?: boolean) => void;
}

interface ThreeStageProps {
  build: (ctx: StageContext) => void;
  cameraPosition: [number, number, number];
  target?: [number, number, number];
  fov?: number;
  background?: number;
  fog?: { color: number; density: number };
  exposure?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  className?: string;
  ariaLabel: string;
}

function makeSurfaceAlbedo(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d')!;
  const image = context.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const broad = Math.sin(x * 0.035) * Math.cos(y * 0.041) * 7;
      const grain = (Math.random() - 0.5) * 10;
      const v = Math.max(214, Math.min(255, 242 + broad + grain));
      image.data[i] = v;
      image.data[i + 1] = v;
      image.data[i + 2] = v;
      image.data[i + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function ThreeStage({
  build,
  cameraPosition,
  target = [0, 0, 0],
  fov = 40,
  background = 0x03080a,
  fog,
  exposure = 1.1,
  autoRotate = true,
  autoRotateSpeed = 0.24,
  className = '',
  ariaLabel,
}: ThreeStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buildRef = useRef(build);
  const autoRotateRef = useRef(autoRotate);
  const controlsRef = useRef<OrbitControls | null>(null);
  buildRef.current = build;
  autoRotateRef.current = autoRotate;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    } catch {
      container.innerHTML = '<div class="absolute inset-0 grid place-items-center text-[11px] text-[var(--muted)]">WebGL is unavailable in this browser.</div>';
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const gl = renderer.getContext();
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const gpuName = debugInfo ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)) : '';
    const softwareRenderer = /swiftshader|llvmpipe|softpipe/i.test(gpuName);
    const shadowsEnabled = !softwareRenderer;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = exposure * 0.94;

    renderer.shadowMap.enabled = shadowsEnabled;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(background);
    scene.fog = fog ? new THREE.FogExp2(fog.color, fog.density) : null;

    // Image-based lighting gives metals, glass and concrete believable reflections.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new RoomEnvironment();
    const envTexture = pmrem.fromScene(envScene, 0.04).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 0.18;
    pmrem.dispose();
    const surfaceAlbedo = makeSurfaceAlbedo();

    // One soft key light with real shadows adds depth to every scene.
    const sun = new THREE.DirectionalLight(0xfff2df, softwareRenderer ? 0.38 : 0.5);
    sun.position.set(-26, 40, 22);
    sun.castShadow = shadowsEnabled;
    sun.shadow.mapSize.set(softwareRenderer ? 1024 : 2048, softwareRenderer ? 1024 : 2048);
    sun.shadow.camera.left = -70;
    sun.shadow.camera.right = 70;
    sun.shadow.camera.top = 70;
    sun.shadow.camera.bottom = -70;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 180;
    sun.shadow.bias = -0.00035;
    sun.shadow.normalBias = 0.035;
    sun.shadow.radius = 3;
    sun.target.position.set(0, 0, 0);
    scene.add(sun);
    scene.add(sun.target);

    const camera = new THREE.PerspectiveCamera(fov, container.clientWidth / Math.max(1, container.clientHeight), 0.1, 900);
    camera.position.set(...cameraPosition);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...target);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 14;
    controls.maxDistance = 190;
    controls.maxPolarAngle = Math.PI / 2.04;
    controls.enablePan = false;
    controls.autoRotate = autoRotateRef.current;
    controls.autoRotateSpeed = autoRotateSpeed;
    controls.update();
    controlsRef.current = controls;

    const labelLayer = document.createElement('div');
    labelLayer.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;';
    container.appendChild(labelLayer);

    const updaters: Array<(dt: number, elapsed: number) => void> = [];
    const disposers: Array<() => void> = [];
    const desiredPosition = new THREE.Vector3();
    const desiredTarget = new THREE.Vector3();
    let hasDesired = false;

    const setCamera = (
      position: THREE.Vector3 | [number, number, number],
      nextTarget: THREE.Vector3 | [number, number, number],
      immediate = false,
    ) => {
      const p = Array.isArray(position) ? new THREE.Vector3(...position) : position.clone();
      const t = Array.isArray(nextTarget) ? new THREE.Vector3(...nextTarget) : nextTarget.clone();
      if (immediate) {
        camera.position.copy(p);
        controls.target.copy(t);
        controls.update();
        hasDesired = false;
      } else {
        desiredPosition.copy(p);
        desiredTarget.copy(t);
        hasDesired = true;
      }
    };

    const ctx: StageContext = {
      scene,
      camera,
      renderer,
      controls,
      container,
      labelLayer,
      addUpdate: (fn) => updaters.push(fn),
      addDispose: (fn) => disposers.push(fn),
      setCamera,
    };

    buildRef.current(ctx);

    // Respect each scene's materials, but let solid geometry cast and receive soft shadows.
    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      const opaque = materials.some((m) => m && !(m as THREE.MeshStandardMaterial).transparent && (m as THREE.MeshStandardMaterial).opacity >= 0.85);
      object.receiveShadow = true;
      const basic = materials.every((m) => (m as THREE.MeshBasicMaterial).isMeshBasicMaterial);
      if (opaque && !basic) object.castShadow = true;
      materials.forEach((m) => {
        const standard = m as THREE.MeshStandardMaterial;
        if (!standard?.isMeshStandardMaterial) return;
        standard.envMapIntensity = Math.min(1, 0.08 + Math.max(0, standard.metalness) * 1.35);
        if (!standard.transparent && standard.metalness < 0.55 && !standard.map) {
          standard.map = surfaceAlbedo;
          standard.needsUpdate = true;
        }
      });
    });

    const resize = () => {
      if (!container.clientWidth || !container.clientHeight) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    const clock = new THREE.Clock();
    let frame = 0;
    let disposed = false;

    const loop = () => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;
      if (hasDesired) {
        controls.target.lerp(desiredTarget, Math.min(1, dt * 2.4));
        camera.position.lerp(desiredPosition, Math.min(1, dt * 2.1));
        if (camera.position.distanceTo(desiredPosition) < 0.25) hasDesired = false;
      }
      updaters.forEach((fn) => fn(dt, elapsed));
      controls.update();
      renderer.render(scene, camera);
      frame = requestAnimationFrame(loop);
    };

    renderer.render(scene, camera);
    frame = requestAnimationFrame(loop);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      disposers.forEach((fn) => fn());
      controls.dispose();
      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.Line ||
          object instanceof THREE.LineSegments ||
          object instanceof THREE.Points ||
          object instanceof THREE.Sprite
        ) {
          (object as THREE.Mesh).geometry?.dispose?.();
          const material = (object as THREE.Mesh).material;
          if (Array.isArray(material)) material.forEach((m) => m.dispose());
          else material?.dispose?.();
        }
      });
      controlsRef.current = null;
      labelLayer.remove();
      envTexture.dispose();
      surfaceAlbedo.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) container.removeChild(renderer.domElement);
    };
    // The stage is created once; scene-specific updates are applied through each scene's API.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (controlsRef.current) controlsRef.current.autoRotate = autoRotate;
  }, [autoRotate]);

  return (
    <div
      className={`twin-canvas ${className}`}
      ref={containerRef}
      role="region"
      aria-label={ariaLabel}
    />
  );
}
