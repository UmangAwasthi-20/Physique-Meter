import uuid
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    profile = relationship("AthleteProfile", back_populates="user", uselist=False)


class AthleteProfile(Base):
    __tablename__ = "athlete_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    gender = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    height_cm = Column(Numeric(6, 2), nullable=False)
    current_weight_kg = Column(Numeric(6, 2), nullable=False)
    target_weight_kg = Column(Numeric(6, 2))
    fitness_goal = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="profile")


class ProgressEntry(Base):
    __tablename__ = "progress_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    weight_kg = Column(Numeric(6, 2), nullable=False)
    body_fat_percent = Column(Numeric(5, 2))
    shoulder_waist_ratio = Column(Numeric(5, 3))
    notes = Column(Text)
    photo_url = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class AIReport(Base):
    __tablename__ = "ai_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    progress_entry_id = Column(UUID(as_uuid=True), ForeignKey("progress_entries.id", ondelete="SET NULL"))
    summary = Column(Text, nullable=False)
    strengths = Column(JSONB, nullable=False, default=list)
    weaknesses = Column(JSONB, nullable=False, default=list)
    focus_areas = Column(JSONB, nullable=False, default=list)
    weekly_summary = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
