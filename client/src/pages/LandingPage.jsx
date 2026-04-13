import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import * as THREE from 'three'
import MentoraLogo from '../components/MentoraLogo'

const LandingPage = () => {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    const width = mount.clientWidth
    const height = mount.clientHeight

    // Scene
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x000000, 0.035)

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.z = 20

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000, 1)
    mount.appendChild(renderer.domElement)

    // ── Cursor sphere ──────────────────────────────────────────────
    const sphereGeo = new THREE.SphereGeometry(1.2, 64, 64)
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x00ffcc,
      emissive: 0x00ffcc,
      emissiveIntensity: 0.4,
      metalness: 0.8,
      roughness: 0.1,
      wireframe: false,
    })
    const sphere = new THREE.Mesh(sphereGeo, sphereMat)
    scene.add(sphere)

    // Wireframe overlay on sphere
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    })
    const wireOverlay = new THREE.Mesh(new THREE.SphereGeometry(1.22, 20, 20), wireMat)
    scene.add(wireOverlay)

    // Glow ring around sphere
    const ringGeo = new THREE.TorusGeometry(1.6, 0.04, 16, 100)
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.4 })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    scene.add(ring)

    // ── Particle field (robotic dots) ──────────────────────────────
    const particleCount = 1800
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 80
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40
    }
    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particleMat = new THREE.PointsMaterial({
      color: 0x00ffcc,
      size: 0.12,
      transparent: true,
      opacity: 0.5,
    })
    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // ── Grid lines (robotic floor grid) ───────────────────────────
    const gridHelper = new THREE.GridHelper(80, 40, 0x003322, 0x001a11)
    gridHelper.position.y = -10
    scene.add(gridHelper)

    // ── Lights ─────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0x00ffcc, 3, 30)
    scene.add(pointLight)

    const rimLight = new THREE.DirectionalLight(0x0066ff, 1)
    rimLight.position.set(-10, 10, -10)
    scene.add(rimLight)

    // ── Mouse tracking ─────────────────────────────────────────────
    const mouse = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }

    const onMouseMove = (e) => {
      // Map mouse to world coords at z=0 plane
      mouse.x = ((e.clientX / window.innerWidth) * 2 - 1) * 14
      mouse.y = -((e.clientY / window.innerHeight) * 2 - 1) * 8
    }
    window.addEventListener('mousemove', onMouseMove)

    // ── Resize ─────────────────────────────────────────────────────
    const onResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    // ── Animation loop ─────────────────────────────────────────────
    let frameId
    const clock = new THREE.Clock()

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // Smooth follow
      target.x += (mouse.x - target.x) * 0.08
      target.y += (mouse.y - target.y) * 0.08

      sphere.position.set(target.x, target.y, 0)
      wireOverlay.position.copy(sphere.position)
      ring.position.copy(sphere.position)
      pointLight.position.copy(sphere.position)

      // Rotate ring to face camera with wobble
      ring.rotation.x = t * 0.6
      ring.rotation.y = t * 0.4

      // Pulse emissive
      sphereMat.emissiveIntensity = 0.3 + Math.sin(t * 2) * 0.15

      // Slowly rotate particles
      particles.rotation.y = t * 0.02
      particles.rotation.x = t * 0.01

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Three.js canvas */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* Subtle vignette overlay */}
      <div className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)' }}
      />

      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center px-8 lg:px-16 py-6 border-b border-gray-900/60 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <MentoraLogo className="h-8 w-8" />
          <h1 className="text-xl font-semibold text-white tracking-wide">Mentora</h1>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="text-gray-400 hover:text-white font-medium transition-colors px-4 py-2"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-6 py-2 rounded-lg font-medium transition-all border border-[#00ffcc] text-[#00ffcc] hover:bg-[#00ffcc] hover:text-black"
            style={{ boxShadow: '0 0 12px rgba(0,255,204,0.3)' }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-88px)] px-6 text-center">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-[#00ffcc] mb-4 font-mono opacity-80">
            AI-Powered Career Intelligence
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
            Mentora –{' '}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(90deg, #00ffcc, #0066ff)' }}
            >
              AI Career Coach
            </span>
          </h1>

          <p className="text-sm md:text-base text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Your personalised guide to building a successful career. Roadmaps, quizzes, resume analysis — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-3 rounded-lg font-semibold text-black transition-all"
              style={{
                background: 'linear-gradient(90deg, #00ffcc, #0066ff)',
                boxShadow: '0 0 20px rgba(0,255,204,0.35)',
              }}
            >
              Start for Free
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 rounded-lg font-semibold text-white border border-gray-700 hover:border-gray-500 transition-all backdrop-blur-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
