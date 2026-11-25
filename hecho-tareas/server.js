require("dotenv").config();
const { assertEnv } = require("./src/config");

assertEnv();
const app = require("./src/app");

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Servidor listo en http://localhost:${port}`));
