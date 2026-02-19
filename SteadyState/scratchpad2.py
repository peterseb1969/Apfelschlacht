# Re-run the script after execution state reset

import sqlite3
import os

# Define database filename
db_filename = "demo_database.db"

# Check if the database file exists
db_exists = os.path.exists(db_filename)

# Connect to the SQLite database (creates it if it doesn't exist)
conn = sqlite3.connect(db_filename)
cursor = conn.cursor()

if not db_exists:
    # Create a demo table if the database didn't exist
    cursor.execute("""
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER NOT NULL
    )
    """)
    conn.commit()
    message = f"Database '{db_filename}' created with 'users' table."
else:
    message = f"Database '{db_filename}' already exists."

# Close connection
conn.close()

# Display the database file path
db_path = os.path.abspath(db_filename)
message, db_path
