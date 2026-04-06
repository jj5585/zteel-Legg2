from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, shops, members, categories, transactions, dashboard

app = FastAPI(title="Zteel Ledger API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(shops.router)
app.include_router(members.router)
app.include_router(categories.router)
app.include_router(transactions.router)
app.include_router(dashboard.router)

@app.get("/")
def root():
    return {"status": "Zteel Ledger API running"}