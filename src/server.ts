import { app } from "./app";
import { connectDB } from "./config/prisma";

const port = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();

  app.listen(port, () => {
    console.log(`Server running on ${port}`);
  });
};

startServer();
