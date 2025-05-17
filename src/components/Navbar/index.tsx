import { FaPalette, FaSave, FaSearch, FaExpand, FaGlobe, FaCaretDown } from 'react-icons/fa'
import { FaFile, FaFolderOpen, FaShareNodes, FaBars, FaXmark } from 'react-icons/fa6'
import { useMediaQuery } from '@mui/material'
import { useState, useEffect, ReactElement } from 'react'
import { cn } from '../../utils'

// Define types for button props
interface NavButtonProps {
  icon?: ReactElement;
  text?: string;
  endIcon?: ReactElement;
}

const Navbar = () => {
  // Enhanced mobile detection with multiple breakpoints
  const isMobileSmall = useMediaQuery('(max-width: 480px)')
  const isMobile = useMediaQuery('(max-width: 875px)')
  // We'll use isTablet in the NavButton component directly

  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle closing menu when resizing to desktop
  useEffect(() => {
    setMounted(true)
    if (!isMobile && showMobileMenu) {
      setShowMobileMenu(false)
    }
  }, [isMobile, showMobileMenu])

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (!mounted) return

    if (showMobileMenu) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [showMobileMenu, mounted])

  // Toggle mobile menu with animation
  const toggleMobileMenu = () => {
    setShowMobileMenu(prev => !prev)
  }

  // Responsive logo size based on screen size
  const logoSize = isMobileSmall ? 'h-[32px] w-[32px]' : 'h-[38px] w-[38px]'
  const titleSize = isMobileSmall ? 'text-[18px]' : 'text-[21px]'

  return (
    <div className='bg-primary shadow-md'>
      {/* Main Navbar */}
      <div className='flex items-center justify-between'>
        {/* Logo Section - Enhanced for better mobile display */}
        <div className='flex items-center gap-1 px-3 py-[8px] sm:px-4 sm:py-[6px]'>
          <img src='/logo.png' alt='Logo' className={cn('mr-2 rounded-full', logoSize)} />
          <h1 className={cn('flex-1 font-normal tracking-normal', titleSize)}>
            {isMobileSmall ? 'Wheel of Names' : 'wheelofnames.com'}
          </h1>
        </div>

        {/* Mobile Menu Button - Enhanced with animation and better styling */}
        {isMobile ? (
          <button
            className='flex items-center justify-center px-4 py-[9px] transition-all duration-300 hover:bg-white/10 focus:outline-none'
            onClick={toggleMobileMenu}
            aria-label={showMobileMenu ? 'Close menu' : 'Open menu'}
          >
            {showMobileMenu ? (
              <FaXmark className="h-6 w-6 text-white" />
            ) : (
              <FaBars className="h-6 w-6 text-white" />
            )}
          </button>
        ) : (
          // Desktop/Tablet Menu - Enhanced with better spacing and hover effects
          <div className='flex flex-wrap items-center'>
            <NavButton icon={<FaPalette />} text="Customize" />
            <NavButton icon={<FaFile />} text="New" />
            <NavButton icon={<FaFolderOpen />} text="Open" />
            <NavButton icon={<FaSave />} text="Save" />
            <NavButton icon={<FaShareNodes />} text="Share" />
            <NavButton icon={<FaSearch />} text="Gallery" />
            <NavButton icon={<FaExpand />} />
            <NavButton text="More" endIcon={<FaCaretDown className='text-[10px]' />} />
            <NavButton icon={<FaGlobe />} text="English" />
          </div>
        )}
      </div>

      {/* Mobile Menu - Enhanced with animation and better styling */}
      <div
        className={cn(
          'absolute left-0 right-0 z-50 bg-primary border-t border-white/10 shadow-lg transition-all duration-300 ease-in-out overflow-hidden',
          showMobileMenu ? 'max-h-[100vh] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className={cn('py-1', showMobileMenu ? 'animate-slide-down' : '')}>
          <MobileNavButton icon={<FaPalette />} text="Customize" />
          <MobileNavButton icon={<FaFile />} text="New" />
          <MobileNavButton icon={<FaFolderOpen />} text="Open" />
          <MobileNavButton icon={<FaSave />} text="Save" />
          <MobileNavButton icon={<FaShareNodes />} text="Share" />
          <MobileNavButton icon={<FaSearch />} text="Gallery" />
          <MobileNavButton icon={<FaExpand />} text="Fullscreen" />
          <MobileNavButton text="More" endIcon={<FaCaretDown className='text-[10px]' />} />
          <MobileNavButton icon={<FaGlobe />} text="English" />
        </div>
      </div>
    </div>
  )
}

// Reusable component for desktop nav buttons
const NavButton = ({ icon, text, endIcon }: NavButtonProps) => {
  // Check if we're in tablet view (show only icons)
  const isTablet = useMediaQuery('(min-width: 876px) and (max-width: 1115px)')

  return (
    <button
      className={cn(
        'flex items-center px-3 py-[9px] text-[15px] font-[400] transition-all duration-300 hover:bg-white/15 active:bg-white/20 sm:px-4',
        isTablet ? 'gap-0 mx-1 justify-center' : 'gap-2 sm:gap-3' // Add margin and center in tablet view
      )}
      title={isTablet && text ? text : undefined} // Add tooltip in tablet view
      aria-label={isTablet && text ? text : undefined} // For accessibility
    >
      <div className={isTablet ? 'text-lg' : ''}>{icon}</div>
      {text && !isTablet && <span className='whitespace-nowrap'>{text}</span>}
      {endIcon && (!isTablet || !text) && endIcon}
    </button>
  )
}

// Reusable component for mobile nav buttons
const MobileNavButton = ({ icon, text, endIcon }: NavButtonProps) => (
  <button className='w-full flex items-center gap-3 px-4 py-3 transition-all duration-300 hover:bg-white/15 active:bg-white/20'>
    {icon}
    {text && <span className='text-[16px] font-[400]'>{text}</span>}
    {endIcon}
  </button>
)

export default Navbar
