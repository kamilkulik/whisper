"use client";

import { useState, useEffect } from "react";
import TestingToolsWidget from "./TestingToolsWidget";
import { isTestingModeEnabled } from "../_actions/testing";

export default function TestingToolsWrapper() {
  const [isTestingMode, setIsTestingMode] = useState(false);

  useEffect(() => {
    const checkTestingMode = async () => {
      try {
        const testingMode = await isTestingModeEnabled();
        setIsTestingMode(testingMode);
        console.log("TestingToolsWrapper - Testing mode:", testingMode);
      } catch (error) {
        console.error("Failed to check testing mode:", error);
        setIsTestingMode(false);
      }
    };

    checkTestingMode();
  }, []);

  return <TestingToolsWidget isVisible={isTestingMode} />;
}
