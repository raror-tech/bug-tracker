from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class TicketStatus(str, enum.Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"

class TicketPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class TicketType(str, enum.Enum):
    bug = "bug"
    task = "task"
    feature = "feature"

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)
    description = Column(Text)

    status = Column(
        Enum(TicketStatus, name="ticket_status_enum"),
        default=TicketStatus.todo,
        nullable=False,
        index=True
    )

    priority = Column(
        Enum(TicketPriority, name="ticket_priority_enum"),
        default=TicketPriority.medium,
        nullable=False,
        index=True
    )

    type = Column(
        Enum(TicketType, name="ticket_type_enum"),
        default=TicketType.task,
        nullable=False
    )

    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        nullable=False,
        index=True
    )

    reporter_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    assignee_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    project = relationship("Project", back_populates="tickets")
    reporter = relationship("User", foreign_keys=[reporter_id])
    assignee = relationship("User", foreign_keys=[assignee_id])
    comments = relationship("Comment", back_populates="ticket")


