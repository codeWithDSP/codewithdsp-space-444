const PROJECT_LINKS = {
  // Replace these three URLs with your deployed project links.
  campusflow: "https://campusflow-ai.vercel.app",
  spaceSite: "https://dsp-space-site.vercel.app",
  tradefxbook: "https://tradefxbook-2-0.vercel.app"
};

const revealEverything = () => {
  document
    .querySelectorAll(".reveal-up, .reveal-left, .reveal-right, .reveal-scale")
    .forEach((element) => element.classList.add("active"));
};

const initInterface = () => {
  const menuButton = document.querySelector("#menu-icon");
  const navbar = document.querySelector(".navbar");
  const navLinks = document.querySelectorAll(".navbar a");
  const sections = document.querySelectorAll("main section[id]");
  const header = document.querySelector(".header");
  const projectLinks = document.querySelectorAll("[data-project-link]");

  projectLinks.forEach((link) => {
    const projectKey = link.getAttribute("data-project-link");
    const projectUrl = PROJECT_LINKS[projectKey];
    if (!projectUrl) return;

    link.href = projectUrl;
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noreferrer");
  });

  const closeMenu = () => {
    menuButton?.classList.remove("active");
    navbar?.classList.remove("active");
    document.body.classList.remove("menu-open");
    menuButton?.setAttribute("aria-expanded", "false");
  };

  menuButton?.addEventListener("click", () => {
    const isOpen = menuButton.classList.toggle("active");
    navbar?.classList.toggle("active", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  const handleScroll = () => {
    const scrollY = window.scrollY;
    header?.classList.toggle("scrolled", scrollY > 42);

    let currentId = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 140;
      const sectionBottom = sectionTop + section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionBottom) {
        currentId = section.id;
      }
    });

    if (!currentId) return;

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`);
    });
  };

  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("active");
          entry.target.querySelectorAll(".skill-fill").forEach((bar) => {
            const progress = bar.getAttribute("data-progress");
            if (progress) {
              bar.style.width = progress;
            }
          });
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -36px 0px"
      }
    );

    document
      .querySelectorAll(".reveal-up, .reveal-left, .reveal-right, .reveal-scale")
      .forEach((element) => observer.observe(element));
  } else {
    revealEverything();
  }
};

const initSpaceScene = async () => {
  const canvas = document.querySelector("#space-canvas");
  if (!canvas) return;

  let THREE;
  try {
    THREE = await import("https://unpkg.com/three@0.164.1/build/three.module.js");
  } catch (error) {
    canvas.classList.add("space-canvas--fallback");
    console.warn("3D scene skipped because Three.js could not load.", error);
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 1200);
  camera.position.set(0, 0, 64);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x050816, 1);

  const starGeometry = new THREE.BufferGeometry();
  const starCount = window.innerWidth < 700 ? 900 : 1500;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const palette = [
    new THREE.Color("#38f8ff"),
    new THREE.Color("#a7f65c"),
    new THREE.Color("#ff4fa3"),
    new THREE.Color("#f8fbff"),
    new THREE.Color("#ffd166")
  ];

  for (let i = 0; i < starCount; i += 1) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 190;
    positions[i3 + 1] = (Math.random() - 0.5) * 120;
    positions[i3 + 2] = (Math.random() - 0.5) * 160;

    const color = palette[Math.floor(Math.random() * palette.length)];
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  starGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.95
    })
  );
  scene.add(stars);

  const planet = new THREE.Mesh(
    new THREE.IcosahedronGeometry(11, 4),
    new THREE.MeshStandardMaterial({
      color: "#111a3f",
      metalness: 0.28,
      roughness: 0.46,
      emissive: "#07234f",
      emissiveIntensity: 0.48
    })
  );
  planet.position.set(28, -9, -18);
  scene.add(planet);

  const wirePlanet = new THREE.Mesh(
    new THREE.IcosahedronGeometry(11.2, 2),
    new THREE.MeshBasicMaterial({
      color: "#38f8ff",
      wireframe: true,
      transparent: true,
      opacity: 0.24
    })
  );
  wirePlanet.position.copy(planet.position);
  scene.add(wirePlanet);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(15.8, 0.08, 12, 160),
    new THREE.MeshBasicMaterial({
      color: "#ffd166",
      transparent: true,
      opacity: 0.7
    })
  );
  ring.position.copy(planet.position);
  ring.rotation.set(1.2, 0.28, -0.35);
  scene.add(ring);

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(1.35, 24, 24),
    new THREE.MeshStandardMaterial({
      color: "#ff4fa3",
      emissive: "#5d1032",
      emissiveIntensity: 0.8,
      roughness: 0.38
    })
  );
  scene.add(moon);

  const cometGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-34, 22, -10),
    new THREE.Vector3(-8, 8, -16)
  ]);
  const comet = new THREE.Line(
    cometGeometry,
    new THREE.LineBasicMaterial({
      color: "#a7f65c",
      transparent: true,
      opacity: 0.72
    })
  );
  scene.add(comet);

  const keyLight = new THREE.PointLight("#38f8ff", 2.4, 120);
  keyLight.position.set(-26, 22, 34);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight("#ff4fa3", 1.8, 90);
  fillLight.position.set(42, -18, 30);
  scene.add(fillLight);

  scene.add(new THREE.AmbientLight("#ffffff", 0.35));

  let pointerX = 0;
  let pointerY = 0;
  let scrollProgress = 0;

  window.addEventListener(
    "pointermove",
    (event) => {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
    },
    { passive: true }
  );

  window.addEventListener(
    "scroll",
    () => {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      scrollProgress = window.scrollY / maxScroll;
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, { passive: true });

  const clock = new THREE.Clock();

  const animate = () => {
    const elapsed = clock.getElapsedTime();

    stars.rotation.y = elapsed * 0.012 + pointerX * 0.02;
    stars.rotation.x = pointerY * 0.015 - scrollProgress * 0.16;

    planet.rotation.y = elapsed * 0.18;
    planet.rotation.x = 0.22 + Math.sin(elapsed * 0.28) * 0.05;
    wirePlanet.rotation.copy(planet.rotation);
    wirePlanet.rotation.z += elapsed * 0.025;
    ring.rotation.z = -0.35 + elapsed * 0.08;

    const moonAngle = elapsed * 0.58;
    moon.position.set(
      planet.position.x + Math.cos(moonAngle) * 19,
      planet.position.y + Math.sin(moonAngle * 0.9) * 6,
      planet.position.z + Math.sin(moonAngle) * 12
    );

    comet.position.x = Math.sin(elapsed * 0.32) * 5;
    comet.position.y = Math.cos(elapsed * 0.22) * 3;

    camera.position.x += (pointerX * 3.6 - camera.position.x) * 0.035;
    camera.position.y += (-pointerY * 2.2 - camera.position.y) * 0.035;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();
};

initInterface();
initSpaceScene();
