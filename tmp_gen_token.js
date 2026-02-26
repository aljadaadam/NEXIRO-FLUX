const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./src/config/env");
const t = jwt.sign({ id: 20, role: "admin", site_key: "local-dev" }, JWT_SECRET);
console.log(t);
