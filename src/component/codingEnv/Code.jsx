import React,{useState} from "react";
import Nav from "../nav/Nav";

function Code() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAIChatOpen, setIsAIChatOpen] = useState(true);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');

  // Function to generate line numbers
  const generateLineNumbers = (text) => {
    const lines = text.split('\n');
    return lines.map((_, index) => index + 1).join('\n');
  };

  // Function to handle code compilation
  const handleRunCode = async () => {
    try {
      // Here you would typically make an API call to your backend to compile/run the code
      // For now, we'll just simulate a response
      setOutput('Compiling and running code...\n');
      
      // Simulate API call
      const response = await new Promise(resolve => 
        setTimeout(() => resolve({ data: 'Code executed successfully!' }), 1000)
      );
      
      setOutput(prev => prev + response.data);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  return (
    <>
      <Nav />
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Sidebar - 20% width */}
        <div className={`${isSidebarOpen ? 'w-1/5' : 'w-0'} transition-all duration-300 bg-gray-100 border-r border-gray-200 flex flex-col overflow-x-visible relative`}>
          {/* Toggle Button - Vertically Centered */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10 bg-blue-500 hover:bg-blue-600 p-2 rounded-full cursor-pointer transition-colors duration-200 shadow-md"
          >
            {isSidebarOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto p-4">
            {isSidebarOpen &&<h3 className="font-semibold mb-4">Open Chats</h3>}
            {/* Chat list items would go here */}
          </div>
          
          {/* Search Area */}
          <div className="p-4 border-t border-gray-200">
            {isSidebarOpen && 
            <input
            type="text"
            placeholder="Search..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        }
          </div>
        </div>

        {/* Main Content Area - 80% width */}
        <div className={`${isSidebarOpen ? 'w-4/5' : 'w-full'} transition-all duration-300 flex flex-col`}>
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
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
                <pre>{output || 'No output yet. Run your code to see results.'}</pre>
              </div>
            </div>
          </div>

          {/* Bottom Section - AI Chat */}
          <div className={`${isAIChatOpen ? 'h-1/3' : 'h-12'} transition-all duration-300 border-t border-gray-200 p-4 bg-gray-50 relative`}>
            {/* AI Chat Toggle Button */}
            <button 
              onClick={() => setIsAIChatOpen(!isAIChatOpen)}
              className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10 bg-blue-500 hover:bg-blue-600 px-4 py-1 rounded-full cursor-pointer transition-colors duration-200 shadow-md text-white"
            >
              {isAIChatOpen ? 'Hide AI Chat' : 'Show AI Chat'}
            </button>

            {isAIChatOpen && (
              <div className="flex flex-col h-full pt-4">
                <h3 className="font-semibold mb-2">AI Assistant</h3>
                <div className="flex-1 bg-white rounded-lg p-4 mb-2 overflow-y-auto">
                  {/* Chat messages would go here */}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask AI assistant..."
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Send
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
