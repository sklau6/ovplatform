import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

let templatePromise: Promise<THREE.Group> | null = null;

export function loadRealCarTemplate(): Promise<THREE.Group> {
  if (templatePromise) return templatePromise;
  templatePromise = new GLTFLoader().loadAsync('/models/CarConcept.glb').then((gltf) => {
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
    const buckets = new Map<THREE.Material, THREE.BufferGeometry[]>();
    model.updateMatrixWorld(true);
    model.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return;
      const material = Array.isArray(o.material) ? o.material[0] : o.material;
      if (!material) return;
      let geometry = o.geometry.clone();
      geometry.applyMatrix4(o.matrixWorld);
      geometry = geometry.toNonIndexed();
      for (const attribute of Object.keys(geometry.attributes)) {
        if (!['position', 'normal', 'uv'].includes(attribute)) geometry.deleteAttribute(attribute);
      }
      const list = buckets.get(material) ?? [];
      list.push(geometry);
      buckets.set(material, list);
    });
    const merged = new THREE.Group();
    buckets.forEach((geometries, material) => {
      const geometry = geometries.length === 1 ? geometries[0] : mergeGeometries(geometries, false);
      if (!geometry) return;
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      merged.add(mesh);
    });
    return merged;
  });
  return templatePromise;
}

export function cloneRealCar(template: THREE.Group, paint: number, wheel = 0xaeb8b6): THREE.Group {
  const car = template.clone(true);
  let paintMaterial: THREE.MeshPhysicalMaterial | null = null;
  car.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    const next = mats.map((m) => {
      const name = m.name || '';
      if (/^Paint/.test(name)) {
        const mat = m.clone() as THREE.MeshPhysicalMaterial;
        mat.color.setHex(paint);
        mat.metalness = 0.65;
        mat.roughness = 0.22;
        mat.clearcoat = 1;
        mat.clearcoatRoughness = 0.06;
        mat.envMapIntensity = 1.2;
        return mat;
      }
      if (/^Rim/.test(name)) {
        const mat = m.clone() as THREE.MeshStandardMaterial;
        mat.color.setHex(wheel);
        mat.metalness = 0.95;
        mat.roughness = 0.2;
        return mat;
      }
      return m;
    });
    o.material = Array.isArray(o.material) ? next : next[0];
  });
  car.userData.paintMaterial = paintMaterial;
  return car;
}
