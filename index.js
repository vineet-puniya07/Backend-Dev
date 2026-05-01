const express = require("express");
const app = express();

app.use(express.json());

let students = [];
let nextId = 1;

app.post("/students", (req, res) => {
    const{name, marks} = req.body;

    if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (marks === undefined || marks < 0) {
    return res.status(400).json({ error: 'Marks must be 0 or greater' });
  }
  const newStudent = {
    id: nextId,
    name: name,
    marks: marks
  };
  nextId++;

  students.push(newStudent);
  res.status(201).json({ message: 'Student added successfully', student: newStudent });


});
app.get('/students', (req, res) => {
  res.status(200).json(students);
});

app.put('/students/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, marks } = req.body;

  const student = students.find(s => s.id === id);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (marks === undefined || marks < 0) {
    return res.status(400).json({ error: 'Marks must be 0 or greater' });
  }

  student.name = name;
  student.marks = marks;

  res.status(200).json({ message: 'Student updated successfully', student: student });
});
app.delete("/students/:id", (req, res) =>{
    const id = parseInt(req.params.id);

    const index = students.findIndex(s=> s.id === id);

    if(index=== -1){
        return res.status(404).json({error: "Student not found"});
    }
    students.splice(index, 1);

    res.status(200).json({message: "Student deleted successfully"});

});

app.listen(3000, () => {
    console.log("Server  is running on http://localhost:3000");
});