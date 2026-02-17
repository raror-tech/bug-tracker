from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.schemas.project import ProjectCreate, ProjectResponse, AddMemberRequest
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/projects", tags=["Projects"])


# 🔐 CREATE PROJECT (ADMIN ONLY)
@router.post("/", response_model=ProjectResponse)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admin can create projects"
        )

    new_project = Project(
        name=project.name,
        description=project.description,
        owner_id=current_user.id
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    # 🔥 Automatically add admin as project member
    member = ProjectMember(
        project_id=new_project.id,
        user_id=current_user.id
    )
    db.add(member)
    db.commit()

    return new_project


# 🔐 ADD MEMBER (ADMIN OWNER ONLY)
@router.post("/{project_id}/members")
def add_project_member(
    project_id: int,
    data: AddMemberRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Only admin and owner can add members
    if current_user.role != "admin" or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only project owner (admin) can add members"
        )

    existing = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == data.user_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="User already a member"
        )

    member = ProjectMember(
        project_id=project_id,
        user_id=data.user_id
    )

    db.add(member)
    db.commit()

    return {"message": "User added to project"}


# 👀 GET MY PROJECTS (ONLY WHERE USER IS MEMBER)
@router.get("/my", response_model=list[ProjectResponse])
def get_my_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    projects = (
        db.query(Project)
        .join(ProjectMember, Project.id == ProjectMember.project_id)
        .filter(ProjectMember.user_id == current_user.id)
        .all()
    )

    return projects

# 👥 GET PROJECT MEMBERS
@router.get("/{project_id}/members")
def get_project_members(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    members = (
        db.query(User)
        .join(ProjectMember, User.id == ProjectMember.user_id)
        .filter(ProjectMember.project_id == project_id)
        .all()
    )

    return members
