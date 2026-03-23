import { useEffect, useState } from "react";
import "./History.css";

function History({ patientId, setPage }) {
  const [patient, setPatient] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/patient-history/${patientId}`)
      .then(res => res.json())
      .then(data => {
        setPatient(data.patient);
        setReports(data.reports || []);
        setLoading(false);
      });
  }, [patientId]);

  if (loading) {
    return (
      <div className="fullscreen-loader">
        <div className="loader-ring"></div>
        <p>Loading patient medical history…</p>
      </div>
    );
  }

  return (
    <div className="history-page">

      {/* ================= TITLE ================= */}
      <div className="history-title">
        <h1>Patient History</h1>
        <p className="history-intro">
          This page presents a chronological record of all clinical analyses
          performed for the patient, including lesion detection results and
          associated risk assessments.
        </p>
      </div>

      {/* ================= PATIENT CARD ================= */}
      <div className="patient-card">
        <h2>{patient.name}</h2>
        <p className="patient-subtext">
          Patient demographic and consulting physician details
        </p>

        <div className="patient-info-grid">
          <div><span>UHI ID</span>{patient.uhi_id}</div>
          <div><span>Age</span>{patient.age}</div>
          <div><span>Gender</span>{patient.gender}</div>
          <div><span>Consulting Doctor</span>{patient.doctor}</div>
        </div>
      </div>

      {/* ================= REPORTS ================= */}
      <div className="reports-wrapper">
        <h3>Clinical Analysis Timeline</h3>

        {reports.map((r, i) => {
          const isTumor = r.lesion_type === "Tumor";
          const isHyper = r.lesion_type === "Hyperplastic";
          const noLesion = r.lesion_status === "No Lesion Found";

          return (
            <div className="report-row" key={i}>

              {/* ===== LEFT: CLINICAL CARD ===== */}
              <div className="report-card">

                <div className="report-header">
                  <span className="date">
                    Analysis performed on {new Date(r.created_at).toLocaleString()}
                  </span>
                  <span className={`status ${isTumor ? "tumor" : isHyper ? "hyper" : "normal"}`}>
                    {r.lesion_status}
                  </span>
                </div>

                {/* ===== CLINICAL NOTE ===== */}
                {noLesion && (
                  <>
                    <p className="clinical-label">Clinical Note</p>
                    <p className="medical-text">
                      No abnormal lesion was detected during this analysis.
                      The findings suggest normal tissue appearance with no
                      visible polyps or malignant indicators at the time of examination.
                    </p>
                    <p className="medical-text subtle">
                      Recommendation: Continue routine screening as advised by
                      the consulting physician.
                    </p>
                  </>
                )}

                {isHyper && (
                  <>
                    <p className="clinical-label">Clinical Note</p>
                    <p className="medical-text">
                      A hyperplastic lesion was identified. Such lesions are
                      typically benign and are not commonly associated with
                      colorectal malignancy.
                    </p>
                    <p className="medical-text subtle">
                      Recommendation: No immediate intervention required.
                      Periodic observation may be advised.
                    </p>
                  </>
                )}

                {isTumor && (
                  <>
                    <p className="clinical-label">Clinical Note</p>
                    <p className="medical-text">
                      A tumorous lesion was detected during this analysis.
                      Advanced AI-based models were used to estimate the
                      associated cancer risk.
                    </p>

                    <div className="risk-box refined">
                      <div className="risk-main">
                        <span className="risk-probability">{r.risk_probability}</span>
                        <span className="risk-label">({r.risk_label})</span>
                      </div>

                      <div className="risk-meta">
                        <span>Estimated Tumor Size</span>
                        <strong>{r.estimated_size} mm</strong>
                      </div>
                    </div>

                    <p className="medical-text subtle">
                      Recommendation: Specialist consultation and follow-up
                      evaluation are recommended based on the current findings.
                    </p>
                  </>
                )}
              </div>

              {/* ===== RIGHT: IMAGE (OUTSIDE CARD) ===== */}
              <div className="report-image-outside">
                {r.yolo_image_path ? (
                  <img
                    src={`http://127.0.0.1:5000/${r.yolo_image_path.replace(/\\/g, "/")}`}
                    alt="YOLO Detection"
                  />
                ) : (
                  <div className="image-placeholder">No image available</div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      <button
        className="mini-action-btn force-compact"
        onClick={() => setPage("home")}
      >
        Analyze Again
      </button>
    </div>
  );
}

export default History;
