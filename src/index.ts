import express from "express";
import karyawanRoutes from "./routes/karyawan";

const app = express();
const port = 3000;

app.use(express.json());

app.use("/karyawan", karyawanRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

export default app;
