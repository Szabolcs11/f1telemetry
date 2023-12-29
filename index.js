const express = require("express");
const app = express();
const port = 2004;
const telemetryController = require("./src/controllers/telemetryController.js");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/sessions", (req, res) => {
  //get the sessions from folder names
  const folderPath = path.join(__dirname, `./files/sessions/`);
  let sessions = [];
  fs.readdirSync(folderPath).forEach((file) => {
    sessions.push(file);
  });
  //sort the sessions by date
  sessions.sort((a, b) => {
    const aMatch = a.match(/(\d{2}-\d{2}-\d{2})_/);
    const bMatch = b.match(/(\d{2}-\d{2}-\d{2})_/);
    const [aDay, aMonth, aYear] = aMatch[1].split("-");
    const [bDay, bMonth, bYear] = bMatch[1].split("-");
    return new Date(`20${bYear}, ${bMonth}, ${bDay}`) - new Date(`20${aYear}, ${aMonth}, ${aDay}`);
  });
  return res.status(200).json({
    success: true,
    sessions,
  });
});

app.get("/session/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  console.log(sessionId);
  const folderPath = path.join(__dirname, `./files/sessions/${sessionId}/`);
  let files = [];
  fs.readdirSync(folderPath).forEach((file) => {
    files.push(file);
  });
  files.sort((a, b) => {
    const lapNumberA = parseInt(a.split("_")[0], 10);
    const lapNumberB = parseInt(b.split("_")[0], 10);
    return lapNumberB - lapNumberA;
  });
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
