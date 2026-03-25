import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Points, PointMaterial } from '@react-three/drei'
import { useMemo, useRef } from 'react'

function ParticleField() {
  const ref = useRef()
  const positions = useMemo(() => {
    const points = new Float32Array(1800)

    for (let i = 0; i < 600; i += 1) {
      const i3 = i * 3
      points[i3] = (Math.random() - 0.5) * 8
      points[i3 + 1] = (Math.random() - 0.5) * 5
      points[i3 + 2] = (Math.random() - 0.5) * 5
    }

    return points
  }, [])

  useFrame((state) => {
    if (!ref.current) {
      return
    }

    ref.current.rotation.y = state.clock.elapsedTime * 0.045
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.12) * 0.08
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color="#68e1ff"
        size={0.02}
        sizeAttenuation
        depthWrite={false}
        opacity={0.75}
      />
    </Points>
  )
}

function HaloMesh() {
  const ref = useRef()

  useFrame((state) => {
    if (!ref.current) {
      return
    }

    ref.current.rotation.z = state.clock.elapsedTime * 0.08
    ref.current.rotation.x = 1.05 + Math.sin(state.clock.elapsedTime * 0.35) * 0.04
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.45) * 0.08
  })

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh ref={ref} position={[1.55, 0.1, -0.3]}>
        <torusKnotGeometry args={[0.78, 0.19, 220, 20, 2, 3]} />
        <meshStandardMaterial
          color="#72d8ff"
          emissive="#4f46e5"
          emissiveIntensity={0.85}
          roughness={0.18}
          metalness={0.72}
        />
      </mesh>
    </Float>
  )
}

function HeroScene() {
  return (
    <div className="hero-canvas" aria-hidden="true">
      <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 4.8], fov: 42 }}>
        <color attach="background" args={['#06111f']} />
        <fog attach="fog" args={['#06111f', 3.5, 8]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[2, 3, 3]} intensity={1.4} color="#9be7ff" />
        <pointLight position={[-3, -1, 2]} intensity={1.7} color="#4f46e5" />
        <ParticleField />
        <HaloMesh />
      </Canvas>
    </div>
  )
}

function App() {
  return (
    <main className="page-shell">
      <section className="hero-section">
        <HeroScene />
        <div className="hero-overlay" />
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">React . n8n . Mini Apps</p>
            <div className="hero-title-frame">
              <h1>Розробка сучасних веб-додатків, лендінгів та автоматизація бізнес-процесів.</h1>
            </div>
            <p className="hero-description">
              Спеціалізуюсь на React, n8n та створенні розумних міні-додатків.
            </p>
            <div className="hero-business-note">
              Запуск Telegram-ботів під ключ для кавʼярень, перукарень, спортзалів,
              барбершопів, салонів і клінік — щоб автоматично приймати записи, відповідати на
              типові запити, нагадувати клієнтам про візит і тримати розклад у порядку. Люба
              Ваша ідея! Людина буде спілкуватись з персональним Вашим секретарем, навіть не
              відчувати, що це ШІ!
            </div>
            <div className="hero-actions">
              <a href="https://t.me/stinches" target="_blank" rel="noreferrer" className="primary-link">
                Написати в Telegram
              </a>
              <a href="mailto:icemanic000@ace.me" className="secondary-link">
                icemanic000@ace.me
              </a>
            </div>
          </div>
          <div className="hero-sidecopy">
            <p>
              Telegram-боти для локального бізнесу: запис клієнтів, відповіді в месенджері,
              нагадування та проста автоматизація щоденної роботи.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
