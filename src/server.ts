import "dotenv/config";

import app from "./app.js";

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log("=================================");
  console.log("   DEV MOTORS BACKEND SERVER");
  console.log("=================================");
  console.log(`Server running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
});