import { useState, memo, useLayoutEffect, useRef, ElementRef } from 'react'
import { WheelComponent } from '../../../components'
import Modal from '@mui/material/Modal'
import { Tooltip } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import { FaPencilAlt } from 'react-icons/fa'
import Button from '@mui/material/Button'

import { useAppDispatch, useAppSelector } from '../../../hooks/store'
import { setNames, setLoading } from '../../../store/wheel'
import Sidebar from './Sidebar'
import { cn } from '../../../utils'

const Content = () => {
  // STATES
  const dispatch = useAppDispatch()
  const { names } = useAppSelector(state => state.wheel)

  // Hide sidebar
  const [hideSidebar, setHideSidebar] = useState(false)

  // title & description
  const [wheelInfo, SetWheelInfo] = useState<{ title: string; description: string }>({
    title: 'The Title',
    description: 'The Description'
  })
  const [wheelModal, setWheelModal] = useState(false)
  const wheelTitleInput = useRef<ElementRef<'input'>>(null)
  const wheelDescriptionInput = useRef<ElementRef<'textarea'>>(null)

  function onSaveWheelInfo() {
    setWheelInfo(wheelTitleInput.current.value, wheelDescriptionInput.current.value)
    setWheelModal(false)
  }

  function setWheelInfo(title: string, description: string) {
    title = title || ''
    description = description || ''
    if (title) {
      document.querySelector('title').innerText = title
    }
    SetWheelInfo({ title, description })
    localStorage.setItem('wheel_title', title)
    localStorage.setItem('wheel_description', description)
  }

  // getting title & description from localstorage
  useLayoutEffect(() => {
    const title = localStorage.getItem('wheel_title')
    const description = localStorage.getItem('wheel_description')

    setWheelInfo(title, description)
  }, [])

  const [winner, setWinner] = useState('')
  const [winnerColor, setWinnerColor] = useState('')
  const [winners, setWinners] = useState<string[]>([])
  const [showWinnerModal, setShowWinnerModal] = useState(false)
  const [riggedName, setRiggedName] = useState('')
  const [winnerIndex, setWinnerIndex] = useState<number>(-1)

  // State for the stopping angle display
  const [stoppingAngle, setStoppingAngle] = useState<{
    angle: number;
    segmentIndex: number;
    segmentName: string;
  } | null>(null)

  // function to remove the winner from the list
  const removeWinner = () => {
    const namesArray = names.split('\n')
    const filteredNames = namesArray.filter(name => name !== '')

    // Use the stored winner index if available
    let indexToRemove = winnerIndex

    // If we don't have a stored index, try to find the name in the list
    if (indexToRemove === -1) {
      // Find the original name with comma if it exists
      // We need to find the name that, when commas are removed, matches the winner

      // First, check if this is a name that had commas removed
      for (let i = 0; i < filteredNames.length; i++) {
        const nameWithoutComma = filteredNames[i].replace(/,/g, '')
        if (nameWithoutComma === winner) {
          // Found the original name with commas
          indexToRemove = i
          break
        }
      }

      // If we didn't find a match with commas, use the regular indexOf
      if (indexToRemove === -1) {
        indexToRemove = filteredNames.indexOf(winner)
      }
    }

    // Log for debugging

    if (indexToRemove !== -1) {
      filteredNames.splice(indexToRemove, 1)
      dispatch(setNames(filteredNames.join('\n')))
    } else {
      console.error(`Could not find winner "${winner}" in the list`)
    }

    // Reset states
    setRiggedName('')
    setWinnerIndex(-1)
    setShowWinnerModal(false)
  }

  // We no longer need to remove commas from names
  function removeCommaFromString(str: string) {
    return str; // Return the string as is
  }

  return (
    <>

      <Modal
        open={showWinnerModal}
        onClose={() => {
          setShowWinnerModal(false)
        }}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70%',
            maxWidth: '640px',
            borderRadius: 10,
            overflow: 'hidden',
            outline: 'none'
          }}
        >
          <div
            style={{
              width: '100%',
              background: winnerColor,
              padding: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              color: 'black'
            }}
          >
            <p style={{ fontSize: '20px', fontWeight: '500', color: 'white' }}>We have a winner!</p>
            <ClearIcon
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setShowWinnerModal(false)
              }}
            />
          </div>
          <div style={{ backgroundColor: '#12151C', color: '#fff' }}>
            <p style={{ fontSize: '40px', padding: '20px' }}>{removeCommaFromString(winner)}</p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 20,
                padding: 10
              }}
            >
              <button onClick={() => setShowWinnerModal(false)}>Close</button>
              <button
                style={{ background: '#5c86e9', padding: '10px', borderRadius: '10px' }}
                onClick={() => removeWinner()}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        open={wheelModal}
        onClose={() => {
          setWheelModal(false)
        }}
        aria-labelledby='modal-modal-title1'
        aria-describedby='modal-modal-description1'
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70%',
            maxWidth: '640px',
            borderRadius: 10,
            overflow: 'hidden',
            backgroundColor: '#1d1d1d',
            padding: '16px'
          }}
        >
          <h2 className='mb-8 text-[20px]'>
            <FaPencilAlt className='mr-1 inline' />{' '}
            <span className='font-medium'>Edit title and description</span>
          </h2>
          <input
            type='text'
            placeholder='Title'
            className='block w-full rounded bg-[#424242] p-4'
            ref={wheelTitleInput}
            defaultValue={wheelInfo.title}
          />
          <div className='h-6'></div>
          <textarea
            rows={5}
            placeholder='Description'
            className='block w-full rounded bg-[#424242] p-4'
            ref={wheelDescriptionInput}
            defaultValue={wheelInfo.description}
          />
          <div className='h-8'></div>
          <div className='flex justify-end gap-2'>
            <Button variant='text' sx={{ color: 'white' }} onClick={() => setWheelModal(false)}>
              Cancel
            </Button>
            <Button variant='contained' onClick={onSaveWheelInfo}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
      {/* Wheel Title & Description */}
      <div className='h-full p-4 absolute z-10'>
        <h2 className=''>
          <span className='text-[32px] font-[400]'>{wheelInfo.title}</span>
          <Tooltip title='Edit title and description' sx={{ fontSize: '16px' }}>
            <button
              className={cn(
                wheelInfo.title ? 'ml-4' : '',
                'inline-flex h-[38px] w-[38px] items-center justify-center rounded-full bg-primary'
              )}
              onClick={() => setWheelModal(true)}
            >
              <FaPencilAlt />
            </button>
          </Tooltip>
        </h2>
        <p className='mt-2 text-base'>{wheelInfo.description}</p>
      </div>
      <div className='leftContainer relative col-span-3 flex flex-col items-center justify-center'>
     

        <WheelComponent
          winningSegment={riggedName}
          onFinished={(winner: string, color: string, finalAngle?: number, segmentIndex?: number, originalIndex?: number) => {
            dispatch(setLoading(false))
            setWinnerColor(color)
            setWinner(winner)
            setWinners(prev => [...prev, winner])

            // Store the original index for removal
            if (originalIndex !== undefined) {
              // Store the original index as a data attribute on the winner
              // This will be used when removing the winner
              setWinnerIndex(originalIndex)
            }

            // Set the stopping angle for display
            if (finalAngle !== undefined && segmentIndex !== undefined) {
              // Convert from radians to degrees
              // Show 360° instead of 0° for better clarity when the wheel completes exactly 10 rotations
              const angleDegrees = finalAngle === 0 ? 360 : (finalAngle * 180 / Math.PI) % 360;
              setStoppingAngle({
                angle: angleDegrees,
                segmentIndex: segmentIndex,
                segmentName: winner
              });
            }

            setTimeout(() => {
              setShowWinnerModal(true)
            }, 500)
          }}
          primaryColor='transparent'
          contrastColor='#ffffff'
          buttonText=''
          isOnlyOnce={false}
          upDuration={50}
          downDuration={400}
          fontFamily='Helvetica'
        />
      </div>
      <div className='relative h-full w-full p-5 min-w-[400px]'>
        <div className='absolute right-5 top-12 z-10'>
          <label htmlFor='hide-checkbox' className='cursor-pointer'>
            <input
              type='checkbox'
              id='hide-checkbox'
              className='cursor-pointer bg-transparent'
              onChange={e => setHideSidebar(e.target.checked)}
              checked={hideSidebar}
            />{' '}
            <span className='select-none'>Hide</span>
          </label>
        </div>
        <div className={`flex ${hideSidebar ? 'hidden' : ''}`}>
          <Sidebar winners={winners} setWinners={setWinners} setRiggedName={setRiggedName} />
        </div>
      </div>
    </>
  )
}

export default memo(Content)
