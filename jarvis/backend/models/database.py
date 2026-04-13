"""
J.A.R.V.I.S — Database Layer
SQLAlchemy models and database initialization.
"""

import os
import json
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, Float, Date
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool

Base = declarative_base()


class CommandHistory(Base):
    __tablename__ = "command_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    raw_text = Column(Text, nullable=False)
    intent = Column(String(100))
    entities = Column(Text)  # JSON string
    status = Column(String(50), default="pending")
    response = Column(Text)
    execution_time_ms = Column(Integer)
    source = Column(String(20), default="voice")

    def to_dict(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "raw_text": self.raw_text,
            "intent": self.intent,
            "entities": json.loads(self.entities) if self.entities else None,
            "status": self.status,
            "response": self.response,
            "execution_time_ms": self.execution_time_ms,
            "source": self.source,
        }


class ContextMemory(Base):
    __tablename__ = "context_memory"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(100), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    extra_data = Column(Text)  # JSON metadata


class Setting(Base):
    __tablename__ = "settings"

    key = Column(String(200), primary_key=True)
    value = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PairedDevice(Base):
    __tablename__ = "paired_devices"

    id = Column(Integer, primary_key=True, autoincrement=True)
    device_name = Column(String(200))
    device_id = Column(String(200), unique=True, nullable=False)
    pairing_code = Column(String(10))
    jwt_token = Column(Text)
    paired_at = Column(DateTime, default=datetime.utcnow)
    last_connected = Column(DateTime)
    is_active = Column(Boolean, default=True)


class UsageStats(Base):
    __tablename__ = "usage_stats"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(Date, default=datetime.utcnow)
    command_count = Column(Integer, default=0)
    voice_commands = Column(Integer, default=0)
    web_commands = Column(Integer, default=0)
    mobile_commands = Column(Integer, default=0)
    most_used_intent = Column(String(100))
    total_interaction_time_ms = Column(Integer, default=0)


class Routine(Base):
    __tablename__ = "routines"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), unique=True, nullable=False)
    description = Column(Text)
    steps = Column(Text, nullable=False)  # JSON
    trigger_type = Column(String(50), default="manual")
    trigger_value = Column(String(200))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Database:
    """Database manager for J.A.R.V.I.S"""

    def __init__(self, db_path: str = "database/jarvis.db"):
        self.db_path = db_path
        os.makedirs(os.path.dirname(db_path), exist_ok=True)

        self.engine = create_engine(
            f"sqlite:///{db_path}",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
            echo=False,
        )
        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(bind=self.engine)

    def get_session(self):
        return self.SessionLocal()

    def add_command(self, raw_text: str, source: str = "voice") -> CommandHistory:
        session = self.get_session()
        try:
            cmd = CommandHistory(raw_text=raw_text, source=source)
            session.add(cmd)
            session.commit()
            session.refresh(cmd)
            return cmd
        finally:
            session.close()

    def update_command(self, cmd_id: int, **kwargs):
        session = self.get_session()
        try:
            cmd = session.query(CommandHistory).filter_by(id=cmd_id).first()
            if cmd:
                for key, value in kwargs.items():
                    if key == "entities" and isinstance(value, dict):
                        value = json.dumps(value)
                    setattr(cmd, key, value)
                session.commit()
        finally:
            session.close()

    def get_recent_commands(self, limit: int = 20) -> list:
        session = self.get_session()
        try:
            cmds = (
                session.query(CommandHistory)
                .order_by(CommandHistory.timestamp.desc())
                .limit(limit)
                .all()
            )
            return [c.to_dict() for c in cmds]
        finally:
            session.close()

    def add_context(self, session_id: str, role: str, content: str):
        session = self.get_session()
        try:
            ctx = ContextMemory(session_id=session_id, role=role, content=content)
            session.add(ctx)
            session.commit()
        finally:
            session.close()

    def get_context(self, session_id: str, limit: int = 10) -> list:
        session = self.get_session()
        try:
            items = (
                session.query(ContextMemory)
                .filter_by(session_id=session_id)
                .order_by(ContextMemory.timestamp.desc())
                .limit(limit)
                .all()
            )
            return [{"role": i.role, "content": i.content} for i in reversed(items)]
        finally:
            session.close()

    def get_setting(self, key: str, default=None):
        session = self.get_session()
        try:
            s = session.query(Setting).filter_by(key=key).first()
            return s.value if s else default
        finally:
            session.close()

    def set_setting(self, key: str, value: str):
        session = self.get_session()
        try:
            s = session.query(Setting).filter_by(key=key).first()
            if s:
                s.value = value
                s.updated_at = datetime.utcnow()
            else:
                s = Setting(key=key, value=value)
                session.add(s)
            session.commit()
        finally:
            session.close()

    def add_paired_device(self, device_id: str, device_name: str, code: str, token: str):
        session = self.get_session()
        try:
            device = PairedDevice(
                device_id=device_id,
                device_name=device_name,
                pairing_code=code,
                jwt_token=token,
            )
            session.add(device)
            session.commit()
        finally:
            session.close()

    def get_paired_device(self, device_id: str):
        session = self.get_session()
        try:
            return session.query(PairedDevice).filter_by(device_id=device_id, is_active=True).first()
        finally:
            session.close()
