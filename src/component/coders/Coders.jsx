import axios from "axios";
import { Folder, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import Nav from "../nav/Nav";
import Loading from "../loading/Loading";

function Coders() {
  const [coders, setCoders] = useState([]);
  const [isFollowing, setIsFollowing] = useState([]);
  const [loading, setLoading] = useState(false);

  const getMyInfo = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/main/me`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // console.log("response:",response.data.data.following);
      setIsFollowing(response.data.data.following);
    } catch (error) {
      console.error("Error fetching user info:", error.message);
    }
  };
  const fetchCoders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/main/coders`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setCoders(response.data.data);
      setLoading(false);
      // console.log("coders:",response.data.data);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching coders:", error.message);
    }
  };

  const handleFollow = async (coderId) => {
    // console.log(
    //     "coderId:",
    //     coderId
    // )
    try {
      setLoading(true);
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/main/follow/${coderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update the coders state to reflect the follow/unfollow status
      setCoders((prevCoders) =>
        prevCoders.map((coder) =>
          coder.id === coderId
            ? { ...coder, isFollowing: !coder.isFollowing }
            : coder
        )
      );
        console.log("Successfully followed user");
        setLoading(false);
        // Remove fetchCoders() since we already update the state locally
    } catch (error) {
      setLoading(false);
      console.error("Error following/unfollowing coder:", error.message);
    }
  };

  const handleUnfollow = async (coderId) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/main/unfollow/${coderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update the coders state to reflect the unfollow status
      setCoders((prevCoders) =>
        prevCoders.map((coder) =>
          coder.id === coderId ? { ...coder, isFollowing: false } : coder
        )
      );
      console.log("Successfully unfollowed user");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error unfollowing coder:", error.message);
    }
  };



  useEffect(() => {
    const loadData = async () => {
      await getMyInfo();
      await fetchCoders();
    };
    loadData();
  }, []);
  return (<>
      <Nav/>
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">All Coders</h1>
      <div className="grid grid-cols-1  gap-6 overflow-y-auto h-[80svh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
      {loading && <Loading loaderType={`chat`} />}

        {coders.map((coder) => (
          <div
            key={coder._id}
            className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:space-x-4">
              <img
                src={coder.picture}
                alt={coder.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1 flex flex-col items-center sm:items-start justify-between">
                <h2 className="text-xl font-semibold text-gray-800 text-center sm:text-left">
                  {coder.firstName} {coder.lastName}
                </h2>
                <div className="mt-2 text-sm text-gray-600 flex flex-wrap justify-center sm:justify-start items-center gap-4 sm:gap-6">
                  <p className="flex items-center gap-1">
                    <Users size={16} />
                    {coder.followers?.length || 0} Followers
                  </p>
                  <p className="flex items-center gap-1">
                    <Folder size={16} />
                    {coder.projects?.length || 0} Projects
                  </p>
                </div>
              </div>
              {isFollowing.some((following) => following.id === coder._id) ? (
                <button
                  onClick={() => handleUnfollow(coder._id)}
                  className="w-full cursor-pointer sm:w-auto px-4 py-2 rounded-full text-sm font-medium transition-colors bg-red-500 hover:bg-red-600 text-white"
                >
                  Unfollow
                </button>
              ) : (
                <button
                  onClick={() => handleFollow(coder._id)}
                  className="text-white cursor-pointer bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-full"
                >
                  Follow
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}

export default Coders;
