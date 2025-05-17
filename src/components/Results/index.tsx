import styled from 'styled-components'
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha'
import ClearIcon from '@mui/icons-material/Clear'
import DeleteIcon from '@mui/icons-material/Delete'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import SearchIcon from '@mui/icons-material/Search'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import Tooltip from '@mui/material/Tooltip'
import { useState, useEffect, useRef, useMemo } from 'react'

type Props = {
  names: string[]
  setWinners: (names: string[]) => void
}

type WinnerWithTimestamp = {
  name: string
  timestamp: number
}

const Results = ({ names, setWinners }: Props) => {
  const [winnersWithTime, setWinnersWithTime] = useState<WinnerWithTimestamp[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [feedback, setFeedback] = useState({ show: false, message: '' })
  const searchInputRef = useRef(null)

  // Convert plain names to objects with timestamps when component mounts or names change
  useEffect(() => {
    // Check if we already have timestamps for these names
    if (names.length === winnersWithTime.length &&
        names.every(name => winnersWithTime.some(w => w.name === name))) {
      return // No need to update
    }

    // Keep existing timestamps if available, add new ones for new names
    const updatedWinners = names.map(name => {
      const existing = winnersWithTime.find(w => w.name === name)
      return existing || { name, timestamp: Date.now() }
    })

    setWinnersWithTime(updatedWinners)
  }, [names])

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

  const handleSortClick = () => {
    // Sort by name alphabetically
    const sortedWinners = [...winnersWithTime].sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    )
    setWinnersWithTime(sortedWinners)
    setWinners(sortedWinners.map(w => w.name))
    setFeedback({ show: true, message: 'Results sorted alphabetically' })
  }

  const handleSortByTimeClick = () => {
    // Sort by timestamp (newest first)
    const sortedWinners = [...winnersWithTime].sort((a, b) => b.timestamp - a.timestamp)
    setWinnersWithTime(sortedWinners)
    setWinners(sortedWinners.map(w => w.name))
    setFeedback({ show: true, message: 'Results sorted by time' })
  }

  const resetWinners = () => {
    if (window.confirm('Are you sure you want to clear all results?')) {
      setWinners([])
      setWinnersWithTime([])
      setFeedback({ show: true, message: 'All results cleared' })
    }
  }

  const removeWinner = (nameToRemove: string) => {
    const updatedWinners = winnersWithTime.filter(w => w.name !== nameToRemove)
    setWinnersWithTime(updatedWinners)
    setWinners(updatedWinners.map(w => w.name))
    setFeedback({ show: true, message: 'Result removed' })
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(names.join('\n'))
    setFeedback({ show: true, message: 'Copied to clipboard' })
  }

  const handleExport = () => {
    // Create CSV content
    const csvContent = 'data:text/csv;charset=utf-8,' +
      'Name,Time\n' +
      winnersWithTime.map(w => {
        const date = new Date(w.timestamp)
        return `"${w.name}","${date.toLocaleString()}"`
      }).join('\n')

    // Create download link
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'wheel_results.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setFeedback({ show: true, message: 'Results exported' })
  }

  const toggleSearch = () => {
    setShowSearch(prev => !prev)
    if (!showSearch) {
      setSearchTerm('')
    }
  }

  function removeCommaFromString(str: string) {
    return str.replace(/,/g, ''); // Removes all commas
  }

  // Filter results based on search term
  const filteredWinners = useMemo(() => {
    if (!searchTerm) return winnersWithTime

    return winnersWithTime.filter(winner =>
      winner.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [winnersWithTime, searchTerm])

  // Check for duplicates
  const hasDuplicates = useMemo(() => {
    const nameCount: Record<string, number> = {}
    for (const winner of winnersWithTime) {
      nameCount[winner.name] = (nameCount[winner.name] || 0) + 1
    }
    return Object.values(nameCount).some(count => count > 1)
  }, [winnersWithTime])

  // Format timestamp to readable format
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <ControlsContainer>
      {/* Feedback message */}
      {feedback.show && (
        <FeedbackMessage>
          {feedback.message}
        </FeedbackMessage>
      )}

      <ButtonContainer>
        <Tooltip title="Sort alphabetically">
          <Button onClick={handleSortClick}>
            <SortByAlphaIcon sx={{ marginRight: '5px', width: '20px' }} />
            Sort
          </Button>
        </Tooltip>
        <Tooltip title="Sort by time (newest first)">
          <Button onClick={handleSortByTimeClick}>
            <AccessTimeIcon sx={{ marginRight: '5px', width: '20px' }} />
            By Time
          </Button>
        </Tooltip>
        <Tooltip title="Clear all results">
          <Button onClick={resetWinners}>
            <ClearIcon sx={{ marginRight: '5px', width: '20px' }} />
            Clear
          </Button>
        </Tooltip>
        <div className="flex-grow"></div>
        <Tooltip title="Search results">
          <Button
            onClick={toggleSearch}
            className={showSearch ? 'active-button' : ''}
          >
            <SearchIcon sx={{ marginRight: '2px', width: '20px' }} />
          </Button>
        </Tooltip>
        <Tooltip title="Copy results">
          <Button onClick={handleCopyToClipboard}>
            <ContentCopyIcon sx={{ marginRight: '2px', width: '20px' }} />
          </Button>
        </Tooltip>
        <Tooltip title="Export as CSV">
          <Button onClick={handleExport}>
            <FileDownloadIcon sx={{ marginRight: '2px', width: '20px' }} />
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
            placeholder="Search results..."
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

      {/* Results count */}
      <ResultsCount>
        {winnersWithTime.length} results
        {searchTerm && ` (${filteredWinners.length} matching)`}
        {hasDuplicates && <span className="duplicate-warning"> • Contains duplicates</span>}
      </ResultsCount>

      <ResultsBox>
        {filteredWinners.length > 0 ? (
          filteredWinners.map(winner => (
            <ResultItem key={`${winner.name}-${winner.timestamp}`}>
              <ResultContent>
                <ResultName isDuplicate={winnersWithTime.filter(w => w.name === winner.name).length > 1}>
                  {removeCommaFromString(winner.name)}
                </ResultName>
                <ResultTime>{formatTime(winner.timestamp)}</ResultTime>
              </ResultContent>
              <DeleteButton onClick={() => removeWinner(winner.name)}>
                <DeleteIcon sx={{ width: '16px', height: '16px' }} />
              </DeleteButton>
            </ResultItem>
          ))
        ) : (
          <EmptyState>
            {names.length === 0 ? 'No results yet. Spin the wheel to see winners here!' : 'No matching results found.'}
          </EmptyState>
        )}
      </ResultsBox>
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

const ResultsBox = styled.div`
  width: 100%;
  height: 100%;
  padding: 0;
  margin-bottom: 10px;
  border: 1px solid #bbbbbb;
  border-radius: 5px;
  background-color: #2a2a2a;
  color: white;
  font-size: 16px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #333;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #555;
    border-radius: 4px;
  }

  &:focus {
    outline: none;
  }
`

const ResultItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid #444;
  transition: background-color 0.2s;

  &:hover {
    background-color: #333;
  }

  &:last-child {
    border-bottom: none;
  }
`

const ResultContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
`

const ResultName = styled.div<{ isDuplicate: boolean }>`
  font-size: 16px;
  font-weight: ${props => props.isDuplicate ? '500' : '400'};
  color: ${props => props.isDuplicate ? '#ffcc00' : 'white'};

  ${props => props.isDuplicate && `
    &::after {
      content: " ★";
      color: #ffcc00;
    }
  `}
`

const ResultTime = styled.div`
  font-size: 12px;
  color: #999;
  margin-left: 12px;
`

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  color: #777;
  cursor: pointer;
  padding: 4px;
  margin-left: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #ff5555;
    background-color: rgba(255, 85, 85, 0.1);
  }
`

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #999;
  font-size: 14px;
  text-align: center;
  padding: 0 20px;
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
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #5c86e9;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  animation: fadeInOut 2s ease-in-out;
  z-index: 100;

  @keyframes fadeInOut {
    0% { opacity: 0; transform: translate(-50%, 10px); }
    10% { opacity: 1; transform: translate(-50%, 0); }
    90% { opacity: 1; transform: translate(-50%, 0); }
    100% { opacity: 0; transform: translate(-50%, -10px); }
  }
`

const ResultsCount = styled.div`
  font-size: 12px;
  color: #999;
  text-align: right;
  margin-top: -8px;
  margin-bottom: 4px;

  .duplicate-warning {
    color: #ffcc00;
  }
`

export default Results
