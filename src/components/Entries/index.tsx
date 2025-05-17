import styled from 'styled-components'
import ShuffleIcon from '@mui/icons-material/Shuffle'
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha'
import ColorLensIcon from '@mui/icons-material/ColorLens'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteIcon from '@mui/icons-material/Delete'
import Modal from '@mui/material/Modal'
import Tooltip from '@mui/material/Tooltip'
import { useState, useRef, useMemo, useEffect, KeyboardEvent } from 'react'
import { setNames, setColors, themes } from '../../store/wheel'
import { useAppDispatch, useAppSelector } from '../../hooks/store'

const Entries = ({ setRiggedName }) => {
  const dispatch = useAppDispatch()
  const { names, colors } = useAppSelector(state => state.wheel)
  const loading = useAppSelector(state => state.wheel.loading)
  const [showWinnerModal, setShowWinnerModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [feedback, setFeedback] = useState({ show: false, message: '' })
  const searchInputRef = useRef(null)

  const getSelectedArr = () => {
    let selected = 'Custom'
    Object.keys(themes).forEach(key => {
      if (JSON.stringify(themes[key]) === JSON.stringify(colors)) selected = key
    })
    return selected
  }
  const selectedKey = getSelectedArr()
  const [selected, setSelected] = useState(selectedKey)
  const [_custom, setCustom] = useState(selectedKey === 'Custom' ? colors : themes[selectedKey])

  const inputRef = useRef()

  // Show feedback message temporarily
  useEffect(() => {
    if (feedback.show) {
      const timer = setTimeout(() => {
        setFeedback({ show: false, message: '' })
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [feedback])

  // Focus search input when search is shown
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  const onNameChange = useMemo(() => {
    return (riggedName: string | undefined, namesArray: string[]) => {
      // We'll only set a rigged name if explicitly passed
      // (not from comma detection in the input field)
      if (riggedName) {
        // Remove commas from the rigged name for consistent matching
        const cleanRiggedName = riggedName.replace(/,/g, '')
        setRiggedName(cleanRiggedName)
        setFeedback({ show: true, message: `"${cleanRiggedName}" will win next spin` })
      }

      // Process all names - ensure only one comma per line
      const cleanNames = namesArray
        .map((name: string) => {
          // Trim whitespace
          const trimmedName = name.trim()

          // Ensure only one comma per line (same logic as removeCommaFromString)
          const firstCommaIndex = trimmedName.indexOf(',')
          if (firstCommaIndex === -1) return trimmedName // No comma in this line

          // Keep everything before the first comma, the comma itself, and everything after but with commas removed
          const beforeComma = trimmedName.substring(0, firstCommaIndex)
          const afterComma = trimmedName.substring(firstCommaIndex + 1).replace(/,/g, '')
          return beforeComma + ',' + afterComma
        })
        .join('\n')

      localStorage.setItem(
        'names',
        cleanNames.trim() !== ''
          ? cleanNames
          : 'Ali\nBeatriz\nCharles\nDiya\nEric\nFatima\nGabriel\nHanna\n'
      )
      dispatch(setNames(cleanNames))

      // Only show feedback if not setting a rigged name
      if (!riggedName && namesArray.length > 0) {
        setFeedback({ show: true, message: 'Entries updated' })
      }
    }
  }, [dispatch, setRiggedName])

  // Define sort and shuffle functions first
  const handleSortClick = () => {
    const namesArray = names.split('\n')
    let filteredNames = namesArray.filter(name => name !== '')

    // Sort the names with numbers first, then text alphabetically
    filteredNames.sort((a, b) => {
      // For sorting purposes, use the part before the comma if it exists
      const aForSort = a.split(',')[0].trim()
      const bForSort = b.split(',')[0].trim()

      const numA = parseFloat(aForSort)
      const numB = parseFloat(bForSort)

      // Check if both are numbers
      const isNumA = !isNaN(numA)
      const isNumB = !isNaN(numB)

      // If both are numbers, sort numerically
      if (isNumA && isNumB) {
        return numA - numB
      }

      // If a is a number and b is not, a comes first
      if (isNumA) return -1

      // If b is a number and a is not, b comes first
      if (isNumB) return 1

      // Otherwise, sort alphabetically
      return aForSort.toLowerCase().localeCompare(bForSort.toLowerCase())
    })

    dispatch(setNames(filteredNames.join('\n')))
    setFeedback({ show: true, message: 'Entries sorted' })
  }

  const handleShuffleClick = () => {
    const namesArray = names.split('\n')
    const filteredNames = namesArray.filter(name => name !== '')
    const shuffledNames = filteredNames.sort(() => Math.random() - 0.5)
    dispatch(setNames(shuffledNames.join('\n')))
    setFeedback({ show: true, message: 'Entries shuffled' })
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process if not in an input field
      if ((e.target as HTMLElement).tagName !== 'TEXTAREA' && (e.target as HTMLElement).tagName !== 'INPUT') {
        if (e.ctrlKey || e.metaKey) {
          if (e.key === 'f') {
            e.preventDefault()
            setShowSearch(prev => !prev)
          } else if (e.key === 's') {
            e.preventDefault()
            handleSortClick()
          } else if (e.key === 'r') {
            e.preventDefault()
            handleShuffleClick()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown as any)
    return () => window.removeEventListener('keydown', handleKeyDown as any)
  }, [handleSortClick, handleShuffleClick])

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all entries?')) {
      dispatch(setNames(''))
      setFeedback({ show: true, message: 'All entries cleared' })
    }
  }

  const handleCopyToClipboard = () => {
    const namesArray = names.split('\n')
    const filteredNames = namesArray.filter(name => name !== '')
    // Keep commas in the clipboard text - they're allowed in the textarea
    navigator.clipboard.writeText(filteredNames.join('\n'))
    setFeedback({ show: true, message: 'Copied to clipboard' })
  }

  const toggleSearch = () => {
    setShowSearch(prev => !prev)
    if (!showSearch) {
      setSearchTerm('')
    }
  }


  const handleChangeColorClick = () => {
    setShowWinnerModal(true)
  }

  // Function to ensure only one comma per line in the textarea
  function removeCommaFromString(str: string) {
    if (!str) return str;

    // Split by lines, process each line to have at most one comma, then rejoin
    const lines = str.split('\n');
    const processedLines = lines.map(line => {
      const firstCommaIndex = line.indexOf(',');
      if (firstCommaIndex === -1) return line; // No comma in this line

      // Keep everything before the first comma, the comma itself, and everything after but with commas removed
      const beforeComma = line.substring(0, firstCommaIndex);
      const afterComma = line.substring(firstCommaIndex + 1).replace(/,/g, '');
      return beforeComma + ',' + afterComma;
    });

    return processedLines.join('\n');
  }

  // Filter entries based on search term
  const filteredNames = useMemo(() => {
    if (!searchTerm) return names

    const namesArray = names.split('\n')
    const filtered = namesArray.filter(name => {
      // Search in the entire name including any comma parts
      return name.toLowerCase().includes(searchTerm.toLowerCase())
    })
    return filtered.join('\n')
  }, [names, searchTerm])

  return (
    <ControlsContainer>
      {/* Feedback message */}
      {feedback.show && (
        <FeedbackMessage>
          {feedback.message}
        </FeedbackMessage>
      )}

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
            width: 400,
            borderRadius: 10,
            overflow: 'hidden',
            backgroundColor: '#12151C',
            padding: '20px',
            maxHeight: '500px',
            overflowY: 'scroll'
          }}
        >
          {Object.entries(themes).map(([key, value]) => (
            <div key={key}>
              <p className='mb-2'>{key}</p>
              {Object.entries(value).map(([title, colorSet]) => (
                <Menu
                  key={title}
                  onClick={() => {
                    dispatch(setColors(colorSet))
                    localStorage.setItem('theme', JSON.stringify(colorSet))
                    setSelected(title)
                    setCustom(colorSet)
                    setFeedback({ show: true, message: 'Theme updated' })
                  }}
                  style={{ background: selected === key ? '#272e3d' : '' }}
                >
                  <p style={{ width: '200px' }}>{title}:</p>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    {colorSet.map((color, i) => (
                      <div
                        key={i}
                        style={{
                          borderRadius: 5,
                          height: '20px',
                          width: '20px',
                          background: color,
                          border: '1px solid white'
                        }}
                      />
                    ))}
                  </div>
                </Menu>
              ))}
            </div>
          ))}
        </div>
      </Modal>

      {/* Action buttons */}
      <ButtonContainer>
        <Tooltip title="Shuffle entries (Ctrl+R)">
          <Button onClick={handleShuffleClick}>
            <ShuffleIcon sx={{ marginRight: '2px', width: '20px' }} />
            Shuffle
          </Button>
        </Tooltip>
        <Tooltip title="Sort entries (Ctrl+S)">
          <Button onClick={handleSortClick}>
            <SortByAlphaIcon sx={{ marginRight: '2px', width: '20px' }} />
            Sort
          </Button>
        </Tooltip>
        <Tooltip title="Customize wheel colors">
          <Button onClick={handleChangeColorClick}>
            <ColorLensIcon sx={{ marginRight: '2px', width: '20px' }} />
            Customize
          </Button>
        </Tooltip>
        <div className="flex-grow"></div>
        <Tooltip title="Search entries (Ctrl+F)">
          <Button
            onClick={toggleSearch}
            className={showSearch ? 'active-button' : ''}
          >
            <SearchIcon sx={{ marginRight: '2px', width: '20px' }} />
          </Button>
        </Tooltip>
        <Tooltip title="Copy all entries">
          <Button onClick={handleCopyToClipboard}>
            <ContentCopyIcon sx={{ marginRight: '2px', width: '20px' }} />
          </Button>
        </Tooltip>
        <Tooltip title="Clear all entries">
          <Button onClick={handleClearAll}>
            <DeleteIcon sx={{ marginRight: '2px', width: '20px' }} />
          </Button>
        </Tooltip>
      </ButtonContainer>

      {/* Search bar */}
      {showSearch && (
        <SearchContainer>
          <SearchIcon sx={{ color: '#999', marginRight: '8px' }} />
          <SearchInput
            ref={searchInputRef}
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <ClearButton onClick={() => setSearchTerm('')}>
              <ClearIcon sx={{ width: '16px', height: '16px' }} />
            </ClearButton>
          )}
        </SearchContainer>
      )}

      {/* Entry count */}
      <EntryCount>
        {names.split('\n').filter(name => name.trim() !== '').length} entries
        {searchTerm && ` (${filteredNames.split('\n').filter(name => name.trim() !== '').length} matching)`}
      </EntryCount>

      {/* Input box */}
      <InputBoxContainer>
        <InputBox
          disabled={loading}
          ref={inputRef}
          placeholder='Enter names, each on a new line'
          value={searchTerm ? filteredNames : removeCommaFromString(names)}
          onChange={e => {
            if (searchTerm) {
              setSearchTerm('')
            }

            // Get the current value and cursor position
            const { value, selectionStart } = e.target

            // Process the value to ensure only one comma per line
            const processedValue = removeCommaFromString(value)

            // Only update if the processed value is different from the input value
            if (processedValue !== value) {
              // Calculate how many characters were removed at or before the cursor position
              const beforeCursor = value.substring(0, selectionStart)
              const processedBeforeCursor = removeCommaFromString(beforeCursor)
              const cursorOffset = beforeCursor.length - processedBeforeCursor.length

              // Set the processed value and adjust cursor position
              e.target.value = processedValue

              // Adjust cursor position to account for removed commas
              const newCursorPosition = Math.max(0, selectionStart - cursorOffset)
              setTimeout(() => {
                e.target.selectionStart = newCursorPosition
                e.target.selectionEnd = newCursorPosition
              }, 0)
            }

            const namesArray = processedValue.split('\n')

            // Process entries for the wheel
            onNameChange(undefined, namesArray)
          }}
          onKeyDown={e => {
            // Handle special keys like Enter
            if (e.key === 'Enter' && !e.shiftKey) {
              // Let the default behavior happen (add a new line)
              // No need to prevent default
            }
          }}
        />
        <LineNumbers>
          {(searchTerm ? filteredNames : names).split('\n').map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </LineNumbers>
      </InputBoxContainer>

      {/* Keyboard shortcuts help */}
      <KeyboardShortcuts>
        <div>Keyboard shortcuts:</div>
        <div>Ctrl+F: Search</div>
        <div>Ctrl+S: Sort</div>
        <div>Ctrl+R: Shuffle</div>
      </KeyboardShortcuts>
    </ControlsContainer>
  )
}

const ControlsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  & > * {
    width: 100%;
    margin-bottom: 12px;
  }
`

const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`

const Button = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  background-color: #4c4c4c;
  color: #fff;
  border: 1px solid ${props => props.theme.colors.dark};
  font-size: 12px;
  cursor: pointer;
  transition: 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #666666;
  }

  &:active, &.active-button {
    background-color: #777777;
    transform: translateY(1px);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
  }
`

const Menu = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 10px;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background-color: #333333;
  }
`

const InputBoxContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
`

const LineNumbers = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 30px;
  padding: 10px 0;
  background-color: #333;
  color: #888;
  font-size: 12px;
  text-align: right;
  user-select: none;
  border-radius: 5px 0 0 5px;
  overflow: hidden;

  div {
    padding-right: 5px;
    height: 21px;
    line-height: 21px;
  }
`

const InputBox = styled.textarea`
  width: 100%;
  height: 100%;
  padding: 10px 10px 10px 35px;
  margin-bottom: 10px;
  border: 1px solid #bbbbbb;
  border-radius: 5px;
  background-color: #2a2a2a;
  color: white;
  font-size: 16px;
  resize: none;
  line-height: 21px;

  &:hover {
    border: 1px solid #fff;
  }

  &:focus {
    outline: none;
    border-color: #5c86e9;
    box-shadow: 0 0 0 1px #5c86e9;
  }

  &::placeholder {
    color: #999;
  }
`

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #333;
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 10px;
  border: 1px solid #444;
`

const SearchInput = styled.input`
  background: transparent;
  border: none;
  color: white;
  flex-grow: 1;
  font-size: 14px;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: #999;
  }
`

const ClearButton = styled.button`
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;

  &:hover {
    color: white;
  }
`

const FeedbackMessage = styled.div`
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #5c86e9;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  animation: fadeInOut 2000000s ease-in-out;
  z-index: 100;

  @keyframes fadeInOut {
    0% { opacity: 0; transform: translate(-50%, 10px); }
    10% { opacity: 1; transform: translate(-50%, 0); }
    90% { opacity: 1; transform: translate(-50%, 0); }
    100% { opacity: 0; transform: translate(-50%, -10px); }
  }
`

const EntryCount = styled.div`
  font-size: 12px;
  color: #999;
  text-align: right;
  margin-top: -8px;
  margin-bottom: 4px;
`

const KeyboardShortcuts = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 11px;
  color: #777;
  margin-top: 8px;
  justify-content: center;
`

export default Entries
