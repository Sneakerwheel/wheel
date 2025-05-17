import { useState, memo, useEffect } from 'react'
import { Entries, Results } from '../../../../components'
import PropTypes from 'prop-types'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { useAppSelector } from '../../../../hooks/store'
import { useMediaQuery } from '@mui/material'
import { cn } from '../../../../utils'

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  [key: string]: any;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      className={cn(
        'transition-opacity duration-300',
        value === index ? 'opacity-100' : 'opacity-0'
      )}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  )
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  }
}
interface SidebarProps {
  winners: string[];
  setWinners: (winners: string[]) => void;
  setRiggedName: (name: string) => void;
}

const Sidebar = ({ winners, setWinners, setRiggedName }: SidebarProps) => {
  const [value, setValue] = useState(0)
  const isMobile = useMediaQuery('(max-width: 600px)')
  const [tabAnimation, setTabAnimation] = useState('')

  const handleChange = (_: any, newValue: number) => {
    // Add animation class when changing tabs
    setTabAnimation('animate-tab-change')
    setTimeout(() => setTabAnimation(''), 300)
    setValue(newValue)
  }

  // Auto-switch to Results tab when a new winner is added
  useEffect(() => {
    if (winners.length > 0 && value !== 1) {
      setValue(1)
    }
  }, [winners.length])

  function Badge({ value }: { value: number }) {
    return (
      <div
        className={cn(
          'flex justify-center items-center w-5 h-5 rounded-full ml-2 text-xs font-bold',
          'bg-[#757575] transition-all duration-300',
          value > 0 ? 'scale-100' : 'scale-90 opacity-70'
        )}
      >
        {value}
      </div>
    )
  }

  const { names } = useAppSelector(state => state.wheel)

  const getLength = () => {
    const namesArray = names.split('\n')
    const filteredNames = namesArray.filter(name => name !== '')
    const uniqueNames = Array.from(new Set(filteredNames))
    return uniqueNames.length
  }

  return (
    <Box className={cn('w-full z-10', tabAnimation)}>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label='wheel tabs'
        variant={isMobile ? 'fullWidth' : 'standard'}
        TabIndicatorProps={{
          style: {
            backgroundColor: 'white',
            height: '3px',
            borderRadius: '3px 3px 0 0'
          }
        }}
        sx={{
          '& .MuiTabs-flexContainer': {
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          },
          '& .Mui-selected': {
            color: 'white !important',
            fontWeight: 'bold !important'
          }
        }}
      >
        <Tab
          label='Entries'
          {...a11yProps(0)}
          sx={{
            paddingLeft: '8px',
            paddingRight: '8px',
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: '14px',
            transition: 'all 0.3s',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'white'
            }
          }}
          icon={<Badge value={getLength()} />}
          iconPosition='end'
        />
        <Tab
          label='Results'
          {...a11yProps(1)}
          sx={{
            paddingLeft: '8px',
            paddingRight: '8px',
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: '14px',
            transition: 'all 0.3s',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'white'
            }
          }}
          icon={<Badge value={winners.length} />}
          iconPosition='end'
        />
      </Tabs>
      <CustomTabPanel value={value} index={0}>
        <div className={cn(
          'flex bg-[#1D1D1D] rounded-lg overflow-hidden',
          'h-[calc(100vh-180px)] sm:h-[calc(100vh-170px)]',
          'p-3 pt-[50px] sm:p-5 sm:pt-[50px]'
        )}>
          <Entries setRiggedName={setRiggedName} />
        </div>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <div className={cn(
          'flex bg-[#1D1D1D] rounded-lg overflow-hidden',
          'h-[calc(100vh-180px)] sm:h-[calc(100vh-170px)]',
        'p-3 pt-[50px] sm:p-5 sm:pt-[50px]'
        )}>
          <Results names={winners} setWinners={setWinners} />
        </div>
      </CustomTabPanel>
    </Box>
  )
}

export default memo(Sidebar)
