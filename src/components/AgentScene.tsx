import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeStage } from './ThreeStage';
import { AGENTS, COMPANY_FUNCTIONS } from '../lib/platformData';

export interface AgentSceneProps {
  selectedId: string | null;
  activeId: string | null;
  autoRotate?: boolean;
  onSelect?: (id: string | null) => void;
}

interface AgentApi {
  setSelected: (id: string | null) => void;
  setActive: (id: string | null) => void;
}

interface NodeRecord {
  id: string;
  name: string;
  role: string;
  group: THREE.Group;
  node: THREE.Mesh;
  wire: THREE.Mesh;
  mat: THREE.MeshStandardMaterial;
  label: HTMLDivElement;
  color: THREE.Color;
  angle: number;
  baseY: number;
  link: THREE.QuadraticBezierCurve3;
  particle: THREE.Mesh;
  offset: number;
}

function edge(mesh: THREE.Mesh, color = 0x2b6a6a, opacity = 0.3) {
  const e = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }),
  );
  mesh.add(e);
}

function makeLabel(text: string, sub: string, color: string, layer: HTMLDivElement) {
  const el = document.createElement('div');
  el.innerHTML = `<span style="display:inline-block;width:4px;height:4px;border-radius:99px;background:${color};box-shadow:0 0 8px ${color};margin-right:5px;vertical-align:1px"></span><span style="color:#e9f4ee">${text}</span><span style="color:rgba(143,166,160,.8);margin-left:5px;font-size:6.5px">${sub}</span>`;
  el.style.cssText = 'position:absolute;transform:translate(-50%,-100%);font-family:"JetBrains Mono Variable",monospace;font-size:7.5px;letter-spacing:.1em;white-space:nowrap;padding:3px 6px;border:1px solid rgba(120,200,190,.18);border-radius:3px;background:rgba(4,10,12,.7);backdrop-filter:blur(3px);transition:border-color .2s,box-shadow .2s;';
  layer.appendChild(el);
  return el;
}

export function AgentScene({ selectedId, activeId, autoRotate = true, onSelect }: AgentSceneProps) {
  const apiRef = useRef<AgentApi | null>(null);
  const onSelectRef = useRef<(id: string | null) => void>(onSelect ?? (() => {}));
  onSelectRef.current = onSelect ?? (() => {});

  useEffect(() => { apiRef.current?.setSelected(selectedId); }, [selectedId]);
  useEffect(() => { apiRef.current?.setActive(activeId); }, [activeId]);

  return (
    <ThreeStage
      ariaLabel="Interactive 3D agent council with eight specialist AI agents orbiting a central COO orchestration core and six company functions."
      cameraPosition={[56, 44, 64]}
      target={[0, 9, 0]}
      fov={40}
      background={0x03080a}
      fog={{ color: 0x03080a, density: 0.004 }}
      autoRotate={autoRotate}
      autoRotateSpeed={0.2}
      build={(ctx) => {
        const scene = ctx.scene;
        const hemi = new THREE.HemisphereLight(0x8ccfd0, 0x050a0c, 0.8);
        scene.add(hemi);
        const key = new THREE.DirectionalLight(0xd8fbff, 1.7);
        key.position.set(-40, 62, 42);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x2bd0b2, 0.55);
        rim.position.set(50, 30, -52);
        scene.add(rim);
        const coreLight = new THREE.PointLight(0x72ffd9, 32, 45, 2);
        coreLight.position.set(0, 7, 0);
        scene.add(coreLight);

        // Platform.
        const platform = new THREE.Mesh(
          new THREE.CylinderGeometry(26, 27, 1.1, 80),
          new THREE.MeshStandardMaterial({ color: 0x050d10, metalness: 0.6, roughness: 0.65 }),
        );
        platform.position.y = -0.55;
        scene.add(platform);
        const platformEdge = new THREE.Mesh(
          new THREE.TorusGeometry(26.1, 0.04, 4, 100),
          new THREE.MeshBasicMaterial({ color: 0x3b7777, transparent: true, opacity: 0.55 }),
        );
        platformEdge.rotation.x = -Math.PI / 2;
        platformEdge.position.y = 0.03;
        scene.add(platformEdge);
        const rings: THREE.Mesh[] = [];
        for (const r of [8, 14, 20.5]) {
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(r, 0.025, 4, 96),
            new THREE.MeshBasicMaterial({ color: r === 20.5 ? 0x51d6ff : 0x3d8f88, transparent: true, opacity: r === 20.5 ? 0.32 : 0.22 }),
          );
          ring.rotation.x = -Math.PI / 2;
          ring.position.y = 0.04;
          scene.add(ring);
          rings.push(ring);
        }
        const radial: THREE.Vector3[] = [];
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          radial.push(new THREE.Vector3(Math.cos(a) * 2.5, 0.04, Math.sin(a) * 2.5), new THREE.Vector3(Math.cos(a) * 20, 0.04, Math.sin(a) * 20));
        }
        scene.add(new THREE.LineSegments(
          new THREE.BufferGeometry().setFromPoints(radial),
          new THREE.LineBasicMaterial({ color: 0x1b4f4e, transparent: true, opacity: 0.18 }),
        ));

        // Central COO core.
        const coreGroup = new THREE.Group();
        coreGroup.position.y = 7.2;
        scene.add(coreGroup);
        const coreGeo = new THREE.IcosahedronGeometry(2.15, 1);
        const core = new THREE.Mesh(
          coreGeo,
          new THREE.MeshStandardMaterial({ color: 0x4cecc4, emissive: 0x2bffd2, emissiveIntensity: 1.25, metalness: 0.35, roughness: 0.28 }),
        );
        coreGroup.add(core);
        const coreWire = new THREE.Mesh(
          new THREE.IcosahedronGeometry(2.42, 1),
          new THREE.MeshBasicMaterial({ color: 0xb7ffeb, wireframe: true, transparent: true, opacity: 0.32, depthWrite: false }),
        );
        coreGroup.add(coreWire);
        const coreHalo = new THREE.Mesh(
          new THREE.TorusGeometry(3.2, 0.04, 4, 80),
          new THREE.MeshBasicMaterial({ color: 0x53f0be, transparent: true, opacity: 0.5 }),
        );
        coreHalo.rotation.x = Math.PI / 2.2;
        coreGroup.add(coreHalo);
        const coreHalo2 = new THREE.Mesh(
          new THREE.TorusGeometry(4.1, 0.025, 4, 90),
          new THREE.MeshBasicMaterial({ color: 0x51d6ff, transparent: true, opacity: 0.28 }),
        );
        coreHalo2.rotation.x = -Math.PI / 2.6;
        coreGroup.add(coreHalo2);
        const coreGlow = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0x7dffda, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending }));
        coreGlow.scale.set(9, 9, 1);
        coreGroup.add(coreGlow);
        const coreLabel = makeLabel('COO CORE', '', '#53f0be', ctx.labelLayer);
        coreLabel.style.fontSize = '7px';
        coreLabel.style.padding = '2px 5px';
        const corePos = new THREE.Vector3(0, 13.6, 0);

        // Company function pillars.
        const functionLabels: HTMLDivElement[] = [];
        COMPANY_FUNCTIONS.forEach((fn, i) => {
          const a = (i / COMPANY_FUNCTIONS.length) * Math.PI * 2 + Math.PI / 6;
          const x = Math.cos(a) * 22.5;
          const z = Math.sin(a) * 22.5;
          const color = new THREE.Color(fn.tone);
          const pillar = new THREE.Mesh(
            new THREE.BoxGeometry(0.28, 3.2 + i * 0.15, 0.28),
            new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.55, metalness: 0.5, roughness: 0.35 }),
          );
          pillar.position.set(x, 1.6, z);
          scene.add(pillar);
          const cap = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.5, 0),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 }),
          );
          cap.position.set(x, 3.4 + i * 0.15, z);
          scene.add(cap);
          const el = makeLabel(fn.name.toUpperCase(), '', fn.tone, ctx.labelLayer);
          el.style.fontSize = '6.5px';
          el.style.padding = '2px 5px';
          el.style.opacity = '0.8';
          functionLabels.push(el);
          (el as HTMLDivElement & { _pos?: THREE.Vector3 })._pos = new THREE.Vector3(x, 4.2 + i * 0.15, z);
        });

        // Agent nodes.
        const nodes: NodeRecord[] = [];
        const pickables: THREE.Mesh[] = [];
        const peerLines = new THREE.Group();
        scene.add(peerLines);
        AGENTS.forEach((agent, i) => {
          const angle = -Math.PI / 2 + (i / AGENTS.length) * Math.PI * 2;
          const radius = 16.4;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const color = new THREE.Color(agent.color);
          const baseY = 5.6 + (i % 3) * 0.35;

          const group = new THREE.Group();
          group.position.set(x, baseY, z);
          scene.add(group);

          const geom =
            i % 4 === 0 ? new THREE.IcosahedronGeometry(1.25, 1) :
            i % 4 === 1 ? new THREE.OctahedronGeometry(1.45, 0) :
            i % 4 === 2 ? new THREE.DodecahedronGeometry(1.2, 0) :
            new THREE.TetrahedronGeometry(1.55, 0);
          const mat = new THREE.MeshStandardMaterial({
            color, emissive: color, emissiveIntensity: 0.65, metalness: 0.42, roughness: 0.3, transparent: true, opacity: 0.94,
          });
          const node = new THREE.Mesh(geom, mat);
          node.userData.agentId = agent.id;
          group.add(node);
          pickables.push(node);
          const wire = new THREE.Mesh(
            geom.clone(),
            new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.3, depthWrite: false }),
          );
          wire.scale.setScalar(1.16);
          group.add(wire);
          const glow = new THREE.Sprite(new THREE.SpriteMaterial({ color, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
          glow.scale.set(4.6, 4.6, 1);
          group.add(glow);

          // Base ring + tether.
          const base = new THREE.Mesh(
            new THREE.RingGeometry(1.5, 1.62, 32),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false }),
          );
          base.rotation.x = -Math.PI / 2;
          base.position.set(x, 0.08, z);
          scene.add(base);
          const tether = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, baseY, 4),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.16, depthWrite: false }),
          );
          tether.position.set(x, baseY / 2, z);
          scene.add(tether);

          // Curved link to the core.
          const start = new THREE.Vector3(0, 7.2, 0);
          const end = new THREE.Vector3(x, baseY, z);
          const mid = start.clone().add(end).multiplyScalar(0.5);
          mid.y = Math.max(start.y, end.y) + 3.4;
          const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
          const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(curve.getPoints(32)),
            new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending }),
          );
          scene.add(line);
          const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.13, 8, 8),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 }),
          );
          particle.userData.agentId = agent.id;
          scene.add(particle);

          // Peer link to the next agent.
          if (i < AGENTS.length - 1) {
            const nextA = -Math.PI / 2 + ((i + 1) / AGENTS.length) * Math.PI * 2;
            const next = new THREE.Vector3(Math.cos(nextA) * radius, baseY, Math.sin(nextA) * radius);
            const peer = new THREE.Line(
              new THREE.BufferGeometry().setFromPoints([end, next]),
              new THREE.LineBasicMaterial({ color: 0x2e6f6c, transparent: true, opacity: 0.18, depthWrite: false }),
            );
            peerLines.add(peer);
          }

          const label = makeLabel(agent.name, '', agent.color, ctx.labelLayer);
          label.style.fontSize = '7px';
          label.style.padding = '2px 5px';
          label.style.letterSpacing = '.14em';
          const basePos = new THREE.Vector3(x, baseY + 3.0, z);
          (label as HTMLDivElement & { _pos?: THREE.Vector3 })._pos = basePos;

          nodes.push({ id: agent.id, name: agent.name, role: agent.role, group, node, wire, mat, label, color, angle, baseY, link: curve, particle, offset: i * 0.17 });
        });

        // Floating particles.
        const particleGeo = new THREE.BufferGeometry();
        const particleCount = 180;
        const particlePos = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
          const a = Math.random() * Math.PI * 2;
          const r = 2 + Math.random() * 24;
          particlePos[i * 3] = Math.cos(a) * r;
          particlePos[i * 3 + 1] = 1 + Math.random() * 13;
          particlePos[i * 3 + 2] = Math.sin(a) * r;
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
        const particles = new THREE.Points(
          particleGeo,
          new THREE.PointsMaterial({ color: 0x7de2d2, size: 0.06, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending }),
        );
        scene.add(particles);

        // Selection halo.
        const selHalo = new THREE.Mesh(
          new THREE.RingGeometry(1.9, 2.15, 40),
          new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }),
        );
        selHalo.rotation.x = -Math.PI / 2;
        selHalo.visible = false;
        scene.add(selHalo);
        const selBeam = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 10, 5, 1, true),
          new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending }),
        );
        selBeam.visible = false;
        scene.add(selBeam);

        // State and API.
        let currentSelected: string | null = selectedId;
        let currentActive: string | null = activeId;
        let hovered: string | null = null;

        const setSelected = (id: string | null) => {
          currentSelected = id;
          const node = nodes.find((n) => n.id === id);
          selHalo.visible = !!node;
          selBeam.visible = !!node;
          selHalo.material = new THREE.MeshBasicMaterial({ color: node ? node.color : 0xffffff, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false });
          selBeam.material = new THREE.MeshBasicMaterial({ color: node ? node.color : 0xffffff, transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending });
          if (node) {
            selHalo.position.set(node.group.position.x, 0.11, node.group.position.z);
            selBeam.position.set(node.group.position.x, node.baseY, node.group.position.z);
          }
          nodes.forEach((n) => {
            const hex = `#${n.color.getHexString()}`;
            n.label.innerHTML = `<span style="display:inline-block;width:4px;height:4px;border-radius:99px;background:${hex};box-shadow:0 0 8px ${hex};margin-right:5px;vertical-align:1px"></span><span style="color:#e9f4ee">${n.name}</span>${n.id === id ? `<span style="color:rgba(180,205,198,.85);margin-left:5px;font-size:6.5px">${n.role.toUpperCase()}</span>` : ''}`;
            n.label.style.borderColor = n.id === id ? `${hex}66` : 'rgba(120,200,190,.18)';
            n.label.style.boxShadow = n.id === id ? `0 0 18px ${hex}33` : 'none';
            n.label.style.display = n.id === id ? 'block' : 'none';
          });
        };

        const setActive = (id: string | null) => {
          currentActive = id;
          nodes.forEach((n) => {
            const active = n.id === id;
            n.mat.emissiveIntensity = active ? 1.8 : 0.65;
            n.mat.opacity = active ? 1 : 0.94;
            n.wire.material = new THREE.MeshBasicMaterial({ color: n.color, wireframe: true, transparent: true, opacity: active ? 0.7 : 0.3, depthWrite: false });
            n.label.style.background = active ? `rgba(${Math.round(n.color.r * 255)},${Math.round(n.color.g * 255)},${Math.round(n.color.b * 255)},.16)` : 'rgba(4,10,12,.7)';
          });
        };

        const api: AgentApi = { setSelected, setActive };
        apiRef.current = api;
        setSelected(selectedId);
        setActive(activeId);

        // Picking.
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
          return hit ? (hit.object.userData.agentId as string) : null;
        };
        const handleMove = (event: PointerEvent) => {
          updatePointer(event);
          const id = pick();
          if (hovered !== id) {
            hovered = id;
            ctx.renderer.domElement.style.cursor = id ? 'pointer' : 'grab';
            nodes.forEach((n) => n.group.scale.setScalar(n.id === id ? 1.12 : 1));
          }
        };
        const handleClick = (event: PointerEvent) => { updatePointer(event); onSelectRef.current(pick()); };
        ctx.renderer.domElement.addEventListener('pointermove', handleMove);
        ctx.renderer.domElement.addEventListener('pointerup', handleClick);
        ctx.addDispose(() => {
          ctx.renderer.domElement.removeEventListener('pointermove', handleMove);
          ctx.renderer.domElement.removeEventListener('pointerup', handleClick);
        });

        const projected = new THREE.Vector3();
        ctx.addUpdate((dt, elapsed) => {
          coreGroup.rotation.y += dt * 0.18;
          coreWire.rotation.y -= dt * 0.12;
          coreHalo.rotation.z += dt * 0.22;
          coreHalo2.rotation.z -= dt * 0.15;
          const pulse = 1 + Math.sin(elapsed * 1.6) * 0.06;
          core.scale.setScalar(pulse);
          rings.forEach((ring, i) => { ring.rotation.z += dt * (i % 2 ? -0.02 : 0.015); });
          particles.rotation.y += dt * 0.008;
          if (currentActive) coreLight.intensity = 26 + Math.sin(elapsed * 2.6) * 12;
          else coreLight.intensity = 22 + Math.sin(elapsed * 1.2) * 6;

          nodes.forEach((n, i) => {
            const active = n.id === currentActive;
            n.group.position.y = n.baseY + Math.sin(elapsed * 1.2 + i) * 0.14;
            n.node.rotation.y += dt * (active ? 0.9 : 0.24);
            n.node.rotation.x = Math.sin(elapsed * 0.4 + i) * 0.12;
            n.wire.rotation.copy(n.node.rotation);
            n.wire.rotation.y += 0.3;
            n.group.scale.lerp(new THREE.Vector3(active ? 1.18 : 1, active ? 1.18 : 1, active ? 1.18 : 1), Math.min(1, dt * 4));
            const t = (elapsed * (active ? 0.34 : 0.1) + n.offset) % 1;
            n.particle.position.copy(n.link.getPointAt(t));
            (n.particle.material as THREE.MeshBasicMaterial).opacity = 0.25 + Math.sin(t * Math.PI) * (active ? 0.75 : 0.35);
          });

          if (selHalo.visible && currentSelected) {
            const n = nodes.find((x) => x.id === currentSelected);
            if (n) {
              selHalo.rotation.z += dt * 0.6;
              selHalo.scale.setScalar(1 + Math.sin(elapsed * 2.2) * 0.05);
              selBeam.scale.y = 0.9 + Math.sin(elapsed * 2.2) * 0.06;
            }
          }

          // Labels.
          const place = (el: HTMLDivElement, pos: THREE.Vector3) => {
            projected.copy(pos).project(ctx.camera);
            const width = ctx.container.clientWidth;
            const height = ctx.container.clientHeight;
            const x = (projected.x * 0.5 + 0.5) * width;
            const y = (-projected.y * 0.5 + 0.5) * height;
            el.style.transform = `translate(-50%,-100%) translate(${x}px, ${y}px)`;
            el.style.opacity = projected.z < 1 && width > 620 ? '1' : '0';
          };
          nodes.forEach((n) => {
            const p = n.group.position.clone();
            p.y += 3.0;
            place(n.label, p);
          });
          functionLabels.forEach((el) => {
            const pos = (el as HTMLDivElement & { _pos?: THREE.Vector3 })._pos;
            if (pos) place(el, pos);
          });
          place(coreLabel, corePos);
        });
      }}
    />
  );
}
