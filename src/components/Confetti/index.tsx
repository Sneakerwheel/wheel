import { forwardRef, type ElementRef, useState, useEffect } from 'react'
import confetti from 'canvas-confetti'

const ConfettiExplosion = forwardRef<ElementRef<'button'>>((_, _ref) => {
  // Add a unique timestamp for each confetti explosion
  const [timestamp, setTimestamp] = useState<number>(Date.now())

  // Update timestamp when component re-renders
  useEffect(() => {
    setTimestamp(Date.now())
  }, [])

  const triggerConfetti = () => {
    // Number of explosions
    const numberOfExplosions = 50

    // Set an initial delay for the first explosion
    const baseDelay = 100

    // Create a unique ID for this confetti explosion session
    const explosionId = Date.now()

    // Trigger multiple confetti explosions with delays
    for (let i = 0; i < numberOfExplosions; i++) {
      // Random delay for each explosion, increasing with each iteration
      const delay = baseDelay * i

      // Random position for each explosion
      const x = Math.random() * window.innerWidth // Random horizontal position
      const y = Math.random() * window.innerHeight // Random vertical position

      // Use setTimeout to delay the confetti explosion
      setTimeout(() => {
        confetti({
          particleCount: 100, // Number of particles
          spread: 70, // Spread of the confetti
          origin: { x: x / window.innerWidth, y: y / window.innerHeight }, // Position
          scalar: 0.5 // Size of particles
        })
      }, delay)
    }
  }

  return (
    <div key={`confetti-container-${timestamp}`}>
      <button
        onClick={triggerConfetti}
        ref={_ref}
        className='hidden'
        key={`confetti-button-${timestamp}`}
      >
        Trigger Confetti
      </button>
    </div>
  )
})

ConfettiExplosion.displayName = 'ConfettiExplosion'

export default ConfettiExplosion
