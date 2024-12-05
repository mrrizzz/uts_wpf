import express from "express";
import karyawanRoutes from "./routes/karyawan";
import departemenRoutes from "./routes/departemen";
import jabatanRoutes from "./routes/jabatan";
import absensiRoutes from "./routes/absensi";
import gajiRoutes from "./routes/gaji";

const app = express();
const port = 3000;

app.use(express.json());

app.use("/karyawan", karyawanRoutes);
app.use("/departemen", departemenRoutes);
app.use("/gaji", gajiRoutes);
app.use("/absensi", absensiRoutes);
app.use("/jabatan", jabatanRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

export default app;
