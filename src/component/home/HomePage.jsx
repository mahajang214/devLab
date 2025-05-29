import React, { useEffect, useState } from "react";
import { Plus, Trash2, Users, LogOut } from "lucide-react";
import axios from "axios";

const HomePage = () => {
    useEffect(()=>{
        const fetchData = async () => {
            try {
               const fetch=await axios.get("http://localhost:3001/protected");
               console.log("chal gaya");
                // Add your data fetching logic here
            } catch (error) {
                console.error('Error fetching data:', error.message);
            }
        };
        fetchData();
    },[])

  const [projects, setProjects] = useState([
    { id: 1, name: "E-Commerce App" },
    { id: 2, name: "AI Chatbot" },
    { id: 3, name: "Web3 Voting DApp" },
  ]);

  const handleDelete = (id) => {
    setProjects((prev) => prev.filter((proj) => proj.id !== id));
  };

  const handleCreate = () => {
    const name = prompt("Enter new project name:");
    if (name) {
      const newProject = { id: Date.now(), name };
      setProjects((prev) => [newProject, ...prev]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">devLab</h1>
        <button className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800">
          <LogOut size={16} />
          Logout
        </button>
      </header>

      {/* Welcome Banner */}
      <section className="px-6 py-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-2">Welcome back, Developer 👋</h2>
        <p className="text-sm sm:text-base">Here’s your current project list:</p>
      </section>

      {/* Project List Section */}
      <main className="px-6 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Your Projects</h3>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
            >
              <Plus size={18} /> New Project
            </button>
          </div>

          {projects.length === 0 ? (
            <p className="text-gray-500">You have no projects yet.</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl shadow-md p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <span className="text-lg font-medium">{project.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => alert(`Coders for ${project.name}`)}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200"
                    >
                      <Users size={16} />
                      Coders
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
