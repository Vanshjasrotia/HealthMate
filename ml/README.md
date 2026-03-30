# HealthMate – ML training

Train Random Forest models for Diabetes, Heart, Liver, and Kidney disease.

## Setup

**Option A – Virtual environment (recommended on Windows if you get “Access is denied”):**

```powershell
cd ml
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements-ml.txt
```

**Option B – Install for your user:**

```powershell
cd ml
pip install -r requirements-ml.txt
```

## Data

Place CSV files under `ml/data/` with these names (or set paths in `train_all_disease_models.py`):

| Disease | Suggested filename | Target column |
|--------|--------------------|----------------|
| Diabetes | diabetes.csv | Outcome (0/1) |
| Heart | heart.csv | target (0/1) or num (0–4, binarized) |
| Liver | liver.csv | Dataset (1=Liver, 2=No) |
| Kidney | kidney.csv | class (ckd / notckd) |

Create the folder if needed:

```bash
mkdir -p ml/data
mkdir -p ml/models
```

## Run

From the `ml` folder:

```powershell
python train_all_disease_models.py
```

If you use the venv, activate it first (`.\venv\Scripts\activate`), then run the same command. Or run with the venv’s Python directly:

```powershell
.\venv\Scripts\python.exe train_all_disease_models.py
```

Models are saved under `ml/models/` as:

- diabetes_model.pkl  
- heart_model.pkl  
- liver_model.pkl  
- kidney_model.pkl  
