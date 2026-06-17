from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import date
from app import db, cursor
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



class Student(BaseModel):
    name: str
    dob: date
    usn: str
    course: str
    cgpa: float


@app.get("/")
def home():
    return {"message": "Student Registration API Running"}


@app.post("/students")
def add_student(student: Student):

    current_year = date.today().year

    if student.dob.year <= 2000 or student.dob.year > current_year:
        raise HTTPException(
            status_code=400,
            detail="DOB year must be between 2001 and current year"
        )

    if student.course not in ["Python", "SQL", "Java"]:
        raise HTTPException(
            status_code=400,
            detail="Course must be Python, SQL or Java"
        )

    if student.cgpa < 6:
        result = "Fail"
    elif student.cgpa >= 8:
        result = "Distinction"
    else:
        result = "Pass"

    query = """
    INSERT INTO students
    (name,dob,usn,course,cgpa,result)
    VALUES (%s,%s,%s,%s,%s,%s)
    """

    values = (
        student.name,
        student.dob,
        student.usn,
        student.course,
        student.cgpa,
        result
    )

    cursor.execute(query, values)
    db.commit()

    return {
        "message": "Student added successfully",
        "result": result
    }


@app.get("/students")
def get_students():

    cursor.execute("""
    SELECT id,name,dob,usn,course,cgpa,result
    FROM students
    """)

    rows = cursor.fetchall()

    students = []

    for row in rows:
        students.append({
            "id": row[0],
            "name": row[1],
            "dob": str(row[2]),
            "usn": row[3],
            "course": row[4],
            "cgpa": float(row[5]),
            "result": row[6]
        })

    return students


@app.put("/students/{student_id}")
def update_student(student_id: int, student: Student):

    if student.cgpa < 6:
        result = "Fail"
    elif student.cgpa >= 8:
        result = "Distinction"
    else:
        result = "Pass"

    query = """
    UPDATE students
    SET name=%s,
        dob=%s,
        usn=%s,
        course=%s,
        cgpa=%s,
        result=%s
    WHERE id=%s
    """

    values = (
        student.name,
        student.dob,
        student.usn,
        student.course,
        student.cgpa,
        result,
        student_id
    )

    cursor.execute(query, values)
    db.commit()

    return {"message": "Student updated successfully"}


@app.delete("/students/{student_id}")
def delete_student(student_id: int):

    cursor.execute(
        "DELETE FROM students WHERE id=%s",
        (student_id,)
    )

    db.commit()

    return {"message": "Student deleted successfully"}