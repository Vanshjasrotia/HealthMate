from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str
    conversation_id: int | None = None


class ChatResponse(BaseModel):
    reply: str
    conversation_id: int | None = None


class ChatHistoryItem(BaseModel):
    id: int
    role: str
    content: str
    created_at: str


class ChatHistoryResponse(BaseModel):
    messages: list[ChatHistoryItem]


class ChatConversationOut(BaseModel):
    id: int
    preview: str
    updated_at: str


class ChatConversationsResponse(BaseModel):
    conversations: list[ChatConversationOut]


class PredictionResponse(BaseModel):
    prediction: str
    probability: str
    message: str


class DiabetesRequest(BaseModel):
    Glucose: float = Field(..., gt=0)
    BloodPressure: float = Field(..., gt=0)
    BMI: float = Field(..., gt=0)
    Age: int = Field(..., gt=0)
    Insulin: float | None = Field(default=None, ge=0)


class HeartRequest(BaseModel):
    Age: int = Field(..., gt=0)
    Sex: str
    ChestPainType: str
    Cholesterol: float = Field(..., gt=0)
    MaxHeartRate: float = Field(..., gt=0)
    ExerciseAngina: str


class LiverRequest(BaseModel):
    Age: int = Field(..., gt=0)
    Gender: str
    TotalBilirubin: float = Field(..., ge=0)
    DirectBilirubin: float = Field(..., ge=0)
    SGPT: float = Field(..., ge=0)
    SGOT: float = Field(..., ge=0)


class KidneyRequest(BaseModel):
    Age: int = Field(..., gt=0)
    BloodPressure: float = Field(..., gt=0)
    Creatinine: float = Field(..., ge=0)
    Hemoglobin: float = Field(..., ge=0)
    Albumin: float = Field(..., ge=0)


class ReportMetric(BaseModel):
    name: str
    value: str
    normal: bool
    note: str | None = None


class ReportAnalyzeResponse(BaseModel):
    summary: str
    extracted_values: list[ReportMetric]
    abnormal_parameters: list[str]
    remedies: list[str]
