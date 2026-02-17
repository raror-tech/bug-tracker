from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.comment import Comment
from app.schemas.comment import CommentCreate, CommentResponse
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/comments", tags=["Comments"])


# 🔹 Create Comment
@router.post("/tickets/{ticket_id}", response_model=CommentResponse)
def create_comment(
    ticket_id: int,
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_comment = Comment(
        content=comment.content,
        ticket_id=ticket_id,
        user_id=current_user.id,
        parent_id=comment.parent_id
    )

    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)

    return db_comment


# 🔹 Get Comments
@router.get("/tickets/{ticket_id}", response_model=list[CommentResponse])
def get_comments(
    ticket_id: int,
    db: Session = Depends(get_db)
):
    return db.query(Comment).filter(
        Comment.ticket_id == ticket_id
    ).all()


# 🔹 Delete Comment (RBAC Protected)
@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comment = db.query(Comment).filter(
        Comment.id == comment_id
    ).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # 🔐 ROLE-BASED PERMISSION
    if current_user.role == "admin":
        pass  # admin can delete any comment

    elif current_user.role == "developer":
        # developer can delete only their own comment
        if comment.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not allowed")

    else:  # viewer
        raise HTTPException(status_code=403, detail="Not allowed")

    db.delete(comment)
    db.commit()

    return {"message": "Comment deleted"}
