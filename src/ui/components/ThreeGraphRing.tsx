import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreeGraphRingProps {
  fraudulent?: boolean;
}

export default function ThreeGraphRing({ fraudulent = true }: ThreeGraphRingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 640;
    const height = 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4, 24);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const graphGroup = new THREE.Group();
    scene.add(graphGroup);

    // Node definitions
    // Central Hub: Shared Emulator (Purple) & Stolen Card (Gold)
    const hubNodes = fraudulent ? [
      { id: 'DEV_EMU_77', label: 'Emulator DEV_EMU_77', pos: new THREE.Vector3(0, 2.2, 0), color: 0x8b65d8, size: 1.1, type: 'EMULATOR' },
      { id: 'CARD_4111', label: 'Stolen Card VISA 4111', pos: new THREE.Vector3(0, -2.2, 0), color: 0xdca635, size: 1.0, type: 'CARD' }
    ] : [
      { id: 'HOME_WIFI', label: 'Home Residential Wi-Fi', pos: new THREE.Vector3(0, 0, 0), color: 0x36a5c2, size: 1.2, type: 'IP' }
    ];

    // Satellite Accounts (Ring around center)
    const numAccounts = fraudulent ? 5 : 3;
    const accountRadius = 8.5;
    const accounts = Array.from({ length: numAccounts }).map((_, i) => {
      const angle = (i / numAccounts) * Math.PI * 2;
      const x = Math.cos(angle) * accountRadius;
      const z = Math.sin(angle) * accountRadius * 0.7;
      const y = Math.sin(i * 1.5) * 1.2;
      return {
        id: fraudulent ? `MULE_0${i + 1}` : ['PARENT', 'CHILD', 'SPOUSE'][i],
        label: fraudulent ? `Mule Account #${i + 1}` : `Family Account (${['Parent', 'Child', 'Spouse'][i]})`,
        pos: new THREE.Vector3(x, y, z),
        color: fraudulent ? 0xe25345 : 0x4f6cd8,
        size: 0.8,
        type: 'ACCOUNT'
      };
    });

    const allNodes = [...hubNodes, ...accounts];

    // Create 3D Meshes for Nodes
    const nodeMeshes: { mesh: THREE.Mesh; data: typeof allNodes[0] }[] = [];
    allNodes.forEach(node => {
      let geo: THREE.BufferGeometry;
      if (node.type === 'EMULATOR') {
        geo = new THREE.OctahedronGeometry(node.size, 1);
      } else if (node.type === 'CARD') {
        geo = new THREE.BoxGeometry(node.size * 1.5, node.size * 0.9, 0.3);
      } else {
        geo = new THREE.SphereGeometry(node.size, 24, 24);
      }

      const mat = new THREE.MeshPhongMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: 0.25,
        shininess: 40,
        specular: 0xffffff,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(node.pos);
      graphGroup.add(mesh);
      nodeMeshes.push({ mesh, data: node });

      // Pulsing glow ring
      const ringGeo = new THREE.RingGeometry(node.size * 1.1, node.size * 1.4, 20);
      const ringMat = new THREE.MeshBasicMaterial({
        color: node.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(node.pos);
      ring.lookAt(camera.position);
      graphGroup.add(ring);
    });

    // Create Connecting 3D Laser Lines
    const lineGroup = new THREE.Group();
    graphGroup.add(lineGroup);

    const edges: [THREE.Vector3, THREE.Vector3, number][] = [];
    accounts.forEach(acc => {
      hubNodes.forEach(hub => {
        edges.push([acc.pos, hub.pos, hub.color]);
      });
    });

    edges.forEach(([p1, p2, color]) => {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const lineMat = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: fraudulent ? 0.75 : 0.45,
        linewidth: 2
      });
      const line = new THREE.Line(lineGeo, lineMat);
      lineGroup.add(line);
    });

    // Floating Ambient Particles in background
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 120;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 32;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.18,
      color: fraudulent ? 0xea8075 : 0x7b8ae6,
      transparent: true,
      opacity: 0.5
    });
    const particleField = new THREE.Points(particleGeo, particleMat);
    graphGroup.add(particleField);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    // Mouse Interaction
    let isMouseDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      setIsDragging(true);

      // Raycast to select node
      const rect = dom.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes.map(n => n.mesh));
      if (intersects.length > 0) {
        const hit = nodeMeshes.find(n => n.mesh === intersects[0].object);
        if (hit) setSelectedNode(`${hit.data.label} (${hit.data.type})`);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      graphGroup.rotation.y += deltaX * 0.007;
      graphGroup.rotation.x = Math.max(-0.5, Math.min(0.5, graphGroup.rotation.x + deltaY * 0.007));
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isMouseDown = false;
      setIsDragging(false);
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isMouseDown) {
        graphGroup.rotation.y += 0.003;
      }
      particleField.rotation.y += 0.0006;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 640;
      camera.aspect = newW / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, height);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(dom)) container.removeChild(dom);
    };
  }, [fraudulent]);

  return (
    <div style={{
      position: 'relative',
      borderRadius: '12px',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, #fafbfc 0%, #edf1f6 100%)',
      border: '1px solid #dbe2ea',
      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
      marginTop: '10px'
    }}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '300px',
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'block'
        }}
      />

      <div style={{
        position: 'absolute',
        top: '12px',
        left: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 9px',
        borderRadius: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(6px)',
        border: '1px solid #d5e0ea',
        fontSize: '9px',
        fontWeight: 700,
        color: '#55657d',
        pointerEvents: 'none'
      }}>
        <span style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: fraudulent ? '#e25345' : '#4f6cd8',
          display: 'inline-block'
        }} />
        <span>3D GRAPH TOPOLOGY &bull; DRAG TO ROTATE &bull; CLICK NODE</span>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '14px',
        right: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '9px 14px',
        borderRadius: '9px',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #d8e2eb',
        fontSize: '9px',
        boxShadow: '0 2px 8px rgba(32, 42, 59, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div>
            <span style={{ color: '#8895a7', display: 'block', fontSize: '8px' }}>BIPARTITE TOPOLOGY</span>
            <b style={{ color: fraudulent ? '#c9382b' : '#253347', fontSize: '11px' }}>
              {fraudulent ? 'Sybil Mule Ring (Bipartite Degree: 5)' : 'Family Household Network'}
            </b>
          </div>
          {selectedNode && (
            <div style={{ borderLeft: '1px solid #e1e7ee', paddingLeft: '12px' }}>
              <span style={{ color: '#8895a7', display: 'block', fontSize: '8px' }}>SELECTED NODE</span>
              <b style={{ color: '#27364b', fontSize: '10px' }}>{selectedNode}</b>
            </div>
          )}
        </div>
        <div>
          <span style={{
            fontSize: '9px',
            fontWeight: 800,
            color: fraudulent ? '#b92b23' : '#13795a',
            backgroundColor: fraudulent ? '#fdedeb' : '#e6f7f1',
            padding: '3px 8px',
            borderRadius: '5px'
          }}>
            {fraudulent ? 'GRAPH COMMUNITY BLOCKED' : 'LEGITIMATE HOUSEHOLD APPROVED'}
          </span>
        </div>
      </div>
    </div>
  );
}
