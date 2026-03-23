import { useState } from "react";
import "./UHI.css";

export default function UHI({ setPage, setPatientId }) {
  const [uhiId, setUhiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitUHI = async () => {
    if (!uhiId.trim()) {
      setError("Please enter UHI ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:5000/check-uhi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uhi_id: uhiId }),
      });

      const data = await res.json();

      if (data.route === "history") {
        setPatientId(data.patient_id); // ✅ NOW THIS EXISTS
        setPage("history");
      } else {
        setPage("register");
      }

    } catch (err) {
      console.error("FETCH ERROR:", err);
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="uhi-page">
      <div className="uhi-card">
        <h1>Patient UHI Verification</h1>

        <p className="subtitle">
          Enter the patient’s Universal Health ID to proceed
        </p>

        <input
          type="text"
          placeholder="Enter UHI ID"
          value={uhiId}
          onChange={(e) => setUhiId(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button onClick={submitUHI} disabled={loading}>
          {loading ? "Verifying..." : "Continue"}
        </button>

        <p className="new-patient">
          New patient?{" "}
          <span onClick={() => setPage("register")}>
            Register here
          </span>
        </p>

        <p className="hint">
          Existing patients will be redirected to history
        </p>
      </div>
    </div>
  );
}
