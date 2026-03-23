from flask import Flask, request, jsonify
from utils.report_generator import generate_clinical_report
from flask import send_file
from flask_cors import CORS
import os
import mysql.connector

from utils.yolo_infer import run_yolo
from utils.lesion_infer import predict_lesion
from utils.densenet_infer import predict_densenet
from utils.resnet_infer import predict_resnet
from utils.efficientnet_infer import predict_efficientnet
from utils.cancer_risk_infer import predict_cancer_risk   # ✅ NEW

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "static/uploads"
RESULT_FOLDER = "static/results"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)


@app.route("/analyze", methods=["POST"])
def analyze():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    uhi_id = request.form.get("uhi_id")

    image_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(image_path)

    lesion = predict_lesion(image_path)

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT id FROM patients WHERE uhi_id=%s",
        (uhi_id,)
    )
    patient = cursor.fetchone()

    # 🔥 patient safety
    if not patient:
        cursor.close()
        conn.close()
        return jsonify({"error": "Patient not registered"}), 400

    # =========================
    # NO LESION CASE
    # =========================
    if lesion["label"] == "No Lesion Detected":
        cursor.execute("""
            INSERT INTO reports (patient_id, lesion_status)
            VALUES (%s, %s)
        """, (patient["id"], lesion["label"]))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "image_path": image_path,
            "lesion": lesion,
            "message": "No lesion detected. Further analysis not required."
        })

    # =========================
    # YOLO DETECTION
    # =========================
    detections, output_image = run_yolo(image_path)
    # output_image = static/results/result.jpg

    # 🔹 ADD LOGIC: make unique copy of YOLO output
    import time, shutil
    timestamp = int(time.time())
    unique_yolo_name = f"yolo_{patient['id']}_{timestamp}.jpg"
    unique_yolo_path = f"{RESULT_FOLDER}/{unique_yolo_name}"
    shutil.copy(output_image, unique_yolo_path)

    # =========================
    # OTHER MODELS
    # =========================
    dense = predict_densenet(image_path)
    res = predict_resnet(image_path)
    efficient = predict_efficientnet(image_path)

    agreement = dense["label"] == res["label"] == efficient["label"]

    cancer_risk = None
    if dense["label"] == "Tumor":
        cancer_risk = predict_cancer_risk(image_path)

    # =========================
    # DB INSERT (WITH YOLO IMAGE)
    # =========================
    cursor.execute("""
        INSERT INTO reports (
            patient_id,
            lesion_status,
            yolo_image_path,
            lesion_type,
            risk_label,
            risk_probability,
            tumor_growth,
            estimated_size
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        patient["id"],
        lesion["label"],
        unique_yolo_path,   # ✅ STORED PERMANENTLY
        dense["label"],
        cancer_risk["risk_label"] if cancer_risk else None,
        cancer_risk["risk_probability"] if cancer_risk else None,
        cancer_risk["tumor_growth_relative"] if cancer_risk else None,
        cancer_risk["estimated_size_mm"] if cancer_risk else None,
    ))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({
        "image_path": unique_yolo_path,  # ✅ send saved image
        "lesion": lesion,
        "detections": detections,
        "dense": dense,
        "res": res,
        "efficientnet": efficient,
        "agreement": agreement,
        "cancer_risk": cancer_risk,
        "message":  "No lesion detected. Further analysis not required."
    })


@app.route("/generate-report", methods=["POST"])
def generate_report():
    data = request.json

    pdf_path = generate_clinical_report(data)

    return send_file(
        pdf_path,
        as_attachment=True,
        download_name=os.path.basename(pdf_path)
    )


@app.route("/")
def health_check():
    return jsonify({"status": "Flask backend running"})




DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Renu@2005",
    "database": "polyp_ai"
}

def get_db():
    return mysql.connector.connect(**DB_CONFIG)


@app.route("/check-uhi", methods=["POST"])
def check_uhi():
    print("✅ /check-uhi HIT")

    data = request.get_json(force=True)
    print("📦 DATA:", data)

    uhi_id = data.get("uhi_id") if data else None
    print("🆔 UHI:", uhi_id)

    print("🔌 CONNECTING TO DB...")
    conn = get_db()
    print("✅ DB CONNECTED")

    cursor = conn.cursor()
    cursor.execute(
        "SELECT id FROM patients WHERE uhi_id=%s",
        (uhi_id,)
    )
    result = cursor.fetchone()
    print("📊 QUERY RESULT:", result)

    cursor.close()
    conn.close()

    if result:
        print("➡️ ROUTE: history")
        return jsonify({
            "route": "history",
            "patient_id": result[0]   # 👈 this is patients.id (1,2,3…)
        })


    print("➡️ ROUTE: home")
    return jsonify({"route": "home"})


@app.route("/register-patient", methods=["POST"])
def register_patient():
    data = request.json

    uhi_id = data.get("uhi_id")
    name = data.get("name")
    age = data.get("age")
    gender = data.get("gender")
    doctor = data.get("doctor")

    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="Renu@2005",
            database="polyp_ai"
        )
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO patients (uhi_id, name, age, gender, doctor)
            VALUES (%s, %s, %s, %s, %s)
        """, (uhi_id, name, age, gender, doctor))

        conn.commit()
        cursor.close()
        conn.close()

        # 🔥 THIS IS WHAT YOU WERE MISSING
        return jsonify({
            "success": True,
            "message": "Patient registered successfully"
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/patient-history/<int:patient_id>", methods=["GET"])
def patient_history(patient_id):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT id, uhi_id, name, age, gender, doctor FROM patients WHERE id=%s",
        (patient_id,)
    )
    patient = cursor.fetchone()

    cursor.execute("""
        SELECT
            lesion_status,
            yolo_image_path,      
            lesion_type,
            risk_label,
            risk_probability,
            tumor_growth,
            estimated_size,
            created_at
        FROM reports
        WHERE patient_id=%s
        ORDER BY created_at DESC
    """, (patient_id,))

    reports = cursor.fetchall()
    conn.close()

    return jsonify({
        "patient": patient,
        "reports": reports
    })



if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)