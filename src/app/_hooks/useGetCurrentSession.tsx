import { useEffect, useState } from "react";

export const useGetCurrentSession = (): {
  sessionId: string | null;
  loading: boolean;
  showPricing: boolean;
} => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    const getSessionId = async () => {
      try {
        const response = await fetch("/api/auth/check");
        const data = await response.json();

        if (data.authenticated && data.sessionId) {
          setSessionId(data.sessionId);
          setShowPricing(data.showPricing);
        } else {
          setSessionId(null);
          setShowPricing(false);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        setSessionId(null);
        setShowPricing(false);
      } finally {
        setLoading(false);
      }
    };

    getSessionId();
  }, []);

  return { sessionId, loading, showPricing };
};
