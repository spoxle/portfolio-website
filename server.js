const express = require("express");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
	console.log(`http://localhost:${PORT}`);
});
