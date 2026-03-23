import os
import cv2
from ultralytics import YOLO

os.environ["ULTRALYTICS_SETTINGS"] = "False"

model = YOLO("models/best.pt")

def run_yolo(image_path):
    results = model.predict(source=image_path, conf=0.25, verbose=False)[0]
    image = cv2.imread(image_path)

    detections = []

    for box in results.boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        conf = float(box.conf[0])

        detections.append({"confidence": round(conf, 3)})

        cv2.rectangle(image, (x1, y1), (x2, y2), (0, 0, 255), 2)
        cv2.putText(image, f"{conf:.2f}", (x1, y1 - 8),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

    output_path = "static/results/result.jpg"
    cv2.imwrite(output_path, image)

    return detections, output_path
