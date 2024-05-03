const express = require("express");
const app = express();
const port = 2004;
const telemetryController = require("./src/controllers/telemetryController.js");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { sortSessions, sortByLapNumber } = require("./src/utils.js");

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/sessions", (req, res) => {
  const folderPath = path.join(__dirname, `./files/sessions/`);
  let sessions = [];
  fs.readdirSync(folderPath).forEach((file) => {
    sessions.push(file);
  });

  sessions = sortSessions(sessions);

  return res.status(200).json({
    success: true,
    sessions,
  });
});

app.get("/session/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const folderPath = path.join(__dirname, `./files/sessions/${sessionId}/`);

  let files = [];
  fs.readdirSync(folderPath).forEach((file) => {
    files.push(file);
  });

  files = sortByLapNumber(files);

  return res.status(200).json({
    success: true,
    files,
  });
});

app.get("/session/:sessionId/:fileName", (req, res) => {
  const { sessionId, fileName } = req.params;
  const filePath = path.join(__dirname, `./files/sessions/${sessionId}/${fileName}`);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        error: err,
      });
    }
    let result = data
      .toString()
      .split("\n")
      .map((e) => JSON.parse(e));
    return res.status(200).json({
      success: true,
      data: result,
    });
  });
});

app.listen(port, () => {
  console.log("Server listening on port:", port);
});

telemetryController.setupTelemetryListener();
