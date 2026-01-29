// import { useClerk, useUser } from '@clerk/clerk-react'
// import React from 'react'

// const Sidebar = ({Sidebar,setSidebar}) => {
//     const {user} = useUser();
//     const{signOut, openUserProfile} = useClerk()

//   return (
//     <div className={`w-60 bg-white border-r border-gray-200 flex flex-col justify-between items-center max-sm:absolute top-14 bottom-0 ${sidebar ? 'translate-x-0' :'max-sm:-translate-x-full' }transition-all duration-300 ease-in-out`}>
//         <div className='my-7 w-full'> 
//             <img src={user.imageUrl} alt="User avatar" className='w-13 rounded-full mx-auto'/>
//             <h1 className='mt-1 text-center'>{user.fullName}</h1>


//         </div>




    

// export default Sidebar








// import React from 'react'
// import { useClerk, useUser } from '@clerk/clerk-react'

// const Sidebar = ({ sidebar, setSidebar }) => {
//   const { user } = useUser()
//   const { signOut, openUserProfile } = useClerk()

//   return (
//     <div
//       className={`w-60 bg-white border-r border-gray-200 flex flex-col justify-between items-center
//       max-sm:absolute top-14 bottom-0
//       ${sidebar ? 'translate-x-0' : 'max-sm:-translate-x-full'}
//       transition-all duration-300 ease-in-out`}
//     >
//       {/* User info */}
//       <div className="my-7 w-full text-center">
//         <img
//           src={user?.imageUrl}
//           alt="User avatar"
//           className="w-16 h-16 rounded-full mx-auto"
//         />
//         <h1 className="mt-2 font-medium">{user?.fullName}</h1>
//       </div>

//       {/* Actions */}
//       <div className="mb-6 flex flex-col gap-3 w-full px-4">
//         <button
//           onClick={openUserProfile}
//           className="w-full py-2 rounded bg-gray-100 hover:bg-gray-200"
//         >
//           Profile
//         </button>

//         <button
//           onClick={signOut}
//           className="w-full py-2 rounded bg-red-100 hover:bg-red-200 text-red-600"
//         >
//           Sign Out
//         </button>
//       </div>
//     </div>
//   )
// }

// export default Sidebar





// import { useClerk, useUser } from '@clerk/clerk-react'
// import{Eraser, FileText, Hash, House, Image, Scissors, SquarePen, Users} from 'lucide-react';
// import React from 'react'

// const navItems = [
//   {to:'/ai',label:'Dashboard',Icon: House},
//    {to:'/ai/write-article',label:'Write Article',Icon: SquarePen},
//     {to:'/ai/blog-titles',label:'Blog Titles',Icon: Hash},
//      {to:'/ai/generate-images',label:'Generate Images',Icon: Image},
//       {to:'/ai/remove-background',label:'Remove Background',Icon: Eraser},
//        {to:'/ai/remove object',label:'Remove Object',Icon: Scissors},
//         {to:'/ai/review-resume',label:'Review Resume',Icon: FileText},
//          {to:'/ai/community',label:'Community',Icon: Users},

// ]

// const Sidebar = ({ sidebar, setSidebar }) => {
//   const { user } = useUser()
//   const { signOut, openUserProfile } = useClerk()

//   return (
//     <div
//       className={`w-60 bg-white border-r border-gray-200 flex flex-col justify-between items-center 
//       max-sm:absolute top-14 bottom-0 
//       ${sidebar ? 'translate-x-0' : 'max-sm:-translate-x-full'} 
//       transition-all duration-300 ease-in-out`}
//     >
//       <div className="my-7 w-full">
//         <img
//           src={user.imageUrl}
//           alt="User avatar"
//           className="w-13 rounded-full mx-auto"
//         />
//         <h1 className="mt-1 text-center">{user.fullName}</h1>
//         <div>
//           {navItems.map(({to,label,Icon})=>(
//             <NavLink key= {to}to = {to}end = {to ==='/ai'} onClick={()=>
//               setSidebar(false)} className= {({isActive})=>`px-3.5 py-2.5 flex items-center gap-3 rounded ${isActive? 'bg-gradient-to-r from-[#3C81F6]to-[#9234EA]text-white':''}`}>
//                 {({isActive})=>(
//                   <>
//                   <Icon className={`w-4 h-4 ${isActive ? 'text-white':' '}`} />
//                   {label}
//                   </>

//                 ) }





//             </NavLink>

//           ))}
          
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Sidebar








import React from 'react'
import { NavLink } from 'react-router-dom'
import { Protect, useClerk, useUser } from '@clerk/clerk-react'
import {
  Eraser,
  FileText,
  Hash,
  House,
  Image,
  LogOut,
  Scissors,
  SquarePen,
  Users,
} from 'lucide-react'

const navItems = [
  { to: '/ai', label: 'Dashboard', Icon: House },
  { to: '/ai/write-article', label: 'Write Article', Icon: SquarePen },
  { to: '/ai/blog-titles', label: 'Blog Titles', Icon: Hash },
  { to: '/ai/generate-images', label: 'Generate Images', Icon: Image },
  { to: '/ai/remove-background', label: 'Remove Background', Icon: Eraser },
  { to: '/ai/remove-object', label: 'Remove Object', Icon: Scissors },
  { to: '/ai/review-resume', label: 'Review Resume', Icon: FileText },
  { to: '/ai/community', label: 'Community', Icon: Users },
]

const Sidebar = ({ sidebar, setSidebar }) => {
  const { user } = useUser()
  const { signOut, openUserProfile } = useClerk()

  return (
    <div
      className={`w-60 bg-white border-r border-gray-200 flex flex-col justify-between items-center 
      max-sm:absolute top-14 bottom-0 
      ${sidebar ? 'translate-x-0' : 'max-sm:-translate-x-full'} 
      transition-all duration-300 ease-in-out`}
    >
      <div className="my-7 w-full">
        <img
          src={user.imageUrl}
          alt="User avatar"
          className="w-13 rounded-full mx-auto"
        />
        <h1 className="mt-1 text-center">{user.fullName}</h1>

        <div className='px-6 mt-5 text-sm text-gray-600 font-medium'>

          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/ai'}
              onClick={() => setSidebar(false)}
              className={({ isActive }) =>
                `px-3.5 py-2.5 flex items-center gap-3 rounded transition
                 ${
                   isActive
                     ? 'bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white'
                     : 'hover:bg-gray-100'
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-gray-500'
                    }`}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
      <div className='w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between'>
        <div onClick={openUserProfile}className='flex gap-2 items-center cursor-pointer'>
          <img src={user.imageUrl} className= 'w-8 rounded-full'alt="" />
          <div>
            <h1 className='text-sm font-medium'>{user.fullName}</h1>
            <p className='text-xs text-gray-500'>
              <Protect plan= 'premium' fallback="Free">Premium</Protect>
              Plan

            </p>
          </div>


        </div>
        <LogOut onClick={signOut} className='w-4.5 text-gray-400 hover:text-gray-700 transition cursor-pointer'/>

      </div>
    </div>
  )
}

export default Sidebar
