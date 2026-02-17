from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

print("🚀 FASTAPI MAIN APP LOADED 🚀")

from app.routes import auth, projects, tickets

app = FastAPI(title="Bug Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tickets.router)
from app.routes import comment

app.include_router(comment.router)


@app.get("/")
def health_check():
    return {"status": "ok"}
