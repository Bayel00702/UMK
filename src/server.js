require("dotenv").config();
const api = require("./index");

const PORT = process.env.PORT || 5000;

api.listen(PORT, "0.0.0.0", () => {
    console.log(`
 Server started successfully!
 http://localhost:${PORT}
`);
});