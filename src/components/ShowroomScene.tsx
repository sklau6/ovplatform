import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createVehicle, type VehicleKind } from '../lib/vehicleModels';

export type ShowroomView = 'exterior' | 'profile' | 'rear' | 'interior' | 'wheels';

interface Props {
  kind: VehicleKind;
  paint: number;
  wheelColor: number;
  view: ShowroomView;
  autoRotate: boolean;
}

const VIEWS: Record<ShowroomView, { position: [number, number, number]; target: [number, number, number] }> = {
  exterior: { position: [7.2, 2.7, 8.2], target: [0, 0.9, 0] },
  profile: { position: [10.5, 1.55, 0.2], target: [0, 0.85, 0] },
  rear: { position: [-6.4, 2.4, -7.4], target: [0, 0.9, 0] },
  interior: { position: [0, 1.12, 0.15], target: [0, 1.0, 2.4] },
  wheels: { position: [5.2, 0.65, 5.4], target: [0, 0.42, 0] },
};

export function ShowroomScene({ kind, paint, wheelColor, view, autoRotate }: Props) {
  const apiRef = useRef<{ setVehicle: (k: VehicleKind, p: number, w: number) => void } | null>(null);
  const cameraRef = useRef<{ setCamera: (p: [number, number, number], t: [number, number, number]) => void } | null>(null);
  const initialView = VIEWS[view];

  useEffect(() => {
    apiRef.current?.setVehicle(kind, paint, wheelColor);
  }, [kind, paint, wheelColor]);

  useEffect(() => {
    const v = VIEWS[view];
    cameraRef.current?.setCamera(v.position, v.target);
  }, [view]);

  return (
    <ThreeStage
      ariaLabel="3D vehicle showroom with configurable sedan, SUV, van, bus or truck, studio lighting and realistic materials."
      cameraPosition={initialView.position}
      target={initialView.target}
      fov={34}
      background={0x050708}
      fog={{ color: 0x050708, density: 0.025 }}
      exposure={1.12}
      autoRotate={autoRotate}
      autoRotateSpeed={0.4}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.fog = null;
        scene.add(new THREE.HemisphereLight(0xcfe8ff, 0x080a0b, 0.55));

        const key = new THREE.SpotLight(0xfff4e6, 900, 30, 0.55, 0.6, 1.4);
        key.position.set(-5.5, 8.5, 5.5);
        key.target.position.set(0, 0.8, 0);
        scene.add(key);
        scene.add(key.target);
        const fill = new THREE.SpotLight(0xdbeeff, 520, 30, 0.7, 0.7, 1.5);
        fill.position.set(6.5, 6.2, 5.2);
        fill.target.position.set(0, 0.7, 0);
        scene.add(fill);
        scene.add(fill.target);
        const rim = new THREE.SpotLight(0x9fd8ff, 700, 28, 0.55, 0.6, 1.4);
        rim.position.set(0, 5.5, -8);
        rim.target.position.set(0, 1, 0);
        scene.add(rim);
        scene.add(rim.target);

        // Reflective studio floor and turntable.
        const floor = new THREE.Mesh(
          new THREE.CircleGeometry(13, 96),
          new THREE.MeshPhysicalMaterial({ color: 0x07090a, metalness: 0.55, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.1 }),
        );
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);
        const plinth = new THREE.Mesh(
          new THREE.CylinderGeometry(4.6, 4.9, 0.12, 96),
          new THREE.MeshPhysicalMaterial({ color: 0x0d1112, metalness: 0.7, roughness: 0.2, clearcoat: 1 }),
        );
        plinth.position.y = 0.06;
        plinth.receiveShadow = true;
        scene.add(plinth);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(4.75, 0.025, 6, 120), new THREE.MeshBasicMaterial({ color: 0x9fe8d5, transparent: true, opacity: 0.4 }));
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.13;
        scene.add(ring);

        // Backdrop.
        const backdrop = new THREE.Mesh(
          new THREE.CylinderGeometry(14, 14, 12, 64, 1, true),
          new THREE.MeshStandardMaterial({ color: 0x0a0e10, roughness: 0.9, side: THREE.BackSide }),
        );
        backdrop.position.y = 4;
        scene.add(backdrop);

        let realTemplate: THREE.Group | null = null;
        let currentKind = kind;
        let currentPaint = paint;
        let currentWheel = wheelColor;
        let car: THREE.Group | null = null;
        const carRoot = new THREE.Group();
        carRoot.position.y = 0.13;
        scene.add(carRoot);

        const disposeCar = () => {
          if (!car) return;
          if (realTemplate && car !== realTemplate) {
            carRoot.remove(car);
            car = null;
            return;
          }
          car.traverse((o) => {
            if (o instanceof THREE.Mesh) {
              o.geometry.dispose();
              const m = o.material;
              if (Array.isArray(m)) m.forEach((x) => x.dispose());
              else m.dispose();
            }
          });
          carRoot.remove(car);
          car = null;
        };

        const paintRealCar = (model: THREE.Group) => {
          model.traverse((o) => {
            if (!(o instanceof THREE.Mesh)) return;
            o.castShadow = true;
            o.receiveShadow = true;
            const mats = Array.isArray(o.material) ? o.material : [o.material];
            const next = mats.map((m) => {
              const name = m.name || '';
              if (/^Paint/.test(name)) {
                const paintMat = m.clone() as THREE.MeshPhysicalMaterial;
                paintMat.color.setHex(currentPaint);
                paintMat.metalness = 0.65;
                paintMat.roughness = 0.22;
                paintMat.clearcoat = 1;
                paintMat.clearcoatRoughness = 0.06;
                paintMat.envMapIntensity = 1.2;
                return paintMat;
              }
              if (/^Rim/.test(name)) {
                const rimMat = m.clone() as THREE.MeshStandardMaterial;
                rimMat.color.setHex(currentWheel);
                rimMat.metalness = 0.95;
                rimMat.roughness = 0.2;
                return rimMat;
              }
              return m;
            });
            o.material = Array.isArray(o.material) ? next : next[0];
          });
        };

        const buildCar = () => {
          disposeCar();
          if (currentKind === 'sedan' && realTemplate) {
            car = realTemplate.clone(true);
            paintRealCar(car);
            car.rotation.y = 0;
          } else {
            car = createVehicle(currentKind, currentPaint, { wheelColor: currentWheel });
            car.rotation.y = -0.35;
          }
          carRoot.add(car);
        };
        buildCar();

        new GLTFLoader().load('/models/CarConcept.glb', (gltf) => {
          const model = gltf.scene;
          const raw = new THREE.Box3().setFromObject(model);
          const rawSize = raw.getSize(new THREE.Vector3());
          const longest = Math.max(rawSize.x, rawSize.z);
          const scale = 4.7 / Math.max(0.01, longest);
          model.scale.setScalar(scale);
          if (rawSize.x > rawSize.z) model.rotation.y = Math.PI / 2;
          model.updateMatrixWorld(true);
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          model.position.x -= center.x;
          model.position.z -= center.z;
          model.position.y -= box.min.y;
          realTemplate = model;
          if (currentKind === 'sedan') buildCar();
        });

        apiRef.current = {
          setVehicle: (k, p, w) => {
            if (k === currentKind && p === currentPaint && w === currentWheel) return;
            currentKind = k;
            currentPaint = p;
            currentWheel = w;
            buildCar();
          },
        };
        cameraRef.current = { setCamera: (p, t) => ctx.setCamera(p, t) };

        ctx.addUpdate((dt) => {
          if (car) car.rotation.y += dt * 0.08;
        });
      }}
    />
  );
}
