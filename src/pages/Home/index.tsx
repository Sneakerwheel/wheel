import styled from 'styled-components'
import { Navbar } from '../../components'
import Content from './Content'
import { memo } from 'react'

const Home = () => {
  return (
    <HomeContainer>
      <Navbar />
      <div className='grid h-[calc(100vh-63px)] w-full grid-cols-1 lg:grid-cols-5'>
        <Content />
      </div>
    </HomeContainer>
  )
}

const HomeContainer = styled.div`
  width: 100%;
  height: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.colors.dark};
`

export default memo(Home)
