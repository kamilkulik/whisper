import { useEffect, useState } from "react";

export const useGetCurrentSession = (): {
  sessionId: string | null;
  loading: boolean;
} => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSessionId = () => {
      // Use document.cookie to get the sessionId cookie on the client side
      const cookies = document.cookie.split(";");
      const sessionCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("sessionId=")
      );

      if (sessionCookie) {
        const sessionId = sessionCookie.split("=")[1];
        setSessionId(sessionId);
      }

      setLoading(false);
    };

    getSessionId();
  }, []);

  return { sessionId, loading };
};
