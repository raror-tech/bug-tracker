from app.core.database import Base, engine

# Import all models so SQLAlchemy registers them
from app.models import user
from app.models import project
from app.models import project_member
from app.models import ticket
from app.models import comment

Base.metadata.create_all(bind=engine)

print("✅ Tables created successfully")