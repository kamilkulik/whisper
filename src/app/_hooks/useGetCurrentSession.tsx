import { useEffect, useState } from "react";

export const useGetCurrentSession = (): {
  sessionId: string | null;
  loading: boolean;
} => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSessionId = async () => {
      try {
        const response = await fetch("/api/auth/check");
        const data = await response.json();

        if (data.authenticated && data.sessionId) {
          setSessionId(data.sessionId);
        } else {
          setSessionId(null);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        setSessionId(null);
      } finally {
        setLoading(false);
      }
    };

    getSessionId();
  }, []);

  return { sessionId, loading };
};
