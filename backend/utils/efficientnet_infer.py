import torch
import timm
from torchvision import transforms
from PIL import Image

# ================= CONFIG =================
DEVICE = torch.device("cpu")
MODEL_PATH = "models/efficientnet_b1_polyp_classifier.pth"
IMG_SIZE = 224

# 🔴 MUST MATCH TRAINING
CLASS_NAMES = [
    "No Tumor",
    "Tumor"
]
# ========================================


# ============ LOAD MODEL =================
model = timm.create_model(
    "efficientnet_b1",
    pretrained=False,
    num_classes=2   # 🔥 FIXED
)

model.load_state_dict(
    torch.load(MODEL_PATH, map_location=DEVICE)
)

model.to(DEVICE)
model.eval()
# ========================================


# ============ TRANSFORMS =================
transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])
# ========================================


# ============ INFERENCE ==================
def predict_efficientnet(image_path):
    img = Image.open(image_path).convert("RGB")
    img = transform(img).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits = model(img)
        probs = torch.softmax(logits, dim=1)

    conf, idx = torch.max(probs, dim=1)
    conf = conf.item()
    cls = idx.item()

    # 🔬 Medical label mapping
    if cls == 1:
        label = "Tumor"
    else:
        # No Tumor class
        if conf < 0.6:
            label = "Healthy Colon"
        else:
            label = "Hyperplastic"

    return {
        "label": label,
        "confidence": round(conf, 4)
    }
