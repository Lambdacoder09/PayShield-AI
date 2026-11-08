import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreeGlobeProps {
  originCity?: string;
  destCity?: string;
  traveler?: boolean;
  distanceKm?: number;
  timeElapsed?: string;
  calculatedSpeed?: number;
  speedLimit?: number;
}

// Convert lat/lon to 3D Cartesian coordinates on sphere of given radius
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export default function ThreeGlobe({
  originCity = 'San Francisco, USA',
  destCity = 'London, UK',
  traveler = false,
  distanceKm = 8620,
  timeElapsed = '20 minutes',
  calculatedSpeed = 25860,
  speedLimit = 850,
}: ThreeGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // SF: 37.7749, -122.4194
  // London: 51.5074, -0.1278
  // Paris: 48.8566, 2.3522
  const originLat = 37.7749;
  const originLon = -122.4194;
  const destLat = traveler ? 48.8566 : 51.5074;
  const destLon = traveler ? 2.3522 : -0.1278;

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 640;
    const height = 300;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 26);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Globe Group (for rotation)
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const radius = 9.5;

    // 2a. Base sphere (Light crisp aesthetic)
    const sphereGeo = new THREE.SphereGeometry(radius, 48, 48);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0xf0f5fa,
      transparent: true,
      opacity: 0.88,
      shininess: 15,
      specular: 0x90b0d0,
    });
    const baseSphere = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(baseSphere);

    // 2b. Atmospheric glow / wireframe rings
    const wireGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(radius * 1.002, 32, 16));
    const wireMat = new THREE.LineBasicMaterial({
      color: 0xc8d8e8,
      transparent: true,
      opacity: 0.35,
    });
    const wireframe = new THREE.LineSegments(wireGeo, wireMat);
    globeGroup.add(wireframe);

    // Outer glow aura
    const glowGeo = new THREE.SphereGeometry(radius * 1.05, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: traveler ? 0x24a47d : 0xe17269,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide,
    });
    const glowSphere = new THREE.Mesh(glowGeo, glowMat);
    globeGroup.add(glowSphere);

    // 3. Points on Globe
    const originVec = latLonToVector3(originLat, originLon, radius);
    const destVec = latLonToVector3(destLat, destLon, radius);

    // Origin Marker (Blue)
    const pinGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const originPinMat = new THREE.MeshBasicMaterial({ color: 0x4f6cd8 });
    const originPin = new THREE.Mesh(pinGeo, originPinMat);
    originPin.position.copy(originVec);
    globeGroup.add(originPin);

    // Origin Pulse Ring
    const ringGeo = new THREE.RingGeometry(0.4, 0.65, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x4f6cd8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const originRing = new THREE.Mesh(ringGeo, ringMat);
    originRing.position.copy(originVec.clone().multiplyScalar(1.01));
    originRing.lookAt(originVec.clone().multiplyScalar(2));
    globeGroup.add(originRing);

    // Destination Marker (Green if traveler, Red if impossible travel)
    const arcColor = traveler ? 0x199c77 : 0xe55648;
    const destPinMat = new THREE.MeshBasicMaterial({ color: arcColor });
    const destPin = new THREE.Mesh(pinGeo, destPinMat);
    destPin.position.copy(destVec);
    globeGroup.add(destPin);

    const destRing = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({
      color: arcColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    }));
    destRing.position.copy(destVec.clone().multiplyScalar(1.01));
    destRing.lookAt(destVec.clone().multiplyScalar(2));
    globeGroup.add(destRing);

    // 4. 3D Flight Arc (Quadratic Bezier Curve rising into atmosphere)
    const midPoint = new THREE.Vector3().addVectors(originVec, destVec).multiplyScalar(0.5);
    const distance = originVec.distanceTo(destVec);
    // Arc altitude scales with distance
    const altitude = radius + distance * 0.45;
    midPoint.setLength(altitude);

    const curve = new THREE.QuadraticBezierCurve3(originVec, midPoint, destVec);
    const curvePoints = curve.getPoints(60);
    const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const curveMat = new THREE.LineBasicMaterial({
      color: arcColor,
      linewidth: 3,
    });
    const arcLine = new THREE.Line(curveGeo, curveMat);
    globeGroup.add(arcLine);

    // Animated Plane / Signal Beacon moving along curve
    const beaconGeo = new THREE.SphereGeometry(0.28, 12, 12);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    globeGroup.add(beacon);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(20, 25, 20);
    scene.add(dirLight);

    // Initial globe orientation so Atlantic / US / Europe faces the user
    globeGroup.rotation.y = 1.35;
    globeGroup.rotation.x = 0.25;

    // 6. Mouse Drag Interaction
    let isMouseDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      setIsDragging(true);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      globeGroup.rotation.y += deltaX * 0.006;
      globeGroup.rotation.x = Math.max(-0.6, Math.min(0.6, globeGroup.rotation.x + deltaY * 0.006));
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

    // 7. Animation Loop
    let animId: number;
    let progress = 0;
    let pulseScale = 1;
    let pulseGrowing = true;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Auto-rotation when not interacting
      if (!isMouseDown) {
        globeGroup.rotation.y += 0.0018;
      }

      // Move beacon along curve
      progress += traveler ? 0.007 : 0.018;
      if (progress > 1) progress = 0;
      const currentPos = curve.getPoint(progress);
      beacon.position.copy(currentPos);

      // Pulse rings
      if (pulseGrowing) {
        pulseScale += 0.015;
        if (pulseScale > 1.4) pulseGrowing = false;
      } else {
        pulseScale -= 0.015;
        if (pulseScale < 0.9) pulseGrowing = true;
      }
      originRing.scale.set(pulseScale, pulseScale, pulseScale);
      destRing.scale.set(pulseScale, pulseScale, pulseScale);

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
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
  }, [traveler, originLat, originLon, destLat, destLon]);

  const isViolating = calculatedSpeed > speedLimit;

  return (
    <div style={{
      position: 'relative',
      borderRadius: '12px',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, #f7fafc 0%, #edf3f8 100%)',
      border: '1px solid #dce5ed',
      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
      marginTop: '10px'
    }}>
      {/* 3D Canvas Mount */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '300px',
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'block'
        }}
      />

      {/* Orbit Drag Instruction Pill */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 9px',
        borderRadius: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
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
          backgroundColor: traveler ? '#199c77' : '#e55648',
          display: 'inline-block'
        }} />
        <span>3D ORBITAL GLOBE &bull; DRAG TO ROTATE</span>
      </div>

      {/* Real-Time Geodesic Telemetry Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '14px',
        right: '14px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: '8px',
        padding: '10px 14px',
        borderRadius: '9px',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #d8e2eb',
        boxShadow: '0 2px 8px rgba(32, 42, 59, 0.05)'
      }}>
        <div>
          <span style={{ fontSize: '8px', color: '#8895a7', display: 'block', fontWeight: 600 }}>GREAT-CIRCLE ROUTE</span>
          <b style={{ fontSize: '11px', color: '#253347' }}>{originCity.split(',')[0]} &rarr; {destCity.split(',')[0]}</b>
          <small style={{ fontSize: '8px', color: '#68788e', display: 'block' }}>{distanceKm.toLocaleString()} km Haversine</small>
        </div>
        <div>
          <span style={{ fontSize: '8px', color: '#8895a7', display: 'block', fontWeight: 600 }}>TIME ELAPSED</span>
          <b style={{ fontSize: '11px', color: '#253347' }}>{timeElapsed}</b>
          <small style={{ fontSize: '8px', color: '#68788e', display: 'block' }}>Between auth events</small>
        </div>
        <div>
          <span style={{ fontSize: '8px', color: '#8895a7', display: 'block', fontWeight: 600 }}>CALCULATED SPEED</span>
          <b style={{ fontSize: '11px', color: isViolating ? '#d2483d' : '#168f6a', fontWeight: 800 }}>
            {calculatedSpeed.toLocaleString()} km/h
          </b>
          <small style={{ fontSize: '8px', color: isViolating ? '#d2483d' : '#168f6a', display: 'block', fontWeight: 700 }}>
            {isViolating ? 'VIOLATES CEILING' : 'WITHIN FLIGHT LIMIT'}
          </small>
        </div>
        <div>
          <span style={{ fontSize: '8px', color: '#8895a7', display: 'block', fontWeight: 600 }}>POLICY DECISION</span>
          <b style={{
            fontSize: '10px',
            color: isViolating ? '#b92b23' : '#13795a',
            backgroundColor: isViolating ? '#fdedeb' : '#e6f7f1',
            padding: '2px 6px',
            borderRadius: '4px',
            display: 'inline-block',
            fontWeight: 800
          }}>
            {isViolating ? 'BLOCK (IMPOSSIBLE TRAVEL)' : 'ALLOW (FPO-1 APPLIED)'}
          </b>
          <small style={{ fontSize: '8px', color: '#8895a7', display: 'block', marginTop: '2px' }}>
            Ceiling: {speedLimit} km/h
          </small>
        </div>
      </div>
    </div>
  );
}
