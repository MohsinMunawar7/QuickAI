// // import { useUser } from '@clerk/clerk-react'
// // import React, { useEffect, useState } from 'react'
// // import { dummyPublishedCreationData } from '../assets/assets'
// // import { Heart } from 'lucide-react'



// // const Community = () => {
// //   const[creations, setCreations] = useState([])
// //   const {user} = useUser()
// //   const fetchCreations = async () => {
// //     setCreations(dummyPublishedCreationData)
    
// //   }
// //   useEffect(()=>{
// //   if(user){
// //     fetchCreations()
// //   }
// // },[user])


// //   return (
// //     <div className='flex-1 h-full flex flex-col gap-4 p-6'>
// //       Creations

// //       <div className='bg-white h-full w-full rounded-xl overflow-y-scroll'>
// //         {creations.map((creation,index)=>(
// //           <div key = {index} className='relative group inline-block pl-3 pt-3 w-full sm:max-w-1/2 lg:max-w-1/3'>
// //             <img src={creation.content} alt="" className='w-full h-full object-cover rounded-lg'/>
// //             <div className='absolute bottom-0 top-0 tight-0 left-3 flex gap-2 items-end justify-end group-hover:justify-between p-3 group-hover:bg-gradient-to-b from-transparent to-black/80 text-white rounded-lg'>


// //               <p className='text-sm hidden group-hover:block'>{creation.prompt}</p>
// //               <div className='flex gap-1 items-center'>

// //                 <p>{creation.likes.length}</p>
// //                 <Heart className={`min-w-5 h-5 hover:scale-110 cursor-pointer ${creation.likes.includes(user.id) ?'fill-red-500 text-red-600' :'text-white'}`}/>

// //               </div>
// //             </div>

// //           </div>
// //         ))}



// //       </div>

// //     </div>
// //   )
// // }

// // export default Community







// import { useAuth, useUser } from '@clerk/clerk-react'
// import React, { useEffect, useState } from 'react'
// import { dummyPublishedCreationData } from '../assets/assets'
// import { Heart } from 'lucide-react'
// import axios from 'axios'
// import toast from 'react-hot-toast'

// axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;




// const Community = () => {
//   const [creations, setCreations] = useState([])
//   const { user } = useUser()
//   const [loading, setLoading] = useState(true)
//   const {getToken} = useAuth()




//   const fetchCreations = async () => {
//     try {
//         const {data} = await axios.get('/api/user/get-published-creations',{ headers:{Authorization: `Bearer ${await getToken()}`}
//       })

//       if(data.success){
//         setCreations(data.creations)
//       }
//       else{
//         toast.error(data.message)
//       }



//     } catch (error) {
//       toast.error(error.message)

      
//     }
//     setLoading(false)

//   }
//   const imageLikeToggle = async (id)=>{
//     try {
//       const {data} = await axios.post('/api/user/toggle-like-creation', {id}, { headers:{Authorization: `Bearer ${await getToken()}`}

      
//     }) 
//     if(data.success){
//       toast.success(data.message)
//       await fetchCreations()

//     }else{

//       toast.error(data.message)

//     }

//   }catch (error) {
//     toast.error(error.message)

      
//     }
//   }


//   useEffect(() => {
//     if (user) {
//       fetchCreations()
//     }
//   }, [user])

//   return (
//     <div className='flex-1 h-full flex flex-col gap-4 p-6'>
//       Creations

//       <div className='bg-white h-full w-full rounded-xl overflow-y-scroll'>
//         {creations.map((creation, index) => (
//           <div
//             key={index}
//             className='relative group inline-block pl-3 pt-3 w-full sm:max-w-1/2 lg:max-w-1/3'
//           >
//             <img
//               src={creation.content}
//               alt=""
//               className='w-full h-full object-cover rounded-lg'
//             />

//             <div className='absolute bottom-0 top-0 right-0 left-3 flex gap-2 items-end justify-end group-hover:justify-between p-3 group-hover:bg-gradient-to-b from-transparent to-black/80 text-white rounded-lg'>
//               <p className='text-sm hidden group-hover:block'>
//                 {creation.prompt}
//               </p>

//               <div className='flex gap-1 items-center'>
//                 <p>{creation.likes?.length || 0}</p>
//                 <Heart onClick={()=> imageLikeToggle(creation.id)}

//                   className={`min-w-5 h-5 hover:scale-110 cursor-pointer ${
//                     creation.likes?.includes(user.id)
//                       ? 'fill-red-500 text-red-600'
//                       : 'text-white'
//                   }`}
//                 />
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

// export default Community






import { useAuth, useUser } from '@clerk/clerk-react'
import React, { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Community = () => {
  const [creations, setCreations] = useState([])
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const { getToken } = useAuth()

  const fetchCreations = async () => {
    try {
      const { data } = await axios.get('/api/user/get-published-creations', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })

      if (data.success) {
        setCreations(data.creations)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Fetch creations error:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to fetch creations')
    } finally {
      setLoading(false)
    }
  }

  const imageLikeToggle = async (id) => {
    try {
      const { data } = await axios.post('/api/user/toggle-like-creation', 
        { id }, 
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      )
      
      if (data.success) {
        toast.success(data.message)
        await fetchCreations()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Like toggle error:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to toggle like')
    }
  }

  useEffect(() => {
    if (user) {
      fetchCreations()
    }
  }, [user])

  return !loading ? (
    <div className='flex-1 h-full flex flex-col gap-4 p-6'>
      <h2 className='text-2xl font-semibold'>Community Creations</h2>

      {loading ? (
        <div className='bg-white h-full w-full rounded-xl flex items-center justify-center'>
          <p className='text-gray-500'>Loading creations...</p>
        </div>
      ) : creations.length === 0 ? (
        <div className='bg-white h-full w-full rounded-xl flex items-center justify-center'>
          <p className='text-gray-500'>No published creations yet</p>
        </div>
      ) : (
        <div className='bg-white h-full w-full rounded-xl overflow-y-scroll p-3'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
            {creations.map((creation, index) => (
              <div
                key={creation.id || index}
                className='relative group overflow-hidden rounded-lg'
              >
                <img
                  src={creation.content}
                  alt={creation.prompt || 'AI Generated Image'}
                  className='w-full h-full object-cover rounded-lg'
                />

                <div className='absolute bottom-0 top-0 right-0 left-0 flex gap-2 items-end justify-end group-hover:justify-between p-3 group-hover:bg-gradient-to-b from-transparent to-black/80 text-white rounded-lg transition-all duration-300'>
                  <p className='text-sm hidden group-hover:block overflow-hidden text-ellipsis'>
                    {creation.prompt}
                  </p>

                  <div className='flex gap-1 items-center'>
                    <p>{creation.likes?.length || 0}</p>
                    <Heart
                      onClick={() => imageLikeToggle(creation.id)}
                      className={`min-w-5 h-5 hover:scale-110 cursor-pointer transition-transform ${
                        creation.likes?.includes(user.id)
                          ? 'fill-red-500 text-red-600'
                          : 'text-white'
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  ): (
    <div className='flex justify-center items-center h-full'>
      <span className='w-10 h-10 my-1 rounded-full border-3 border-primary border-t-transparent animate-spin'></span>
    </div>
  )
}

export default Community
