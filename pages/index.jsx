import { useEffect } from "react";

export default function Index() {
  useEffect(() => {
    window.location.replace("/Dashboard");
  }, []);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0f0f0f", color: "#fff", fontFamily: "sans-serif" }}>
      Loading GhostSites…
    </div>
  );
}
