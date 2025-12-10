export function createSocket(tripId) {
  // Placeholder for WebSocket or Socket.IO implementation.
  // Example using native WebSocket to ws://localhost:3000
  try {
    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:3000";
    const ws = new WebSocket(wsUrl + `/?tripId=${tripId}`);
    ws.onopen = () => console.log("ws open");
    ws.onmessage = (msg) => console.log("ws msg", msg.data);
    ws.onerror = (e) => console.error("ws err", e);
    return ws;
  } catch (e) {
    console.error(e);
    return null;
  }
}
