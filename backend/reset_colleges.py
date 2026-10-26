"""
Utility Script: Reset all hardcoded colleges and applications.
Leaves regulatory rules, admin/nodal users, authority registry, and genesis audit records intact.
Allows the user to start completely fresh with their own institution.
"""
from config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from seed import reset_all_colleges, seed_system_rules_and_users

def main():
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    try:
        seed_system_rules_and_users(db)
        reset_all_colleges(db)
        print("=" * 65)
        print("PRAMAAN-AICTE: ALL SAMPLE COLLEGES & APPLICATIONS CLEARED!")
        print("=" * 65)
        print("Your database is now clean. You can register your own college")
        print("from the dashboard at: http://localhost:3000")
        print("=" * 65)
    finally:
        db.close()

if __name__ == "__main__":
    main()
