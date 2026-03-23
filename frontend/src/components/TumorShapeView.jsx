import React from "react";

/**
 * TumorShapeView
 * ----------------
 * Illustrative inward tumor growth on colon wall
 * with vascular-textured tumor surface
 */
function TumorShapeView({ growth = 0.0 }) {
  // -------- GROWTH STAGES --------
  let tumorHeight;
  let tumorWidth;

  if (growth < 0.15) {
    tumorHeight = 35;
    tumorWidth = 60;
  } else if (growth < 0.35) {
    tumorHeight = 70;
    tumorWidth = 90;
  } else {
    tumorHeight = 110;
    tumorWidth = 120;
  }

  return (
    <div style={{ marginTop: "24px", textAlign: "center" }}>
      <svg
        width="100%"
        height="260"
        viewBox="0 0 600 260"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          
          {/* ===== Colon wall: light pink ===== */}
          <linearGradient id="colonSkin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f9d2dc" />
            <stop offset="100%" stopColor="#f3b9c6" />
          </linearGradient>


          {/* ===== Tumor base: reddish-pink (lighter, clinical) ===== */}
          <linearGradient id="tumorBase" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e86a75" />
            <stop offset="100%" stopColor="#cf4f5c" />
          </linearGradient>

          {/* ===== Vascular texture (lighter veins) ===== */}
          <pattern
            id="vascularPattern"
            patternUnits="userSpaceOnUse"
            width="18"
            height="18"
          >
            <line x1="9" y1="0" x2="9" y2="18" stroke="#b93b46" strokeWidth="1" />
            <line x1="0" y1="9" x2="18" y2="9" stroke="#b93b46" strokeWidth="1" />
            <line x1="2" y1="2" x2="16" y2="16" stroke="#a8323d" strokeWidth="0.6" />
            <line x1="16" y1="2" x2="2" y2="16" stroke="#a8323d" strokeWidth="0.6" />
          </pattern>

        </defs>

        {/* ===== Colon inner wall ===== */}
        <path
          d="
            M 0 150
            Q 150 120 300 140
            Q 450 160 600 140
            L 600 260
            L 0 260
            Z
          "
          fill="url(#colonSkin)"
        />

        {/* ===== Tumor shape ===== */}
        <path
          d={`
            M ${300 - tumorWidth / 2} 140
            C ${300 - tumorWidth / 3} ${140 - tumorHeight}
              ${300 + tumorWidth / 3} ${140 - tumorHeight}
              ${300 + tumorWidth / 2} 140
            C ${300 + tumorWidth / 3} 155
              ${300 - tumorWidth / 3} 155
              ${300 - tumorWidth / 2} 140
          `}
          fill="url(#tumorBase)"
        />

        {/* ===== Tumor texture overlay ===== */}
        <path
          d={`
            M ${300 - tumorWidth / 2} 140
            C ${300 - tumorWidth / 3} ${140 - tumorHeight}
              ${300 + tumorWidth / 3} ${140 - tumorHeight}
              ${300 + tumorWidth / 2} 140
            C ${300 + tumorWidth / 3} 155
              ${300 - tumorWidth / 3} 155
              ${300 - tumorWidth / 2} 140
          `}
          fill="url(#vascularPattern)"
          opacity="0.35"
        />
      </svg>

      {/* Caption */}
      <p
        style={{
          fontSize: "0.85rem",
          color: "#64748b",
          marginTop: "8px",
        }}
      >
        Illustrative inward tumor growth with vascular texture (AI-estimated)
      </p>
    </div>
  );
}

export default TumorShapeView;
