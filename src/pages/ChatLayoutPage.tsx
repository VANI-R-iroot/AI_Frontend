import React, { useState } from "react";
import {
  FiMessageSquare,
  FiImage,
  FiCode,
  FiEdit3,
  FiVideo,
  FiMail,
  FiGlobe,
  FiSettings,
  FiHelpCircle,
  FiUser,
  FiSearch,
  FiPlus,
  FiMoreVertical,
  FiThumbsUp,
  FiRepeat,
  FiShare,
  FiRefreshCw,
  FiSend,
  FiMic,
  FiMoon,
  FiSun,
  FiChevronDown,
} from "react-icons/fi";

interface ChatLayoutPageProps {}
const ChatLayoutPage: React.FC<ChatLayoutPageProps> = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedTool, setSelectedTool] = useState("Text Generator");

  const tools = [
    { name: "Text Generator", icon: FiMessageSquare, color: "bg-green-500" },
    {
      name: "Image Generator",
      icon: FiImage,
      color: "bg-orange-500",
      badge: "NEW",
    },
    { name: "Code Generator", icon: FiCode, color: "bg-pink-500" },
    { name: "Image Editor", icon: FiEdit3, color: "bg-orange-600" },
    { name: "Video Generator", icon: FiVideo, color: "bg-cyan-500" },
    { name: "Email Generator", icon: FiMail, color: "bg-purple-500" },
    {
      name: "Website Generator",
      icon: FiGlobe,
      color: "bg-yellow-500",
      badge: "PRO",
    },
  ];

  const chatHistory = [
    { title: "AiWaveDefination", time: "Today" },
    { title: "Your last Question", time: "Today" },
    { title: "Business Shortcut Methods", time: "Today" },
    { title: "Best way to maintain code Quality", time: "Today" },
    { title: "How to write a code", time: "Yesterday" },
    { title: "Form Html CSS JS", time: "Yesterday" },
    { title: "HTML Shortcut Methods", time: "Yesterday" },
    { title: "Best way to maintain code Quality", time: "Yesterday" },
    { title: "AiWaveDefination", time: "Yesterday" },
    { title: "User Assistant Request", time: "Previous 7 days" },
    { title: "Function JS Windows", time: "Previous 7 days" },
    { title: "Go to Settings to activate Windows", time: "Previous 7 days" },
    { title: "Generate a Image", time: "Previous 7 days" },
  ];

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className={`min-h-screen flex ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div
        className={`w-64 ${isDarkMode ? "bg-gray-800" : "bg-white"} border-r ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        } flex flex-col`}
      >
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-sm font-medium mb-3 text-gray-400">TOOLS</h2>
          <div className="space-y-2">
            {tools.map((tool, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  selectedTool === tool.name
                    ? isDarkMode
                      ? "bg-gray-700"
                      : "bg-gray-100"
                    : "hover:bg-gray-700"
                }`}
                onClick={() => setSelectedTool(tool.name)}
              >
                <div
                  className={`w-6 h-6 rounded ${tool.color} flex items-center justify-center`}
                >
                  <tool.icon className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm">{tool.name}</span>
                {tool.badge && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      tool.badge === "NEW" ? "bg-blue-500" : "bg-yellow-500"
                    } text-white`}
                  >
                    {tool.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Settings Section */}
        <div className="p-4 border-b border-gray-700">
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-700">
              <FiSettings className="w-5 h-5" />
              <span className="text-sm">Setting</span>
              <FiPlus className="w-4 h-4 ml-auto" />
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-700">
              <FiHelpCircle className="w-5 h-5" />
              <span className="text-sm">Help & FAQ</span>
            </div>
          </div>
        </div>

        {/* User Section */}
        <div className="mt-auto p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <FiUser className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Adam Milner</div>
              <div className="text-xs text-gray-400">trentadam@net</div>
            </div>
            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
              Free
            </span>
          </div>
          <button className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            Upgrade To Pro
          </button>
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                isDarkMode ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              {isDarkMode ? (
                <FiMoon className="w-4 h-4" />
              ) : (
                <FiSun className="w-4 h-4" />
              )}
              <span className="text-sm">{isDarkMode ? "Dark" : "Light"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-medium">AI</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">AiWave</span>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    2.0
                  </span>
                </div>
                <div
                  className={`p-4 rounded-lg ${
                    isDarkMode ? "bg-gray-800" : "bg-gray-50"
                  }`}
                >
                  <p className="mb-4">
                    Certainly! Here's the result of your question:
                  </p>
                  <p className="mb-4">
                    You're already talking to a AiWave right now! You can ask me
                    anything or discuss various topics. Just type your questions
                    or statements, and I'll do my best to provide helpful and
                    informative responses.
                  </p>
                  <p>
                    If you have a specific topic in mind or if there's something
                    you'd like to know or discuss, feel free to let me know!
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button className="p-2 hover:bg-gray-700 rounded-lg">
                    <FiThumbsUp className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-700 rounded-lg">
                    <FiRepeat className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-700 rounded-lg">
                    <FiShare className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-700 rounded-lg">
                    <FiMoreVertical className="w-4 h-4" />
                  </button>
                  <button className="ml-auto flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600">
                    <FiRefreshCw className="w-4 h-4" />
                    <span className="text-sm">Regenerate</span>
                  </button>
                </div>
              </div>
            </div>

            {/* User Message */}
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiUser className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">Adam Milner</span>
                </div>
                <div
                  className={`p-4 rounded-lg ${
                    isDarkMode ? "bg-gray-800" : "bg-gray-50"
                  }`}
                >
                  <p>Could I know Everything from AiWave?</p>
                </div>
              </div>
            </div>

            {/* Another AI Response */}
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-medium">AI</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">AiWave</span>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    2.0
                  </span>
                </div>
                <div
                  className={`p-4 rounded-lg ${
                    isDarkMode ? "bg-gray-800" : "bg-gray-50"
                  }`}
                >
                  <p className="mb-4">
                    Certainly! Here's the result of your question:
                  </p>
                  <p>
                    While AiWave is a powerful language model that has been
                    trained on a diverse range of internet text, it doesn't know
                    everything. It has limitations...
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button className="p-2 hover:bg-gray-700 rounded-lg">
                    <FiThumbsUp className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-700 rounded-lg">
                    <FiRepeat className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-700 rounded-lg">
                    <FiShare className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-700 rounded-lg">
                    <FiMoreVertical className="w-4 h-4" />
                  </button>
                  <button className="ml-auto flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600">
                    <FiRefreshCw className="w-4 h-4" />
                    <span className="text-sm">Regenerate</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="p-6 border-t border-gray-700">
          <div className="max-w-4xl mx-auto">
            <div
              className={`relative flex items-center gap-2 p-4 rounded-lg ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } border ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
            >
              <FiSettings className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Send a message..."
                className="flex-1 bg-transparent border-none outline-none text-sm"
              />
              <button className="p-2 hover:bg-gray-700 rounded-lg">
                <FiPlus className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-700 rounded-lg">
                <FiMic className="w-4 h-4" />
              </button>
              <button
                onClick={handleSendMessage}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <FiSend className="w-4 h-4 text-white" />
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              AiWave can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div
        className={`w-80 ${isDarkMode ? "bg-gray-800" : "bg-white"} border-l ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors">
              <FiPlus className="w-4 h-4" />
              NEW CHAT
            </button>
          </div>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Here..."
              className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-100 border-gray-300"
              } border text-sm`}
            />
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium mb-3">Today</h3>
            <div className="space-y-2 mb-6">
              {chatHistory
                .filter((chat) => chat.time === "Today")
                .map((chat, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700 cursor-pointer group"
                  >
                    <span className="text-sm truncate">{chat.title}</span>
                    <FiMoreVertical className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
            </div>

            <h3 className="text-sm font-medium mb-3">Yesterday</h3>
            <div className="space-y-2 mb-6">
              {chatHistory
                .filter((chat) => chat.time === "Yesterday")
                .map((chat, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700 cursor-pointer group"
                  >
                    <span className="text-sm truncate text-gray-400">
                      {chat.title}
                    </span>
                    <FiMoreVertical className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
            </div>

            <div className="flex items-center justify-between cursor-pointer hover:bg-gray-700 p-2 rounded-lg">
              <span className="text-sm">Show More</span>
              <FiChevronDown className="w-4 h-4" />
            </div>

            <h3 className="text-sm font-medium mb-3 mt-6">Previous 7 days</h3>
            <div className="space-y-2">
              {chatHistory
                .filter((chat) => chat.time === "Previous 7 days")
                .map((chat, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700 cursor-pointer group"
                  >
                    <span className="text-sm truncate text-gray-400">
                      {chat.title}
                    </span>
                    <FiMoreVertical className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatLayoutPage;
