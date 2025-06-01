import { Search } from 'lucide-react';
import React,{useEffect, useState} from 'react'
import Nav from '../nav/Nav';
import axios from 'axios';

function Projects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState([]);
  const [searchOne, setSearchOne] = useState([]);
//   const [filteredProjects, setFilteredProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/main/projects/all`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setProjects(response.data.data);
        // setFilteredProjects(response.data.data);
        // console.log("projects:",response.data.data);
      } catch (error) {
        console.error("Error fetching projects:", error.message);
      }
    };
    fetchProjects();
  }, []);

  

  const handleViewProject = (projectId) => {
    navigate(`/project/${projectId}`);
  };

    const findOneProject=async (query) => {
        // console.log("query:",query);
        try {
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
        }  catch (error) {
            console.error("Error fetching one project:", error.message);
          }
    }  
  return (<>
  <Nav/>
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">All Projects</h1>
        <div className="relative">
          <input
            type="text"
            onChange={(e)=>{ return setSearchQuery(e.target.value);
                
            }}
            placeholder="Search projects..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search onClick={(e)=>{
            return findOneProject(searchQuery)}} className="absolute right-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      <div className="grid grid-cols-1  gap-6 overflow-y-auto h-[80svh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
        {searchQuery? searchOne.map((project) => (
          <div key={project._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{project.projectName}</h2>
            {/* <p className="text-gray-600 mb-4">{project.description}</p> */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Owner: {project.ownerName}</span>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => handleViewProject(project._id)}
              >
                View Details
              </button>
            </div>
          </div>)) : projects.map((project) => (
          <div key={project._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{project.projectName}</h2>
            {/* <p className="text-gray-600 mb-4">{project.description}</p> */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Owner: {project.ownerName}</span>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => handleViewProject(project._id)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  )
}

export default Projects