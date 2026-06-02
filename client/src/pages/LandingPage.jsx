import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import * as THREE from 'three'
import { BrainCircuit, LineChart, Waypoints, Rocket, Sparkles, ChevronDown } from 'lucide-react'
import MentoraLogo from '../components/MentoraLogo'

const useInView = (options) => {
  const [ref, setRef] = useState(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    if (!ref) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true)
        observer.unobserve(ref)
      }
    }, options)
    observer.observe(ref)
    return () => observer.disconnect()
  }, [ref, options])

  return [setRef, isInView]
}

const LandingPage = () => {
  const mountRef = useRef(null)

  // Three.js Background Logic (Untouched, just wrapped in fixed container)
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const width = mount.clientWidth
    const height = mount.clientHeight

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x000000, 0.035)

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.z = 20

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000, 1)
    mount.appendChild(renderer.domElement)

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

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    })
    const wireOverlay = new THREE.Mesh(new THREE.SphereGeometry(1.22, 20, 20), wireMat)
    scene.add(wireOverlay)

    const ringGeo = new THREE.TorusGeometry(1.6, 0.04, 16, 100)
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.4 })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    scene.add(ring)

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

    const gridHelper = new THREE.GridHelper(80, 40, 0x003322, 0x001a11)
    gridHelper.position.y = -10
    scene.add(gridHelper)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0x00ffcc, 3, 30)
    scene.add(pointLight)

    const rimLight = new THREE.DirectionalLight(0x0066ff, 1)
    rimLight.position.set(-10, 10, -10)
    scene.add(rimLight)

    const mouse = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }

    const onMouseMove = (e) => {
      mouse.x = ((e.clientX / window.innerWidth) * 2 - 1) * 14
      mouse.y = -((e.clientY / window.innerHeight) * 2 - 1) * 8
    }
    window.addEventListener('mousemove', onMouseMove)

    const onResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    let frameId
    const clock = new THREE.Clock()

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      target.x += (mouse.x - target.x) * 0.08
      target.y += (mouse.y - target.y) * 0.08

      sphere.position.set(target.x, target.y, 0)
      wireOverlay.position.copy(sphere.position)
      ring.position.copy(sphere.position)
      pointLight.position.copy(sphere.position)

      ring.rotation.x = t * 0.6
      ring.rotation.y = t * 0.4

      sphereMat.emissiveIntensity = 0.3 + Math.sin(t * 2) * 0.15

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
      if (mount && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  // Animation Refs
  const [featuresRef, featuresInView] = useInView({ threshold: 0.1 })
  const [whyRef, whyInView] = useInView({ threshold: 0.1 })

  return (
    <div className="relative min-h-screen bg-black w-full overflow-hidden text-white font-sans">
      
      {/* ── Fixed Background ── */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <div ref={mountRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.8)_100%)]" />
      </div>

      {/* ── Scrollable Content ── */}
      <div className="relative z-10">
        
        {/* Navbar */}
        <nav className="flex justify-between items-center px-6 lg:px-16 py-6 border-b border-white/5 backdrop-blur-md sticky top-0 z-50 bg-black/30">
          <div className="flex items-center space-x-3">
            <MentoraLogo className="h-8 w-8" />
            <h1 className="text-xl font-bold tracking-wide">Mentora</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-gray-400 hover:text-white font-medium transition-colors px-4 py-2 hidden sm:block">
              Login
            </Link>
            <Link to="/signup" className="px-5 py-2.5 rounded-lg font-bold text-sm tracking-wide transition-all border border-primary text-primary hover:bg-primary hover:text-black shadow-[0_0_15px_rgba(13,235,161,0.2)] hover:shadow-[0_0_25px_rgba(13,235,161,0.5)]">
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-88px)] px-6 text-center relative pt-10 pb-32">
          <div className="max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Your Personal AI Career Twin</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Master your career with <br className="hidden sm:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#0066ff] drop-shadow-[0_0_30px_rgba(13,235,161,0.3)]">
                Mentora AI
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Step-by-step personalized roadmaps, intelligent skill gap analysis, and realistic daily tasks designed to land you the exact role you want.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Link to="/signup" className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-black transition-all bg-gradient-to-r from-primary to-[#0066ff] hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(13,235,161,0.4)] flex items-center justify-center gap-2">
                Start Building Free <Rocket className="w-4 h-4" />
              </Link>
              <Link to="/login" className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white border border-gray-700 hover:border-gray-400 hover:bg-white/5 transition-all backdrop-blur-md flex items-center justify-center">
                Sign In
              </Link>
            </div>
          </div>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50 hidden sm:flex flex-col items-center gap-2">
            <span className="text-xs tracking-widest uppercase text-gray-400">Scroll to explore</span>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* ── Features Section (Polaris/Notewise Style) ── */}
        <div ref={featuresRef} className="py-24 px-6 lg:px-16 bg-black/60 backdrop-blur-sm border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className={`text-center mb-16 transition-all duration-700 transform ${featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Precision Engineering for <span className="text-primary">Your Career</span></h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">Stop guessing what to learn. Mentora analyzes your profile and generates a mathematically precise path to your target role.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature Card 1 */}
              <div className={`glass-card p-8 group hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(13,235,161,0.15)] transition-all duration-500 hover:border-primary/50 transform ${featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.1s' }}>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <BrainCircuit className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">AI Skill-Gap Analysis</h3>
                <p className="text-gray-400 leading-relaxed text-sm">Mentora compares your exact current skillset with live job market requirements and highlights exactly what you are missing.</p>
              </div>

              {/* Feature Card 2 */}
              <div className={`glass-card p-8 group hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(13,235,161,0.15)] transition-all duration-500 hover:border-primary/50 transform ${featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.2s' }}>
                <div className="w-14 h-14 rounded-2xl bg-[#0066ff]/10 border border-[#0066ff]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Waypoints className="w-7 h-7 text-[#0066ff]" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Dynamic Roadmaps</h3>
                <p className="text-gray-400 leading-relaxed text-sm">Get a meticulously structured, step-by-step learning path. We curate the exact free resources, docs, and tutorials you need to succeed.</p>
              </div>

              {/* Feature Card 3 */}
              <div className={`glass-card p-8 group hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(13,235,161,0.15)] transition-all duration-500 hover:border-primary/50 transform ${featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.3s' }}>
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <LineChart className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Daily Progress Tracking</h3>
                <p className="text-gray-400 leading-relaxed text-sm">Your daily tasks are dynamically generated based on your roadmap. Keep your streak alive and track your neural activity over time.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Why Section ── */}
        <div ref={whyRef} className="py-24 px-6 lg:px-16 bg-gradient-to-b from-black/60 to-black backdrop-blur-md">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className={`text-3xl md:text-5xl font-bold mb-8 transition-all duration-700 transform ${whyInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066ff] to-primary">Modern Engineers</span>
            </h2>
            <p className={`text-gray-400 text-lg mb-12 transition-all duration-700 delay-100 transform ${whyInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              Generic bootcamps are outdated. Mentora creates a <strong className="text-white">Career Digital Twin</strong> for you. By connecting your real background with your future goals, Mentora tells you exactly what to do next without you ever having to figure it out yourself.
            </p>
            <Link to="/signup" className={`inline-flex px-10 py-4 rounded-xl font-bold text-black transition-all bg-primary hover:bg-white hover:text-black shadow-[0_0_30px_rgba(13,235,161,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] transform ${whyInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.2s' }}>
              Create Your Digital Twin Now
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-900 bg-black py-12 px-6 lg:px-16 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <MentoraLogo className="h-6 w-6 opacity-50" />
            <span className="text-gray-500 font-semibold tracking-widest uppercase text-sm">Mentora AI</span>
          </div>
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} Mentora AI. All rights reserved. 
            <br className="sm:hidden" /> Designed for the ambitious.
          </p>
        </footer>

      </div>
    </div>
  )
}

export default LandingPage
