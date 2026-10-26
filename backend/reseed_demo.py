"""
Utility Script: Reseed the 3 golden sample scenario colleges on demand.
Scenarios:
- Scenario A: Vishwakarma Institute of Technology, Pune (Clean Fast-Track)
- Scenario B: Apex Institute of Technology, Mumbai (Tampered Fire NOC + Canva metadata)
- Scenario C: St. Xavier Institute of Science & Technology (Area Contradiction + Reused Photo)
"""
from config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from seed import seed_system_rules_and_users, seed_demo_colleges

def main():
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    try:
        seed_system_rules_and_users(db)
        seed_demo_colleges(db)
        print("=" * 65)
        print("PRAMAAN-AICTE: 3 DEMO SCENARIO COLLEGES RESEEDED SUCCESSFULLY!")
        print("=" * 65)
        print("Applications reseeded:")
        print("  1. Vishwakarma Institute of Technology, Pune (Fast-Track)")
        print("  2. Apex Institute of Technology, Mumbai (Tampered Fire NOC)")
        print("  3. St. Xavier Institute, Mumbai (Area Mismatch + Duplicate Lab)")
        print("=" * 65)
    finally:
        db.close()

if __name__ == "__main__":
    main()
