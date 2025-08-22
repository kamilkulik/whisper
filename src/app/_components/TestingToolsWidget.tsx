"use client";

import { useState, useEffect } from "react";

interface TestingToolsWidgetProps {
  isVisible: boolean;
}

export default function TestingToolsWidget({
  isVisible,
}: TestingToolsWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Reset expanded state when component mounts
  useEffect(() => {
    setIsExpanded(false);
    setIsHovered(false);
  }, []);

  // Auto-expand on hover, retract when not hovered
  useEffect(() => {
    console.log("Hover effect - isHovered:", isHovered);
    if (isHovered) {
      console.log("Setting expanded to true");
      setIsExpanded(true);
    } else {
      console.log("Setting up retract timer");
      // Add a small delay before retracting to allow for interaction
      const timer = setTimeout(() => {
        console.log("Retracting widget");
        setIsExpanded(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isHovered]);

  console.log(
    "TestingToolsWidget render - isVisible:",
    isVisible,
    "isExpanded:",
    isExpanded,
    "isHovered:",
    isHovered
  );
  if (!isVisible) {
    console.log("TestingToolsWidget not visible, returning null");
    return null;
  }

  return (
    <div className="fixed top-20 right-0 z-50">
      {/* Main container with transform */}
      <div
        className="transition-all duration-300 ease-in-out"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          transform: isExpanded
            ? "translateX(0)"
            : "translateX(calc(100% - 0px ))",
        }}
      >
        {/* Handle - positioned on the left side */}
        <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-3 rounded-l-2xl shadow-lg cursor-pointer border-2 border-white z-10">
          <div className="writing-mode-vertical text-center text-sm">
            TESTING TOOLS
          </div>
        </div>

        {/* Content panel */}
        <div className="w-80 bg-gray-800/95 backdrop-blur-sm rounded-l-2xl shadow-xl border-l border-gray-600 overflow-hidden">
          <div className="p-6 text-white overflow-y-auto overflow-x-hidden">
            <h3 className="text-xl font-bold mb-4">Testing Tools</h3>

            <div className="space-y-4">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h2 className="font-semibold mb-2">Environment Status</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>SMS Provider:</span>
                    <span className="text-green-400">Local</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email Provider:</span>
                    <span className="text-green-400">Local</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm transition-colors">
                    Test SMS Send
                  </button>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm transition-colors">
                    Test Email Send
                  </button>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm transition-colors">
                    Clear Test Data
                  </button>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Debug Info</h4>
                <div className="text-xs text-gray-300 space-y-1">
                  <div>Mode: Development</div>
                  <div>Timestamp: {new Date().toLocaleTimeString()}</div>
                  <div>
                    User Agent: {navigator.userAgent.substring(0, 50)}...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
