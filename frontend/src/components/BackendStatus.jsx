import { useEffect, useState } from "react";
 
export default function BackendStatus() {
  const [status, setStatus] = useState({
    loading: true,
    connected: false,
    message: "",
  });
 
  useEffect(() => {
    const controller = new AbortController();
 
    async function checkBackend() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
 
        if (!apiUrl) {
          throw new Error("VITE_API_URL is missing.");
        }
 
        const response = await fetch(`${apiUrl}/health`, {
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        });
 
        if (!response.ok) {
          throw new Error(`Backend returned HTTP ${response.status}`);
        }
 
        const data = await response.json();
 
        if (data.success !== true) {
          throw new Error(data.message || "Backend health check failed.");
        }
 
        setStatus({
          loading: false,
          connected: true,
          message: data.message,
        });
      } catch (error) {
        if (error.name === "AbortError") return;
 
        setStatus({
          loading: false,
          connected: false,
          message: error.message,
        });
      }
    }
 
    checkBackend();
 
    return () => controller.abort();
  }, []);
 
  if (status.loading) {
    return <p>Checking backend connection...</p>;
  }
 
  return (
<div role="status">
<strong>
        {status.connected
          ? "Backend connected"
          : "Backend connection failed"}
</strong>
<p>{status.message}</p>
</div>
  );
}