import React, { useEffect, useState } from "react";
import Nav from "../nav/Nav";
import axios from "axios";
import userStore from "../context/store";
import { SendHorizontal, Send } from "lucide-react";

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

  const messageHandler = async () => {
    // console.log("Username:", username);
    // console.log("User ID:", userId);
    // console.log("Project ID:", projectID);
    // console.log("Project Name:", projectName);
    // console.log("User Picture:", userPic);

    try {
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

      console.log("message successully sended");
    } catch (error) {
      console.log("error:", error.message);
    }
  };
  const fetchMessages = async () => {
    try {
      // console.log("userID:",userId==="68381f581c16499b75817325");
      // console.log("projectID:",projectID==="68382af5142923838053ff57");
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
    } catch (error) {
      console.log("error:", error.message);
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
      const res=await axios.post(`${import.meta.env.VITE_BASE_URL}/code/update`,{
        code:code,
        language: "javascript"
      },{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      setOutput(res.data.data);
      // console.log("Code execution done");
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  // open ai api
  const sendPropmt = async () => {
    if (!query) {
      return console.log("error: Search box is empty");
    }

    try {
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "mistralai/mistral-7b-instruct", // or "meta-llama/llama-3-8b-instruct"
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
      setQuery("");
    } catch (error) {
      console.log("error:", error.message);
    }
  };

  useEffect(() => {
    fetchMessages();
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
                <div ref={(el) => {
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }

                }} className="space-y-2 overflow-y-auto  h-full ">
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
                                  {new Date(message.updatedAt).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" }
                                  )}
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
                                  {new Date(message.updatedAt).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" }
                                  )}
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
                <div className="flex justify-end mb-2">
                  <button
                    onClick={handleRunCode}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
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
                  {aiResponse && aiResponse.length > 0 && (
                    <div className={`space-y-4 `}>
                      {aiResponse.map((response, index) => (
                        <div key={index} className={`flex items-start gap-3 `}>
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white font-bold">AI</span>
                            </div>
                          </div>
                          <div className="flex-1 bg-blue-50 rounded-lg p-3 shadow-sm" ref={(el) => {
                            if (el) {
                              el.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}>
                            <p className="text-blue-800 font-medium mb-2">{response.question}</p>
                            <p className="text-gray-700">{response.answer || "How can I help you with your project today? I can assist with coding, debugging, or provide guidance on best practices."}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) }
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
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
