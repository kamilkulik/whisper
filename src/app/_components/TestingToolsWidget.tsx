"use client";

import { useState, useEffect } from "react";
import { getUserDataFromSession } from "../_actions/testing";

interface TestingToolsWidgetProps {
  isVisible: boolean;
  emailProvider: string;
  smsProvider: string;
}

export default function TestingToolsWidget({
  isVisible,
  emailProvider,
  smsProvider,
}: TestingToolsWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sessionIdFromCookie, setSessionIdFromCookie] = useState<string | null>(
    null
  );

  // Reset expanded state when component mounts
  useEffect(() => {
    setIsExpanded(false);
    setIsHovered(false);
  }, []);

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const data = await getUserDataFromSession();
        setUserData(data);
        // Set sessionId from server response if available
        if (data?.sessionId) {
          setSessionIdFromCookie(data.sessionId);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Auto-expand on hover, retract when not hovered
  useEffect(() => {
    if (isHovered) {
      setIsExpanded(true);
    } else {
      // Add a small delay before retracting to allow for interaction
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isHovered]);

  if (!isVisible) {
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
                <h2 className="font-semibold mb-2 text-lg">
                  Environment Status
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>SMS Provider:</span>
                    <span className="text-green-400">{smsProvider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email Provider:</span>
                    <span className="text-green-400">{emailProvider}</span>
                  </div>
                </div>
              </div>

              {/* <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2  text-lg">Quick Actions</h4>
                <div className="space-y-2">
                  <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                    onClick={async () => {
                      try {
                        const response = await fetch("/api/cron");
                        if (response.ok) {
                          const result = await response.json();
                          console.log(
                            "Cron job executed successfully:",
                            result
                          );
                          alert("SMS sent to all users successfully!");
                        } else {
                          const error = await response.json();
                          console.error("Cron job failed:", error);
                          alert(
                            "Failed to send SMS: " +
                              (error.error || "Unknown error")
                          );
                        }
                      } catch (error) {
                        console.error("Error calling cron endpoint:", error);
                        alert("Error calling cron endpoint: " + error);
                      }
                    }}
                  >
                    Wyślij sms do wszystkich
                  </button>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm transition-colors">
                    Test Email Send
                  </button>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm transition-colors">
                    Clear Test Data
                  </button>
                </div>
              </div> */}

              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-lg">Debug Info</h4>
                <div className="text-xs text-gray-300 space-y-1">
                  <div>Mode: Development</div>
                  <div>Timestamp: {new Date().toLocaleTimeString()}</div>
                  <div>
                    User Agent: {navigator.userAgent.substring(0, 50)}...
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-sm">
                        Session Info:
                      </span>
                      <button
                        onClick={async () => {
                          setLoading(true);
                          try {
                            const data = await getUserDataFromSession();
                            setUserData(data);
                          } catch (error) {
                            console.error("Error refreshing user data:", error);
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
                        disabled={loading}
                      >
                        {loading ? "..." : "↻"}
                      </button>
                    </div>

                    {/* Session ID from cookies */}
                    <div className="mb-2 p-2 bg-gray-600/30 rounded">
                      <div className="text-xs text-gray-400 mb-1">
                        Session ID (from cookie):
                      </div>
                      <div className="font-mono text-xs text-green-400 break-all">
                        {sessionIdFromCookie
                          ? sessionIdFromCookie
                          : "No session ID found"}
                      </div>
                    </div>

                    {loading ? (
                      <div className="text-blue-400">Loading...</div>
                    ) : userData?.error ? (
                      <div className="text-red-400">{userData.error}</div>
                    ) : userData ? (
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Session ID (verified):</span>
                          <span className="text-green-400 font-mono text-xs">
                            {userData.sessionId.substring(0, 8)}...
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Name:</span>
                          <span className="text-green-400">
                            {userData.user.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Email:</span>
                          <span className="text-green-400">
                            {userData.user.email}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Email Verified:</span>
                          <span
                            className={
                              userData.user.emailVerified
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {userData.user.emailVerified ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Phone:</span>
                          <span className="text-green-400">
                            {userData.user.phoneNumber}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Phone Verified:</span>
                          <span
                            className={
                              userData.user.phoneVerified
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {userData.user.phoneVerified ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-yellow-400">
                        No user data available
                      </div>
                    )}
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
