import { useEffect, useState, useRef } from "react";
import "./Results.css";
import TumorShapeView from "./TumorShapeView";

function Results({ data, setPage }) {
  const [showClassification, setShowClassification] = useState(false);
  const [showRisk, setShowRisk] = useState(false);

  const riskLoadingRef = useRef(null);

  /* ================= SAFE DERIVED VALUES ================= */

  const lesionLabel = data?.lesion?.label || "";
  const lesionFound = lesionLabel === "Lesion Found";

  const denseLabel = data?.dense?.label || "";
  const resLabel = data?.res?.label || "";

  const isTumor =
    lesionFound && denseLabel.toLowerCase().includes("tumor");

  const isHyperplastic =
    lesionFound && denseLabel.toLowerCase().includes("hyper");

  /* ================= DELAYS ================= */

  // ⏳ Delay: lesion category
  useEffect(() => {
    if (lesionFound) {
      const timer = setTimeout(() => {
        setShowClassification(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [lesionFound]);

  // ⏳ Delay: cancer risk (only if tumor)
  useEffect(() => {
    if (showClassification && isTumor) {
      const timer = setTimeout(() => {
        setShowRisk(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showClassification, isTumor]);

  // ✅ Auto-scroll when cancer risk analysis starts
  useEffect(() => {
    if (showClassification && isTumor && riskLoadingRef.current) {
      setTimeout(() => {
        riskLoadingRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    }
  }, [showClassification, isTumor]);

  /* ================= UI ================= */

  return (
    <div className="results-container">
      <div className="results-layout">

        {/* ================= YOLO ================= */}
        <section className="yolo-section fade-in">
          <div className="section-header">
            <h2>Polyp Detection (YOLO)</h2>
            <span className="section-subtitle">
              Detected region highlighted by AI
            </span>
          </div>

          <div className="yolo-box">
            <img
              src={`http://127.0.0.1:5000/${data?.image_path}`}
              alt="YOLO detection result"
            />
          </div>
        </section>

        {/* ================= ANALYSIS PANEL ================= */}
        <section className="analysis-section">

          {/* -------- LESION RESULT -------- */}
          <div className="model-card lesion-card slide-in">
            <h3>Lesion Screening</h3>

            <p className={`label ${lesionFound ? "positive" : "negative"}`}>
              {lesionLabel}
            </p>

            <div className="confidence-row">
              <span>Confidence</span>
              <span className="confidence-value">
                {data?.lesion?.confidence ?? "—"}
              </span>
            </div>
          </div>

          {/* -------- STOP IF NO LESION -------- */}
          {!lesionFound && (
            <>
              <div className="no-lesion-message fade-in">
                <p>No abnormal lesion detected.</p>
                <span>Further classification is not required.</span>
              </div>

              <div className="center-btn">
                <button
                  className="download-btn"
                  onClick={() => setPage("report")}
                >
                  View Clinical Report
                </button>
              </div>
            </>
          )}

          {/* -------- LOADING: CATEGORY -------- */}
          {lesionFound && !showClassification && (
            <div className="loading-box fade-in">
              <div className="spinner"></div>
              <p>Analyzing lesion category...</p>
            </div>
          )}

          {/* -------- CLASSIFICATION -------- */}
          {lesionFound && showClassification && data?.dense && data?.res && (
            <>
              {/* DenseNet */}
              <div className="model-card densenet slide-up">
                <div className="model-header">
                  <h3>DenseNet</h3>
                  <span className="model-tag primary">Primary Model</span>
                </div>

                <p className="label">{denseLabel}</p>

                <div className="confidence-row">
                  <span>Confidence</span>
                  <span className="confidence-value">
                    {data.dense.confidence}
                  </span>
                </div>
              </div>

              {/* ResNet */}
              <div className="model-card resnet slide-up">
                <div className="model-header">
                  <h3>ResNet</h3>
                  <span className="model-tag secondary">Secondary Model</span>
                </div>

                <p className="label">{resLabel}</p>

                <div className="confidence-row">
                  <span>Confidence</span>
                  <span className="confidence-value">
                    {data.res.confidence}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* -------- STOP IF HYPERPLASTIC -------- */}
          {showClassification && isHyperplastic && (
            <>
              <div className="no-lesion-message fade-in">
                <p>Lesion classified as hyperplastic.</p>
                <span>Cancer risk analysis is not required.</span>
              </div>

              <div className="center-btn">
                <button
                  className="download-btn"
                  onClick={() => setPage("report")}
                >
                  View Clinical Report
                </button>
              </div>
            </>
          )}

          {/* -------- LOADING: CANCER RISK -------- */}
          {showClassification && isTumor && !showRisk && (
            <div ref={riskLoadingRef} className="loading-box fade-in">
              <div className="spinner"></div>
              <p>Analyzing cancer risk...</p>
            </div>
          )}

          {/* -------- CANCER RISK RESULT -------- */}
          {showRisk && data?.cancer_risk && (
            <div className="model-card slide-up">
              <div className="model-header">
                <h3>Cancer Risk Assessment</h3>
                <span className="model-tag primary">Risk Model</span>
              </div>

              <div style={{ textAlign: "center", marginBottom: "14px" }}>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: "700",
                    color: "#b91c1c",
                  }}
                >
                  {data.cancer_risk.risk_probability}
                </div>

                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#64748b",
                    marginTop: "4px",
                  }}
                >
                  ({data.cancer_risk.risk_label})
                </div>
              </div>

              <div className="confidence-row">
                <span>Tumor Growth (Relative)</span>
                <span className="confidence-value">
                  {data.cancer_risk.tumor_growth_relative}
                </span>
              </div>

              <div className="confidence-row">
                <span>Estimated Size</span>
                <span className="confidence-value">
                  {data.cancer_risk.estimated_size_mm} mm
                </span>
              </div>

              <TumorShapeView
                growth={data.cancer_risk.tumor_growth_relative}
              />

              <div className="center-btn">
                <button
                  className="download-btn"
                  onClick={() => setPage("report")}
                >
                  View Clinical Report
                </button>
              </div>
            </div>
          )}

        </section>
      </div>
    </div>
  );
}

export default Results;
