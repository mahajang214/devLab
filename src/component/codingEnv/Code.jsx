import React, { useEffect, useState } from "react";
import Nav from "../nav/Nav";
import axios from "axios";
import userStore from "../context/store";
import { SendHorizontal, Send, Folder } from "lucide-react";
import { motion } from "framer-motion";
import Loading from "../loading/Loading";

function Code() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAIChatOpen, setIsAIChatOpen] = useState(true);
  const [code, setCode] = useState(``);
  const [output, setOutput] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [getAllMessages, setGetAllMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [aiResponse, setAiResponse] = useState([{ question: "", answer: "" }]);

  const username = userStore((state) => state.username);
  const userId = userStore((state) => state.userId);
  const projectID = userStore((state) => state.projectID);
  const projectName = userStore((state) => state.projectName);
  const userPic = userStore((state) => state.userPic);
  const fileID = userStore((state) => state.fileID);
  const folderID=userStore((state)=>state.folderID);

  const [showFileModal, setShowFileModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [fileType, setFileType] = useState("");
  const [parentRepo, setParentRepo] = useState("");
  const [files, setFiles] = useState([]);
  const [isFilesOpen, setIsFilesOpen] = useState(false);
  const [selectFile, setSelectedFile] = useState(null);

  const [chatLoading, setChatLoading] = useState(false);
  const [editorLoading, setEditorLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [aiResponseImportantCode, setAiResponseImportantCode] = useState("");

  const [showUndoButton, setShowUndoButton] = useState(false);
  const [originalCode, setOriginalCode] = useState("");

  const getProjectDetails = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/code/get_project_ff`,
        {
          params: { projectID },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("files :", res.data.data);
      console.log("folders :", res.data.folders);
      // setParentRepo(res.data.data.folderName);
      // setFiles(res.data.data.folder);
      setFiles([...res.data.data, ...res.data.folders]);
    } catch (error) {
      console.log("error:", error.message);
    }
  };

  const getFileCode = async () => {
    try {
      setEditorLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/code/get_file_content`,
        {
          params: { fileID },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // console.log("file content:", res.data.data);
      setCode(
        res.data.data.content === " "
          ? "No content is available"
          : res.data.data.content
      );
      setEditorLoading(false);
      // .content
    } catch (error) {
      console.log("error:", error.message);
      setEditorLoading(false);
    }
  };

  const handleSaveCode = async () => {
    try {
      setEditorLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/code/update_code`,
        {
          fileID: fileID,
          content: code,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("save code data:", res.data.data);
      alert("Code saved successfully!");
      setEditorLoading(false);
    } catch (error) {
      console.log("error:", error.message);
      setEditorLoading(false);
    }
  };

  console.log("folderID:",folderID);
    console.log("fileID:",fileID);

  const handleCreateFile = async () => {
    if (!newFileName || !projectID) {
      return alert("All fields are required");
    }
    if (newFileName.includes(" ")) {
      alert(
        "File name cannot contain spaces. Please use underscores or hyphens instead."
      );
      return;
    }
    if (!newFileName.endsWith(".js")) {
      alert("Please add .js extension to your file name");
      return;
    }
    // console.log("file type:",fileType);
    
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/code/create_file`,
        {
          fileName: newFileName,
          content: " ",
          language: fileType,
          projectID: projectID,
          folderID: folderID || null,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("new file data:", res.data.data);
      setFiles(res.data.data);
      // if(files.length<1){
      // }else{

      //   setFiles((prev) => [...prev, res.data.data]);
      // }
      setShowFileModal(false);
    } catch (error) {
      console.log("error:", error.message);
      setShowFileModal(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName || !projectID) {
      return alert("All fields are required");
    }
    if (newFolderName.includes(" ")) {
      alert(
        "Folder name cannot contain spaces. Please use underscores or hyphens instead."
      );
      return;
    }
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/code/create_folder`,
        {
          folderName: newFolderName,
          projectID,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("new folder data:", res.data.data);
      setFiles((prev) => [...prev, res.data.data]);
      setShowFolderModal(false);
    } catch (error) {
      console.log("error:", error.message);
      setShowFolderModal(false);
    }
  };

  const messageHandler = async () => {
    // console.log("Username:", username);
    // console.log("User ID:", userId);
    // console.log("Project ID:", projectID);
    // console.log("Project Name:", projectName);
    // console.log("User Picture:", userPic);

    try {
      setChatLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/chat/send`,
        {
          from: userId,
          to: projectID,
          fromName: username,
          toName: projectName,
          message: sendMessage,
          fromPic: userPic,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setGetAllMessages((prev) => [...prev, res.data.data]);
      setSendMessage("");
      alert("Message sent successfully!");
      setChatLoading(false);

      console.log("message successully sended");
    } catch (error) {
      console.log("error:", error.message);
      setChatLoading(false);
    }
  };
  const fetchMessages = async () => {
    try {
      // console.log("userID:",userId==="68381f581c16499b75817325");
      // console.log("projectID:",projectID==="68382af5142923838053ff57");
      setChatLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/chat/messages`,
        {
          params: { from: userId, to: projectID },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // console.log("All messages successully fetched");
      // console.log("fetch messages:", res.data.data);
      setGetAllMessages(res.data.data);
      setChatLoading(false);
    } catch (error) {
      console.log("error:", error.message);
      setChatLoading(false);
    }
  };

  // Function to generate line numbers
  const generateLineNumbers = (text) => {
    const lines = text.split("\n");
    return lines.map((_, index) => index + 1).join("\n");
  };

  // Function to handle code compilation
  const handleRunCode = async () => {
    try {
      setEditorLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/code/update`,
        {
          code: code,
          language: "javascript",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setOutput(res.data.data);
      setEditorLoading(false);
      // console.log("Code execution done");
    } catch (error) {
      setEditorLoading(false);
      setOutput(`Error: ${error.message}`);
    }
  };

  // open ai api
  const sendPropmt = async () => {
    if (!query) {
      return console.log("error: Search box is empty");
    }
    // console.log("query:",query);

    try {
      setAiLoading(true);
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "meta-llama/llama-3-70b-instruct", // or "meta-llama/llama-3-8b-instruct"
          messages: [{ role: "user", content: query }],
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      // const reply = ;

      // console.log("All messages successully fetched");
      // console.log("ai response data:", res.data.data);
      // setGetAllMessages(res.data.data);
      setAiResponse((prev) => [
        ...prev,
        { question: query, answer: res.data.choices[0]?.message?.content },
      ]);
      // setAiResponseImportantCode
      // const str = res.data.choices[0]?.message?.content;

      // const match = str.match(/```([\s\S]*?)```/);

      // if (match) {
      //   const insideBackticks = match[1].trim();
      //   // console.log("Extracted content:", insideBackticks);
      //   setCode(insideBackticks);
      // }
      setAiLoading(false);
      setQuery("");
    } catch (error) {
      setAiLoading(false);
      console.log("error:", error.message);
    }
  };
  useEffect(() => {
    // runDemoString();
    fetchMessages();
    getProjectDetails();
    if (selectFile) {
      getFileCode();
    }
  }, []);

  return (
    <>
      <Nav />
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Sidebar - 20% width */}
        <div
          className={`${
            isSidebarOpen ? "w-1/5" : "w-0"
          } transition-all duration-300 bg-gray-100 border-r border-gray-200 flex flex-col overflow-x-visible relative`}
        >
          {/* Toggle Button - Vertically Centered */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10 bg-blue-500 hover:bg-blue-600 p-2 rounded-full cursor-pointer transition-colors duration-200 shadow-md"
          >
            {isSidebarOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          {/* Chat List */}
          <div className="flex-1 overflow-hidden py-10 px-3  mb-1 ">
            {isSidebarOpen && (
              <h3 className="font-semibold mb-4">{projectName} Chats</h3>
            )}
            {/* Chat list items would go here */}

            {isSidebarOpen && (
              <div className="space-y-2 overflow-y-auto  h-full ">
                {/* Demo Messages */}
                <div
                  ref={(el) => {
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="space-y-2 overflow-y-auto  h-full "
                >
                  {getAllMessages.map((message) => {
                    if (message.from === userId) {
                      return (
                        <div
                          key={message._id}
                          className={`p-2 rounded-lg shadow-sm hover:bg-gray-50 cursor-pointer ml-auto 
                           w-[75%] bg-white`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden`}
                            >
                              <iframe
                                src={message.fromPic}
                                title={message.fromName}
                                className="w-full h-full object-cover"
                                frameBorder="0"
                                allowFullScreen
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <p className="text-sm font-medium text-gray-700">
                                  {message.fromName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(
                                    message.updatedAt
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {message.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div
                          key={message._id}
                          className={`p-2 rounded-lg shadow-sm hover:bg-gray-50 cursor-pointer ${
                            message.senderName === "Wizard" ? "ml-auto" : ""
                          } w-[75%] bg-white`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-10 h-10  rounded-full flex items-center justify-center overflow-hidden`}
                            >
                              <iframe
                                src={message.fromPic}
                                title={message.fromName}
                                className="w-full h-full object-cover"
                                frameBorder="0"
                                allowFullScreen
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <p className="text-sm font-medium text-gray-700">
                                  {message.fromName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(
                                    message.updatedAt
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {message.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            )}
            {chatLoading && <Loading loaderType="chat" />}
          </div>

          {/* Search Area */}
          <div className="p-4 border-t border-gray-200 bg-gray-200 rounded-t-2xl  flex">
            {isSidebarOpen && (
              <>
                <input
                  type="text"
                  value={sendMessage}
                  placeholder="Hey there type something..."
                  onChange={(e) => setSendMessage(e.target.value)}
                  className="w-full px-3 py-2 mr-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={messageHandler}
                  className="py-2 px-3 text-white  bg-green-400 rounded-lg cursor-pointer hover:bg-green-500 transition-all"
                >
                  <Send />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Content Area - 80% width */}
        <div
          className={`${
            isSidebarOpen ? "w-4/5" : "w-full"
          } transition-all duration-300 flex flex-col`}
        >
          {/* Top Section - Editor and Output */}
          <div className="flex-1 flex ">
            {/* Code Editor */}
            <div className="w-1/2 p-4 border-r border-gray-200">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsFilesOpen(!isFilesOpen)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Files
                    </button>
                    {selectFile && (
                      <div className="  bg-gray-200 px-5 py-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="font-medium text-gray-700">
                            {selectFile.fileName?selectFile.fileName:selectFile.folderName}
                          </span>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => setShowFileModal(true)}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      New File
                    </button>
                    <button
                      onClick={() => setShowFolderModal(true)}
                      className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                      </svg>
                      New Folder
                    </button>
                  </div>

                  {isFilesOpen && (
                    <motion.div
                      initial={{ x: -300 }}
                      animate={{ x: 0 }}
                      exit={{ x: -300 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                      className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 shadow-lg z-40"
                    >
                      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700">
                          Project Files
                        </h3>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setIsFilesOpen(false)}
                          className="p-1 hover:bg-gray-100 rounded-full"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </motion.button>
                      </div>

                      <div className="p-4">
                        <div className="space-y-1">
                          {files && files.length > 0 ? (
                            files.map((file, index) => {
                              // console.log("file:",file);
                              if(file.folderID!==null && file.fileID){
                                console.log("folder and file id ")
                                return <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  whileHover={{ scale: 1.02 }}
                                  onClick={() => {
                                    if (!file.folderID) {
                                      userStore.getState().setFolderID(file.folderID);
                                      return setSelectedFile(file);
                                    } else {
                                      userStore.getState().setFileID(file._id);
                                      setSelectedFile(file);
                                    }
                                  }}
                                  className={`flex items-center gap-2 px-2 py-1   rounded-lg cursor-pointer transition-colors ${
                                    selectFile?.fileName === file.fileName
                                      ? "bg-blue-100 text-blue-700"
                                      : "hover:bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-3 w-3 ${
                                      selectFile?.fileName === file.fileName
                                        ? "text-blue-500"
                                        : "text-gray-500"
                                    }`}
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span className="text-xs">
                                    {file.fileName}
                                  </span>
                                </motion.div>
                              }
                              if (file.folderID !== null) {
                                return (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => {
                                      // console.log("file data:",file);

                                      userStore
                                        .getState()
                                        .setFolderID(file._id);
                                      return setSelectedFile(file);
                                    }}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                      selectFile?.folderName === file.folderName
                                        ? "bg-blue-100 text-blue-700"
                                        : "hover:bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    <span className="text-sm flex gap-1 items-center">
                                      <Folder />
                                      {file.folderName}
                                    </span>
                                  </motion.div>
                                );
                              }
                              return (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  whileHover={{ scale: 1.02 }}
                                  onClick={() => {
                                    // console.log("file data:",file._id);
                                 
                                      userStore.getState().setFileID(file._id);
                                      setSelectedFile(file);
                                    
                                  }}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                    selectFile?.fileName === file.fileName
                                      ? "bg-blue-100 text-blue-700"
                                      : "hover:bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-4 w-4 ${
                                      selectFile?.fileName === file.fileName
                                        ? "text-blue-500"
                                        : "text-gray-500"
                                    }`}
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span className="text-sm">
                                    {file.fileName}
                                  </span>
                                </motion.div>
                              );
                            })
                          ) : (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                              className="text-sm text-gray-500 pl-4"
                            >
                              No files created yet
                            </motion.p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* File Creation Modal */}
                  {showFileModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white p-6 rounded-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">
                          Create New File
                        </h3>
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            placeholder="Enter file name"
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                          <select
                            className="w-full px-3 py-2 border rounded-lg mb-4"
                            value={fileType}
                            onChange={(e) => setFileType(e.target.value)}
                          >
                            <option value="">Select file type</option>
                            <option value="javascript">JavaScript</option>
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                            <option value="py">Python</option>
                          </select>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setShowFileModal(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleCreateFile}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          >
                            Create
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Folder Creation Modal */}
                  {showFolderModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white p-6 rounded-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">
                          Create New Folder
                        </h3>
                        <input
                          type="text"
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          placeholder="Enter folder name"
                          className="w-full px-3 py-2 border rounded-lg mb-4"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setShowFolderModal(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleCreateFolder}
                            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                          >
                            Create
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-center items-center">
                    <button
                      onClick={handleSaveCode}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex cursor-pointer items-center gap-2 mr-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Save Code
                    </button>
                    <button
                      onClick={handleRunCode}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Run Code
                    </button>
                  </div>
                </div>
                <div className="flex flex-1">
                  {/* Line Numbers */}
                  <div className="w-12 bg-gray-100 p-2 font-mono text-sm text-gray-500 select-none overflow-hidden">
                    <pre>{generateLineNumbers(code)}</pre>
                  </div>
                  {/* Code Editor */}
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 p-4 font-mono text-sm bg-gray-50 rounded-lg focus:outline-none resize-none"
                    placeholder="Write your code here..."
                  />
                </div>
              </div>
            </div>

            {/* Output Area */}
            <div className="w-1/2 p-4">
              {/* {editorLoading && <Loading loaderType={"editor" } loadingStyle={`w-full h-full overflow-hidden`} />} */}

              <h3 className="font-semibold mb-2">Output</h3>
              <div className="bg-white p-4 rounded-lg h-[calc(100%-40px)] overflow-y-auto font-mono text-sm">
                <pre>
                  {output || "No output yet. Run your code to see results."}
                </pre>
              </div>
            </div>
          </div>

          {/* Bottom Section - AI Chat */}
          <div
            className={`${
              isAIChatOpen ? "h-1/3" : "h-12"
            } transition-all duration-300 border-t border-gray-200 p-4 bg-gray-50 relative`}
          >
            <div
              className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize bg-gray-200 hover:bg-blue-500 transition-colors"
              onMouseDown={(e) => {
                const startY = e.clientY;
                const startHeight = e.target.parentElement.offsetHeight;
                const container = e.target.parentElement;

                const handleMouseMove = (moveEvent) => {
                  const deltaY = moveEvent.clientY - startY;
                  const newHeight = Math.max(48, startHeight + deltaY);
                  container.style.height = `${newHeight}px`;

                  // Smooth animation
                  container.style.transition = "none";
                  requestAnimationFrame(() => {
                    container.style.transition = "height 0.1s ease-out";
                  });
                };

                const handleMouseUp = () => {
                  document.removeEventListener("mousemove", handleMouseMove);
                  document.removeEventListener("mouseup", handleMouseUp);
                };

                document.addEventListener("mousemove", handleMouseMove);
                document.addEventListener("mouseup", handleMouseUp);
              }}
            />
            <div className="absolute top-0 right-4 flex gap-2">
              <button
                onClick={() => {
                  const container =
                    document.querySelector(".ai-chat-container");
                  const currentHeight = container.offsetHeight;
                  container.style.height = `${currentHeight + 50}px`;
                }}
                className="p-1 bg-gray-200 hover:bg-blue-500 rounded-full transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                onClick={() => {
                  const container =
                    document.querySelector(".ai-chat-container");
                  const currentHeight = container.offsetHeight;
                  container.style.height = `${Math.max(
                    48,
                    currentHeight - 50
                  )}px`;
                }}
                className="p-1 bg-gray-200 hover:bg-blue-500 rounded-full transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            {/* AI Chat Toggle Button */}
            <button
              onClick={() => setIsAIChatOpen(!isAIChatOpen)}
              className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10 bg-blue-500 hover:bg-blue-600 px-4 py-1 rounded-full cursor-pointer transition-colors duration-200 shadow-md text-white"
            >
              {isAIChatOpen ? "Hide AI Chat" : "Show AI Chat"}
            </button>

            {isAIChatOpen && (
              <div className="flex flex-col h-full pt-4">
                <h3 className="font-semibold mb-2">AI Assistant</h3>
                <div className="flex-1 bg-white rounded-lg p-4 mb-2 overflow-y-auto">
                  {/* Chat messages would go here */}
                  {/* {aiResponse && aiResponse.length > 0 && (
                    <div className={`space-y-4 `}>
                      {aiResponse.map((response, index) => (
                        <div key={index} className={`flex items-start gap-3 `}>
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white font-bold">AI</span>
                            </div>
                          </div>
                          <div
                            className="flex-1 bg-blue-50 rounded-lg p-3 shadow-sm"
                            ref={(el) => {
                              if (el) {
                                el.scrollIntoView({ behavior: "smooth" });
                              }
                            }}
                          >
                            <p className="text-blue-800 font-medium mb-2">
                              {response.question}
                            </p>
                            <p className="text-gray-700">
                              {response.answer ||
                                "How can I help you with your project today? I can assist with coding, debugging, or provide guidance on best practices."}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )} */}
                  {aiResponse && aiResponse.length > 0 && (
                    <div className="space-y-6">
                      {aiResponse.map((response, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
                              <span className="text-white font-bold">AI</span>
                            </div>
                          </div>

                          <div
                            className="flex-1 bg-white border border-blue-200 rounded-xl p-4 shadow-sm"
                            ref={(el) =>
                              el && el.scrollIntoView({ behavior: "smooth" })
                            }
                          >
                            <p className="text-blue-800 font-semibold mb-2 text-lg">
                              {response.question}
                            </p>

                            <div className="text-gray-800 whitespace-pre-line leading-relaxed space-y-4">
                              {response.answer
                                ?.split(/```([\s\S]*?)```/g)
                                .map((part, i) =>
                                  i % 2 === 1 ? (
                                    <pre
                                      key={i}
                                      className="bg-gray-900 text-green-200 p-4 rounded-md overflow-x-auto text-sm font-mono"
                                    >
                                      {part.trim()}
                                    </pre>
                                  ) : (
                                    <p key={i}>{part.trim()}</p>
                                  )
                                )}
                              {!response.answer && (
                                <p className="text-gray-500 italic">
                                  No response generated yet. Please ask a
                                  question to get started.
                                </p>
                              )}
                              {response.answer?.includes("```") && (
                                <div className="flex gap-2 mt-4">
                                  <button
                                    onClick={() => {
                                      const codeBlock =
                                        response.answer.match(
                                          /```([\s\S]*?)```/
                                        )?.[1];
                                      if (codeBlock) {
                                        // Store the original code before modification
                                        const originalCode = code;
                                        setCode(codeBlock.trim());
                                        // Add undo button after code is modified
                                        setShowUndoButton(true);
                                        setOriginalCode(originalCode);
                                      }
                                    }}
                                    className="px-4 py-2 bg-green-500 cursor-pointer text-white rounded-lg hover:bg-green-600 transition-colors"
                                  >
                                    Add AI response to your code
                                  </button>
                                  {showUndoButton && (
                                    <button
                                      onClick={() => {
                                        setCode(originalCode);
                                        setShowUndoButton(false);
                                      }}
                                      className="px-4 py-2 bg-red-500 cursor-pointer text-white rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                      Undo Changes
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {aiLoading && (
                    <Loading
                      loaderType={"ai"}
                      loadingStyle={`w-full h-full `}
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase();

                      // if (value.includes('sudo/')) {
                      //   setQuery(prev => prev.includes('sudo/') ? `"${code}"` : prev);
                      //   return;
                      // }
                      if (value.includes("sudo/")) {
                        const replaced = value.replace(/sudo\//g, code); // replace all occurrences
                        setQuery(replaced);
                        return;
                      }

                      return setQuery(e.target.value);
                    }}
                    placeholder="Ask AI assistant..."
                    className="flex-1 text-xl px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    onClick={sendPropmt}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <SendHorizontal />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Code;
