import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export type VehicleKind = 'sedan' | 'suv' | 'van' | 'bus' | 'truck';

interface VehicleSpec {
  length: number;
  width: number;
  height: number;
  wheelRadius: number;
  wheelbase: number;
}

const SPECS: Record<VehicleKind, VehicleSpec> = {
  sedan: { length: 4.5, width: 1.82, height: 1.42, wheelRadius: 0.33, wheelbase: 2.7 },
  suv: { length: 4.75, width: 1.92, height: 1.68, wheelRadius: 0.38, wheelbase: 2.85 },
  van: { length: 5.1, width: 1.98, height: 1.95, wheelRadius: 0.37, wheelbase: 3.15 },
  bus: { length: 10.8, width: 2.5, height: 3.15, wheelRadius: 0.48, wheelbase: 6.2 },
  truck: { length: 7.4, width: 2.3, height: 2.9, wheelRadius: 0.45, wheelbase: 4.2 },
};

function carProfile(kind: VehicleKind): Array<[number, number]> {
  const L = SPECS[kind].length;
  const h = SPECS[kind].height;
  if (kind === 'sedan') {
    return [
      [-0.5, 0.22], [-0.5, 0.38], [-0.47, 0.5], [-0.39, 0.58], [-0.29, 0.6],
      [-0.22, 0.86], [-0.08, 1.02], [0.09, 1.02], [0.24, 0.84], [0.37, 0.7],
      [0.46, 0.64], [0.5, 0.5], [0.5, 0.36], [0.45, 0.22], [0.36, 0.15], [-0.36, 0.15],
    ].map(([x, y]) => [x * L, y * h * 0.92]);
  }
  if (kind === 'suv') {
    return [
      [-0.5, 0.22], [-0.5, 0.45], [-0.46, 0.58], [-0.36, 0.65], [-0.26, 0.68],
      [-0.2, 0.92], [-0.05, 1.03], [0.12, 1.02], [0.26, 0.86], [0.38, 0.74],
      [0.47, 0.68], [0.5, 0.52], [0.5, 0.36], [0.44, 0.22], [0.35, 0.15], [-0.36, 0.15],
    ].map(([x, y]) => [x * L, y * h * 0.92]);
  }
  return [
    [-0.5, 0.22], [-0.5, 0.8], [-0.46, 0.92], [-0.3, 0.97], [-0.2, 1.0],
    [-0.12, 1.02], [0.22, 1.02], [0.34, 0.96], [0.43, 0.9], [0.5, 0.8],
    [0.5, 0.34], [0.45, 0.22], [0.34, 0.15], [-0.36, 0.15],
  ].map(([x, y]) => [x * L, y * h * 0.92]);
}

function addWheel(group: THREE.Group, x: number, z: number, radius: number, tire: THREE.Material, rim: THREE.Material, trim: THREE.Material) {
  const wheel = new THREE.Group();
  const rubber = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.26, 24), tire);
  rubber.rotation.z = Math.PI / 2;
  rubber.castShadow = true;
  wheel.add(rubber);
  const alloy = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.64, radius * 0.64, 0.28, 20), rim);
  alloy.rotation.z = Math.PI / 2;
  wheel.add(alloy);
  for (let i = 0; i < 5; i++) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.045, radius * 1.15), rim);
    spoke.rotation.x = (i / 5) * Math.PI;
    wheel.add(spoke);
  }
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.46, radius * 0.46, 0.035, 20), new THREE.MeshStandardMaterial({ color: 0x7d8588, metalness: 0.9, roughness: 0.35 }));
  disc.rotation.z = Math.PI / 2;
  disc.position.x = 0.02;
  wheel.add(disc);
  const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.18, 0.12), new THREE.MeshStandardMaterial({ color: 0xb3262e, metalness: 0.4, roughness: 0.35 }));
  caliper.position.set(0.08, radius * 0.25, 0);
  wheel.add(caliper);
  const arch = new THREE.Mesh(new THREE.TorusGeometry(radius * 1.16, 0.045, 6, 18, Math.PI), trim);
  arch.rotation.y = Math.PI / 2;
  arch.rotation.z = Math.PI;
  arch.position.set(x > 0 ? 0.13 : -0.13, 0, 0);
  wheel.add(arch);
  wheel.position.set(x, radius, z);
  group.add(wheel);
}

function addCarLights(group: THREE.Group, spec: VehicleSpec, headlight: THREE.Material, taillight: THREE.Material, trim: THREE.Material) {
  const front = spec.length / 2;
  const rear = -spec.length / 2;
  for (const x of [-0.56, 0.56]) {
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.16, 0.07), headlight);
    h.position.set(x, 0.58, front + 0.01);
    group.add(h);
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.07), taillight);
    t.position.set(x, 0.62, rear - 0.01);
    group.add(t);
  }
  const grille = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.2, 0.06), trim);
  grille.position.set(0, 0.44, front + 0.02);
  group.add(grille);
  const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(spec.width * 0.9, 0.2, 0.3), trim);
  frontBumper.position.set(0, 0.3, front - 0.06);
  group.add(frontBumper);
  const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(spec.width * 0.9, 0.2, 0.3), trim);
  rearBumper.position.set(0, 0.3, rear + 0.06);
  group.add(rearBumper);
  for (const x of [-spec.width / 2 - 0.08, spec.width / 2 + 0.08]) {
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.3), trim);
    mirror.position.set(x, 0.92, front - 0.8);
    group.add(mirror);
  }
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.14, 0.03), new THREE.MeshStandardMaterial({ color: 0xdfe7e2, roughness: 0.5 }));
  plate.position.set(0, 0.34, front + 0.08);
  group.add(plate);
}

export function createVehicle(kind: VehicleKind = 'sedan', color = 0xcfd8da, options: { wheelColor?: number } = {}): THREE.Group {
  const spec = SPECS[kind];
  const group = new THREE.Group();
  group.name = `vehicle-${kind}`;

  const paint = new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.6,
    roughness: 0.26,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.2,
  });
  group.userData.paintMaterial = paint;
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x0a1620,
    metalness: 0.15,
    roughness: 0.04,
    transparent: true,
    opacity: 0.82,
    side: THREE.DoubleSide,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
  });
  const trim = new THREE.MeshStandardMaterial({ color: 0x10151a, metalness: 0.55, roughness: 0.4 });
  const tire = new THREE.MeshStandardMaterial({ color: 0x090b0d, roughness: 0.92, metalness: 0.02 });
  const rim = new THREE.MeshStandardMaterial({ color: options.wheelColor ?? 0xaeb8b6, metalness: 0.92, roughness: 0.22 });
  const headlight = new THREE.MeshStandardMaterial({ color: 0xfff3d6, emissive: 0xffe9bf, emissiveIntensity: 1.8, roughness: 0.15 });
  const taillight = new THREE.MeshStandardMaterial({ color: 0x8a151d, emissive: 0xff2b36, emissiveIntensity: 1.3, roughness: 0.25 });

  if (kind === 'bus' || kind === 'truck') {
    const bodyLength = kind === 'bus' ? spec.length : spec.length - 2.2;
    const body = new THREE.Mesh(new RoundedBoxGeometry(spec.width, kind === 'bus' ? 2.55 : 1.55, bodyLength, 4, 0.16), paint);
    body.position.set(0, kind === 'bus' ? 1.6 : 1.15, kind === 'bus' ? 0 : -0.9);
    group.add(body);

    if (kind === 'bus') {
      const band = new THREE.Mesh(new RoundedBoxGeometry(spec.width + 0.01, 0.85, spec.length * 0.82, 3, 0.08), glass);
      band.position.set(0, 2.1, -0.2);
      group.add(band);
      const dest = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.3, 0.05), headlight);
      dest.position.set(0, 2.75, -spec.length / 2 - 0.01);
      group.add(dest);
      for (const z of [-spec.length * 0.32, -spec.length * 0.1, spec.length * 0.1, spec.length * 0.32]) {
        for (const x of [-spec.width / 2 - 0.01, spec.width / 2 + 0.01]) {
          const side = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.8, spec.length * 0.13), glass);
          side.position.set(x, 2.1, z);
          group.add(side);
        }
      }
      for (const z of [-spec.length * 0.34, spec.length * 0.2]) {
        addWheel(group, -spec.width / 2 + 0.1, z, spec.wheelRadius, tire, rim, trim);
        addWheel(group, spec.width / 2 - 0.1, z, spec.wheelRadius, tire, rim, trim);
      }
    } else {
      const cargo = new THREE.Mesh(new RoundedBoxGeometry(spec.width + 0.05, 2.5, spec.length - 2.4, 3, 0.08), new THREE.MeshStandardMaterial({ color: 0xd7ded9, metalness: 0.25, roughness: 0.55 }));
      cargo.position.set(0, 1.8, -1.2);
      group.add(cargo);
      for (const z of [-spec.length * 0.32, -spec.length * 0.05, spec.length * 0.3]) {
        addWheel(group, -spec.width / 2 + 0.05, z, spec.wheelRadius, tire, rim, trim);
        addWheel(group, spec.width / 2 - 0.05, z, spec.wheelRadius, tire, rim, trim);
      }
    }

    for (const x of [-0.65, 0.65]) {
      const h = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.2, 0.08), headlight);
      h.position.set(x, kind === 'bus' ? 0.9 : 0.75, -spec.length / 2 + (kind === 'bus' ? 0.01 : 1.2));
      group.add(h);
      const t = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.08), taillight);
      t.position.set(x, kind === 'bus' ? 1.0 : 0.8, spec.length / 2 - 0.05);
      group.add(t);
    }
    return group;
  }

  const profile = carProfile(kind);
  const shape = new THREE.Shape();
  shape.splineThru(profile.map(([x, y]) => new THREE.Vector2(x, y)));
  shape.closePath();
  const bodyGeometry = new THREE.ExtrudeGeometry(shape, {
    depth: spec.width,
    bevelEnabled: true,
    bevelSize: 0.045,
    bevelThickness: 0.045,
    bevelSegments: 3,
    curveSegments: 4,
    steps: 1,
  });
  bodyGeometry.translate(0, 0, -spec.width / 2);
  bodyGeometry.rotateY(-Math.PI / 2);
  const body = new THREE.Mesh(bodyGeometry, paint);
  body.position.y = 0.18;
  group.add(body);

  const beltLine = new THREE.Mesh(new THREE.BoxGeometry(spec.width + 0.12, 0.035, spec.length * 0.64), trim);
  beltLine.position.set(0, 0.78, 0.05);
  group.add(beltLine);

  const glassShape = new THREE.Shape();
  glassShape.moveTo(-spec.length * 0.235, 0.9);
  glassShape.lineTo(-spec.length * 0.11, 1.3);
  glassShape.lineTo(spec.length * 0.13, 1.3);
  glassShape.lineTo(spec.length * 0.235, 0.92);
  glassShape.closePath();
  const glassGeometry = new THREE.ShapeGeometry(glassShape);
  glassGeometry.rotateY(Math.PI / 2);
  for (const x of [-spec.width / 2 - 0.058, spec.width / 2 + 0.058]) {
    const side = new THREE.Mesh(glassGeometry, glass);
    side.position.set(x, 0, 0.02);
    group.add(side);
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.42, 0.06), trim);
    pillar.position.set(x, 1.1, 0.02);
    group.add(pillar);
  }

  const windshield = new THREE.Mesh(new THREE.BoxGeometry(spec.width * 0.84, 0.46, 0.035), glass);
  windshield.position.set(0, 1.04, spec.length * 0.21);
  windshield.rotation.x = -0.56;
  group.add(windshield);
  const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(spec.width * 0.8, 0.4, 0.035), glass);
  rearGlass.position.set(0, 1.02, -spec.length * 0.24);
  rearGlass.rotation.x = 0.52;
  group.add(rearGlass);

  const hoodLine = new THREE.Mesh(new THREE.BoxGeometry(spec.width * 0.86, 0.02, 0.55), trim);
  hoodLine.position.set(0, 0.82, spec.length * 0.3);
  group.add(hoodLine);

  for (const z of [-spec.wheelbase / 2, spec.wheelbase / 2]) {
    addWheel(group, -spec.width / 2 - 0.015, z, spec.wheelRadius, tire, rim, trim);
    addWheel(group, spec.width / 2 + 0.015, z, spec.wheelRadius, tire, rim, trim);
  }

  addCarLights(group, spec, headlight, taillight, trim);

  // Door seams, handles, skirts, splitter and diffuser.
  for (const x of [-spec.width / 2 - 0.062, spec.width / 2 + 0.062]) {
    for (const z of [-spec.length * 0.06, -spec.length * 0.24]) {
      const seam = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.52, 0.012), trim);
      seam.position.set(x, 0.86, z);
      group.add(seam);
    }
    for (const z of [spec.length * 0.1, -spec.length * 0.17]) {
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.035, 0.22), rim);
      handle.position.set(x + (x > 0 ? 0.012 : -0.012), 0.85, z);
      group.add(handle);
    }
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, spec.length * 0.48), trim);
    skirt.position.set(x, 0.34, 0);
    group.add(skirt);
  }
  const splitter = new THREE.Mesh(new THREE.BoxGeometry(spec.width * 0.86, 0.05, 0.42), trim);
  splitter.position.set(0, 0.2, spec.length / 2 - 0.12);
  group.add(splitter);
  const diffuser = new THREE.Mesh(new THREE.BoxGeometry(spec.width * 0.76, 0.07, 0.3), trim);
  diffuser.position.set(0, 0.2, -spec.length / 2 + 0.08);
  group.add(diffuser);
  const spoiler = new THREE.Mesh(new THREE.BoxGeometry(spec.width * 0.58, 0.04, 0.22), paint);
  spoiler.position.set(0, kind === 'van' ? 1.55 : 1.0, -spec.length / 2 + 0.08);
  group.add(spoiler);
  const wiper = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.012, 0.03), trim);
  wiper.position.set(-0.15, 0.86, spec.length * 0.24);
  wiper.rotation.z = -0.18;
  group.add(wiper);
  const port = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.02), trim);
  port.position.set(-spec.width / 2 - 0.065, 0.78, -spec.length * 0.29);
  group.add(port);
  for (const x of [-0.36, 0.36]) {
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.14, 10), rim);
    exhaust.rotation.x = Math.PI / 2;
    exhaust.position.set(x, 0.24, -spec.length / 2 - 0.03);
    group.add(exhaust);
  }

  // Interior visible through the glass.
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(spec.width * 0.78, 0.45, spec.length * 0.34), new THREE.MeshStandardMaterial({ color: 0x171b1d, roughness: 0.8 }));
  cabin.position.set(0, 0.55, 0);
  group.add(cabin);
  for (const x of [-0.4, 0.4]) {
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.14, 0.48), new THREE.MeshStandardMaterial({ color: 0x2a2e30, roughness: 0.9 }));
    seat.position.set(x, 0.82, 0.05);
    group.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.46, 0.12), new THREE.MeshStandardMaterial({ color: 0x24282a, roughness: 0.9 }));
    back.position.set(x, 0.98, -0.16);
    back.rotation.x = -0.14;
    group.add(back);
  }
  const dash = new THREE.Mesh(new THREE.BoxGeometry(spec.width * 0.76, 0.16, 0.3), new THREE.MeshStandardMaterial({ color: 0x1a1e20, roughness: 0.75 }));
  dash.position.set(0, 1.0, 0.78);
  group.add(dash);
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.028, 8, 24), new THREE.MeshStandardMaterial({ color: 0x111416, roughness: 0.8 }));
  wheel.position.set(-0.4, 0.96, 0.53);
  wheel.rotation.x = 0.35;
  group.add(wheel);

  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.24, 5), trim);
  antenna.position.set(0, 1.38, -spec.length * 0.12);
  group.add(antenna);

  return group;
}
