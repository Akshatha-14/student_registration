import mysql.connector

db = mysql.connector.connect(
    host="localhost",
    port=3307,
    user="root",
    password="123456",
    database="school"
)

cursor = db.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    usn VARCHAR(20) UNIQUE NOT NULL,
    course VARCHAR(20) NOT NULL,
    cgpa DECIMAL(3,2),
    result VARCHAR(20)
)
""")

db.commit()

print("Connected to MySQL and students table created!")
