from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional

from app.core.database import get_db
from app.models.ticket import Ticket
from app.models.project import Project
from app.schemas.ticket import TicketCreate, TicketUpdate, TicketResponse
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/tickets",
    tags=["Tickets"]
)

# --------------------------------------------------------
# 🔐 CREATE TICKET
# --------------------------------------------------------
@router.post("/projects/{project_id}", response_model=TicketResponse)
def create_ticket(
    project_id: int,
    data: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # 🔐 Only admin can assign tickets
    if data.assignee_id is not None:
        if current_user.role != "admin":
            raise HTTPException(
                status_code=403,
                detail="Only admin can assign tickets"
            )

    ticket = Ticket(
        title=data.title,
        description=data.description,
        priority=data.priority,
        type=data.type,
        project_id=project_id,
        reporter_id=current_user.id,
        assignee_id=data.assignee_id if current_user.role == "admin" else None
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return ticket


# --------------------------------------------------------
# 🔍 GET PROJECT TICKETS (WITH FILTERS)
# --------------------------------------------------------
@router.get("/projects/{project_id}", response_model=list[TicketResponse])
def get_project_tickets(
    project_id: int,
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    assignee_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Ticket).filter(Ticket.project_id == project_id)

    if status:
        query = query.filter(Ticket.status == status)

    if priority:
        query = query.filter(Ticket.priority == priority)

    if assignee_id:
        query = query.filter(Ticket.assignee_id == assignee_id)

    if search:
        query = query.filter(
            or_(
                Ticket.title.ilike(f"%{search}%"),
                Ticket.description.ilike(f"%{search}%")
            )
        )

    return query.all()


# --------------------------------------------------------
# 🔐 UPDATE TICKET
# --------------------------------------------------------
@router.patch("/{ticket_id}", response_model=TicketResponse)
def update_ticket(
    ticket_id: int,
    data: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # 🔐 ROLE-BASED PERMISSIONS

    if current_user.role == "admin":
        pass  # admin can update anything

    elif current_user.role == "developer":
        # Developer can only update tickets assigned to them
        if ticket.assignee_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not allowed")

        # 🔐 Developer cannot reassign
        if data.assignee_id is not None:
            raise HTTPException(
                status_code=403,
                detail="Only admin can reassign tickets"
            )

    else:  # viewer
        raise HTTPException(status_code=403, detail="Not allowed")

    # Apply updates
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(ticket, field, value)

    db.commit()
    db.refresh(ticket)

    return ticket


# --------------------------------------------------------
# 🗑 DELETE TICKET (ADMIN ONLY)
# --------------------------------------------------------
@router.delete("/{ticket_id}")
def delete_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    db.delete(ticket)
    db.commit()

    return {"message": "Ticket deleted"}
