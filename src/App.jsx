import gsap from "gsap";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const routes = [
  {
    page: "explore",
    path: "",
  },
  {
    page: "create",
    path: "",
  },
];

const App = () => {
  const mountRef = useRef(null);
  const meshRef = useRef(null);
  const [mouseDown, setMouseDown] = useState(false);
  const [RGB, setRGB] = useState([0, 0, 0]);

  const [sizes, setSizes] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const timeline = gsap.timeline({ defaults: { duration: 1 } });

  useEffect(() => {
    // Initialize scene, camera, and renderer
    if (mountRef.current != null) {
      const mountRefCurrent = mountRef.current;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        45,
        sizes.width / sizes.height,
        0.1,
        100
      );
      const renderer = new THREE.WebGLRenderer();

      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(3);
      mountRef.current.appendChild(renderer.domElement);

      // Add 3D object
      const sphereGeometry = new THREE.SphereGeometry(3, 64, 64);
      const material = new THREE.MeshStandardMaterial({
        color: "#00ff83",
        roughness: 0.5,
        metalness: 0.15,
      });
      meshRef.current = new THREE.Mesh(sphereGeometry, material);

      scene.add(meshRef.current);

      // Add light
      const light = new THREE.PointLight(0xffffff, 100, 100);
      light.position.set(1, 10, 10);
      scene.add(light);

      camera.position.z = 20;

      // controls

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enablePan = false;
      controls.enableZoom = false;
      controls.autoRotate = true;
      controls.update();

      // Render the scene

      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };

      animate();

      // resizing

      const resize = () => {
        setSizes({
          ...sizes,
          width: window.innerWidth,
          height: window.innerHeight,
        });
        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();
      };

      window.addEventListener("resize", resize);

      // GSAP Animation

      timeline
        .fromTo(
          meshRef.current.scale,
          { z: 0, x: 0, y: 0 },
          { z: 1, x: 1, y: 1 }
        )
        .fromTo("nav", { opacity: 0 }, { opacity: 1 })
        .fromTo(
          ".list-item",
          { y: "-50%", opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.5 }
        )
        .fromTo(".title", { opacity: 0 }, { opacity: 1 });

      return () => {
        timeline.clear();
        window.removeEventListener("resize", resize);
        mountRefCurrent.removeChild(renderer.domElement);
      };
    }
  }, [sizes]);

  useEffect(() => {
    const handleMouseDown = () => {
      setMouseDown(true);
      // console.log("Mouse Down: ", mouseDown);
    };

    const handleMouseUp = () => {
      setMouseDown(false);
      // console.log("Mouse Down: ", mouseDown);
    };

    const handleColorChange = (e) => {
      if (mouseDown) {
        let normalizedY = e.pageY / sizes.height;
        let normalizedX = e.pageX / sizes.width;
        let normalizedZ = normalizedY * normalizedX;
        setRGB([
          Math.round(normalizedX * 255),
          Math.round(normalizedY * 255),
          Math.round(normalizedZ * 255),
        ]);

        // changing the color

        let newColor = new THREE.Color(`rgb(${RGB.join(",")})`);
        gsap.to(meshRef.current.material.color, {
          r: newColor.r,
          g: newColor.g,
          b: newColor.b,
        });
      }
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleColorChange);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleColorChange);
    };
  }, [mouseDown, RGB, sizes]);

  return (
    <main>
      <div className="canvas" ref={mountRef} />
      <nav className="nav">
        <a href="">Sphere</a>
        <ul className="list">
          {routes.map((item, i) => (
            <li className="list-item" key={i}>
              <a href={`${item.path}`}>{item.page}</a>
            </li>
          ))}
        </ul>
      </nav>
      <h1 className="title">Give it a Spin</h1>
    </main>
  );
};

export default App;
