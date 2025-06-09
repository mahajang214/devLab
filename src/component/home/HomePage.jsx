import React, { useEffect, useState } from "react";
import { Plus, Trash2, Users, LogOut, Info, X, Code } from "lucide-react";
import axios from "axios";
import Nav from "../nav/Nav";
import userStore from "../context/store";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loading from "../loading/Loading";
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
  const username = userStore((state) => state.username);
  const userId = userStore((state) => state.userId);
  const socket = userStore((state) => state.socket);
  const projectID = userStore((state) => state.projectID);

  const [projects, setProjects] = useState([]);
  const [singleProject, setSingleProject] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  const [createNewProject, setCreateNewProject] = useState(false);
  const [selectedCollabs, setSelectedCollabs] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [collabedWith, setCollabedWith] = useState([]);
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCollabName, setNewCollabName] = useState([]);
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAddCollabsModal, setShowAddCollabsModal] = useState(false);


  const handleDelete = async (id) => {
    // console.log("id",id);
    try {
      setLoading(true);
      const removeProject = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/main/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setProjects((prev) => prev.filter((proj) => proj._id !== id));
      setLoading(false);
      alert("Project successfully removed!");
    } catch (error) {
      setLoading(false);
      console.error("Error deleting project:", error.message);
    }
  };

  const collabedWithProjects = async (req, res) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/main/collabedWith`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // console.log("collabed projects:",res.data.data);
      setCollaborations(res.data.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("error:", error.message);
    }
  };

  const handleNewProject = async (e) => {
    // console.log("collabs type:",Array.isArray(selectedCollabs))
    // console.log("collabs:",selectedCollabs);
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/main/create`,
        {
          projectName: e.target.projectName.value,
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
      setProjects((prev) => [...prev, response.data]);
      setCreateNewProject(false);
      setLoading(false);

      // In your handleNewProject function
      // toast.success("Project created successfully!");
    } catch (error) {
      setLoading(false);
      console.error("Error creating project:", error.message);
    }
  };

  const addCollaborators = async ({collaborators}) => {
    // console.log("collaborators for function:",collaborators);
    // console.log("collaborators length:",collaborators.length);
    if(!selectedFile){
      alert("Please select any project before adding collaborations");
      return;
    }
    
    if (username=== selectedFile ? selectedFile.ownerName:null) {
      alert("Only project owner can add collaborators");
      return;
    }

    if(collaborators.length===0){
    alert("Please select any collaborator ");
    return;
    }
   

    try {
      setLoading(true);
      const res = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/main/add/collabs`,
        { fileID: selectedFile.projectID, collabs: collaborators },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log("add collabs data:",res.data.data);
      setNewCollabName("");
      setLoading(false);
    } catch (error) {
      setNewCollabName("");
      if (error.response?.data?.message?.endsWith("exists")) {
        alert(`This collaborator is already exist in that project`);
      } else {
        console.log("error:", error.message);
      }
     return setLoading(false);
    }
  };

  const getProjectDetails = async () => {
    try {
      setLoading(true);
      const send = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/main/projects/one`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // console.log("project data:", send.data.data);
      setSingleProject(send.data.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error.message);
    }
  };

  const getProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/main/projects`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("data:",response.data.data)
      // projects.collabs[0].name
      setProjects(response.data.data);
      // setLoading(false);
      // console.log("Projects data:", response.data.data);
    } catch (error) {
      // setLoading(false);
      console.error("Error fetching projects:", error.message);
    }
  };

  // console.log("username:",username);
  useEffect(() => {
    getProjects();
    collabedWithProjects();
    if (!localStorage.getItem("token") || !username) {
      console.log("username:",username)
      localStorage.removeItem("token");
      navigate("/login");
    }

  }, []);


  
  

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* <ToastContainer/> */}
      {/* Navbar */}
      <Nav />

      {/* Welcome Banner */}
      <section className="px-4 sm:px-6 py-8 sm:py-12 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-b-3xl shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 flex items-center gap-2">
            Welcome back, {username}
            <span className="animate-bounce">👋</span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-blue-100">
            Build, collaborate, and code together in real-time with <span className="text-white font-bold">devLab</span> - your all-in-one development workspace.
          </p>
          <div className="mt-3 sm:mt-4">
            <p className="text-xs sm:text-sm text-blue-100 mb-2">DevLab supports the following programming languages:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-2">
              <span className="px-2 sm:px-3 md:px-5 py-1 bg-blue-500/20 rounded-lg text-xs sm:text-sm hover:bg-blue-500/30 transition-colors cursor-default">JavaScript (18.15.0)</span>
              <span className="px-2 sm:px-3 md:px-5 py-1 bg-blue-500/20 rounded-lg text-xs sm:text-sm hover:bg-blue-500/30 transition-colors cursor-default">TypeScript (5.0.3)</span>
              <span className="px-2 sm:px-3 md:px-5 py-1 bg-blue-500/20 rounded-lg text-xs sm:text-sm hover:bg-blue-500/30 transition-colors cursor-default">Python (3.10.0)</span>
              <span className="px-2 sm:px-3 md:px-5 py-1 bg-blue-500/20 rounded-lg text-xs sm:text-sm hover:bg-blue-500/30 transition-colors cursor-default">Python2 (2.7.18)</span>
              <span className="px-2 sm:px-3 md:px-5 py-1 bg-blue-500/20 rounded-lg text-xs sm:text-sm hover:bg-blue-500/30 transition-colors cursor-default">Java (15.0.2)</span>
              <span className="px-2 sm:px-3 md:px-5 py-1 bg-blue-500/20 rounded-lg text-xs sm:text-sm hover:bg-blue-500/30 transition-colors cursor-default">C (10.2.0)</span>
              <span className="px-2 sm:px-3 md:px-5 py-1 bg-blue-500/20 rounded-lg text-xs sm:text-sm hover:bg-blue-500/30 transition-colors cursor-default">C++ (10.2.0)</span>
              <span className="px-2 sm:px-3 md:px-5 py-1 bg-blue-500/20 rounded-lg text-xs sm:text-sm hover:bg-blue-500/30 transition-colors cursor-default">Go (1.16.2)</span>
              <span className="px-2 sm:px-3 md:px-5 py-1 bg-blue-500/20 rounded-lg text-xs sm:text-sm hover:bg-blue-500/30 transition-colors cursor-default">Ruby (3.0.1)</span>
              <span className="px-2 sm:px-3 md:px-5 py-1 bg-blue-500/20 rounded-lg text-xs sm:text-sm hover:bg-blue-500/30 transition-colors cursor-default">Rust (1.68.2)</span>
              <span className="px-2 sm:px-3 md:px-5 py-1 bg-blue-500/20 rounded-lg text-xs sm:text-sm hover:bg-blue-500/30 transition-colors cursor-default">PHP (8.2.3)</span>
              <span className="px-2 sm:px-3 md:px-5 py-1 bg-blue-500/20 rounded-lg text-xs sm:text-sm hover:bg-blue-500/30 transition-colors cursor-default">C# (6.12.0)</span>
              <span className="px-2 sm:px-3 md:px-5 py-1 bg-blue-500/20 rounded-lg text-xs sm:text-sm hover:bg-blue-500/30 transition-colors cursor-default">Kotlin (1.8.20)</span>
              <span className="px-2 sm:px-3 md:px-5 py-1 bg-blue-500/20 rounded-lg text-xs sm:text-sm hover:bg-blue-500/30 transition-colors cursor-default">Swift (5.3.3)</span>
              <span className="px-2 sm:px-3 md:px-5 py-1 bg-blue-500/20 rounded-lg text-xs sm:text-sm hover:bg-blue-500/30 transition-colors cursor-default">Scala (3.2.2)</span>
              <span className="px-2 sm:px-3 md:px-5 py-1 bg-blue-500/20 rounded-lg text-xs sm:text-sm hover:bg-blue-500/30 transition-colors cursor-default">Dart (2.19.6)</span>
              <span className="px-2 sm:px-3 md:px-5 py-1 bg-blue-500/20 rounded-lg text-xs sm:text-sm hover:bg-blue-500/30 transition-colors cursor-default">Haskell (9.0.1)</span>
              <span className="px-2 sm:px-3 md:px-5 py-1 bg-blue-500/20 rounded-lg text-xs sm:text-sm hover:bg-blue-500/30 transition-colors cursor-default">Bash (5.2.0)</span>
              <span className="px-2 sm:px-3 md:px-5 py-1 bg-blue-500/20 rounded-lg text-xs sm:text-sm hover:bg-blue-500/30 transition-colors cursor-default">Perl (5.36.0)</span>
              <span className="px-2 sm:px-3 md:px-5 py-1 bg-blue-500/20 rounded-lg text-xs sm:text-sm hover:bg-blue-500/30 transition-colors cursor-default">R (4.1.1)</span>
              <span className="px-2 sm:px-3 md:px-5 py-1 bg-blue-500/20 rounded-lg text-xs sm:text-sm hover:bg-blue-500/30 transition-colors cursor-default">Lua (5.4.4)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Project List Section */}
      <main className="px-6 py-8 flex-1 overflow-hidden">
        {loading && <Loading loaderType={`chat`} />}

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Your Projects</h3>
            <button
              onClick={() => setCreateNewProject(!createNewProject)}
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
                        Collaborators
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const response = await axios.get(
                                `${
                                  import.meta.env.VITE_BASE_URL
                                }/main/followings`,
                                {
                                  headers: {
                                    Authorization: `Bearer ${localStorage.getItem(
                                      "token"
                                    )}`,
                                  },
                                }
                              );
                              setFollowers(response.data.data);
                              setShowFollowers(!showFollowers);
                              // console.log("following:",response.data.data);
                            } catch (error) {
                              console.error(
                                "Error fetching followers:",
                                error.message
                              );
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left flex justify-between items-center"
                        >
                          <span>
                            {selectedCollabs.length} collaborators selected
                          </span>
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
                                  checked={selectedCollabs.some(
                                    (collab) => collab.id === follower.id
                                  )}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedCollabs([
                                        ...selectedCollabs,
                                        {
                                          id: follower.id,
                                          name: follower.name,
                                        },
                                      ]);
                                    } else {
                                      setSelectedCollabs(
                                        selectedCollabs.filter(
                                          (collab) => collab.id !== follower.id
                                        )
                                      );
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
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
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

          {/* add collaborators modal */}
          {showAddCollabsModal && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Collaborators
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const response = await axios.get(
                        `${import.meta.env.VITE_BASE_URL}/main/followings`,
                        {
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                              "token"
                            )}`,
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
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="bg-white rounded-xl p-6 w-full max-w-md"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Add Collaborators</h3>
                        <button
                          onClick={() => setShowFollowers(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X size={24} />
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {followers.map((follower) => (
                          <label
                            key={follower.id}
                            className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCollabs.some(
                                (collab) =>
                                  collab.id === follower.id ||
                                  follower.id === userStore.getState().userId
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCollabs([
                                    ...selectedCollabs,
                                    {
                                      id: follower.id,
                                      name: follower.name,
                                    },
                                  ]);
                                } else {
                                  setSelectedCollabs(
                                    selectedCollabs.filter(
                                      (collab) => collab.id !== follower.id
                                    )
                                  );
                                }
                              }}
                              className="mr-3 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex items-center flex-1">
                              <img
                                src={follower.picture}
                                alt={follower.name}
                                className="w-10 h-10 rounded-full mr-3"
                              />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {follower.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {follower.email}
                                </p>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          onClick={() => setShowFollowers(false)}
                          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            // Handle adding collaborators
                            setNewCollabName([
                              ...selectedCollabs.map((collab) => ({
                                name: collab.name,
                                id: collab.id,
                              })),
                            ]);
                            addCollaborators({collaborators:selectedCollabs});
                            setSelectedCollabs([]);
                            setShowFollowers(false);
                            setShowAddCollabsModal(false);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          Add Collaborators
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {projects.length === 0 ? (
            <p className="text-gray-500">You have no projects yet.</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project, k) => {
                return (
                  <div key={k}>
                    <div
                      onClick={() => setSelectedFile(project)}
                      className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-4"
                    >
                      <span className="text-lg font-medium">
                        {project.projectName}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            userStore.getState().setProjectId(project.projectID);
                            userStore.getState().setProjectName(project.projectName);
                            navigate("/code");
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 cursor-pointer text-sm sm:text-base"
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
                          onClick={() => setShowAddCollabsModal(true)}
                          className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 cursor-pointer text-sm sm:text-base"
                        >
                          <Users size={16} />
                          Add Collabs
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
                          className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 cursor-pointer text-sm sm:text-base"
                        >
                          <Info size={16} />
                          Details
                        </button>
                        <button
                          onClick={(e) => handleDelete(project.projectID)}
                          className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200 cursor-pointer text-sm sm:text-base"
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
                          <h2 className="text-base sm:text-lg font-semibold">
                            Project Name: {singleProject.projectName}
                          </h2>
                          <h2 className="text-sm sm:text-base text-gray-700">
                            Owner Name: {singleProject.ownerName}
                          </h2>
                          <h2 className="text-sm sm:text-base text-gray-700">
                            Collaborators:{" "}
                            {Array.isArray(singleProject.collabs)
                              ? singleProject.collabs.map((collab, index) => (
                                  <span key={index}>
                                    {collab.name}
                                    {index < singleProject.collabs.length - 1
                                      ? ", "
                                      : ""}
                                  </span>
                                ))
                              : "No collaborators"}
                          </h2>
                          <h2 className="text-sm sm:text-base text-gray-700">
                            Project Description:{" "}
                            {singleProject.description ||
                              "No description available"}
                          </h2>
                          <h2 className="text-sm sm:text-base text-gray-700">
                            Last modified:{" "}
                            {new Date(singleProject.updatedAt).toLocaleString()}
                          </h2>
                        </motion.div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-8 flex-1 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Collaborations</h1>
          {collaborations.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No collaborations found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collaborations.map((project) => (
                <div
                  key={project._id}
                  className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex-grow">
                      <h2 className="text-lg font-semibold mb-2 line-clamp-1">
                        {project.projectName}
                      </h2>
                      <p className="text-gray-600 text-sm mb-4">
                        Owner: {project.ownerName}
                      </p>
                    </div>
                    <div className="mt-auto">
                      <button
                        onClick={() => {
                          userStore.getState().setProjectId(project._id);
                          userStore.getState().setProjectName(project.projectName);
                          navigate("/code");
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Open Project</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

    <footer className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-t-4xl text-white py-12 mt-auto">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              devLab
            </h3>
            <p className="text-blue-200">
              Your all-in-one development workspace where innovation meets collaboration
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-200">Connect With Us</h4>
            <div className="flex space-x-4">
              <a 
                href="https://github.com/gauravmahajan" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-200 hover:text-white transition-colors duration-300"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a 
                href="https://gauravmahajan.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-200 hover:text-white transition-colors duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-200">Why Choose DevLab?</h4>
            <ul className="text-blue-200 space-y-2">
              <li>✨ Real-time collaboration</li>
              <li>🚀 Multiple language support</li>
              <li>💡 AI-powered assistance</li>
              <li>🔒 Secure & reliable</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-blue-800">
          <div className="text-center space-y-4">
            <p className="text-blue-200 text-sm max-w-2xl mx-auto">
              Join thousands of developers who trust DevLab for their coding needs. 
              Experience seamless collaboration, powerful features, and a community-driven platform.
            </p>
            <p className="text-blue-300 text-sm">
              © {new Date().getFullYear()} DevLab | Created with ❤️ by Gaurav Mahajan
            </p>
          </div>
        </div>
      </div>
    </footer>
    </div>
  );
};

export default HomePage;
