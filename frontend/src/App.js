import { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Results from "./components/Results";
import Report from "./components/Report";
import UHI from "./components/UHI";
import Register from "./components/Register";
import History from "./components/History";

export default function App() {
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Start from UHI verification
  const [page, setPage] = useState("uhi");

  const [result, setResult] = useState(null);

  // 🔑 REQUIRED STATES (WERE MISSING)
  const [uhiId, setUhiId] = useState(null);
  const [patientId, setPatientId] = useState(null);

  // ---------------- ANALYZE IMAGE ----------------
  const onAnalyze = async (formData) => {
    try {
      setIsLoading(true);

      // attach UHI ID with image
      if (uhiId) {
        formData.append("uhi_id", uhiId);
      }

      const res = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
      setPage("results");
    } catch (err) {
      alert("Analysis failed");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- NAVIGATION ----------------
  const handleNavigate = (target) => {
    if (target === "home") setPage("home");
    if (target === "results" && result) setPage("results");
    if (target === "report" && result) setPage("report");
  };

  return (
    <>
      {/* Navbar visible only AFTER UHI / Register */}
      {page !== "uhi" && page !== "register" && (
        <Navbar onNavigate={handleNavigate} />
      )}

      {/* ================= UHI PAGE ================= */}
      {page === "uhi" && (
        <UHI
          setPage={setPage}
          setPatientId={setPatientId}  // ✅ FIX
            
        />
      )}

      {/* ================= HISTORY PAGE ================= */}
      {page === "history" && (
        <History
          patientId={patientId}        // ✅ FIX (case-sensitive)
          setPage={setPage}
        />
      )}

      {/* ================= REGISTER PAGE ================= */}
      {page === "register" && (
        <Register
          setPage={setPage}
          setUhiId={setUhiId}          // ✅ FIX
        />
      )}

      {/* ================= HOME ================= */}
      {page === "home" && (
        <Home
          onAnalyze={onAnalyze}
          isLoading={isLoading}
        />
      )}

      {/* ================= RESULTS ================= */}
      {page === "results" && result && (
        <Results
          data={result}
          setPage={setPage}
        />
      )}

      {/* ================= REPORT ================= */}
      {page === "report" && result && (
        <Report
          data={result}
          setPage={setPage}
        />
      )}
    </>
  );
}
