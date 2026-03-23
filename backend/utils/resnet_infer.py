import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

# -------------------------
# Device
# -------------------------
device = torch.device("cpu")

# -------------------------
# Build ResNet50
# -------------------------
model = models.resnet50(weights=None)
model.fc = nn.Linear(model.fc.in_features, 3)

# -------------------------
# Load trained weights
# -------------------------
state_dict = torch.load(
    "models/resnet50_polyp_3class.pth",
    map_location=device
)
model.load_state_dict(state_dict)
model.to(device)
model.eval()

# -------------------------
# Preprocessing
# -------------------------
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

# -------------------------
# Class labels
# -------------------------
classes = ["Healthy", "Hyperplastic", "Harmful Tumor"]

# -------------------------
# Inference function
# -------------------------
def predict_resnet(image_path: str):
    image = Image.open(image_path).convert("RGB")
    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        logits = model(image)
        probs = torch.softmax(logits, dim=1)[0]

    p_healthy = probs[0].item()
    p_hyper = probs[1].item()
    p_tumor = probs[2].item()

    # 🔬 Medical decision logic
    if p_tumor > max(p_healthy, p_hyper):
        label = "Tumor"
        confidence = p_tumor
    elif p_hyper > max(p_healthy, p_tumor):
        label = "Hyperplastic"
        confidence = p_hyper
    else:
        label = "Healthy Colon"
        confidence = p_healthy

    return {
        "label": label,
        "confidence": round(confidence, 3),
        "probs": {
            "Healthy": round(p_healthy, 3),
            "Hyperplastic": round(p_hyper, 3),
            "Tumor": round(p_tumor, 3),
        }
    }

