import express from "express";
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/student/:id", (req, res) => {
  const student_id = req.params.id;
  res.send(`THIS IS ${student_id}th student`);
});

app.put("/student/:id", (req, res) => {
  const student_id = req.params.id;
  res.send(`THIS IS ${student_id}th student PUT PAGEE`);
});

app.listen(port, () => {
  console.log(`this app is listening port ${port}`);
});
