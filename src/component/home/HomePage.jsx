import React, { useEffect, useState } from "react";
import { Plus, Trash2, Users, LogOut, Info, X } from "lucide-react";
import axios from "axios";
import Nav from "../nav/Nav";
import userStore from "../context/store";
import { motion } from "framer-motion";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
const toastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// const ToastContainer = () => {
//   return <ToastContainer {...toastOptions} />;
// };

const HomePage = () => {
  
   // Add this near the top of your component
  const [projects, setProjects] = useState([]);
  const username = userStore((state) => state.username);
  const [singleProject, setSingleProject] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  const [createNewProject, setCreateNewProject] = useState(false);
  const [selectedCollabs, setSelectedCollabs] = useState([]);
  const [showFollowers, setShowFollowers] = useState([]);
  const [followers, setFollowers] = useState([]);

  const navigate=useNavigate();
  // console.log("usernaem:",username);
  useEffect(() => {
    
    const getProjects = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/main/projects`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        // console.log("data:",response.data.data)
        setProjects(response.data.data);
        // console.log("Projects data:", response.data.data);
      } catch (error) {
        console.error("Error fetching projects:", error.message);
      }
    };
    getProjects();
  }, []);

  const handleDelete = async(id) => {
// console.log("id",id);
    try {
      const removeProject=await axios.delete(`${import.meta.env.VITE_BASE_URL}/main/delete/${id}`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

    setProjects((prev) => prev.filter((proj) => proj._id !== id));
    alert("Project successfully removed!");
    } catch (error) {
      console.error("Error deleting project:", error.message);
    }
  };

 

 

 const handleNewProject=async (e) => {
  // console.log("collabs type:",Array.isArray(selectedCollabs))
  // console.log("collabs:",selectedCollabs);
  e.preventDefault();
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/main/create`,
      {
        projectName: e.target.projectName.value,
        folderName: e.target.folderName.value,
        collabs: selectedCollabs,
        description: e.target.description.value,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    // console.log("res.data:",response.data);
    setProjects(prev => [response.data, ...prev]);
    setCreateNewProject(false);

 
  
  // In your handleNewProject function
  // toast.success("Project created successfully!");
  } catch (error) {
    console.error("Error creating project:", error.message);
  }
}

  const getProjectDetails = async () => {
    try {
      const send = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/main/projects/one`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("project data:", send.data.data);
      setSingleProject(send.data.data);
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* <ToastContainer/> */}
      {/* Navbar */}
      <Nav />

      {/* Welcome Banner */}
      <section className="px-6 py-12 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-b-3xl shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 flex items-center gap-2">
            Welcome back, {username} 
            <span className="animate-bounce">👋</span>
          </h2>
          <p className="text-base sm:text-lg text-blue-100">
            Here's your current project list:
          </p>
        </div>
      </section>

      {/* Project List Section */}
      <main className="px-6 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Your Projects</h3>
            <button
              onClick={()=>setCreateNewProject(!createNewProject)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
            >
              <Plus size={18} /> New Project
            </button>
          </div>
          {createNewProject && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-white rounded-xl p-6 w-full max-w-md"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Create New Project</h3>
                  <button
                    onClick={() => setCreateNewProject(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleNewProject}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Name
                      </label>
                      <input
                        type="text"
                        name="projectName"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Folder Name
                      </label>
                      <input
                        type="text"
                        name="folderName"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Collaborators
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={
                            async () => {
                            try {
                              const response = await axios.get(
                                `${import.meta.env.VITE_BASE_URL}/main/followings`,
                                {
                                  headers: {
                                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                                  },
                                }
                              );
                              setFollowers(response.data.data);
                              setShowFollowers(!showFollowers);
                              // console.log("following:",response.data.data);
                            } catch (error) {
                              console.error("Error fetching followers:", error.message);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left flex justify-between items-center"
                        >
                          <span>{selectedCollabs.length} collaborators selected</span>
                          <Users size={20} />
                        </button>
                        {showFollowers && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {followers.map((follower) => (
                              <label
                                key={follower.id}
                                className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedCollabs.some(collab => collab.id === follower.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedCollabs([...selectedCollabs, { id: follower.id, name: follower.name }]);
                                    } else {
                                      setSelectedCollabs(selectedCollabs.filter(collab => collab.id !== follower.id));
                                    }
                                  }}
                                  className="mr-2"
                                />
                                <img 
                                  src={follower.picture} 
                                  alt={follower.name}
                                  className="w-8 h-8 rounded-full mr-2"
                                />
                                {follower.name}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Project Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter project description..."
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Create Project
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}

          {projects.length === 0 ? (
            <p className="text-gray-500">You have no projects yet.</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project, k) => {
                // console.log("el:",project);
                return (
                  <div key={k}>
                    <div className="bg-white rounded-xl shadow-md p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <span className="text-lg font-medium">
                        {project.projectName}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            userStore.getState().setProjectId(project.projectID);
                            userStore.getState().setProjectName(project.projectName);
                            navigate('/code');
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Code
                        </button>
                        <button
                          onClick={() => {
                            if (showDetails && singleProject.id === project.id) {
                              setShowDetails(false);
                              setSingleProject(null);
                            } else {
                              setSingleProject(project);
                              setShowDetails(true);
                              getProjectDetails();
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 cursor-pointer"
                        >
                          <Info size={16} />
                          Details
                        </button>
                        <button
                          onClick={(e) => {
                            // console.log("projectID",project.projectID);
                            return handleDelete(project.projectID)}}
                          className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200 cursor-pointer"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                    {showDetails && singleProject.id === project.id && (
                      <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 p-4 bg-gray-100 rounded-lg"
                      >
                        <motion.div 
                          className="space-y-2"
                          initial={{ scale: 0.95 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <h2 className="text-lg font-semibold">Project Name: {singleProject.projectName}</h2>
                          <h2 className="text-gray-700">Parent Repo Name: {singleProject.folderName}</h2>
                          <h2 className="text-gray-700">Owner Name: {singleProject.ownerName}</h2>
                          <h2 className="text-gray-700">
                            Collaborators: {Array.isArray(singleProject.collabs) ? singleProject.collabs.map((collab, index) => (
                              <span key={index}>{collab.name}{index < singleProject.collabs.length - 1 ? ', ' : ''}</span>
                            )) : 'No collaborators'}
                          </h2>
                          <h2 className="text-gray-700">
                            Project Description: {singleProject.description || 'No description available'}
                          </h2>
                          <h2 className="text-gray-700">Last modified: {new Date(singleProject.updatedAt).toLocaleString()}</h2>
                        </motion.div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
