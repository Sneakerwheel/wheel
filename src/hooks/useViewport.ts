import { useEffect, useState } from 'react'

export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  const handleResize = () => {
    setViewport({
      width: window.innerWidth,
      height: window.innerHeight
    })
  }

  useEffect(() => {
    // Initial setup
    handleResize()

    // Event listener for window resize
    window.addEventListener('resize', handleResize)

    // Cleanup the event listener when the component is unmounted
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, []) // Empty dependency array ensures that this effect runs only once during component mount

  return viewport
}
