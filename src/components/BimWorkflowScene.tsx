import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { BIM_TOOLS, WORKFLOW_STEPS, type BimTool } from '../lib/bimWorkflowData';

interface Props {
  selected: string | null;
  stage: string;
  autoRotate: boolean;
  onSelect: (id: string | null) => void;
}

interface Api {
  setSelected: (id: string | null) => void;
  setStage: (stage: string) => void;
}

function labelSprite(title: string, sub: string, color: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 512, 128);
  ctx.fillStyle = 'rgba(4,12,15,.82)';
  ctx.strokeStyle = 'rgba(150,220,210,.22)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(2, 18, 508, 92, 14);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(30, 64, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e9f8f3';
  ctx.font = 'bold 27px Arial';
  ctx.fillText(title, 48, 58);
  ctx.fillStyle = '#8fb7b0';
  ctx.font = '20px Arial';
  ctx.fillText(sub, 48, 90);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
  sprite.scale.set(3.6, 0.9, 1);
  return sprite;
}

export function BimWorkflowScene({ selected, stage, autoRotate, onSelect }: Props) {
  const apiRef = useRef<Api | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => { apiRef.current?.setSelected(selected); }, [selected]);
  useEffect(() => { apiRef.current?.setStage(stage); }, [stage]);

  return (
    <ThreeStage
      ariaLabel="3D BIM tool and workflow graph: ten authoring, CDE, review and issue-management tools connected to a federated building model, with Proptech.AI site access."
      cameraPosition={[17, 13, 23]}
      target={[0, 3.2, 0]}
      fov={40}
      background={0x04090c}
      fog={{ color: 0x04090c, density: 0.018 }}
      exposure={1.1}
      autoRotate={autoRotate}
      autoRotateSpeed={0.28}
      build={(ctx) => {
        const scene = ctx.scene;
        scene.fog = new THREE.Fog(0x04090c, 24, 55);
        scene.add(new THREE.HemisphereLight(0xa6d5e8, 0x080b0c, 0.9));

        const key = new THREE.DirectionalLight(0xe9f4ff, 2.2);
        key.position.set(-10, 18, 8);
        scene.add(key);
        const rim = new THREE.PointLight(0x53f0be, 90, 30, 2);
        rim.position.set(0, 4, -8);
        scene.add(rim);

        // Grid floor.
        const grid = new THREE.GridHelper(36, 36, 0x1b4a45, 0x102a2b);
        (grid.material as THREE.Material).transparent = true;
        (grid.material as THREE.Material).opacity = 0.35;
        scene.add(grid);
        const plinth = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.8, 0.2, 64), new THREE.MeshPhysicalMaterial({ color: 0x0a1214, metalness: 0.7, roughness: 0.2, clearcoat: 1 }));
        plinth.position.y = 0.1;
        plinth.receiveShadow = true;
        scene.add(plinth);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(4.55, 0.025, 8, 96), new THREE.MeshBasicMaterial({ color: 0x53f0be, transparent: true, opacity: 0.45 }));
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.22;
        scene.add(ring);

        // Federated building: podium + tower floors + core.
        const building = new THREE.Group();
        const concrete = new THREE.MeshStandardMaterial({ color: 0x8fa3a1, roughness: 0.75, metalness: 0.08 });
        const glass = new THREE.MeshPhysicalMaterial({ color: 0x2d6674, roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.6, clearcoat: 1 });
        const coreMat = new THREE.MeshStandardMaterial({ color: 0x4d5e5e, roughness: 0.8 });
        const accent = new THREE.MeshStandardMaterial({ color: 0x53f0be, emissive: 0x1a7a5e, emissiveIntensity: 0.7, metalness: 0.4, roughness: 0.3 });
        for (let l = 0; l < 3; l++) {
          const slab = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.2, 4.4), concrete);
          slab.position.y = 0.3 + l * 1.1;
          building.add(slab);
        }
        for (let l = 0; l < 7; l++) {
          const slab = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.18, 3.0), l < 5 ? glass : concrete);
          slab.position.y = 3.6 + l * 0.85;
          building.add(slab);
        }
        const core = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.4, 1.4), coreMat);
        core.position.set(0, 1.9, -0.4);
        building.add(core);
        const coreTall = new THREE.Mesh(new THREE.BoxGeometry(1.0, 6.2, 1.2), concrete);
        coreTall.position.set(0, 5.8, -0.3);
        building.add(coreTall);
        const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), accent);
        beacon.position.set(0, 9.2, 0);
        building.add(beacon);
        scene.add(building);

        const nodeMeshes: THREE.Mesh[] = [];
        const nodeData: Array<{ mesh: THREE.Mesh; tool: BimTool; sprite: THREE.Sprite }> = [];
        const packets: Array<{ point: THREE.Mesh; curve: THREE.CatmullRomCurve3; tool: BimTool; offset: number }> = [];

        BIM_TOOLS.forEach((tool, i) => {
          const angle = (i / BIM_TOOLS.length) * Math.PI * 2 + 0.15;
          const radius = 7.6;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = 3.0 + (i % 3) * 0.35;
          const node = new THREE.Mesh(new THREE.IcosahedronGeometry(0.58, 2), new THREE.MeshStandardMaterial({ color: tool.color, emissive: tool.color, emissiveIntensity: 0.55, metalness: 0.5, roughness: 0.25 }));
          node.position.set(x, y, z);
          node.castShadow = true;
          node.userData.toolId = tool.id;
          scene.add(node);
          nodeMeshes.push(node);
          const halo = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.02, 6, 32), new THREE.MeshBasicMaterial({ color: tool.color, transparent: true, opacity: 0.5 }));
          halo.rotation.x = Math.PI / 2;
          halo.position.copy(node.position);
          halo.position.y -= 0.02;
          scene.add(halo);
          const sprite = labelSprite(tool.name, tool.category, tool.color);
          sprite.position.set(x, y + 1.15, z);
          scene.add(sprite);
          nodeData.push({ mesh: node, tool, sprite });

          // Curved connection to the federated model.
          const start = new THREE.Vector3(x, y, z);
          const end = new THREE.Vector3(0, 3.3 + (i % 3) * 0.2, 0);
          const mid = start.clone().lerp(end, 0.5);
          mid.y += 1.5 + (i % 2) * 0.6;
          const curve = new THREE.CatmullRomCurve3([start, mid, end]);
          const geometry = new THREE.TubeGeometry(curve, 32, 0.018, 5, false);
          const line = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: tool.color, transparent: true, opacity: 0.28 }));
          scene.add(line);
          const point = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), new THREE.MeshBasicMaterial({ color: tool.color }));
          point.userData.baseColor = new THREE.Color(tool.color);
          scene.add(point);
          packets.push({ point, curve, tool, offset: i / BIM_TOOLS.length });
        });

        // Proptech.AI access gate and people.
        const gate = new THREE.Group();
        const frame = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.6, 0.25), new THREE.MeshStandardMaterial({ color: 0x1d2d2f, metalness: 0.7, roughness: 0.3 }));
        frame.position.y = 1.3;
        gate.add(frame);
        for (const x of [-1.2, 1.2]) {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.6, 0.55), new THREE.MeshStandardMaterial({ color: 0x37504f, metalness: 0.7, roughness: 0.3 }));
          post.position.set(x, 1.3, 0);
          gate.add(post);
          const lens = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), new THREE.MeshBasicMaterial({ color: 0x53f0be }));
          lens.position.set(x, 2.35, 0.3);
          gate.add(lens);
        }
        const scan = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.2), new THREE.MeshBasicMaterial({ color: 0x53f0be, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false }));
        scan.position.set(0, 1.2, 0.15);
        gate.add(scan);
        for (const [x, z] of [[-3.6, 1.8], [-2.4, 2.4], [-4.6, 2.8]] as const) {
          const person = new THREE.Group();
          const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.5, 3, 6), new THREE.MeshStandardMaterial({ color: 0xd9a63a, roughness: 0.8 }));
          body.position.y = 0.75;
          person.add(body);
          const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), new THREE.MeshStandardMaterial({ color: 0xd4b69a, roughness: 0.7 }));
          head.position.y = 1.25;
          person.add(head);
          person.position.set(x, 0.1, z);
          gate.add(person);
        }
        gate.position.set(7.5, 0, 6.5);
        gate.rotation.y = -0.7;
        scene.add(gate);
        const gateLabel = labelSprite('Proptech.AI Edge', 'Access · occupancy · visitors', '#53f0be');
        gateLabel.position.set(7.5, 3.6, 6.5);
        scene.add(gateLabel);

        let selectedId = selected;
        let currentStage = stage;

        const apply = () => {
          nodeData.forEach(({ mesh, tool, sprite }) => {
            const isSelected = tool.id === selectedId;
            const matchesStage = currentStage === 'all' || tool.stage === currentStage;
            mesh.scale.setScalar(isSelected ? 1.45 : 1);
            (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = isSelected ? 1.2 : matchesStage ? 0.55 : 0.18;
            (sprite.material as THREE.SpriteMaterial).opacity = currentStage === 'all' || matchesStage ? 1 : 0.32;
            sprite.scale.set(isSelected ? 4.0 : 3.6, isSelected ? 1.0 : 0.9, 1);
          });
        };

        apiRef.current = {
          setSelected: (id) => { selectedId = id; apply(); },
          setStage: (s) => { currentStage = s; apply(); },
        };
        apply();

        // Interaction.
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        const onPointer = (event: PointerEvent) => {
          const rect = ctx.renderer.domElement.getBoundingClientRect();
          pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(pointer, ctx.camera);
          const hit = raycaster.intersectObjects(nodeMeshes, false)[0];
          onSelectRef.current(hit ? String(hit.object.userData.toolId) : null);
        };
        ctx.renderer.domElement.addEventListener('pointerup', onPointer);
        ctx.addDispose(() => ctx.renderer.domElement.removeEventListener('pointerup', onPointer));

        ctx.addUpdate((dt, elapsed) => {
          packets.forEach((packet, i) => {
            const t = (elapsed * 0.16 + packet.offset) % 1;
            const pos = packet.curve.getPointAt(t);
            packet.point.position.copy(pos);
            const selectedBoost = packet.tool.id === selectedId ? 2.2 : 1;
            packet.point.scale.setScalar(selectedBoost * (0.8 + Math.sin(elapsed * 4 + i) * 0.2));
          });
          nodeData.forEach(({ mesh }, i) => {
            mesh.rotation.y += dt * 0.35;
            const base = mesh.userData.toolId === selectedId ? 1.45 : 1;
            mesh.position.y += Math.sin(elapsed * 1.6 + i) * 0.0016;
            mesh.scale.setScalar(base + Math.sin(elapsed * 2 + i) * 0.02);
          });
          beacon.scale.setScalar(1 + Math.sin(elapsed * 3) * 0.25);
          (scan.material as THREE.MeshBasicMaterial).opacity = 0.08 + Math.abs(Math.sin(elapsed * 1.8)) * 0.14;
        });
      }}
    />
  );
}
