import torch
import torch.nn as nn
import timm
from torchvision import transforms
from PIL import Image

# -------------------------
# Device
# -------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# -------------------------
# Model Definition (same as training)
# -------------------------
class ColonMultiTaskNet(nn.Module):
    def __init__(self):
        super().__init__()

        self.backbone = timm.create_model(
            "densenet121",
            pretrained=False,
            num_classes=0
        )

        feat = self.backbone.num_features
        self.lesion_head = nn.Linear(feat, 1)
        self.growth_head = nn.Linear(feat, 1)
        self.risk_head = nn.Linear(feat, 1)

    def forward(self, x):
        f = self.backbone(x)
        lesion = torch.sigmoid(self.lesion_head(f))
        growth = torch.sigmoid(self.growth_head(f))
        risk = torch.sigmoid(self.risk_head(f))
        return lesion, growth, risk


# -------------------------
# Load trained model ONCE
# -------------------------
MODEL_PATH = "models/colon_multitask_densenet121.pth"

model = ColonMultiTaskNet().to(device)
state_dict = torch.load(MODEL_PATH, map_location=device)
model.load_state_dict(state_dict)
model.eval()

# -------------------------

































# Preprocessing
# -------------------------
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# -------------------------
# Inference function (Flask-ready)
# -------------------------
def predict_lesion(image_path: str):
    image = Image.open(image_path).convert("RGB")
    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        lesion_prob, _, _ = model(image)

    prob = lesion_prob.item()

    if prob >= 0.5:
        label = "Lesion Found"
        confidence = prob
    else:
        label = "No Lesion Found"
        confidence = 1 - prob

    return {
        "label": label,
        "confidence": round(confidence, 3),
        "lesion_probability": round(prob, 3)
    }
