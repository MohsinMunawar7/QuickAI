// import React, { useState } from 'react'
// import { Outlet, useNavigate } from 'react-router-dom'
// import {assets} from'../assets/assets'
// import { Menu, X } from 'lucide-react'
// import Sidebar from '../components/Sidebar'
// import {SignIn, useUser } from '@clerk/clerk-react'


// const Layout = () => {
//   const navigate = useNavigate()

//   const [sidebar, setSidebar] =  useState(false)
//   const {user} = useUser()




//   return user ? (
//     <div className = 'flex flex-col items-start justify-start h-screen'>
//       <nav className='w-full px-8 min-h-14 flex items-center justify-between border-b border-gray-200'>


//         <img src = {assets.logo} alt="" onClick = {()=>navigate('/')}/>
//         {
//           sidebar ? <X onClick = {()=> setSidebar(false)} className ='w-6 h-6 text-gray-600 sm:hidden'/>
//           :<Menu  onClick = {()=> setSidebar(true)} className='w-6 h-6 text-gray-600 sm:hidden'/>
          


//         }
//       </nav>
//       <div className='flex-1 w-full flex h-[calc(100vh-64px)]'>
//         <Sidebar sidebar = {setSidebar} setSidebar={setSidebar}/>

//         <div className='flex-1 bg-[#F4F7FB]'>
//           <Outlet/>
//         </div>

//       </div>
        
//         <Outlet/>
//     </div>
//   ) :(

//     <div className='flex items-center justify-center h-screen'>
//       <SignIn/>
//     </div>
//   )
// }

// export default Layout









import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { Menu, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { SignIn, useUser } from '@clerk/clerk-react'

const Layout = () => {
  const navigate = useNavigate()
  const { user } = useUser()

  const [sidebar, setSidebar] = useState(false)

  return user ? (
    <div className="flex flex-col items-start justify-start h-screen">
      
      {/* Top Navbar */}
      <nav className="w-full px-8 min-h-14 flex items-center justify-between border-b border-gray-200">
        <img
         className="cursor-pointer w-32 sm:w-44"
          src={assets.logo}
          alt="Logo"
          onClick={() => navigate('/')}
        />

        {/* Mobile menu toggle */}
        {sidebar ? (
          <X
            onClick={() => setSidebar(false)}
            className="w-6 h-6 text-gray-600 sm:hidden cursor-pointer"
          />
        ) : (
          <Menu
            onClick={() => setSidebar(true)}
            className="w-6 h-6 text-gray-600 sm:hidden cursor-pointer"
          />
        )}
      </nav>

      {/* Main layout */}
      <div className="flex flex-1 w-full h-[calc(100vh-56px)]">
        
        {/* Sidebar */}
        <Sidebar sidebar={sidebar} setSidebar={setSidebar} />

        {/* Page Content */}
        <div className="flex-1 bg-[#F4F7FB] overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen">
      <SignIn />
    </div>
  )
}

export default Layout
