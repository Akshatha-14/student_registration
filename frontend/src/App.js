import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    usn: "",
    course: "",
    cgpa: ""
  });

  const API_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/students`);
      setStudents(response.data);
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to load students.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      dob: "",
      usn: "",
      course: "",
      cgpa: ""
    });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_URL}/students/${editId}`, formData);
        setStatusMessage("Student updated successfully.");
      } else {
        await axios.post(`${API_URL}/students`, formData);
        setStatusMessage("Student added successfully.");
      }
      resetForm();
      fetchStudents();
    } catch (error) {
      console.error(error);
      setStatusMessage("Operation failed.");
    }
  };

  const handleEdit = (student) => {
    setEditId(student.id);
    setFormData({
      name: student.name,
      dob: student.dob,
      usn: student.usn,
      course: student.course,
      cgpa: student.cgpa
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/students/${id}`);
      setStatusMessage("Student deleted successfully.");
      fetchStudents();
    } catch (error) {
      console.error(error);
      setStatusMessage("Delete failed.");
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.usn.toLowerCase().includes(search.toLowerCase());

      const matchesCourse =
        courseFilter === "" || student.course === courseFilter;

      return matchesSearch && matchesCourse;
    });
  }, [students, search, courseFilter]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>Student Registration Dashboard</h1>
          <p>Manage student records in one place.</p>
        </div>
        <div className="stats-card">
          <span>Total Students</span>
          <strong>{students.length}</strong>
        </div>
      </header>

      {statusMessage && <div className="status-banner">{statusMessage}</div>}

      <section className="grid-layout">
        <div className="card form-card">
          <div className="card-header">
            <h2>{editId ? "Edit Student" : "Add Student"}</h2>
            {editId && (
              <button className="ghost-btn" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>

          <form className="student-form" onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Student Name" value={formData.name} onChange={handleChange} required />
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
            <input type="text" name="usn" placeholder="USN" value={formData.usn} onChange={handleChange} required />
            <select name="course" value={formData.course} onChange={handleChange} required>
              <option value="">Select Course</option>
              <option value="Python">Python</option>
              <option value="SQL">SQL</option>
              <option value="Java">Java</option>
            </select>
            <input type="number" step="0.01" name="cgpa" placeholder="CGPA" value={formData.cgpa} onChange={handleChange} required />
            <button className="primary-btn" type="submit">
              {editId ? "Update Student" : "Add Student"}
            </button>
          </form>
        </div>

        <div className="card table-card">
          <div className="card-header controls">
            <h2>Students List</h2>
            <div className="filters">
              <input
                type="text"
                placeholder="Search by name or USN"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
              >
                <option value="">All Courses</option>
                <option value="Python">Python</option>
                <option value="SQL">SQL</option>
                <option value="Java">Java</option>
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>DOB</th>
                  <th>USN</th>
                  <th>Course</th>
                  <th>CGPA</th>
                  <th>Result</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-cell">
                      No matching students found
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, index) => (
                    <tr key={student.id}>
                      <td>{index + 1}</td>
                      <td>{student.name}</td>
                      <td>{student.dob}</td>
                      <td>{student.usn}</td>
                      <td>{student.course}</td>
                      <td>{student.cgpa}</td>
                      <td>
                        <span className={`badge ${student.result?.toLowerCase()}`}>
                          {student.result}
                        </span>
                      </td>
                      <td className="action-group">
                        <button className="edit-btn" onClick={() => handleEdit(student)}>
                          Edit
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(student.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;