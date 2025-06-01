import React, { useEffect,useState } from 'react'
import Nav from '../nav/Nav'
import axios from 'axios';

function Followings() {
  const [showFollowings, setShowFollowings] = useState([]);

  useEffect(()=>{
    const followings= async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/main/followings`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log("following:",response.data.data);
        setShowFollowings(response.data.data);
        // setShowFollowers(!showFollowers);
      } catch (error) {
        console.error("Error fetching followers:", error.message);
      }
    }
    followings()
  },[]);

  const unfollowUser=async (id) => {
    // console.log("token Val:",localStorage.getItem("token"))
    // console.log("base url:",import.meta.env.VITE_BASE_URL);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/main/unfollow/${id}`,{},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // console.log("following:",response.data.data);
      // setShowFollowings(response.data.data);
      // setShowFollowers(!showFollowers);
    alert("Successfully unfollowed user!");
    setShowFollowings(prevFollowings => prevFollowings.filter(following => following.id !== id));
    } catch (error) {
      console.error("Error unfollowing user:", error.message);
    }
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
     <Nav/>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search followers..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute right-3 top-3.5 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Followers Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1  gap-6 items-center">
          {/* Follower Card */}
          {showFollowings.map((follower) => (
            <div key={follower.id} className="bg-white  rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-4">
                  <img
                    src={`${follower.picture}`}
                    alt={`image`}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{follower.name}</h3>
                    {/* <p className="text-gray-500">@johndoe</p> */}
                  </div>
                </div>
                <button onClick={(e)=>{
                  // console.log("unfollowing data:",follower.id);
                  return unfollowUser(follower.id);
                }} className="cursor-pointer bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors">
                  Unfollow
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Followings