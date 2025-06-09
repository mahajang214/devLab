import React, { useEffect, useRef, useState } from "react";
import Nav from "../nav/Nav";
import axios from "axios";
import userStore from "../context/store";
import { SendHorizontal, Send, Folder } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Loading from "../loading/Loading";
import { Editor } from "@monaco-editor/react/dist";

function Code() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAIChatOpen, setIsAIChatOpen] = useState(true);
  const [code, setCode] = useState(``);
  const [output, setOutput] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [getAllMessages, setGetAllMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [aiResponse, setAiResponse] = useState([{ question: "", answer: "" }]);

  const username = userStore((state) => state.username);
  const userId = userStore((state) => state.userId);
  const projectID = userStore((state) => state.projectID);
  const projectName = userStore((state) => state.projectName);
  const userPic = userStore((state) => state.userPic);
  const fileID = userStore((state) => state.fileID);
  const folderID = userStore((state) => state.folderID);
  const socket = userStore((state) => state.socket);

  const [showFileModal, setShowFileModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [fileType, setFileType] = useState("");
  const [parentRepo, setParentRepo] = useState("");
  const [isFilesOpen, setIsFilesOpen] = useState(false);
  const [selectFile, setSelectedFile] = useState(null);

  const [chatLoading, setChatLoading] = useState(false);
  const [editorLoading, setEditorLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [aiResponseImportantCode, setAiResponseImportantCode] = useState("");

  const [showUndoButton, setShowUndoButton] = useState(false);
  const [originalCode, setOriginalCode] = useState("");

  const [expandedFolders, setExpandedFolders] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [folderChilds, setFolderChilds] = useState([]);

  const [selectedText, setSelectedText] = useState("");
  const [hasScrolled, setHasScrolled] = useState(false);

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showFolderRenameModal, setShowFolderRenameModal] = useState(false);

  const [roomID, setRoomID] = useState("");

  const remoteCursors = new Map();
  const selectFileRef = useRef(selectFile);

  // console.log("online users:", onlineUsers);

  // socket
  useEffect(() => {
    socket.on("connect", () => {
      // console.log(`Client is connected: `);
    });

    socket.on("message", (msg) => {
      // console.log('new message received:', msg);
      setGetAllMessages((prev) => [...prev, msg]);
    });

    // online users
    socket.on("online-users", (data) => {
      // console.log("socket online users data:", data);
      const isUserAlreadyOnline = onlineUsers.some(
        (user) => user.data.username !== data.username
      );
      if (!isUserAlreadyOnline) {
        setOnlineUsers((prev) => [...prev, { data }]);
      }
    });

    socket.on("join-room", (roomid) => {
      // console.log("join room data:", roomid);
      // setRoomID(roomid);
    });

    socket.on("code-change", ({  code,fileName }) => {
      // console.log("socket code updated");
      // setCode(data.content);

      if (fileName === selectFileRef.current.fileName  || fileName == selectFileRef.current.folderName){
       return  setCode(code);
      } 
      return;

      
    });

    socket.on("cursor-move", ({ username, cursorPosition, fileName }) => {
      

      if (fileName !== (selectFile?.fileName )) return; // only show for current file
      showRemoteCursor(username, cursorPosition);
    });
    

    return () => {
      socket.off("message");
      socket.off("online-users");
      socket.off("join-room");
      socket.off("code-change");
      socket.off("join-room");
      socket.off("connect");
      socket.off("cursor-move");
    if (!localStorage.getItem("token") || !username) {
      console.log("username:",username)
      localStorage.removeItem("token");
      navigate("/login");
    }
    socket.off("disconnect");
    };
  }, []);

  const getProjectDetails = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/code/get_project_files`,
        {
          params: { projectID },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const foldersWithFilse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/code/get_project_folders`,
        {
          params: { projectID },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // console.log("root files :", res.data.data);
      // console.log("root folders :", foldersWithFilse.data.folders);
      // console.log("child files : ",foldersWithFilSe.data.folderFiles);
      // setParentRepo(res.data.data.folderName);
      // setFiles(res.data.data.folder);
      setFiles(res.data.data);
      setFolders(foldersWithFilse.data.folders);
      setFolderChilds(foldersWithFilse.data.folderFiles);
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
      // console.log("file content:", selectFile.content);
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
  useEffect(() => {
    if (!selectFile) {
      return;
    }
    selectFileRef.current = selectFile;
    // console.log("current file:",selectFile);
    getFileCode();
  }, [selectFile]);

  useEffect(() => {
    socket.emit("online-users", { username });

    socket.emit("join-room", projectName);
  }, []);

  const handleSaveCode = async () => {
    try {
      setEditorLoading(true);
      socket.emit("code-update", {
        fileID: fileID,
        content: code,
      });
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
      // console.log("save code data:", res.data.data);
      // alert("Code saved successfully!");
      setEditorLoading(false);
    } catch (error) {
      console.log("error:", error.message);
      setEditorLoading(false);
    }
  };

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
    const fileExtensions = {
      python: ".py",
      python2: ".py",
      javascript: ".js",
      typescript: ".ts",
      c: ".c",
      cpp: ".cpp",
      "c++": ".cpp",
      java: ".java",
      go: ".go",
      ruby: ".rb",
      rust: ".rs",
      php: ".php",
      csharp: ".cs",
      kotlin: ".kt",
      swift: ".swift",
      scala: ".scala",
      dart: ".dart",
      haskell: ".hs",
      bash: ".sh",
      perl: ".pl",
      r: ".r",
      lua: ".lua",
    };
    const isFileNameExists =
      files.some((file) => file.fileName === newFileName) ||
      files.some((folder) => folder.folderName === newFileName) ||
      files.some(
        (folder) =>
          folder.folderChilds &&
          folder.folderChilds.some(
            (child) =>
              child.fileName === newFileName || child.folderName === newFileName
          )
      );

    if (isFileNameExists) {
      alert("A file or folder with this name already exists");
      return;
    }

    const requiredExtension = fileExtensions[fileType];
    if (!newFileName.endsWith(requiredExtension)) {
      alert(`Please add ${requiredExtension} extension to your file name`);
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
      // console.log("new file data:", res.data.data);
      setFiles((prev) => [...prev, res.data.data]);
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
    const isFolderNameExists = files.some(
      (folder) =>
        folder.folderName === newFolderName ||
        (folder.folderChilds &&
          folder.folderChilds.some(
            (child) => child.folderName === newFolderName
          ))
    );

    if (isFolderNameExists) {
      alert("A folder with this name already exists");
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
      // console.log("new folder data:", res.data.data);
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
      socket.emit("message", {
        from: userId,
        to: projectID,
        fromName: username,
        toName: projectName,
        message: sendMessage,
        fromPic: userPic,
      });

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

      setSendMessage("");
      // alert("Message sent successfully!");
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

  // Function to handle code compilation
  const handleRunCode = async () => {
    try {
      setEditorLoading(true);
      const res = await axios.post(
        "https://emkc.org/api/v2/piston/execute",
        {
          files: [
            {
              name: `${selectFile.fileName}`,
              content: code,
            },
          ],
          language: `${selectFile.language}`,
          version:
            selectFile.language === "javascript"
              ? "18.15.0"
              : selectFile.language === "typescript"
              ? "5.0.3"
              : selectFile.language === "python"
              ? "3.10.0"
              : selectFile.language === "python2"
              ? "2.7.18"
              : selectFile.language === "java"
              ? "15.0.2"
              : selectFile.language === "c"
              ? "10.2.0"
              : selectFile.language === "c++" || selectFile.language === "cpp"
              ? "10.2.0"
              : selectFile.language === "go"
              ? "1.16.2"
              : selectFile.language === "ruby"
              ? "3.0.1"
              : selectFile.language === "rust"
              ? "1.68.2"
              : selectFile.language === "php"
              ? "8.2.3"
              : selectFile.language === "csharp"
              ? "6.12.0"
              : selectFile.language === "kotlin"
              ? "1.8.20"
              : selectFile.language === "swift"
              ? "5.3.3"
              : selectFile.language === "scala"
              ? "3.2.2"
              : selectFile.language === "dart"
              ? "2.19.6"
              : selectFile.language === "haskell"
              ? "9.0.1"
              : selectFile.language === "bash"
              ? "5.2.0"
              : selectFile.language === "perl"
              ? "5.36.0"
              : selectFile.language === "r"
              ? "4.1.1"
              : selectFile.language === "lua"
              ? "5.4.4"
              : "3.10.0",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // console.log("code output :",res.data.run.stdout);
      // console.log("code output error :",res.data.run.stderr);
      if (res.data.run.stdout) setOutput(res.data.run.stdout);
      else if (res.data.run.stderr) setOutput(res.data.run.stderr);
      // setOutput(res.data.data);
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
    // console.log("ai query:",query);

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

      setAiLoading(false);
      setQuery("");
      setUserQuery("");
    } catch (error) {
      setAiLoading(false);

      console.log("error:", error.message);
    }
  };

  useEffect(() => {
    fetchMessages();
    getProjectDetails();
  }, []);

  useEffect(() => {
    // socket.emit("code-change", ({ roomID:roomID, data:code }));
    // handleSaveCode();
    // console.log("selected file fileName:",selectFile.fileName);
    // console.log("code :",code);

    if(selectFileRef.current){
    
      socket.emit("code-change", { roomid: projectName, code,fileName:(selectFileRef.current.fileName || selectFileRef.current.folderName) });
  
      // console.log("sended code to socket")
  
      handleSaveCode();
    }

    return;
  }, [code]);

  // console.log("file id:",fileID);
  const deleteFile = async () => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/code/delete_file/${fileID}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("data :", res.data.data);
      setFiles(files.filter((file) => file._id !== fileID));
      setFolderChilds(folderChilds.filter((file) => file._id !== fileID));
    } catch (error) {
      console.log("error:", error.message);
    }
  };

  const deleteFolder = async () => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/code/delete_folders/${folderID}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("data :", res.data.data);
      setFolders(folders.filter((folder) => folder._id !== folderID));
    } catch (error) {
      console.log("error:", error.message);
    }
  };

  const renameFile = async () => {
    if (!newFileName || !projectID) {
      return alert("All fields are required");
    }
    if (newFileName.includes(" ")) {
      alert(
        "File name cannot contain spaces. Please use underscores or hyphens instead."
      );
      return;
    }

    const isFileNameExists =
      files.some((file) => file.fileName === newFileName) ||
      files.some((folder) => folder.folderName === newFileName) ||
      files.some(
        (folder) =>
          folder.folderChilds &&
          folder.folderChilds.some(
            (child) =>
              child.fileName === newFileName || child.folderName === newFileName
          )
      );

    if (isFileNameExists) {
      alert("A file or folder with this name already exists");
      return;
    }

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/code/rename_file`,
        {
          fileID,
          newFileName,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("data :", res.data.data);
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file._id === fileID ? { ...file, fileName: newFileName } : file
        )
      );

      // Update in folderChilds if the file exists there
      setFolderChilds((prevChilds) =>
        prevChilds.map((folder) => ({
          ...folder,
          files: folder.files.map((file) =>
            file._id === fileID ? { ...file, fileName: newFileName } : file
          ),
        }))
      );
    } catch (error) {
      console.log("error:", error.message);
    }
  };

  const renameFolder = async () => {
    const isFileNameExists =
      files.some((file) => file.fileName === newFileName) ||
      files.some((folder) => folder.folderName === newFileName) ||
      files.some(
        (folder) =>
          folder.folderChilds &&
          folder.folderChilds.some(
            (child) =>
              child.fileName === newFileName || child.folderName === newFileName
          )
      );

    if (isFileNameExists) {
      alert("A file or folder with this name already exists");
      return;
    }

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/code/rename_folder`,
        {
          folderID,
          newFileName,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("data :", res.data.data);
      setFolders((prevFolders) =>
        prevFolders.map((folder) =>
          folder._id === folderID
            ? { ...folder, folderName: newFileName }
            : folder
        )
      );

      // Update in folderChilds if the folder exists there
      setFolderChilds((prevChilds) =>
        prevChilds.map((folder) => ({
          ...folder,
          files: folder.files.map((file) =>
            file._id === folderID ? { ...file, folderName: newFileName } : file
          ),
        }))
      );
    } catch (error) {
      console.log("error:", error.message);
    }
  };

  const editorRef = useRef(null);

 
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

    editor.onDidChangeCursorSelection((e) => {
      const selection = editor.getSelection();
      const model = editor.getModel();

      if (!selection || !model) return;

      const position = selection.getPosition(); // safer than e.selection.getPosition()

      if (!position) return;
      const currentSelectFile = selectFileRef.current;

      const selectedText = model.getValueInRange(selection);
      setSelectedText(selectedText);

      socket.emit("cursor-move", {
        roomid: projectName,
        cursorPosition: {
          line: position.lineNumber,
          column: position.column,
        },
        fileName: selectFileRef.current ? (selectFileRef.current.fileName || selectFileRef.current.folderName) : "unknown",
        username,
      });
    });
  };

  function showRemoteCursor(username, cursorPosition) {
    if (!editorRef.current) return;
    const { line, column } = cursorPosition;

    // Remove previous decoration
    const oldDecorations = remoteCursors.get(username);
    
    if (oldDecorations) {
      editorRef.current.deltaDecorations(oldDecorations, []);
    }

    function getColorClass(username) {
      const colors = ["red", "green", "blue", "orange", "purple"];
      const index =
        [...username].reduce((sum, c) => sum + c.charCodeAt(0), 0) %
        colors.length;
      return `cursor-${colors[index]}`;
    }

    // Create new decoration
    const newDecorations = editorRef.current.deltaDecorations(
      [],
      [
        {
          range: new monaco.Range(line, column, line, column),
          options: {
            className: `remote-cursor ${getColorClass(username)}`,
            hoverMessage: { value: `**${username}**` },
            stickiness:
              monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          },
        },
      ]
    );

    remoteCursors.set(username, newDecorations);
  }

  return (
    <>
      <Nav navStyle={`bg-gray-900`} />
      <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#1E1E1E]">
        {/* Left Sidebar - 20% width */}
        <div
          className={`${
            isSidebarOpen ? "w-full sm:w-full md:w-1/3 lg:w-1/5" : "w-0"
          } transition-all duration-300 bg-[#23272E] border-r border-[#333] flex flex-col overflow-x-visible relative`}
        >
          {/* Toggle Button - Vertically Centered */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10 bg-[#2D3748] hover:bg-[#4A5568] p-2 rounded-full cursor-pointer transition-colors duration-200 shadow-md"
          >
            {isSidebarOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 md:h-5 md:w-5 text-white"
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
                className="h-4 w-4 md:h-5 md:w-5 text-white"
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
          <div className="flex-1 overflow-hidden py-6 md:py-10 px-2 md:px-3 mb-1">
            {isSidebarOpen && (
              <h3 className="font-semibold mb-4 text-[#e0e0e0] text-sm md:text-base">
                {projectName} Chats
              </h3>
            )}

            {isSidebarOpen && (
              <div className="my-4">
                <h3 className="font-semibold mb-2 text-[#e0e0e0] text-sm md:text-base">
                  Online Users
                </h3>
                <div className="space-y-1">
                  {onlineUsers.map((user, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-gray-300"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs md:text-sm">{user.data.username}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isSidebarOpen && (
              <div className="space-y-2 overflow-y-auto h-full">
                <div
                  ref={(el) => {
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="space-y-2 overflow-y-auto h-full"
                >
                  {getAllMessages.map((message, i) => {
                    if (message.from === userId) {
                      return (
                        <div
                          key={i}
                          className={`p-2 rounded-lg shadow-sm hover:bg-gray-50 cursor-pointer ml-auto 
                           w-[90%] md:w-[75%] bg-white`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden`}
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
                                <p className="text-xs md:text-sm font-medium text-gray-700">
                                  {message.fromName}
                                </p>
                                <p className="text-[10px] md:text-xs text-gray-500">
                                  {new Date(message.updatedAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              <p className="text-xs md:text-sm text-gray-600 mt-1">
                                {message.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div
                          key={i}
                          className={`p-2 rounded-lg shadow-sm hover:bg-gray-50 cursor-pointer ${
                            message.senderName === "Wizard" ? "ml-auto" : ""
                          } w-[90%] md:w-[75%] bg-white`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center overflow-hidden`}
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
                                <p className="text-xs md:text-sm font-medium text-gray-700">
                                  {message.fromName}
                                </p>
                                <p className="text-[10px] md:text-xs text-gray-500">
                                  {new Date(message.updatedAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              <p className="text-xs md:text-sm text-gray-600 mt-1">
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
          <div className="p-2 md:p-4 border-t border-[#333] bg-[#23272E] rounded-t-2xl flex">
            {isSidebarOpen && (
              <>
                <input
                  type="text"
                  value={sendMessage}
                  placeholder="Hey there type something..."
                  onChange={(e) => setSendMessage(e.target.value)}
                  className="w-full px-2 md:px-3 py-1.5 md:py-2 mr-2 rounded-lg border border-[#444] bg-[#1E1E1E] text-[#e0e0e0] text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={messageHandler}
                  className="py-1.5 md:py-2 px-2 md:px-3 text-white bg-green-600 rounded-lg cursor-pointer hover:bg-green-700 transition-all"
                >
                  <Send className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Content Area - 80% width */}
        <div
          className={`${
            isSidebarOpen ? "w-0 sm:w-0 md:w-2/3 lg:w-4/5" : "w-full"
          } transition-all duration-300 flex flex-col bg-[#1E1E1E]`}
        >
          {/* Top Section - Editor and Output */}
          <div className="flex-1 flex flex-col lg:flex-row h-full w-full ">
            {/* Code Editor */}
            <div className="w-full  h-1/2 lg:h-full  lg:w-1/2 p-4 border-r border-[#333] ">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setIsFilesOpen(!isFilesOpen)}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 sm:h-5 sm:w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="hidden sm:inline">Files</span>
                    </button>
                    {selectFile && (
                      <div className="bg-gray-200 px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg max-w-[200px] sm:max-w-none overflow-hidden">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="font-medium text-gray-700 text-sm sm:text-base truncate">
                            {selectFile.fileName
                              ? selectFile.fileName
                              : selectFile.folderName}
                          </span>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => setShowFileModal(true)}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 sm:h-5 sm:w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="hidden sm:inline">New File</span>
                    </button>
                    <button
                      onClick={() => setShowFolderModal(true)}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 sm:h-5 sm:w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                      </svg>
                      <span className="hidden sm:inline">New Folder</span>
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

                      <div className="p-4 ">
                        <div className="space-y-1">
                          {files && files.length > 0 ? (
                            <>
                              {/* Root Files */}
                              <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-500 mb-2">
                                  Root Files
                                </h4>
                                {files.map((file, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => {
                                      userStore.getState().setFolderID("");
                                      userStore.getState().setFileID(file._id);
                                      return setSelectedFile(file);
                                    }}
                                    className={`flex justify-between items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                      selectFile?.fileName === file.fileName
                                        ? "bg-blue-100 text-blue-700"
                                        : "hover:bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    <div className="flex items-center gap-1">
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
                                      <span className="text-md">
                                        {file.fileName}
                                      </span>
                                    </div>

                                    {/* rename file */}
                                    {fileID === file._id && (
                                      <div className=" ">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setNewFileName(file.fileName);
                                            setShowRenameModal(true);
                                          }}
                                          className="ml-auto p-1 cursor-pointer hover:bg-blue-100 rounded-full transition-colors mr-1"
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 text-blue-500"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                          >
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                          </svg>
                                        </button>

                                        {/* delete button */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            return deleteFile(file._id);
                                          }}
                                          className="ml-auto p-1 cursor-pointer hover:bg-red-100 rounded-full transition-colors"
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 text-red-500"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        </button>
                                      </div>
                                    )}
                                  </motion.div>
                                ))}
                              </div>

                              {/* Folders */}
                              <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-500 mb-2">
                                  Folders
                                </h4>
                                {folders.map((folder, index) => (
                                  <div key={folder._id}>
                                    <motion.div
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.1 }}
                                      whileHover={{ scale: 1.02 }}
                                      onClick={() => {
                                        userStore
                                          .getState()
                                          .setFolderID(folder._id);
                                        userStore.getState().setFileID("");
                                        setSelectedFile(null);
                                      }}
                                      className={`flex justify-between items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                        userStore.getState().folderID ===
                                        folder._id
                                          ? "bg-green-100 text-green-700"
                                          : "hover:bg-gray-100 text-gray-700"
                                      }`}
                                    >
                                      <div className="flex items-center gap-1">
                                        <Folder className="h-4 w-4 text-gray-500" />
                                        <span className="text-md">
                                          {folder.folderName}
                                        </span>
                                      </div>

                                      <div>
                                        {folderID === folder._id && (
                                          <>
                                            {/* rename btn */}
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setNewFileName(
                                                  folder.folderName
                                                );
                                                // setFolderID(folder._id);
                                                setShowFolderRenameModal(true);
                                              }}
                                              className="ml-auto p-1 hover:bg-blue-100 rounded-full transition-colors"
                                            >
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 text-blue-500"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                              >
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                              </svg>
                                            </button>

                                            {/* delete btn */}

                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                return deleteFolder(folder._id);
                                              }}
                                              className="ml-auto p-1 hover:bg-red-100 rounded-full transition-colors"
                                            >
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 text-red-500"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                              >
                                                <path
                                                  fillRule="evenodd"
                                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                  clipRule="evenodd"
                                                />
                                              </svg>
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </motion.div>
                                    {folderChilds.map((el, k) => {
                                      return (
                                        el.folderID === folder._id && (
                                          <motion.div
                                            key={el._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: k * 0.1 }}
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => {
                                              userStore
                                                .getState()
                                                .setFileID(el._id);
                                              setSelectedFile(el);
                                            }}
                                            className={`flex justify-between items-center gap-2 px-3 py-2 ml-4 rounded-lg cursor-pointer transition-colors ${
                                              selectFile?.fileName ===
                                              el.fileName
                                                ? "bg-blue-100 text-blue-700"
                                                : "hover:bg-gray-100 text-gray-700"
                                            }`}
                                          >
                                            <div className="flex items-center">
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className={`h-4 w-4 ${
                                                  selectFile?.fileName ===
                                                  el.fileName
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
                                              <span className="text-md">
                                                {el.fileName}
                                              </span>
                                            </div>
                                            <div>
                                              {/* delete button */}
                                              {/* rename btn */}
                                              {fileID === el._id && (
                                                <>
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setNewFileName(
                                                        file.fileName
                                                      );
                                                      setShowRenameModal(true);
                                                    }}
                                                    className="ml-auto p-1 cursor-pointer hover:bg-blue-100 rounded-full transition-colors mr-1"
                                                  >
                                                    <svg
                                                      xmlns="http://www.w3.org/2000/svg"
                                                      className="h-4 w-4 text-blue-500"
                                                      viewBox="0 0 20 20"
                                                      fill="currentColor"
                                                    >
                                                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                    </svg>
                                                  </button>

                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      return deleteFile(el._id);
                                                    }}
                                                    className="ml-auto p-1 cursor-pointer hover:bg-red-100 rounded-full transition-colors"
                                                  >
                                                    <svg
                                                      xmlns="http://www.w3.org/2000/svg"
                                                      className="h-4 w-4 text-red-500"
                                                      viewBox="0 0 20 20"
                                                      fill="currentColor"
                                                    >
                                                      <path
                                                        fillRule="evenodd"
                                                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                        clipRule="evenodd"
                                                      />
                                                    </svg>
                                                  </button>
                                                </>
                                              )}
                                            </div>
                                          </motion.div>
                                        )
                                      );
                                    })}
                                  </div>
                                ))}
                              </div>

                              {/* Folder Files */}
                              {/* <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Folder Files</h4>
                                {folderChilds.map((file, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => {
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
                                    <span className="text-md">
                                      {file.fileName}
                                    </span>
                                  </motion.div>
                                ))}
                              </div> */}
                            </>
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
                          {/* Rename file Modal */}
                          {showRenameModal && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                              <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
                                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                                  Rename File
                                </h3>
                                <input
                                  type="text"
                                  value={newFileName}
                                  onChange={(e) =>
                                    setNewFileName(e.target.value)
                                  }
                                  placeholder="Enter new file name"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => setShowRenameModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => {
                                      renameFile();
                                      setShowRenameModal(false);
                                    }}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                  >
                                    Rename
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* folder rename modal */}
                          {showFolderRenameModal && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                              <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
                                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                                  Rename Folder
                                </h3>
                                <input
                                  type="text"
                                  value={newFileName}
                                  onChange={(e) =>
                                    setNewFileName(e.target.value)
                                  }
                                  placeholder="Enter new folder name"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() =>
                                      setShowFolderRenameModal(false)
                                    }
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => {
                                      renameFolder();
                                      setShowFolderRenameModal(false);
                                    }}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                  >
                                    Rename
                                  </button>
                                </div>
                              </div>
                            </div>
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
                            <option value="javascript">
                              JavaScript (v16.3.0)
                            </option>
                            <option value="python">Python (v3.10.0)</option>
                            <option value="c">C (v10.2.0)</option>
                            <option value="cpp">C++ (v10.2.0)</option>
                            <option value="java">Java (v15.0.2)</option>
                            <option value="go">Go (v1.15.5)</option>
                            <option value="ruby">Ruby (v3.0.0)</option>
                            <option value="rust">Rust (v1.49.0)</option>
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
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-0">
                    <button
                      onClick={handleSaveCode}
                      className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex cursor-pointer items-center justify-center gap-1 sm:gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 sm:h-5 sm:w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm sm:text-base">Save Code</span>
                    </button>
                    <button
                      onClick={handleRunCode}
                      className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer flex items-center justify-center gap-1 sm:gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 sm:h-5 sm:w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm sm:text-base">Run Code</span>
                    </button>
                  </div>
                </div>
                {/* Code Editor */}
                <div className="flex flex-1 bg-[#1E1E1E]">
                  {/* {console.log("select file language:", selectFile.language)} */}
                  <Editor
                    height="100%"
                    width="100%"
                    defaultLanguage={
                      selectFile ? selectFile.language : "javascript"
                    }
                    defaultValue="// write your code here"
                    value={code}
                    theme="vs-dark"
                    options={{
                      fontSize: window.innerWidth >= 1024 ? 23 : 16,
                      wordWrap: "on",
                    }}
                    onMount={handleEditorDidMount}
                    onChange={(value) => {
                      setCode(value);
                      // console.log("code:",code);
                      setSelectedText("");
                    }}

                    // onChange={(e) => {
                    //   setCode(e.target.value);
                    //   setSelectedText(""); // Clear selected text when user types
                    // }}
                    // onSelect={(e) => {
                    //   const value = e.target.value;
                    //   const selectionStart = e.target.selectionStart;
                    //   const selectionEnd = e.target.selectionEnd;

                    //   if (selectionStart !== selectionEnd) {
                    //     const codeSelectedText = value.substring(
                    //       selectionStart,
                    //       selectionEnd
                    //     );
                    //     setSelectedText(codeSelectedText);
                    //   }
                    // }}
                  />
                  {selectedText && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="fixed bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2 z-50 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={userQuery}
                            onChange={(e) => {
                              const input = e.target.value;
                              setUserQuery(input);

                              // Build query based on selectedText once, if query is not already set
                              if (!query && selectedText) {
                                setQuery(`${selectedText} ${input}`);
                              } else {
                                setQuery(`${selectedText} ${input}`);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && query.trim()) {
                                sendPropmt(); // Ensure this function exists
                              }
                            }}
                            className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
                            placeholder="Ask AI about this code..."
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (query) {
                              sendPropmt();
                            }
                          }}
                          className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg flex items-center justify-center"
                        >
                          <Send className="h-5 w-5" />
                        </motion.button>
                      </div>
                      <p className="text-md text-gray-500 mt-2 text-center">
                        What you want to change in that
                      </p>

                      {aiResponse.length > 0 && (
                        <h2 className="text-red-500 text-center">
                          Please check your ai section.
                        </h2>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Output Area */}
            <div className="w-full  h-1/2 lg:h-full  lg:w-1/2 p-4">
              <h3 className="font-semibold mb-2 text-[#e0e0e0] mt-4">Output</h3>
              <div className="bg-[#23272E] p-4 rounded-lg h-[calc(100%-40px)] overflow-y-auto font-mono text-sm text-[#e0e0e0]">
                <pre>
                  {output || "No output yet. Run your code to see results."}
                </pre>
              </div>
            </div>
          </div>

          {/* Bottom Section - AI Chat */}
          <div
            id="ai"
            className={`transition-all duration-300 border-t border-gray-700 bg-[#23272E] relative ai-chat-container   flex-shrink-0 ${
              isAIChatOpen ? "h-[32vh] p-4" : "h-12 p-0"
            }`}
            style={{
              minHeight: isAIChatOpen ? "250px" : "3rem", // Ensures enough height for chat on open
              maxHeight: isAIChatOpen ? "32vh" : "3rem", // Prevents overflow on open
              overflow: isAIChatOpen ? "visible" : "hidden",
              position: "sticky",
              bottom: 0,
              zIndex: 30,
            }}
          >
            {/* AI Chat Toggle Button */}
            <button
              onClick={() => setIsAIChatOpen(!isAIChatOpen)}
              className={`absolute -top-0 left-1/2 transform -translate-x-1/2 z-50 bg-blue-500 hover:bg-blue-600 px-4 py-2  cursor-pointer transition-colors duration-200 shadow-md text-white rounded-${
                isAIChatOpen ? "full" : "md"
              } transition-all`}
            >
              {isAIChatOpen ? "Hide AI Chat" : "Show AI Chat"}
            </button>

            {isAIChatOpen && (
              <>
                {/* <div className="absolute top-0 right-4 flex gap-2">
                  <button
                    onClick={() => {
                      const container =
                        document.querySelector(".ai-chat-container");
                      const currentHeight = container.offsetHeight;
                      container.style.height = `${currentHeight + 50}px`;
                    }}
                    className="p-1 bg-[#23272E] hover:bg-blue-500 rounded-full transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
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
                    className="p-1 bg-[#23272E] hover:bg-blue-500 rounded-full transition-colors"
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
                </div> */}
                <div className="flex flex-col h-full pt-4">
                  <h3 className="font-semibold mb-2 text-[#e0e0e0]">
                    AI Assistant
                  </h3>
                  <div className="flex-1 bg-[#1E1E1E] rounded-lg p-4 mb-2 overflow-y-auto">
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
                              ref={(el) => {
                                if (el && !hasScrolled) {
                                  el.scrollIntoView({ behavior: "smooth" });
                                  setHasScrolled(true);
                                }
                              }}
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
                                    use " sudo/ " and paste all your code for
                                    change.
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
                                          if (selectedText) {
                                            // Replace selected text with AI code
                                            const newCode = code.replace(
                                              selectedText,
                                              codeBlock.trim()
                                            );
                                            setCode(newCode);
                                          } else {
                                            // Replace entire code if no selection
                                            setCode(codeBlock.trim());
                                          }
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
                      value={userQuery}
                      onChange={(e) => {
                        const input = e.target.value;
                        setUserQuery(input);

                        if (!query && selectedText) {
                          setQuery(`${selectedText} ${input}`);
                        } else {
                          setQuery(`${selectedText} ${input}`);
                        }

                        const value = e.target.value.toLowerCase();

                        if (value.includes("sudo/")) {
                          const replaced = value.replace(/sudo\//g, code);
                          setQuery(replaced);
                          return;
                        }

                        return setQuery(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && query.trim()) {
                          sendPropmt();
                        }
                      }}
                      placeholder="Ask AI assistant..."
                      className="flex-1 text-xl px-3 py-2 rounded-lg border border-gray-700 bg-[#23272E] text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                      onClick={sendPropmt}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <SendHorizontal />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        </div>
    </>
  );
}

export default Code;
