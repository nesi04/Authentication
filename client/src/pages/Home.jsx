import React from 'react'
import NavBar from '../components/NavBar'
import Header from '../components/Header'

const Home = () => {
  return (
    <div className='flex flex-col justify-center items-center min-h-screen bg-[url("/bg_img.png")] bg-cover bg-center '>
      <NavBar></NavBar>
      <Header></Header>
    </div>
  )
}

export default Home