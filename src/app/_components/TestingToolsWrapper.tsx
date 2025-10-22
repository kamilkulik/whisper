"use client";

import { useState, useEffect } from "react";
import TestingToolsWidget from "./TestingToolsWidget";
import { isTestingModeEnabled } from "../_actions/testing";

export default function TestingToolsWrapper() {
  const [isTestingMode, setIsTestingMode] = useState(false);
  const [emailProvider, setEmailProvider] = useState("local");
  const [smsProvider, setSmsProvider] = useState("local");

  useEffect(() => {
    const checkTestingMode = async () => {
      try {
        const testingMode = await isTestingModeEnabled();
        setIsTestingMode(testingMode.isTestingModeEnabled);
        setEmailProvider(testingMode.emailProvider);
        setSmsProvider(testingMode.smsProvider);
      } catch (error) {
        console.error("Failed to check testing mode:", error);
        setIsTestingMode(false);
      }
    };

    checkTestingMode();
  }, []);

  return (
    <TestingToolsWidget
      isVisible={isTestingMode}
      emailProvider={emailProvider}
      smsProvider={smsProvider}
    />
  );
}
