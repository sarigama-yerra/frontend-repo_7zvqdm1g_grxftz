import React, { useEffect, useRef, useState } from 'react';
import { Sun, Moon, ArrowRight } from 'lucide-react';
import Spline from '@splinetool/react-spline';

// Single-file portfolio with Tailwind, dual theme, a Spline hero object, and an auxiliary three.js scene loaded via CDN
export default function Portfolio() {
  const [dark, setDark] = useState(false);
  const heroRef = useRef(null);
  const threeContainerRef = useRef(null);

  // Load three.js via CDN and initialize a lightweight interactive scene (low-poly shapes) behind the Spline object
  useEffect(() => {
    let cleanup = () => {};

    // If THREE is already present (HMR), skip loading
    const startThree = () => {
      const THREE = window.THREE;
      if (!THREE || !threeContainerRef.current) return;

      const container = threeContainerRef.current;
      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        100
      );
      camera.position.set(0, 0, 6);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding; // compat
      container.appendChild(renderer.domElement);

      // Lighting
      const ambient = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambient);
      const dir = new THREE.DirectionalLight(0xffffff, 0.6);
      dir.position.set(2, 3, 4);
      scene.add(dir);

      // Create a few playful low-poly icosahedrons
      const group = new THREE.Group();
      const colors = [0x5eead4, 0x93c5fd, 0xa78bfa, 0xf472b6];
      const mats = colors.map(
        (c) =>
          new THREE.MeshStandardMaterial({ color: c, flatShading: true, metalness: 0.2, roughness: 0.7 })
      );

      const geos = [
        new THREE.IcosahedronGeometry(1.2, 0),
        new THREE.DodecahedronGeometry(0.9, 0),
        new THREE.OctahedronGeometry(0.7, 0),
      ];

      for (let i = 0; i < 8; i++) {
        const mesh = new THREE.Mesh(
          geos[i % geos.length],
          mats[i % mats.length]
        );
        mesh.position.set(
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 3.5,
          (Math.random() - 0.5) * 2
        );
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        const s = 0.5 + Math.random() * 0.8;
        mesh.scale.setScalar(s);
        group.add(mesh);
      }
      scene.add(group);

      // Mouse interaction
      const mouse = { x: 0, y: 0 };
      const onPointerMove = (e) => {
        const rect = container.getBoundingClientRect();
        mouse.x = (e.clientX - rect.left) / rect.width - 0.5;
        mouse.y = (e.clientY - rect.top) / rect.height - 0.5;
      };
      container.addEventListener('pointermove', onPointerMove);

      // Handle resize
      const onResize = () => {
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      window.addEventListener('resize', onResize);

      let raf;
      const animate = () => {
        raf = requestAnimationFrame(animate);
        group.rotation.y += 0.002 + mouse.x * 0.01;
        group.rotation.x += 0.001 - mouse.y * 0.01;

        // Subtle color shift on hover via HSL
        group.children.forEach((m, idx) => {
          if (m.material && m.material.color) {
            const t = (Date.now() * 0.0003 + idx) % 1;
            const hueShift = (mouse.x + 0.5) * 0.2;
            const baseHue = (idx * 0.15 + hueShift + t) % 1;
            const color = new THREE.Color().setHSL(baseHue, 0.6, 0.6);
            m.material.color.copy(color);
          }
          m.rotation.y += 0.003;
        });

        renderer.render(scene, camera);
      };
      animate();

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', onResize);
        container.removeEventListener('pointermove', onPointerMove);
        // Dispose scene
        group.children.forEach((m) => {
          if (m.geometry) m.geometry.dispose();
          if (m.material) m.material.dispose();
        });
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      };
    };

    if (!window.THREE) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/three@0.160.0/build/three.min.js';
      script.async = true;
      script.onload = startThree;
      document.head.appendChild(script);
      cleanup = () => {
        // Do not remove the script to allow caching between HMR reloads
      };
    } else {
      startThree();
    }

    return () => cleanup();
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
        {/* Navigation */}
        <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200/60 dark:supports-[backdrop-filter]:bg-slate-950/60 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 shadow-sm" />
              <span className="font-semibold tracking-tight">Design Portfolio</span>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-sm">
              <button onClick={() => scrollTo('work')} className="hover:text-cyan-500 transition-colors">Work</button>
              <button onClick={() => scrollTo('about')} className="hover:text-cyan-500 transition-colors">About</button>
              <button onClick={() => scrollTo('contact')} className="hover:text-cyan-500 transition-colors">Contact</button>
            </nav>
            <div className="flex items-center gap-3">
              <button
                aria-label="Toggle theme"
                onClick={() => setDark((d) => !d)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:scale-[1.03] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section ref={heroRef} className="relative overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative h-[76vh] sm:h-[78vh] md:h-[82vh] rounded-3xl border border-slate-200/70 bg-gradient-to-b from-slate-50 to-white shadow-sm dark:from-slate-900 dark:to-slate-950 dark:border-slate-800">
              {/* three.js canvas container (behind) */}
              <div ref={threeContainerRef} className="absolute inset-0 z-0 rounded-3xl overflow-hidden" />

              {/* Spline 3D object (main) */}
              <div className="absolute inset-0 z-10">
                <Spline
                  scene="https://prod.spline.design/N8g2VNcx8Rycz93J/scene.splinecode"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>

              {/* Foreground content */}
              <div className="relative z-20 h-full w-full flex flex-col items-start justify-end p-8 sm:p-12 md:p-16 pointer-events-none">
                <div className="max-w-2xl pointer-events-auto">
                  <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-white dark:to-slate-400">
                    Crafting thoughtful interfaces with motion and depth
                  </h1>
                  <p className="mt-4 text-slate-600 dark:text-slate-300/90">
                    I design interactive products that feel alive—clean visuals, subtle motion, and immersive 3D moments.
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button onClick={() => scrollTo('work')} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-white shadow-md transition hover:scale-[1.02] hover:bg-slate-800 active:scale-100 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                      View Selected Work <ArrowRight size={18} />
                    </button>
                    <a href="#contact" onClick={(e) => { e.preventDefault(); scrollTo('contact'); }} className="rounded-2xl border border-slate-300 px-5 py-3 text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600">
                      Get in touch
                    </a>
                  </div>
                </div>
              </div>

              {/* Soft gradient overlay for polish (non-blocking) */}
              <div className="pointer-events-none absolute inset-0 z-20 rounded-3xl bg-gradient-to-b from-transparent via-transparent to-white/40 dark:to-slate-950/50" />
            </div>
          </div>
        </section>

        {/* Selected Work */}
        <section id="work" className="relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl sm:text-3xl font-semibold">Selected Work</h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">2022 — 2025</span>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[{
                title: 'Cyan Motion Bank',
                desc: 'A fintech dashboard with expressive micro-interactions and rich motion language.',
                accent: 'from-cyan-400 to-blue-500'
              }, {
                title: 'Aurora Health',
                desc: 'Calm, human-centered mobile flows with tactile feedback and subtle 3D.',
                accent: 'from-emerald-400 to-teal-500'
              }, {
                title: 'Nova Commerce',
                desc: 'Modular e-commerce design system focused on velocity and brand flexibility.',
                accent: 'from-fuchsia-500 to-violet-500'
              }].map((p, i) => (
                <article key={i} className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                  {/* Motion accent: animated gradient pill and subtle scale on hover */}
                  <div className={`h-40 w-full overflow-hidden rounded-2xl bg-gradient-to-br ${p.accent} opacity-90 transition-all duration-500 group-hover:scale-[1.03]`}>
                    {/* Placeholder GIF-like shimmer */}
                    <div className="h-full w-full animate-pulse bg-[linear-gradient(110deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.35)_15%,rgba(255,255,255,0)_30%)] bg-[length:200%_100%]" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold leading-snug">{p.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{p.desc}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-cyan-600 transition group-hover:gap-3 dark:text-cyan-400">
                    View Case Study <ArrowRight size={16} />
                  </div>
                  <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="grid gap-10 md:grid-cols-2">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold">About</h2>
                <p className="mt-4 text-slate-600 dark:text-slate-300">
                  I’m a designer focused on crafting cohesive product experiences—clear hierarchy, engaging motion, and a strong systematic foundation. I collaborate with growth-stage teams to ship fast, learn quickly, and scale design quality.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Skills</div>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>UI/UX Design</li>
                    <li>Motion & Micro-interactions</li>
                    <li>Prototyping</li>
                    <li>Design Systems</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Tools</div>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>Figma</li>
                    <li>After Effects</li>
                    <li>Spline</li>
                    <li>Framer</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Focus</div>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>Onboarding</li>
                    <li>Dashboard UX</li>
                    <li>3D Interactions</li>
                    <li>Brand Systems</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Values</div>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>Clarity</li>
                    <li>Craft</li>
                    <li>Speed</li>
                    <li>Empathy</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-xl sm:text-2xl font-semibold">Let’s build something great</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300">Have a project in mind or just want to say hi?</p>
              <a
                href="mailto:designer@example.com"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 px-6 py-3 font-medium text-white shadow-md transition hover:scale-[1.02] active:scale-100"
              >
                Contact Me <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          © {new Date().getFullYear()} Design Portfolio — All rights reserved.
        </footer>
      </div>
    </div>
  );
}
