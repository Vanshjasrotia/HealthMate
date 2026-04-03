from datetime import date, time

from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    age: int = Field(ge=1, le=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserOut(BaseModel):
    id: int
    name: str
    age: int | None = None
    email: EmailStr

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ReminderCreateRequest(BaseModel):
    medicine_name: str = Field(min_length=1, max_length=255)
    time: time
    frequency: str = Field(min_length=1, max_length=50)
    start_date: date
    end_date: date


class ReminderOut(BaseModel):
    id: int
    user_id: int
    medicine_name: str
    time: time
    frequency: str
    start_date: date
    end_date: date

    class Config:
        from_attributes = True


class RecentPredictionItem(BaseModel):
    disease: str
    result: str
    probability: str
    date: str


class DashboardResponse(BaseModel):
    total_predictions: int
    last_prediction: str
    reports_uploaded: int
    active_reminders: int
    recent_predictions: list[RecentPredictionItem]
    health_tips: list[str]


class HealthTipsResponse(BaseModel):
    health_tips: list[str]
