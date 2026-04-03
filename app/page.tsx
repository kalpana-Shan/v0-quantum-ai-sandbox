"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Volume2, VolumeX, ChevronDown } from "lucide-react"

// Scene data
const scenes = [
  { id: 1, name: "The Void" },
  { id: 2, name: "The Data Lake" },
  { id: 3, name: "The Architecture" },
  { id: 4, name: "The Weights" },
  { id: 5, name: "The Hallucination" },
  { id: 6, name: "The Fine-Tuning" },
  { id: 7, name: "The Agentic Future" },
  { id: 8, name: "The Singularity" },
]

export default function QuantumAISandbox() {
  const [initiated, setInitiated] = useState(false)
  const [activeScene, setActiveScene] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })

  const containerRef = useRef<HTMLDivElement>(null)
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null)
  const snapAudioRef = useRef<HTMLAudioElement | null>(null)
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([])

  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  const springX = useSpring(cursorX, { stiffness: 500, damping: 28 })
  const springY = useSpring(cursorY, { stiffness: 500, damping: 28 })

  // Initialize audio on initiation
  const handleInitiate = useCallback(() => {
    ambientAudioRef.current = new Audio(
      "https://cdn.jsdelivr.net/gh/kalpana-Shan/weboreel-assets@main/quantum-ambient.mp3"
    )
    ambientAudioRef.current.loop = true
    ambientAudioRef.current.volume = 0.3
    ambientAudioRef.current.play().catch(() => {})

    snapAudioRef.current = new Audio(
      "https://cdn.jsdelivr.net/gh/kalpana-Shan/weboreel-assets@main/scene-snap.mp3"
    )
    snapAudioRef.current.volume = 0.5

    setInitiated(true)
  }, [])

  // Play snap sound
  const playSnapSound = useCallback(() => {
    if (snapAudioRef.current && !isMuted) {
      snapAudioRef.current.currentTime = 0
      snapAudioRef.current.play().catch(() => {})
    }
  }, [isMuted])

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newMuted = !prev
      if (ambientAudioRef.current) {
        ambientAudioRef.current.muted = newMuted
      }
      return newMuted
    })
  }, [])

  // Cursor tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      setCursorPos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [cursorX, cursorY])

  // Intersection observer for scene detection
  useEffect(() => {
    if (!initiated) return

    const observers: IntersectionObserver[] = []

    sceneRefs.current.forEach((ref, index) => {
      if (!ref) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
              if (activeScene !== index) {
                setActiveScene(index)
                playSnapSound()
              }
            }
          })
        },
        { threshold: 0.5 }
      )

      observer.observe(ref)
      observers.push(observer)
    })

    return () => {
      observers.forEach((obs) => obs.disconnect())
    }
  }, [initiated, activeScene, playSnapSound])

  // Scroll to top for restart
  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="relative">
      {/* Custom Cursor */}
      {initiated && (
        <motion.div
          className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-white/80 pointer-events-none z-[9999] mix-blend-difference"
          style={{
            x: springX,
            y: springY,
            translateX: "-50%",
            translateY: "-50%",
          }}
        >
          <motion.div
            className="absolute inset-1 rounded-full bg-white/30"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      )}

      {/* Gatekeeper */}
      <AnimatePresence>
        {!initiated && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            <motion.button
              onClick={handleInitiate}
              className="relative px-10 py-5 text-lg font-mono tracking-[0.3em] text-white/90 uppercase border border-white/30 bg-transparent cursor-pointer overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="absolute inset-0 bg-white/10"
                initial={{ x: "-100%" }}
                whileHover={{ x: "0%" }}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className="relative z-10"
                animate={{
                  textShadow: [
                    "0 0 10px rgba(255,255,255,0.5)",
                    "0 0 20px rgba(255,255,255,0.8)",
                    "0 0 10px rgba(255,255,255,0.5)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Initiate Neural Link
              </motion.span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Indicator */}
      {initiated && (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3">
          {scenes.map((scene, i) => (
            <motion.div
              key={scene.id}
              className={`w-3 h-3 rounded-full backdrop-blur-sm cursor-pointer transition-all duration-300 ${
                activeScene === i
                  ? "bg-white scale-125"
                  : "bg-white/30 hover:bg-white/50"
              }`}
              onClick={() => {
                sceneRefs.current[i]?.scrollIntoView({ behavior: "smooth" })
              }}
              whileHover={{ scale: 1.3 }}
              title={scene.name}
            />
          ))}
        </div>
      )}

      {/* Mute Button */}
      {initiated && (
        <motion.button
          onClick={toggleMute}
          className="fixed top-6 right-6 z-40 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </motion.button>
      )}

      {/* Main Container */}
      <div
        ref={containerRef}
        className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory bg-black text-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ cursor: initiated ? "none" : "default" }}
      >
        {/* Scene 1: The Void */}
        <Scene1
          ref={(el) => { sceneRefs.current[0] = el }}
          cursorPos={cursorPos}
        />

        {/* Scene 2: The Data Lake */}
        <Scene2 ref={(el) => { sceneRefs.current[1] = el }} />

        {/* Scene 3: The Architecture */}
        <Scene3
          ref={(el) => { sceneRefs.current[2] = el }}
          cursorPos={cursorPos}
        />

        {/* Scene 4: The Weights */}
        <Scene4 ref={(el) => { sceneRefs.current[3] = el }} />

        {/* Scene 5: The Hallucination */}
        <Scene5
          ref={(el) => { sceneRefs.current[4] = el }}
          cursorPos={cursorPos}
        />

        {/* Scene 6: The Fine-Tuning */}
        <Scene6 ref={(el) => { sceneRefs.current[5] = el }} />

        {/* Scene 7: The Agentic Future */}
        <Scene7 ref={(el) => { sceneRefs.current[6] = el }} />

        {/* Scene 8: The Singularity */}
        <Scene8
          ref={(el) => { sceneRefs.current[7] = el }}
          onRestart={scrollToTop}
        />
      </div>
    </div>
  )
}

// Scene 1: The Void
import { forwardRef } from "react"

const Scene1 = forwardRef<HTMLDivElement, { cursorPos: { x: number; y: number } }>(
  ({ cursorPos }, ref) => {
    const dotX = useMotionValue(0)
    const dotY = useMotionValue(0)
    const springDotX = useSpring(dotX, { stiffness: 50, damping: 20 })
    const springDotY = useSpring(dotY, { stiffness: 50, damping: 20 })

    useEffect(() => {
      const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 0
      const centerY = typeof window !== "undefined" ? window.innerHeight / 2 : 0
      const offsetX = (cursorPos.x - centerX) * 0.05
      const offsetY = (cursorPos.y - centerY) * 0.05
      dotX.set(offsetX)
      dotY.set(offsetY)
    }, [cursorPos, dotX, dotY])

    return (
      <div
        ref={ref}
        className="h-[100dvh] w-full snap-start relative flex flex-col items-center justify-center p-8 overflow-hidden bg-black"
      >
        {/* Breathing dot */}
        <motion.div
          className="absolute w-32 h-32 rounded-full bg-white"
          style={{ x: springDotX, y: springDotY }}
          animate={{
            scale: [1, 1.3, 1],
            boxShadow: [
              "0 0 60px 30px rgba(255,255,255,0.3)",
              "0 0 100px 50px rgba(255,255,255,0.5)",
              "0 0 60px 30px rgba(255,255,255,0.3)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Title */}
        <motion.h1
          className="absolute top-1/4 text-4xl md:text-6xl lg:text-7xl font-mono tracking-[0.4em] text-white/90 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          THE NEURAL AWAKENING
        </motion.h1>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-12 flex flex-col items-center gap-2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-sm font-mono tracking-widest text-white/50 uppercase">
            Scroll to Descend
          </span>
          <ChevronDown className="w-6 h-6 text-white/50" />
        </motion.div>
      </div>
    )
  }
)
Scene1.displayName = "Scene1"

// Scene 2: The Data Lake
const Scene2 = forwardRef<HTMLDivElement>((_, ref) => {
  const [isHovering, setIsHovering] = useState(false)
  const [dataGrid, setDataGrid] = useState<string[]>([])

  const generateDataRef = useRef(() => {
    const chars = "01"
    const newData: string[] = []
    for (let i = 0; i < 200; i++) {
      let line = ""
      for (let j = 0; j < 50; j++) {
        line += Math.random() > 0.7 ? chars[Math.floor(Math.random() * 2)] : " "
      }
      newData.push(line)
    }
    return newData
  })

  useEffect(() => {
    setDataGrid(generateDataRef.current())
  }, [])

  useEffect(() => {
    if (!isHovering) return
    const interval = setInterval(() => {
      setDataGrid(generateDataRef.current())
    }, 100)
    return () => clearInterval(interval)
  }, [isHovering])

  return (
    <div
      ref={ref}
      className="h-[100dvh] w-full snap-start relative flex flex-col items-center justify-center p-8 overflow-hidden bg-black"
    >
      {/* Data background */}
      <div className="absolute inset-0 overflow-hidden opacity-20 font-mono text-[8px] leading-[10px] text-cyan-400 whitespace-pre">
        {dataGrid.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      {/* Glass card */}
      <motion.div
        className="relative z-10 max-w-2xl p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
        onHoverStart={() => setIsHovering(true)}
        onHoverEnd={() => setIsHovering(false)}
        whileHover={{ scale: 1.02, borderColor: "rgba(255,255,255,0.3)" }}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.span className="text-cyan-400 font-mono text-sm tracking-widest">
          SCENE 01
        </motion.span>
        <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
          1. The Raw Input
        </h2>
        <p className="mt-6 text-lg text-white/70 leading-relaxed">
          Every AI model begins here—swimming in an ocean of data. Billions of
          parameters, trillions of tokens. Numbers cascading through neural
          pathways, seeking patterns in the chaos. This is where intelligence
          is born from mathematics.
        </p>
        <div className="mt-6 text-sm text-white/40 font-mono">
          Hover to scramble the data matrix
        </div>
      </motion.div>
    </div>
  )
})
Scene2.displayName = "Scene2"

// Scene 3: The Architecture
const Scene3 = forwardRef<
  HTMLDivElement,
  { cursorPos: { x: number; y: number } }
>(({ cursorPos }, ref) => {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 0
    const centerY = typeof window !== "undefined" ? window.innerHeight / 2 : 0
    setMouseOffset({
      x: (cursorPos.x - centerX) / centerX,
      y: (cursorPos.y - centerY) / centerY,
    })
  }, [cursorPos])

  return (
    <div
      ref={ref}
      className="h-[100dvh] w-full snap-start relative flex flex-col items-center justify-center p-8 overflow-hidden bg-black"
    >
      {/* Interlocking circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full border-2 border-purple-500/50"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{
            x: mouseOffset.x * 50,
            y: mouseOffset.y * 30,
          }}
        />
        <motion.div
          className="absolute w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full border-2 border-pink-500/50"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{
            x: mouseOffset.x * -80,
            y: mouseOffset.y * -50,
          }}
        />
        <motion.div
          className="absolute w-[200px] h-[200px] md:w-[300px] md:h-[300px] rounded-full border-2 border-cyan-500/50"
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{
            x: mouseOffset.x * 100,
            y: mouseOffset.y * 70,
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center max-w-2xl"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <span className="text-purple-400 font-mono text-sm tracking-widest">
          SCENE 02
        </span>
        <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
          2. The Attention Mechanism
        </h2>
        <p className="mt-6 text-lg text-white/70 leading-relaxed">
          The Transformer architecture revolutionized AI. Through self-attention,
          models learn which parts of the input matter most—like a spotlight
          illuminating connections across vast distances of context.
        </p>
      </motion.div>
    </div>
  )
})
Scene3.displayName = "Scene3"

// Scene 4: The Weights
const Scene4 = forwardRef<HTMLDivElement>((_, ref) => {
  const [sliders, setSliders] = useState([0.3, 0.5, 0.7, 0.4])

  const handleSliderChange = (index: number, value: number) => {
    const newSliders = [...sliders]
    newSliders[index] = value
    setSliders(newSliders)
  }

  // Calculate background color based on sliders
  const avgValue = sliders.reduce((a, b) => a + b, 0) / sliders.length
  const hue = Math.floor(200 + avgValue * 100) // Blue to purple range
  const saturation = 70 + avgValue * 30
  const lightness = 10 + avgValue * 15

  return (
    <div
      ref={ref}
      className="h-[100dvh] w-full snap-start relative flex flex-col items-center justify-center p-8 overflow-hidden transition-colors duration-500"
      style={{
        backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
      }}
    >
      <motion.div
        className="relative z-10 text-center mb-12"
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="text-white/60 font-mono text-sm tracking-widest">
          SCENE 03
        </span>
        <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight text-white">
          3. Tuning the Weights
        </h2>
        <p className="mt-4 text-white/70 max-w-xl mx-auto">
          Drag the sliders to adjust the neural weights and watch reality shift.
        </p>
      </motion.div>

      {/* Brutalist sliders */}
      <div className="flex gap-8 md:gap-16 items-end">
        {sliders.map((value, index) => (
          <div key={index} className="flex flex-col items-center gap-4">
            <div className="h-[200px] md:h-[300px] w-4 bg-white/20 relative rounded-full overflow-hidden">
              <motion.div
                className="absolute bottom-0 w-full bg-white rounded-full"
                style={{ height: `${value * 100}%` }}
                layout
              />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={value}
                onChange={(e) =>
                  handleSliderChange(index, parseFloat(e.target.value))
                }
                className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize"
                style={{
                  writingMode: "vertical-lr",
                  direction: "rtl",
                }}
              />
            </div>
            <span className="text-white font-mono text-sm">
              W{index + 1}: {value.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
})
Scene4.displayName = "Scene4"

// Scene 5: The Hallucination
const GLITCH_FONTS = ["font-mono", "font-serif", "font-sans", "italic", "font-bold"] as const

const Scene5 = forwardRef<
  HTMLDivElement,
  { cursorPos: { x: number; y: number } }
>(({ cursorPos }, ref) => {
  const [textOffset, setTextOffset] = useState({ x: 0, y: 0 })
  const [currentFont, setCurrentFont] = useState(0)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!textRef.current) return
    const rect = textRef.current.getBoundingClientRect()
    const textCenterX = rect.left + rect.width / 2
    const textCenterY = rect.top + rect.height / 2
    const distance = Math.sqrt(
      Math.pow(cursorPos.x - textCenterX, 2) +
        Math.pow(cursorPos.y - textCenterY, 2)
    )

    if (distance < 200) {
      const angle = Math.atan2(
        cursorPos.y - textCenterY,
        cursorPos.x - textCenterX
      )
      const pushForce = (200 - distance) / 2
      setTextOffset({
        x: -Math.cos(angle) * pushForce,
        y: -Math.sin(angle) * pushForce,
      })
    } else {
      setTextOffset({ x: 0, y: 0 })
    }
  }, [cursorPos])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFont(Math.floor(Math.random() * GLITCH_FONTS.length))
    }, 200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      ref={ref}
      className="h-[100dvh] w-full snap-start relative flex flex-col items-center justify-center p-8 overflow-hidden bg-black"
    >
      {/* Glitch overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            "linear-gradient(90deg, transparent 0%, rgba(255,0,0,0.03) 50%, transparent 100%)",
            "linear-gradient(90deg, transparent 0%, rgba(0,255,0,0.03) 50%, transparent 100%)",
            "linear-gradient(90deg, transparent 0%, rgba(0,0,255,0.03) 50%, transparent 100%)",
          ],
          x: [0, 5, -5, 0],
        }}
        transition={{ duration: 0.2, repeat: Infinity }}
      />

      {/* Misaligned background text */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <motion.span
          className="text-[200px] font-bold text-red-500"
          animate={{ x: [-10, 10, -10], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 0.3, repeat: Infinity }}
        >
          ERROR
        </motion.span>
      </div>

      {/* Main content */}
      <motion.div
        ref={textRef}
        className="relative z-10 text-center max-w-2xl"
        animate={{
          x: textOffset.x,
          y: textOffset.y,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
      >
        <motion.span
          className={`text-red-400 text-sm tracking-widest ${GLITCH_FONTS[currentFont]}`}
          animate={{ skewX: [-5, 5, -5] }}
          transition={{ duration: 0.1, repeat: Infinity }}
        >
          SC3N3 04
        </motion.span>
        <motion.h2
          className={`mt-4 text-4xl md:text-5xl tracking-tight text-white ${GLITCH_FONTS[currentFont]}`}
          animate={{
            textShadow: [
              "2px 0 red, -2px 0 cyan",
              "-2px 0 red, 2px 0 cyan",
              "2px 0 red, -2px 0 cyan",
            ],
          }}
          transition={{ duration: 0.1, repeat: Infinity }}
        >
          4. The H̷̢a̶l̵l̸u̷c̵i̵n̵a̸t̵i̴o̷n̸
        </motion.h2>
        <motion.p
          className="mt-6 text-lg text-white/70 leading-relaxed"
          animate={{ letterSpacing: ["0em", "0.05em", "0em"] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Sometimes, AI confidently generates information that doesn&apos;t exist.
          It hallucinates. The model fills gaps with plausible-sounding fiction,
          a byproduct of pattern completion without true understanding.
        </motion.p>
        <p className="mt-4 text-sm text-red-400/60 font-mono">
          [ Try to catch the text with your cursor ]
        </p>
      </motion.div>
    </div>
  )
})
Scene5.displayName = "Scene5"

// Scene 6: The Fine-Tuning
const Scene6 = forwardRef<HTMLDivElement>((_, ref) => {
  const [aligned, setAligned] = useState(false)

  return (
    <div
      ref={ref}
      className="h-[100dvh] w-full snap-start relative flex flex-col items-center justify-center p-8 overflow-hidden bg-white"
    >
      {/* Green wave animation */}
      <AnimatePresence>
        {aligned && (
          <motion.div
            className="absolute inset-0 bg-emerald-400 origin-center"
            initial={{ scale: 0, borderRadius: "100%" }}
            animate={{ scale: 3, borderRadius: "0%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center max-w-2xl"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <span
          className={`font-mono text-sm tracking-widest ${aligned ? "text-white/80" : "text-black/50"}`}
        >
          SCENE 05
        </span>
        <h2
          className={`mt-4 text-4xl md:text-5xl font-bold tracking-tight transition-colors duration-500 ${aligned ? "text-white" : "text-black"}`}
        >
          5. Human Alignment
        </h2>
        <p
          className={`mt-6 text-lg leading-relaxed transition-colors duration-500 ${aligned ? "text-white/80" : "text-black/60"}`}
        >
          Through RLHF (Reinforcement Learning from Human Feedback), we teach AI
          to align with human values. Human trainers guide the model, rewarding
          helpful responses and penalizing harmful ones.
        </p>

        <motion.button
          onClick={() => setAligned(true)}
          className={`mt-10 px-12 py-4 text-lg font-mono tracking-widest uppercase border-2 transition-all duration-300 ${
            aligned
              ? "bg-white text-emerald-600 border-white"
              : "bg-transparent text-black border-black hover:bg-black hover:text-white"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          disabled={aligned}
        >
          {aligned ? "✓ Aligned" : "Align"}
        </motion.button>
      </motion.div>
    </div>
  )
})
Scene6.displayName = "Scene6"

// Scene 7: The Agentic Future
const Scene7 = forwardRef<HTMLDivElement>((_, ref) => {
  const [nodes, setNodes] = useState([
    { id: 1, x: 200, y: 200, label: "Orchestrator" },
    { id: 2, x: 400, y: 150, label: "Planner" },
    { id: 3, x: 350, y: 350, label: "Executor" },
    { id: 4, x: 150, y: 380, label: "Memory" },
    { id: 5, x: 500, y: 300, label: "Tools" },
  ])
  const [dragging, setDragging] = useState<number | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (id: number, e: React.MouseEvent) => {
    setDragging(id)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging === null || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const newX = e.clientX - rect.left
    const newY = e.clientY - rect.top

    setNodes((prev) =>
      prev.map((node) =>
        node.id === dragging ? { ...node, x: newX, y: newY } : node
      )
    )
  }

  const handleMouseUp = () => {
    if (dragging !== null) {
      // Spring back effect - nodes return to general area
      setNodes((prev) =>
        prev.map((node) => {
          if (node.id === dragging) {
            const originalPositions: Record<number, { x: number; y: number }> = {
              1: { x: 200, y: 200 },
              2: { x: 400, y: 150 },
              3: { x: 350, y: 350 },
              4: { x: 150, y: 380 },
              5: { x: 500, y: 300 },
            }
            const original = originalPositions[node.id]
            return {
              ...node,
              x: original.x + (node.x - original.x) * 0.3,
              y: original.y + (node.y - original.y) * 0.3,
            }
          }
          return node
        })
      )
    }
    setDragging(null)
  }

  // Connections between nodes
  const connections = [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 2],
    [2, 4],
    [3, 2],
  ]

  return (
    <div
      ref={ref}
      className="h-[100dvh] w-full snap-start relative flex flex-col items-center justify-center p-8 overflow-hidden bg-black"
    >
      {/* Title */}
      <motion.div
        className="absolute top-20 text-center z-20"
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="text-blue-400 font-mono text-sm tracking-widest">
          SCENE 06
        </span>
        <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-white">
          6. Multi-Agent Systems
        </h2>
        <p className="mt-2 text-white/50 text-sm">Drag the nodes</p>
      </motion.div>

      {/* Network graph */}
      <div
        ref={containerRef}
        className="relative w-full max-w-3xl h-[500px]"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* SVG connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {connections.map(([from, to], i) => (
            <motion.line
              key={i}
              x1={nodes[from].x}
              y1={nodes[from].y}
              x2={nodes[to].x}
              y2={nodes[to].y}
              stroke="rgba(59, 130, 246, 0.4)"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: i * 0.1 }}
            />
          ))}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
          <motion.div
            key={node.id}
            className="absolute w-24 h-24 -ml-12 -mt-12 rounded-full bg-blue-500/20 border border-blue-400/50 flex items-center justify-center cursor-grab active:cursor-grabbing backdrop-blur-sm"
            style={{ left: node.x, top: node.y }}
            onMouseDown={(e) => handleMouseDown(node.id, e)}
            whileHover={{ scale: 1.1, borderColor: "rgba(59, 130, 246, 1)" }}
            animate={{
              x: dragging === node.id ? 0 : 0,
              transition: { type: "spring", stiffness: 300, damping: 20 },
            }}
          >
            <span className="text-xs font-mono text-blue-300 text-center px-2">
              {node.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Mention */}
      <motion.p
        className="absolute bottom-20 text-white/40 text-sm font-mono"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Powered by Watsonx Orchestration
      </motion.p>
    </div>
  )
})
Scene7.displayName = "Scene7"

// Scene 8: The Singularity
const Scene8 = forwardRef<HTMLDivElement, { onRestart: () => void }>(
  ({ onRestart }, ref) => {
    return (
      <div
        ref={ref}
        className="h-[100dvh] w-full snap-start relative flex flex-col items-center justify-center p-8 overflow-hidden bg-black"
      >
        {/* Wireframe sphere */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px]"
            animate={{ rotateY: 360, rotateX: 15 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ transformStyle: "preserve-3d", perspective: 1000 }}
          >
            {/* Horizontal rings */}
            {[...Array(8)].map((_, i) => {
              const scale = Math.sin((i / 7) * Math.PI)
              const y = (i - 3.5) * 25
              return (
                <motion.div
                  key={`h-${i}`}
                  className="absolute left-1/2 top-1/2 rounded-full border border-white/30"
                  style={{
                    width: `${scale * 100}%`,
                    height: `${scale * 100}%`,
                    transform: `translate(-50%, -50%) translateY(${y}px)`,
                  }}
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(255,255,255,0.2)",
                      "0 0 40px rgba(255,255,255,0.4)",
                      "0 0 20px rgba(255,255,255,0.2)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              )
            })}
            {/* Vertical rings */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`v-${i}`}
                className="absolute left-1/2 top-1/2 w-full h-full rounded-full border border-white/20"
                style={{
                  transform: `translate(-50%, -50%) rotateY(${i * 30}deg)`,
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Glow effect */}
        <motion.div
          className="absolute w-[200px] h-[200px] rounded-full bg-white/10 blur-[100px]"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Content */}
        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <span className="text-white/50 font-mono text-sm tracking-widest">
            SCENE 07 — FINALE
          </span>
          <h2 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight text-white">
            You are now part of
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              the network
            </span>
          </h2>

          <motion.button
            onClick={onRestart}
            className="mt-12 px-10 py-4 text-sm font-mono tracking-[0.3em] text-black uppercase bg-white border-2 border-white hover:bg-transparent hover:text-white transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Restart Simulation
          </motion.button>
        </motion.div>
      </div>
    )
  }
)
Scene8.displayName = "Scene8"
