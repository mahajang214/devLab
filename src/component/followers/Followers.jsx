import React,{useEffect, useState} from 'react'
import Nav from '../nav/Nav'
import axios from 'axios';
import Loading from '../loading/Loading';

function Followers() {
    const [showFollowers, setShowFollowers] = useState([]);
    const [currentFollowings, setCurrentFollowings] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(()=>{
        const fetchFollowers=async () => {
            try {
setLoading(true);
                const res=await axios.get(`${import.meta.env.VITE_BASE_URL}/main/followers`,{
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                      },
                });
                setShowFollowers(res.data.data);
                // console.log("followers:",res.data.data);
                setLoading(false);
            } catch (error) {
              setLoading(false);
                console.log("Error fetching followers:",error.message);
            }
        }
        const fetchMyFollowing=async () => {
            try {
              setLoading(true);
                const res=await axios.get(`${import.meta.env.VITE_BASE_URL}/main/followings`,{
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                      },
                });
                setCurrentFollowings(res.data.data);
                // console.log("current followings:",res.data.data);
                setLoading(false);
            } catch (error) {
              setLoading(false);
                console.log("Error fetching current followings:",error.message);
            }
        }
        fetchFollowers()
        fetchMyFollowing()
    },[]);

    const unfollowUser=async (id) => {
        try {
          setLoading(true);
            const response = await axios.put(
              `${import.meta.env.VITE_BASE_URL}/main/unfollow/${id}`,{},
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
          //   setShowFollowers(prev=>[...prev, response.data.data]);
            // console.log("following:",response.data.data);
            // setShowFollowings(response.data.data);
          alert("Successfully Unfollowed user!");
          setLoading(false);
          } catch (error) {
            setLoading(false);
            console.error("Error unfollowing user:", error.message);
          }
    }

    const followUser=async (id) => {
        // console.log("token Val:",localStorage.getItem("token"))
        // console.log("base url:",import.meta.env.VITE_BASE_URL);
        // console.log("id:",id);
        try {
          setLoading(true);
          const response = await axios.put(
            `${import.meta.env.VITE_BASE_URL}/main/follow/${id}`,{},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        //   setShowFollowers(prev=>[...prev, response.data.data]);
        //   console.log("following:",response.data.data);
        //   setShowFollowings(response.data.data);
        alert("Successfully followed user!");
        setLoading(false);
        } catch (error) {
          setLoading(false);
          console.error("Error following user:", error.message);
        }
      }
  return (<>
  <Nav/>
    <div className="min-h-screen bg-gray-50">
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
        <div className="grid grid-cols-1 gap-6 items-center">
          {loading && <Loading loaderType={`chat`} />}
          {/* Follower Card */}
          {showFollowers.map((follower) => (
            <div key={follower.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-4">
                  <img
                    src={`${follower.picture}`}
                    alt={`image`}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{follower.name}</h3>
                  </div>
                </div>
                {currentFollowings.length>0? 
                 currentFollowings.map((el)=>
                {
                    // console.log("current=follower :",el.id===follower.id);
                    if(el.id===follower.id){
                        return <button key={el.id} onClick={(e) => {
                            return unfollowUser(follower.id);
                          }} className="cursor-pointer bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors">
                            Unfollow
                          </button>
                    }
                    else{ return <button key={el.id} onClick={(e) => {
                            return followUser(follower.id);
                          }} className="cursor-pointer bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors">
                            Follow
                          </button>
                    }
                }):
                <button  onClick={(e) => {
                    return followUser(follower.id);
                  }} className="cursor-pointer bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors">
                    Follow
                  </button>}
                
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  )
}

export default Followers