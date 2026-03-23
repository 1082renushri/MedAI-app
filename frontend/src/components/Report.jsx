import "./Report.css";

function Report({ data }) {
  const handleDownload = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Clinical_Report.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to generate report");
    }
  };

  const lesionLabel = data?.lesion?.label || "Unknown";
  const lesionFound = lesionLabel === "Lesion Found";

  const classificationLabel =
    lesionFound && data?.dense ? data.dense.label : "None";

  const classificationConfidence =
    lesionFound && data?.dense ? data.dense.confidence : null;

  const isTumor =
    lesionFound &&
    classificationLabel.toLowerCase().includes("tumor");

  const risk = isTumor ? data.cancer_risk : null;

  return (
    <div className="report-container">
      <div className="report-card">

        <h1 className="report-title">Clinical Analysis Report</h1>

        {/* ================= SUMMARY ================= */}
        <section className="report-section summary">
          <h2>Examination Summary</h2>
          <p>
            This report presents the automated analysis of a colonoscopy image
            using AI-based detection and classification models.
          </p>
          <p>
            <strong>Modality:</strong> Colonoscopy Image Analysis<br />
            <strong>Analysis Date:</strong> {new Date().toLocaleDateString()}
          </p>
        </section>

        {/* ================= LESION STATUS ================= */}
        <section className="report-section">
          <h2>Lesion Assessment</h2>
          <p>
            <strong>Status:</strong>{" "}
            {lesionFound ? "Lesion Detected" : "No Lesion Detected"}
          </p>
          <p>
            <strong>Confidence:</strong> {data.lesion.confidence}
          </p>
        </section>

        {/* ================= CLASSIFICATION ================= */}
        <section className="report-section">
          <h2>Lesion Classification</h2>

          {!lesionFound ? (
            <p>
              No lesion was detected in the analyzed image; therefore,
              lesion classification was not performed.
            </p>
          ) : (
            <>
              <p>
                <strong>Predicted Type:</strong> {classificationLabel}
              </p>
              <p>
                <strong>Confidence:</strong> {classificationConfidence}
              </p>
            </>
          )}
        </section>

        {/* ================= AI INTERPRETATION ================= */}
        <section className="report-section interpretation">
          <h2>AI Interpretation</h2>

          {!lesionFound && (
            <p>
              The analyzed image does not demonstrate any abnormal lesion
              patterns. The colonic mucosa appears within normal limits,
              and no further pathological assessment is required.
            </p>
          )}

          {lesionFound && !isTumor && (
            <p>
              The detected lesion demonstrates characteristics consistent
              with a benign or non-neoplastic (hyperplastic) pattern.
              These findings are associated with a low risk of malignant
              transformation.
            </p>
          )}

          {isTumor && (
            <p>
              The detected lesion exhibits morphological features consistent
              with a neoplastic growth. An additional cancer risk assessment
              was performed to evaluate potential malignant progression.
            </p>
          )}
        </section>

        {/* ================= CANCER RISK ================= */}
        {risk && (
          <section className="report-section highlight">
            <h2>Cancer Risk Evaluation</h2>
            <p><strong>Risk Level:</strong> {risk.risk_label}</p>
            <p><strong>Risk Probability:</strong> {risk.risk_probability}</p>
            <p><strong>Tumor Growth (Relative):</strong> {risk.tumor_growth_relative}</p>
            <p><strong>Estimated Size:</strong> {risk.estimated_size_mm} mm</p>
          </section>
        )}

        {/* ================= CLINICAL IMPRESSION ================= */}
        <section className="report-section impression">
          <h2>Clinical Impression</h2>

          {!lesionFound && (
            <p>
              No pathological abnormalities were identified in the analyzed
              colonoscopy image.
            </p>
          )}

          {lesionFound && !isTumor && (
            <p>
              The lesion appears benign in nature. Routine clinical follow-up
              may be considered as per standard screening guidelines.
            </p>
          )}

          {isTumor && (
            <p>
              The lesion demonstrates features suggestive of neoplastic
              progression. Clinical correlation and further diagnostic
              evaluation are recommended.
            </p>
          )}
        </section>

        {/* ================= RECOMMENDATIONS ================= */}
        <section className="report-section recommendations">
          <h2>Recommendations</h2>
          <ul>
            <li>Correlate findings with patient history and clinical symptoms.</li>
            <li>Consider histopathological evaluation if clinically indicated.</li>
            <li>This report should be used as decision-support only.</li>
          </ul>
        </section>

        {/* ================= DISCLAIMER ================= */}
        <section className="report-section disclaimer">
          <p>
            This report is generated by an AI-based image analysis system and
            is intended for clinical decision-support only. Final diagnosis
            must be made by a qualified medical professional.
          </p>
        </section>

        {/* ================= ACTIONS ================= */}
        <div className="report-actions">
          <button className="download-btn" onClick={handleDownload}>
            Download Clinical Report (PDF)
          </button>
        </div>

      </div>
    </div>
  );
}

export default Report;

