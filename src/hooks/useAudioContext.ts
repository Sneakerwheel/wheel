import { useEffect, useRef } from 'react'

const useAudioContext = (audioFile: string) => {
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioBufferRef = useRef<AudioBuffer | null>(null)

  useEffect(() => {
    // Initialize the AudioContext
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()

    const loadAudio = async () => {
      if (!audioContextRef.current) return

      const audioContext = audioContextRef.current
      try {
        // Fetch the audio data from the imported file
        const response = await fetch(audioFile)
        const arrayBuffer = await response.arrayBuffer()

        // Decode the audio data
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        audioBufferRef.current = audioBuffer
      } catch (error) {
        console.error('Error loading audio:', error)
      }
    }

    loadAudio()

    return () => {
      // Clean up the AudioContext on component unmount
      audioContextRef.current?.close()
    }
  }, [audioFile])

  const playAudio = () => {
    if (!audioContextRef.current || !audioBufferRef.current) return

    const audioContext = audioContextRef.current
    const audioBuffer = audioBufferRef.current

    // Create a new source node each time to play the sound
    const source = audioContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(audioContext.destination)
    source.start()
  }

  return playAudio
}

export default useAudioContext
