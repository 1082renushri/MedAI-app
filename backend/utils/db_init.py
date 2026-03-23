import mysql.connector

# ================= MYSQL CONFIG =================
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Renu@2005"   # 🔴 CHANGE IF NEEDED
}

DB_NAME = "polyp_ai"
# ===============================================


def create_database():
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    # -------- CREATE DATABASE --------
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
    cursor.execute(f"USE {DB_NAME}")

    # ================= PATIENTS =================
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS patients (
            id INT AUTO_INCREMENT PRIMARY KEY,
            uhi_id VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(100),
            age INT,
            gender VARCHAR(20),
            doctor VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)


    # ================= VISITS =================
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS visits (
            id INT AUTO_INCREMENT PRIMARY KEY,
            patient_id INT NOT NULL,
            visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            notes TEXT,
            FOREIGN KEY (patient_id) REFERENCES patients(id)
                ON DELETE CASCADE
        )
    """)

    # ================= REPORTS =================
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id INT AUTO_INCREMENT PRIMARY KEY,
            visit_id INT NOT NULL,

            lesion_status VARCHAR(50),
            lesion_type VARCHAR(50),

            classification_confidence FLOAT,

            risk_label VARCHAR(50),
            risk_probability FLOAT,
            tumor_growth FLOAT,
            estimated_size FLOAT,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (visit_id) REFERENCES visits(id)
                ON DELETE CASCADE
        )
    """)

    conn.commit()
    conn.close()

    print("✅ Database & all tables created successfully")


if __name__ == "__main__":
    create_database()
