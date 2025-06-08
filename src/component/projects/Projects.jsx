import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import Nav from "../nav/Nav";
import axios from "axios";
import Loading from "../loading/Loading";import { motion } from "framer-motion";


function Projects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState([]);
  const [searchOne, setSearchOne] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewProject, setViewProject] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  //   const [filteredProjects, setFilteredProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/main/projects/all`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setProjects(response.data.data);
        setLoading(false);
        // setFilteredProjects(response.data.data);
        // console.log("projects:",response.data.data);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching projects:", error.message);
      }
    };
    fetchProjects();
  }, []);

  const handleViewProject = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const findOneProject = async (query) => {
    // console.log("query:",query);
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/main/search/project/${query}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      //   console.log("find one project:",response.data.data);
      setSearchOne(response.data.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching one project:", error.message);
    }
  };
  return (
    <>
      <Nav />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            All Projects
          </h1>
          <div className="relative">
            <input
              type="text"
              onChange={(e) => {
                return setSearchQuery(e.target.value);
              }}
              placeholder="Search projects..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search
              onClick={(e) => {
                return findOneProject(searchQuery);
              }}
              className="absolute right-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
          {loading && <Loading loaderType={`chat`} />}

          {searchQuery
            ? searchOne.map((project) => (
                <div
                  key={project._id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {project.projectName}
                  </h2>
                  {/* <p className="text-gray-600 mb-4">{project.description}</p> */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Owner: {project.ownerName}
                    </span>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      onClick={() => handleViewProject(project._id)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            : projects.map((project) => (
                <div
                  key={project._id}
                  className={`w-full py-1 rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border ${
                    selectedFile === project._id 
                      ? 'bg-gradient-to-r from-blue-200 to-indigo-200 border-blue-300' 
                      : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
                  }`}
                  onClick={() => setSelectedFile(project._id)}
                >
                  {/* {console.log("project details:",)} */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-gray-800">
                        {project.projectName}
                      </h2>
                      <span className="text-sm text-gray-600">
                        Owner: {project.ownerName}
                      </span>
                    </div>
                    <button
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewProject(!viewProject);
                      
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      View
                    </button>
                  </div>
                  {selectedFile === project._id && viewProject && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 text-sm text-gray-600"
                    >
                      {project.description || 'No description available'}
                    </motion.div>
                  )}
                </div>
              ))}
        </div>
      </div>
    </>
  );
}

export default Projects;
