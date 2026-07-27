import torch
import torch.nn as nn
import timm
from torchvision import transforms
from PIL import Image


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


class TumorRiskGrowthNet(nn.Module):
    def __init__(self):
        super().__init__()

        self.backbone = timm.create_model(
            "densenet121",
            pretrained=False,
            num_classes=0
        )

        feat = self.backbone.num_features
        self.risk_head = nn.Linear(feat, 1)
        self.growth_head = nn.Linear(feat, 1)

    def forward(self, x):
        f = self.backbone(x)
        risk = torch.sigmoid(self.risk_head(f))
        growth = torch.sigmoid(self.growth_head(f))
        return risk, growth


model = TumorRiskGrowthNet()


state_dict = torch.load(
    "models/tumor_risk_growth_densenet121_last.pth",
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
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


def predict_cancer_risk(image_path: str):
    image = Image.open(image_path).convert("RGB")
    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        risk_p, growth_p = model(image)

    risk = risk_p.item()
    growth = growth_p.item()


    if risk < 0.15:
        risk_label = "Low Cancer Risk"
    elif risk < 0.35:
        risk_label = "Moderate Cancer Risk"
    else:
        risk_label = "High Cancer Risk"

    estimated_mm = round(growth * 80, 2) 

    return {
        "risk_label": risk_label,
        "risk_probability": round(risk, 3),
        "tumor_growth_relative": round(growth, 3),
        "estimated_size_mm": estimated_mm
    }
