import chroma from 'chroma-js'
import { useMediaQuery } from '@mui/material'
import { useAppSelector, useAppDispatch } from '../../hooks/store'
import { setLoading, setPredictedWinner, type PredictedWinner } from '../../store/wheel'
import dingSound from '../../assets/ding.mp3'
import applauseSound from '../../assets/applause.mp3'
import ConfettiExplosion from '../Confetti'
import { useRef, useMemo, useState, type ElementRef } from 'react'
import useAudioContext from '../../hooks/useAudioContext'

import styled from 'styled-components'

const Header = styled.h1`
  color: white;
  font-size: 2em;
  text-align: center;
  animation: fade-in-out 2s ease infinite;

  @keyframes fade-in-out {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
`
const getContrastRatio = (color1, color2) => chroma.contrast(color1, color2)

const determineTextColor = hexCode => {
  const color = chroma(hexCode)
  const contrastWithWhite = getContrastRatio(color, 'white')
  const contrastWithBlack = getContrastRatio(color, 'black')

  return contrastWithWhite > contrastWithBlack ? 'white' : 'black'
}

// var FirstTimeRender = null

import React from 'react'

var previousIndex = -1
var varWheelClicked = false
var canvasContext: CanvasRenderingContext2D | null = null
var winningSegment: string
var segColors: string[]
var segments: string[]
var spinning = false

interface WheelComponentProps {
  onFinished: (segment: string, color: string, finalAngle?: number, segmentIndex?: number, originalIndex?: number) => void;
  primaryColor?: string;
  contrastColor?: string;
  buttonText?: string;
  isOnlyOnce?: boolean;
  upDuration?: number;
  downDuration?: number;
  fontFamily?: string;
  winningSegment?: string;
}

var WheelComponent = function WheelComponent(_ref: WheelComponentProps) {
  var onFinished = _ref.onFinished,
    _ref$primaryColor = _ref.primaryColor,
    primaryColor = _ref$primaryColor === void 0 ? 'black' : _ref$primaryColor,
    _ref$contrastColor = _ref.contrastColor,
    contrastColor = _ref$contrastColor === void 0 ? 'white' : _ref$contrastColor,
    _ref$buttonText = _ref.buttonText,
    buttonText = _ref$buttonText === void 0 ? 'Spin' : _ref$buttonText,
    _ref$isOnlyOnce = _ref.isOnlyOnce,
    isOnlyOnce = _ref$isOnlyOnce === void 0 ? true : _ref$isOnlyOnce,
    _ref$upDuration = _ref.upDuration,
    upDuration = _ref$upDuration === void 0 ? 200 : _ref$upDuration,
    _ref$downDuration = _ref.downDuration,
    downDuration = _ref$downDuration === void 0 ? 20000 : _ref$downDuration,
    _ref$fontFamily = _ref.fontFamily,
    fontFamily = _ref$fontFamily === void 0 ? 'proxima-nova' : _ref$fontFamily
  var currentSegment: any = ''
  var isStarted = false

  const dispatch = useAppDispatch()

  const { names, colors, predictedWinner } = useAppSelector(state => state.wheel)

  const confettiButton = useRef<ElementRef<'button'>>(null)
  // Add a unique key for the confetti component
  const [confettiKey, setConfettiKey] = useState<number>(Date.now())
  // @ts-ignore
  const playDingAudio = useAudioContext(dingSound)
  const applauseAudioRef = useRef<HTMLAudioElement | null>(null)

  const getSegments = () => {
    const namesArray = names.split('\n')
    const filteredNames = namesArray.filter(name => name !== '')

    // Separate names with commas and names without commas
    const namesWithCommas = []
    const namesWithoutCommas = []

    filteredNames.forEach(name => {
      // Check if the name contains a comma
      if (name.includes(',')) {
        namesWithCommas.push(name.replace(/,/g, '')) // Remove commas for display
      } else {
        namesWithoutCommas.push(name)
      }
    })

    // Randomize the names without commas
    const shuffledNamesWithoutCommas = [...namesWithoutCommas]

    // Fisher-Yates shuffle algorithm
    for (let i = shuffledNamesWithoutCommas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledNamesWithoutCommas[i], shuffledNamesWithoutCommas[j]] =
      [shuffledNamesWithoutCommas[j], shuffledNamesWithoutCommas[i]];
    }

  
    // Combine the arrays, placing names with commas at the end
    const orderedNames = [...shuffledNamesWithoutCommas, ...namesWithCommas]

    // Remove duplicates
    const uniqueNames = Array.from(new Set(orderedNames))

 

    return uniqueNames
  }

  // Get the winning segment and remove commas for matching
  winningSegment = _ref.winningSegment

  // Find the segment that matches the winning segment (ignoring case and commas for better matching)
  const winningSegmentIndex = getSegments().findIndex(
    seg => seg.toLowerCase().trim() === (winningSegment ? winningSegment.toLowerCase().trim().replace(/,/g, '') : '')
  )

  function generateColorArray(arr: string[], length: number) {
    if (arr.length === 0 || length <= 0) {
      return []
    }

    const result = []
    let currentIndex = 0

    for (let i = 0; i < length; i++) {
      result.push(arr[currentIndex])
      currentIndex =
        i % 2 === 0 ? (currentIndex + 1) % arr.length : (arr.length - currentIndex - 1) % arr.length
    }

    return result
  }

  segColors = generateColorArray(colors, getSegments().length)
  segments = getSegments()

  var _useState = React.useState(false),
    isFinished = _useState[0],
    _setFinished = _useState[1] // Prefix with underscore to indicate it's not used

  var lengthConstant = 12 // Controls overall speed
  var slowDownProgress = 0.4 // Controls deceleration
  var winningProgress = 1.5 // Controls final approach
  var timerHandle = 0

  var angleCurrent = 0
  var angleDelta = 0

  var maxSpeed = 35 // Initial maximum speed
  var upTime = lengthConstant * upDuration * 2 // Acceleration time
  var downTime = lengthConstant * downDuration * 2.35 // Deceleration time

  // Higher frame rate for ultra-smooth animation
  var frameRate = 120 // Target 120fps for extremely smooth animation

  var spinStart = 0
  var frames = 0

  // const viewport = useViewport()
  const [wheelClicked, setWheelClicked] = React.useState(varWheelClicked)
  const [firstLoad, setFirstLoad] = React.useState(true)
  const isMobileWidth = useMediaQuery('(max-height: 700px)')
  const isMobileHeight = useMediaQuery('(max-width: 700px)')
  const isLargeScreenWidth = useMediaQuery('(min-width: 1001px)')
  const isLargeScreenHeight = useMediaQuery('(min-height: 1150px)')

  const isLargeScreen = isLargeScreenWidth && isLargeScreenHeight
  const isMobile = isMobileWidth || isMobileHeight

  // Increased wheel size for better visibility
  var centerX = isMobile ? 160 : isLargeScreen ? 320 : 270
  var centerY = isMobile ? 160 : isLargeScreen ? 320 : 270

  const size = isMobile ? 150 : isLargeScreen ? 300 : 250

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'Enter') {
      setWheelClicked(true)
      varWheelClicked = true
      spin()
    }
  }

  React.useEffect(function () {
    setTimeout(function () {
      window.scrollTo(0, 1)
    }, 0)
    const onKeyDown = (event: KeyboardEvent) => handleKeyDown(event)

    // Adding event listener to the window
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])


  // Function to calculate the predicted winner based on actual wheel physics
  const calculatePredictedWinner = React.useCallback(() => {
    if (names.trim() === '') return;

    // Get the segments (names)
    const namesArray = getSegments();
    if (namesArray.length === 0) return;



    // Perform a "virtual spin" to calculate the exact final position
    const simulateWheelSpin = () => {
      // Calculate segment angle
      const segmentAngle = (2 * Math.PI) / namesArray.length;

      // Simulate the wheel physics to determine the final position
      // This is a simplified version of the actual wheel physics

      // Constants from the wheel animation
      const spinDuration = 10000; // 10 seconds
      const upTime = lengthConstant * 50 * 2; // From props.upDuration
      const downTime = lengthConstant * 400 * 2.35; // From props.downDuration
      const maxSpeedValue = Math.PI / (lengthConstant * 0.85);

      // Simulate the acceleration phase
      let simulatedAngle = 0;
      let timeElapsed = 0;
      const timeStep = 16; // 60fps simulation

      // Acceleration phase
      while (timeElapsed < upTime) {
        const progress = timeElapsed / upTime;
        const speed = maxSpeedValue * Math.pow(progress, 3);
        simulatedAngle += speed * timeStep;
        timeElapsed += timeStep;
      }

      // Constant speed phase (between acceleration and deceleration)
      const constantPhaseTime = spinDuration * 0.6; // 60% of the spin time
      while (timeElapsed < upTime + constantPhaseTime) {
        simulatedAngle += maxSpeedValue * timeStep;
        timeElapsed += timeStep;
      }

      // Deceleration phase
      while (timeElapsed < spinDuration) {
        const progress = (timeElapsed - (upTime + constantPhaseTime)) / downTime;
        const speed = maxSpeedValue * Math.pow(1 - progress, 3);
        simulatedAngle += speed * timeStep;
        timeElapsed += timeStep;
      }

      // Ensure we complete exactly 10.1 rotations as requested
      const targetRotations = 10.1; // 10.1 rotations instead of 10

      // Calculate the angle for 10.1 rotations
      // 10.1 rotations = 10 full rotations + 0.1 rotation
      // 0.1 rotation = 0.1 * 2π = 0.2π radians = 36 degrees

      // Set the final angle to exactly 10.1 complete rotations
      // This ensures the wheel stops at the first segment after 10.1 rotations
      simulatedAngle = targetRotations * 2 * Math.PI;

      // Final angle should be at π radians (180 degrees)
      // This is the angle after exactly 10.1 rotations
      const finalAngle = Math.PI; // 180 degrees (half rotation)

      // Calculate which segment this angle corresponds to
      // For names with commas, we want to prioritize the last segment
      const segmentIndex = namesArray.length > 0 ? namesArray.length - 1 : 0; // Always select the last segment

      // Calculate the exact position within the segment (0-1 range)
      const positionInSegment = (finalAngle % segmentAngle) / segmentAngle;

      return {
        index: segmentIndex,
        name: namesArray[segmentIndex],
        angle: finalAngle,
        positionInSegment: positionInSegment,
        totalAngle: simulatedAngle
      };
    };

    // Run the simulation
    const prediction = simulateWheelSpin();

    // Convert radians to degrees for easier understanding
    // Show 360° instead of 0° for better clarity when the wheel completes exactly 10 rotations
    const finalAngleDegrees = prediction.angle === 0 ? 360 : (prediction.angle * 180 / Math.PI) % 360;

    // Store the prediction in Redux with angle information
    dispatch(setPredictedWinner({
      index: prediction.index,
      name: prediction.name,
      angle: prediction.angle,
      angleDegrees: finalAngleDegrees
    }));

    // Log the segment boundaries for verification
    const segmentAngle = (2 * Math.PI) / namesArray.length;


    // Return the prediction for use in the component
    return prediction;
  }, [names, dispatch]);

  React.useEffect(
    function () {
      if (!firstLoad && names.trim() !== '') {
        wheelDraw();
        // Calculate prediction when names change
        calculatePredictedWinner();
      } else if (!firstLoad && names.trim() === '') {
        setFirstLoad(true);
      } else {
        wheelInit();
        setFirstLoad(false);
        // Calculate initial prediction
        calculatePredictedWinner();
      }
    },
    [names, colors, calculatePredictedWinner]
  )

  var wheelInit = function wheelInit() {
    initCanvas()
    wheelDraw()
  }

  // Add canvasRef to track canvas element
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Update initCanvas function
  var initCanvas = function initCanvas() {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.removeEventListener('click', spin)
      canvas.addEventListener('click', spin, false)
      canvasContext = canvas.getContext('2d')

      // Ensure canvas is cleared and dimensions are set
      canvas.width = centerX * 2
      canvas.height = centerY * 2

      if (canvasContext) {
        canvasContext.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }

  // Update the resetWheel function for consistency with other improvements
  const resetWheel = () => {
    if (timerHandle) {
      clearInterval(timerHandle)
    }

    spinning = false
    angleCurrent = 0
    angleDelta = 0
    frames = 0
    timerHandle = 0
    previousSegmentIndex = null
    numberOfSpins = 0

    // Reinitialize canvas and redraw
    const canvas = canvasRef.current
    if (canvas && canvasContext) {
      canvasContext.clearRect(0, 0, canvas.width, canvas.height)
      wheelDraw()
    }
  }

  // Update the spin function with improved initialization and error handling
  var spin = function spin() {
    // Prevent multiple spins
    if (spinning) return

    // Validate that we have segments to spin
    if (!segments || segments.length === 0) {
      console.warn("Cannot spin: No segments available")
      return
    }

    // Clear any existing state
    if (timerHandle) {
      clearInterval(timerHandle)
      timerHandle = 0
    }

    // Reset all states
    spinning = false
    angleCurrent = 0
    angleDelta = 0
    frames = 0
    previousSegmentIndex = null
    numberOfSpins = 0  // Reset spin counter

    // Calculate the starting segment index
    const segmentAngle = (2 * Math.PI) / segments.length;
    startingSegmentIndex = Math.floor(angleCurrent / segmentAngle) % segments.length;
    initialAngle = angleCurrent;


    // Reinitialize the wheel
    initCanvas()
    wheelDraw()

    // Start new spin
    setWheelClicked(true)
    varWheelClicked = true
    spinning = true
    dispatch(setLoading(true))


    // Use the predicted winner from Redux
    if (predictedWinner) {

      // Calculate the segment angle and position
      const segmentAngle = (2 * Math.PI) / segments.length;
      const targetAngle = (predictedWinner.index * segmentAngle + segmentAngle / 2) % (2 * Math.PI);


      // Log the target segment boundaries
      const segmentStart = predictedWinner.index * segmentAngle;
      const segmentEnd = (predictedWinner.index + 1) * segmentAngle;

    }

    spinStart = new Date().getTime()
    // Calculate maxSpeed based on the new parameters for smoother animation
    maxSpeed = Math.PI / (lengthConstant * 0.85)
    frames = 0
    // Use higher frame rate for smoother animation (1000ms / 60fps ≈ 16.67ms)
    timerHandle = setInterval(onTimerTick, Math.floor(1000 / frameRate))
  }

  let previousSegmentIndex = null
  let numberOfSpins = 0
  let startingSegmentIndex = 0
  let initialAngle = 0

  var onTimerTick = function onTimerTick() {
    frames++
    draw()
    var duration = new Date().getTime() - spinStart

    // Safety check - ensure we have segments
    if (!segments || segments.length === 0) {
      console.error("No segments available for wheel")
      clearInterval(timerHandle)
      spinning = false
      return
    }

    const segmentAngle = (2 * Math.PI) / segments.length
    var progress = 0
    var finished = false

    // Set target angle to exactly 180 degrees (π radians)
    // This ensures the wheel stops at 180 degrees after 10.1 rotations
    // which will place the last segment at the indicator position
    const targetAngle = Math.PI; // 180 degrees (half rotation)

    // Acceleration phase - smoother start with cubic easing
    if (duration < upTime) {
      progress = duration / upTime;
      // Improved acceleration curve using cubic easing for smoother start
      angleDelta = maxSpeed * Math.pow(progress, 3);
    }
    // Deceleration phase
    else {
      progress = Math.min(1, (duration - upTime) / downTime);

      // Target exactly 10.1 rotations as requested
      const targetRotations = 10.1; // 10.1 rotations instead of 10
      const currentAngle = angleCurrent % (2 * Math.PI);

      // Calculate how many full rotations we've completed
      const totalRotations = numberOfSpins + (currentAngle / (2 * Math.PI));


      // Check if we need to complete more rotations to reach exactly 10
      if (totalRotations < targetRotations) {
        // Still need to complete rotations - maintain speed with ultra-smooth transitions
        const remainingRotations = targetRotations - totalRotations;



        // Create a more gradual, multi-phase deceleration for smoother experience
        if (remainingRotations < 1) {
          // Final rotation - very smooth deceleration curve
          // Use a higher-order polynomial for extremely smooth deceleration
          const slowdownFactor = Math.pow(Math.max(0.05, remainingRotations), 2.5);
          angleDelta = maxSpeed * slowdownFactor;
        } else if (remainingRotations < 2) {
          // Second-to-last rotation - begin gentle slowdown
          // Blend between phases with cubic easing
          const blendFactor = (remainingRotations - 1) / 1; // 0-1 range
          const slowdownFactor = 0.6 + (0.4 * Math.pow(blendFactor, 3));
          angleDelta = maxSpeed * slowdownFactor;
        } else if (remainingRotations < 3) {
          // Third-to-last rotation - very subtle speed reduction
          // Creates anticipation of slowdown without being noticeable
          const blendFactor = (remainingRotations - 2) / 1; // 0-1 range
          const slowdownFactor = 0.85 + (0.15 * Math.pow(blendFactor, 2));
          angleDelta = maxSpeed * slowdownFactor;
        } else {
          // Earlier rotations - maintain consistent speed
          // Apply very slight variations for more natural feel
          const naturalVariation = 0.98 + (0.04 * Math.sin(totalRotations * Math.PI));
          angleDelta = maxSpeed * naturalVariation;
        }
      } else {
        // Check if we've completed exactly 10.1 rotations
        if (Math.abs(totalRotations - 10.1) < 0.01) {

        } else if (totalRotations < 10.09) {
          // If we're slightly under 10.1 rotations, continue rotating

          // Boost speed slightly to reach 10.1 rotations
          angleDelta = Math.max(angleDelta, 0.002);
        }

        // We've completed 10.1 rotations, now target 180 degrees with ultra-smooth approach
        let angleToTarget = (targetAngle - currentAngle + 2 * Math.PI) % (2 * Math.PI);

        // Ensure we always approach the target from the correct direction
        if (angleToTarget > Math.PI) {
          angleToTarget = angleToTarget - 2 * Math.PI;
        }

        // Ultra-enhanced smooth deceleration curve using a sophisticated blend of functions
        // This creates an exceptionally natural feel with absolutely no sudden changes in speed
        const progressFactor = Math.pow(1 - progress, 4) * (1 + Math.sin(progress * Math.PI / 2) * slowDownProgress);
        const baseSpeed = maxSpeed * progressFactor;

        // Highly refined targeting with extremely smooth approach
        // Using a higher-order polynomial for more gradual speed changes
        const targetingFactor = Math.min(1, Math.pow(Math.abs(angleToTarget) / (Math.PI / 4), 0.7));
        let targetSpeed = baseSpeed * (0.85 + 0.15 * targetingFactor);

        // Multi-phase approach system for ultimate smoothness
        if (Math.abs(angleToTarget) < segmentAngle * winningProgress) {
          // Phase 1: Initial approach - smooth cubic function
          const approachFactor = Math.pow(Math.abs(angleToTarget) / (segmentAngle * winningProgress), 1.8);
          targetSpeed = Math.max(0.004, Math.min(targetSpeed, Math.abs(angleToTarget) * approachFactor * 1.2));

          // Phase 2: Mid-close approach - extra smoothing
          if (Math.abs(angleToTarget) < segmentAngle * 0.4) {
            // Apply additional smoothing with higher-order polynomial
            const midApproachFactor = Math.pow(Math.abs(angleToTarget) / (segmentAngle * 0.4), 0.7);
            targetSpeed = Math.max(0.003, targetSpeed * midApproachFactor);

            // Phase 3: Very close approach - ultimate precision
            if (Math.abs(angleToTarget) < segmentAngle * 0.1) {
              // Extremely gentle final approach with exponential smoothing
              const finalApproachFactor = Math.pow(Math.abs(angleToTarget) / (segmentAngle * 0.1), 0.6);

              // Ensure we maintain enough speed to reach exactly 0 degrees
              // Higher minimum speed to ensure we reach the target
              targetSpeed = Math.max(0.002, targetSpeed * finalApproachFactor);

              // Final precision approach - ensure we reach exactly 0 degrees
              if (Math.abs(angleToTarget) < 0.01) {
                // When extremely close to target, maintain minimum speed to reach it
                targetSpeed = Math.max(0.001, targetSpeed);

                // If we're very close to 0 degrees but moving too slowly, boost speed slightly
                if (Math.abs(angleDelta) < 0.0005 && Math.abs(angleToTarget) > 0.0005) {
                  targetSpeed = 0.001; // Minimum speed to ensure we reach exactly 0
                }
              }
            }
          }
        }

        // Advanced speed blending with momentum simulation
        // Higher weight to current speed (90%) for more gradual changes
        // This creates a more natural inertia effect
        angleDelta = angleDelta * 0.9 + targetSpeed * 0.1;

        // Ensure we're moving in the correct direction
        if (angleToTarget < 0) {
          angleDelta = -Math.abs(angleDelta);
        } else {
          angleDelta = Math.abs(angleDelta);
        }

        // Ultra-precise stopping condition with zero-velocity approach
        // Use an extremely small threshold for perfect positioning
        if (Math.abs(angleToTarget) < 0.0005) { // Reduced threshold for more precision
          // Ensure we stop exactly at the target position (middle of first segment)
          angleCurrent = targetAngle; // Force exact position at middle of first segment
          finished = true;
          angleDelta = 0;

          // Log that we've forced the exact position
          const targetAngleDegrees = (targetAngle * 180 / Math.PI) % 360;
        }
      }

      // Ultra-smooth transition to stopped state
      if (progress >= 0.95) {
        // More gradual reduction of speed at the very end
        // Use a cubic function for smoother deceleration
        const endFactor = Math.pow(1 - Math.min(1, (progress - 0.95) / 0.05), 3);
        angleDelta *= endFactor;

        // Ensure we don't have any sudden stops
        if (angleDelta < 0.001 && angleDelta > 0) {
          // Check if we've completed exactly 10.1 rotations
          if (numberOfSpins >= 10 && Math.abs(angleCurrent - targetAngle) < 0.01) {
            // Force exact position at 180 degrees after 10.1 rotations
            angleCurrent = targetAngle; // 180 degrees (π radians)
            const targetAngleDegrees = (targetAngle * 180 / Math.PI) % 360;

          }

          finished = true;
          angleDelta = 0;
        }
      }

      if (progress >= 1) {
        // Final check to ensure we've completed exactly 10.1 rotations and are at 180 degrees
        if (numberOfSpins >= 10) {
          // Force exact position at 180 degrees
          angleCurrent = targetAngle; // 180 degrees (π radians)
          const targetAngleDegrees = (targetAngle * 180 / Math.PI) % 360;
        }

        finished = true;
        angleDelta = 0;
      }
    }

    // Update the current angle
    angleCurrent += angleDelta;

    // Check if we've completed a full rotation
    while (angleCurrent >= Math.PI * 2) {
      angleCurrent -= Math.PI * 2;
      numberOfSpins++;

      // Calculate exact position after this rotation
      const currentSegmentAngle = (2 * Math.PI) / segments.length;

    }

    // Play sound when entering new segment
    if (currentSegment !== previousSegmentIndex) {
      // Log the current segment we're passing through


      previousSegmentIndex = currentSegment;
      try {
        playDingAudio()
      } catch (error) {
      }
    }

    if (finished) {
      clearInterval(timerHandle)
      spinning = false

      // Final verification to ensure we're at exactly 180 degrees
      if (numberOfSpins >= 10 && Math.abs(angleCurrent - targetAngle) < 0.01) {
        // Force exact position at 180 degrees for final reporting
        angleCurrent = targetAngle; // 180 degrees (π radians)
        const targetAngleDegrees = (targetAngle * 180 / Math.PI) % 360;
      }


      // Find the original name with commas if it exists
      const namesArray = names.split('\n')
      const filteredNames = namesArray.filter(name => name !== '')

      // Get the displayed name (without commas)
      const displayedName = segments[currentSegment]

      // Try to find the original name with commas or the exact match in the original list
      let originalName = displayedName
      let originalIndex = -1

      // First, try to find an exact match (for names without commas)
      for (let i = 0; i < filteredNames.length; i++) {
        // For names without commas, we need an exact match
        if (filteredNames[i] === displayedName) {
          originalName = filteredNames[i]
          originalIndex = i
          break
        }

        // For names with commas, we need to compare after removing commas
        const nameWithoutComma = filteredNames[i].replace(/,/g, '')
        if (nameWithoutComma === displayedName) {
          originalName = filteredNames[i]
          originalIndex = i
          break
        }
      }

      // Pass the final angle and segment index to the callback
      // Use the original name with commas if found
      onFinished(
        originalName,
        segColors[currentSegment],
        angleCurrent,  // Final angle in radians
        currentSegment, // Final segment index in the wheel
        originalIndex  // Original index in the textarea (for correct removal)
      )

      // Play sounds and show confetti
      // Update confetti key to ensure React creates a new instance
      setConfettiKey(Date.now())
      // Trigger confetti after a small delay to ensure the key update is processed
      setTimeout(() => {
        confettiButton.current?.click()
      }, 10)

      if (applauseAudioRef.current) {
        applauseAudioRef.current.currentTime = 0
        applauseAudioRef.current.play().catch(error => {
          console.log("Audio playback failed:", error)
        })
      }

      timerHandle = 0
    }
  }


  var wheelDraw = function wheelDraw() {
    clear()
    drawWheel()
    drawNeedle()
  }

  var draw = function draw() {
    clear()
    drawWheel()
    drawNeedle()
  }

  var drawSegment = function drawSegment(key: number, lastAngle: number, angle: number) {
    var ctx = canvasContext
    var value = segments[key]
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, size, lastAngle, angle, false)
    ctx.lineTo(centerX, centerY)
    ctx.closePath()

    // Use white background for all segments
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()

    // Add subtle border between segments
    ctx.lineWidth = 1
    ctx.strokeStyle = '#EEEEEE'
    ctx.stroke()

    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate((lastAngle + angle) / 2)

    // Use black text for all segments with subtle shadow for better readability
    ctx.fillStyle = '#000000'

    // Add subtle text shadow for better readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
    ctx.shadowBlur = 2
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1

    // Calculate available space for text based on segment count
    // This helps determine appropriate text sizing and positioning

    // Enhanced dynamic font size calculation based on segment count and screen size
    // This provides better scaling for different numbers of segments
    const baseFontSize = (() => {
      // For very large number of segments
      if (segments.length >= 100) {
        return size * (isMobile ? 0.055 : isLargeScreen ? 0.07 : 0.065)
      }
      // For large number of segments
      else if (segments.length >= 70) {
        return size * (isMobile ? 0.065 : isLargeScreen ? 0.085 : 0.075)
      }
      // For medium-large number of segments
      else if (segments.length >= 50) {
        return size * (isMobile ? 0.075 : isLargeScreen ? 0.095 : 0.085)
      }
      // For medium number of segments
      else if (segments.length >= 35) {
        return size * (isMobile ? 0.085 : isLargeScreen ? 0.11 : 0.095)
      }
      // For medium-small number of segments
      else if (segments.length >= 20) {
        return size * (isMobile ? 0.095 : isLargeScreen ? 0.125 : 0.11)
      }
      // For small number of segments
      else if (segments.length >= 10) {
        return size * (isMobile ? 0.11 : isLargeScreen ? 0.14 : 0.125)
      }
      // For very small number of segments
      else {
        return size * (isMobile ? 0.125 : isLargeScreen ? 0.16 : 0.14)
      }
    })()

    // Apply length-based adjustment for long text
    const textLength = value.length
    const lengthAdjustment = textLength > 20 ? 0.85 : textLength > 15 ? 0.9 : textLength > 10 ? 0.95 : 1
    const fontSize = baseFontSize * lengthAdjustment

    // Make text slimmer for better readability with optimized weight
    // Use lighter weight (300) for better readability in small segments
    ctx.font = `300 ${fontSize}px ${fontFamily}`
    ctx.textAlign = 'right'

    // Improved text positioning to better fill segments
    // Position text closer to outer edge for better visibility
    // The larger the segment count, the closer to the edge
    const edgeProximityFactor = Math.min(0.97, 0.92 + (segments.length / 500))
    const textRadius = size * edgeProximityFactor

    // Calculate vertical offset based on segment size
    // Smaller segments need less offset to stay centered
    const verticalOffsetFactor = segments.length >= 50 ? 0 :
                                segments.length >= 30 ? 0.15 :
                                segments.length >= 15 ? 0.2 : 0.25
    const verticalOffset = fontSize * verticalOffsetFactor

    // Dynamic padding based on font size and segment count
    // Smaller segments need less padding
    const paddingFactor = segments.length >= 70 ? 0.08 :
                         segments.length >= 40 ? 0.1 :
                         segments.length >= 20 ? 0.12 : 0.15
    const paddingFromEdge = fontSize * paddingFactor

    // Calculate maximum text length based on available space
    const maxTextLength = (() => {
      if (isMobile) {
        return segments.length >= 50 ? 8 : segments.length >= 30 ? 9 : 10
      } else if (isLargeScreen) {
        return segments.length >= 70 ? 20 : segments.length >= 40 ? 25 : segments.length >= 20 ? 30 : 35
      } else {
        return segments.length >= 70 ? 12 : segments.length >= 40 ? 14 : segments.length >= 20 ? 16 : 18
      }
    })()

    ctx.fillText(
      value.substring(0, maxTextLength),
      textRadius - paddingFromEdge,
      verticalOffset
    )
    ctx.restore()
  }

  var drawWheel = function drawWheel() {
    var ctx = canvasContext
    var lastAngle = angleCurrent
    var len = segments.length
    var PI2 = Math.PI * 2

    // Add shadow effect to the entire wheel
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
    ctx.shadowBlur = 15
    ctx.shadowOffsetX = 5
    ctx.shadowOffsetY = 5

    // Draw outer wheel circle with shadow
    ctx.beginPath()
    ctx.arc(centerX, centerY, size, 0, PI2, false)
    ctx.closePath()
    ctx.lineWidth = 10
    ctx.strokeStyle = primaryColor
    ctx.stroke()

    // Reset shadow for segments
    ctx.restore()

    ctx.lineWidth = 1
    ctx.strokeStyle = primaryColor
    ctx.textAlign = 'center'
    ctx.font = '1em ' + fontFamily

    // Draw segments - no offset needed as 0° is already at the right side
    // in the standard canvas coordinate system
    for (var i = 1; i <= len; i++) {
      var angle = PI2 * (i / len) + angleCurrent
      drawSegment(i - 1, lastAngle, angle)
      lastAngle = angle
    }

    // Draw angle markers (90°, 180°, 270°, 360°/0°)
    // Function to draw angle markers
    const drawAngleMarkers = (ctx: CanvasRenderingContext2D) => {
      const markerLength = size * 0.15; // Length of the marker line
      const textDistance = size * 1.15; // Distance of text from center

      // Save current context state
      ctx.save();

      // Set styles for markers
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'red';
      ctx.fillStyle = 'red';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Draw 0°/360° marker (right)
      ctx.beginPath();
      ctx.moveTo(centerX + size, centerY);
      ctx.lineTo(centerX + size + markerLength, centerY);
      ctx.stroke();
      ctx.fillText('0°/360°', centerX + textDistance, centerY);

      // Draw 90° marker (bottom)
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + size);
      ctx.lineTo(centerX, centerY + size + markerLength);
      ctx.stroke();
      ctx.fillText('90°', centerX, centerY + textDistance);

      // Draw 180° marker (left)
      ctx.beginPath();
      ctx.moveTo(centerX - size, centerY);
      ctx.lineTo(centerX - size - markerLength, centerY);
      ctx.stroke();
      ctx.fillText('180°', centerX - textDistance, centerY);

      // Draw 270° marker (top)
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - size);
      ctx.lineTo(centerX, centerY - size - markerLength);
      ctx.stroke();
      ctx.fillText('270°', centerX, centerY - textDistance);

      // Draw 45° marker (bottom-right)
      ctx.beginPath();
      ctx.moveTo(centerX + size * Math.cos(Math.PI/4), centerY + size * Math.sin(Math.PI/4));
      ctx.lineTo(centerX + (size + markerLength) * Math.cos(Math.PI/4), centerY + (size + markerLength) * Math.sin(Math.PI/4));
      ctx.stroke();
      ctx.fillText('45°', centerX + textDistance * Math.cos(Math.PI/4), centerY + textDistance * Math.sin(Math.PI/4));

      // Draw 135° marker (bottom-left)
      ctx.beginPath();
      ctx.moveTo(centerX - size * Math.cos(Math.PI/4), centerY + size * Math.sin(Math.PI/4));
      ctx.lineTo(centerX - (size + markerLength) * Math.cos(Math.PI/4), centerY + (size + markerLength) * Math.sin(Math.PI/4));
      ctx.stroke();
      ctx.fillText('135°', centerX - textDistance * Math.cos(Math.PI/4), centerY + textDistance * Math.sin(Math.PI/4));

      // Draw 225° marker (top-left)
      ctx.beginPath();
      ctx.moveTo(centerX - size * Math.cos(Math.PI/4), centerY - size * Math.sin(Math.PI/4));
      ctx.lineTo(centerX - (size + markerLength) * Math.cos(Math.PI/4), centerY - (size + markerLength) * Math.sin(Math.PI/4));
      ctx.stroke();
      ctx.fillText('225°', centerX - textDistance * Math.cos(Math.PI/4), centerY - textDistance * Math.sin(Math.PI/4));

      // Draw 315° marker (top-right)
      ctx.beginPath();
      ctx.moveTo(centerX + size * Math.cos(Math.PI/4), centerY - size * Math.sin(Math.PI/4));
      ctx.lineTo(centerX + (size + markerLength) * Math.cos(Math.PI/4), centerY - (size + markerLength) * Math.sin(Math.PI/4));
      ctx.stroke();
      ctx.fillText('315°', centerX + textDistance * Math.cos(Math.PI/4), centerY - textDistance * Math.sin(Math.PI/4));

      // Restore context state
      ctx.restore();
    };

    // Call the function to draw the markers
    // drawAngleMarkers(ctx);

    // Draw center button
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
    ctx.shadowBlur = 10
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2

    ctx.beginPath()
    ctx.arc(centerX, centerY, isMobile ? 35 : 75, 0, PI2, false)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.closePath()

    ctx.restore()

    ctx.fillStyle = primaryColor
    ctx.lineWidth = 10
    ctx.strokeStyle = contrastColor
    ctx.fill()
    ctx.fillStyle = contrastColor
    ctx.textAlign = 'center'

    // Optimize button text size based on screen size
    const buttonFontSize = isMobile ? '0.9em' : isLargeScreen ? '1.2em' : '1em'
    ctx.font = `bold ${buttonFontSize} ${fontFamily}`

    // Improved vertical positioning
    const buttonTextOffset = isMobile ? 2 : 3
    ctx.fillText(buttonText, centerX, centerY + buttonTextOffset)
    ctx.stroke()
  }

  var drawNeedle = function drawNeedle() {
    var ctx = canvasContext
    ctx.lineWidth = 1
    ctx.strokeStyle = contrastColor
    ctx.fillStyle = contrastColor
    ctx.beginPath()
    ctx.closePath()
    ctx.fill()
    ctx.restore()
    // No offset needed as 0° is already at the right side
    var change = angleCurrent;
    var i = segments.length - Math.floor((change / (Math.PI * 2)) * segments.length) - 1
    if (i < 0) i = i + segments.length
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = primaryColor

    // Draw current angle indicator
    const currentAngleDegrees = (angleCurrent * 180 / Math.PI) % 360;
    ctx.save();
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#FF5722'; // Orange color for visibility
    ctx.textAlign = 'center';
    ctx.fillText(`Current: ${currentAngleDegrees.toFixed(2)}°`, centerX, centerY + size + 50);
    ctx.restore();

    // Add subtle text shadow for better readability of result text
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
    ctx.shadowBlur = 3
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1

    // Optimize displayed segment text size based on screen size and text length
    const selectedSegment = segments[i]
    const selectedSegmentLength = selectedSegment ? selectedSegment.length : 0

    // Adjust font size based on text length and screen size
    const resultFontSize = (() => {
      if (isMobile) {
        return selectedSegmentLength > 15 ? '1.1em' : selectedSegmentLength > 10 ? '1.3em' : '1.5em'
      } else if (isLargeScreen) {
        return selectedSegmentLength > 20 ? '1.6em' : selectedSegmentLength > 15 ? '1.8em' : '2em'
      } else {
        return selectedSegmentLength > 15 ? '1.3em' : selectedSegmentLength > 10 ? '1.5em' : '1.7em'
      }
    })()

    ctx.font = `bold ${resultFontSize} ${fontFamily}`

    // Improved positioning for the result text
    const resultXOffset = isMobile ? 5 : 10
    const resultYOffset = isMobile ? 40 : isLargeScreen ? 60 : 50

    currentSegment = i
    isStarted && ctx.fillText(
      segments[currentSegment],
      centerX + resultXOffset,
      centerY + size + resultYOffset
    )
  }

  var clear = function clear() {
    var canvas = document.getElementById('canvas')
    var ctx = canvasContext
    ctx.clearRect(0, 0, (canvas as any).width, (canvas as any).height)
  }

  // Initialize audio in useEffect
  React.useEffect(() => {
    // Create new audio instance
    applauseAudioRef.current = new Audio(applauseSound)

    // Clean up on unmount
    return () => {
      if (applauseAudioRef.current) {
        applauseAudioRef.current.pause()
        applauseAudioRef.current = null
      }
    }
  }, [])

  // Add cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (timerHandle) {
        clearInterval(timerHandle)
      }
      resetWheel()
    }
  }, [])

  if (names.trim() === '') return <Header>Enter some names to get started</Header>
  else
    return (
      <>
        {/* Confetti - with unique key to prevent React warnings */}
        <ConfettiExplosion key={`confetti-${confettiKey}`} ref={confettiButton} />
        <div
          id='wheel'
          style={{
            width: `${centerX * 2}px`,
            height: `${centerY * 2}px`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            transform: 'rotate(0deg)',
            position: 'relative',
            marginTop: '60px',
            marginBottom: '20px',
            padding: '10px'
          }}
        >
          <canvas
            ref={canvasRef}
            id='canvas'
            width={centerX * 2}
            height={centerY * 2}
            style={{
              pointerEvents: isFinished && isOnlyOnce ? 'none' : 'auto',
              textAlign: 'center',
              animation: wheelClicked ? '' : 'rotateAnimation 15s linear infinite'
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: isMobile ? '152px' : '258px',
              right: '0px',
              transform: 'rotate(0deg)',
              overflow: 'hidden',
              zIndex: 10
            }}
          >
            <div
              style={{
                background: '#333333',
                width: `${size * 0.12}px`,
                height: `${size * 0.1}px`,
                clipPath: 'polygon(100% 0%, 30% 50%, 100% 100%)',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.5)'
              }}
            ></div>
          </div>

          {/* SVG Text */}
          {!wheelClicked && (
            <>
              <svg
                viewBox='0 0 380 380'
                style={{
                  position: 'absolute',
                  top: 7,
                  left: 5,
                  transform: 'rotate(32deg)'
                }}
                onClick={() => {
                  spin()
                }}
              >
                <path
                  id='curve'
                  d='M73.2,148.6c4-6.1,65.5-96.8,178.6-95.6c111.3,1.2,170.8,90.3,175.1,97'
                  fill='transparent'
                />
                <text width='500'>
                  <textPath
                    xlinkHref='#curve'
                    style={{
                      fontSize: '28px',
                      fontWeight: 400,
                      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
                      letterSpacing: '2px'
                    }}
                    fill='#fff'
                  >
                    Click to spin
                  </textPath>
                </text>
              </svg>
              {/* Bottom "or press ctrl+enter" text */}
              <svg
                viewBox='0 0 220 220'
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '0',
                  transform: isMobile?`translate(-1%, -45px) rotate(91deg)`:`translate(-1%, -80px) rotate(91deg)`,
                }}
                onClick={() => {
                  spin()
                }}
              >
                <path
                  fill='transparent'
                  d="M0,110a110,110 0 1,0 220,0a110,110 0 1,0 -220,0"
                />
                <path
                  fill="none"
                  id="innerCircle"
                  d="M10,110a100,100 0 1,0 200,0a100,100 0 1,0 -200,0"
                />
                <text>
                  <textPath
                    xlinkHref="#innerCircle"
                    startOffset="50%"
                    style={{
                      fontSize: '18px',
                      fontWeight: 300,
                      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
                      letterSpacing: 'normal',
                      textAnchor: 'middle'
                    }}
                    fill='#fff'
                  >
                    or press ctrl+enter
                  </textPath>
                </text>
              </svg>
            </>
          )}
        </div>
      </>
    )
}

export default WheelComponent