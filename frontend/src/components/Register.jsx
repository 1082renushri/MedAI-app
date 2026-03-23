import { useEffect, useState } from "react";
import "./Register.css";

export default function Register({ setPage, setUhiId }) {
  const [patient, setPatient] = useState({
    name: "",
    age: "",
    gender: "",
    doctor: "",
  });

  // 🔑 LOCAL UHI STATE (RENAMED)
  const [generatedUhi, setGeneratedUhi] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔑 Generate UHI automatically
  useEffect(() => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const year = new Date().getFullYear();
    setGeneratedUhi(`UHI-IND-${year}-${random}`);
  }, []);

  const handleChange = (e) => {
    setPatient({ ...patient, [e.target.name]: e.target.value });
  };

  const submitRegistration = async () => {
    if (!patient.name || !patient.age || !patient.gender || !patient.doctor) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:5000/register-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uhi_id: generatedUhi,
          ...patient,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Registration failed");
      }

      // ✅ SAVE UHI TO APP STATE
      setUhiId(generatedUhi);
      setPage("home");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h1>New Patient Registration</h1>
        <p className="subtitle">Register patient before clinical analysis</p>

        <div className="uhi-box">
          <span>Assigned UHI ID</span>
          <strong>{generatedUhi}</strong>
        </div>

        <input
          name="name"
          placeholder="Patient Name"
          value={patient.name}
          onChange={handleChange}
        />

        <input
          type="number"
          name="age"
          placeholder="Age"
          value={patient.age}
          onChange={handleChange}
        />

        <select name="gender" value={patient.gender} onChange={handleChange}>
          <option value="">Select Gender</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Other">Other</option>
        </select>

        <select name="doctor" value={patient.doctor} onChange={handleChange}>
          <option value="">Select Consulting Doctor</option>
          <option value="Dr. Vikram Patel, MBBS, DM (Gastroenterology)">
            Dr. Vikram Patel, MBBS, DM (Gastroenterology)
          </option>
          <option value="Dr. Arjun Mehta, MD (Gastroenterology)">
            Dr. Arjun Mehta, MD (Gastroenterology)
          </option>
          <option value="Dr. Kavya Nair, MS, DNB (GI Surgery)">
            Dr. Kavya Nair, MS, DNB (GI Surgery)
          </option>
        </select>

        {error && <p className="error">{error}</p>}

        <button onClick={submitRegistration} disabled={loading}>
          {loading ? "Registering..." : "Register & Continue"}
        </button>
      </div>
    </div>
  );
}
