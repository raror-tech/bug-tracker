from pydantic import BaseModel
from typing import Optional
from app.models.ticket import TicketPriority, TicketStatus, TicketType
from app.schemas.user import UserResponse


class TicketCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: TicketPriority = TicketPriority.medium
    type: TicketType = TicketType.task
    assignee_id: Optional[int] = None


class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[TicketPriority] = None
    type: Optional[TicketType] = None
    status: Optional[TicketStatus] = None
    assignee_id: Optional[int] = None


class TicketResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: TicketStatus
    priority: TicketPriority
    type: TicketType
    project_id: int
    reporter_id: int
    assignee_id: Optional[int]
    assignee: Optional[UserResponse] = None 

    class Config:
        from_attributes = True
