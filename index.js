const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");
const port = 2004;
const { F1TelemetryClient, constants } = require("@z0mt3c/f1-telemetry-client");
const { PACKETS } = constants;

// var corsOptions = {
//     origin: "192.168.0.102:2004",
// };
// app.use(cors(corsOptions));

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Test!",
  });
});

let currentSessionUID = "";
let currentUserName = "";
let currentTrackId = "";
let currentLapData = [];
let currentLapTime = null;
let currentLapNum = 1;
let currentLapInvalid = 0;
let listenInputs = 0;

const lapDataListener = (data) => {
  if (data.m_lapData[0].m_pitStatus == 0 && data.m_lapData[0].m_lapDistance > 0) {
    listenInputs = 1;
    if (currentLapNum + 1 == data.m_lapData[0].m_currentLapNum) {
      const tempFileName = saveLapDataToTxt(currentLapData, currentLapNum);
      console.log(tempFileName, "Saved");
      currentLapData = [];
    }
    currentLapTime = data.m_lapData[0].m_currentLapTime;
    currentLapNum = data.m_lapData[0].m_currentLapNum;
  } else {
    currentLapData = [];
    currentLapNum = 1;
  }
  currentLapInvalid = data.m_lapData[0].m_currentLapInvalid;
};

const carTelemetryListener = (data) => {
  if (listenInputs) {
    let inputdata = {
      speed: data.m_carTelemetryData[0].m_speed,
      throttle: data.m_carTelemetryData[0].m_throttle,
      brake: data.m_carTelemetryData[0].m_brake,
      steer: data.m_carTelemetryData[0].m_steer,
      gear: data.m_carTelemetryData[0].m_gear,
      engineRPM: data.m_carTelemetryData[0].m_engineRPM,
      drs: data.m_carTelemetryData[0].m_drs,
    };
    let outdata = {
      inputdata,
      currentLapTime,
      currentLapNum,
      currentLapInvalid,
    };
    currentLapData.push(outdata);
  }
};

function saveLapDataToTxt(tempLapData, lapNum) {
  let result = filterArray(tempLapData);
  let fileName = currentSessionUID + "-" + currentUserName + "-" + currentTrackId + "-" + lapNum + ".txt";
  const dataString = result.map((e) => JSON.stringify(e)).join("\n");
  fs.appendFile(fileName, dataString, (err) => {
    if (err) throw err;
  });
  return fileName;
}

function filterArray(arr) {
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    if (i === 0 || arr[i].currentLapTime > arr[i - 1].currentLapTime) {
      result.push(arr[i]);
    } else {
      result = [arr[i]]; // Start a new sequence if the condition is not met
    }
  }
  return result;
}

const sessionListener = (data) => {
  currentTrackId = data.m_trackId;
  currentSessionUID = data.m_header.m_sessionUID;
  if (currentSessionUID != data.m_header.m_sessionUID) {
    currentLapData = [];
    currentLapNum = 1;
  }
};

const participantsListener = (data) => {
  currentUserName = data.m_participants[0].m_name;
};

const client = new F1TelemetryClient({
  port: 20777,
  forwardAddresses: [{ port: 2004, ip: "192.168.0.102" }],
});
client.on(PACKETS.lapData, lapDataListener);
client.on(PACKETS.carTelemetry, carTelemetryListener);
client.on(PACKETS.participants, participantsListener);
client.on(PACKETS.session, sessionListener);

// client.on(PACKETS.event, console.log);
// client.on(PACKETS.motion, console.log);
// client.on(PACKETS.carSetups, console.log);
// client.on(PACKETS.carStatus, console.log);
// client.on(PACKETS.finalClassification, console.log);
// client.on(PACKETS.lobbyInfo, console.log);
// client.on(PACKETS.carDamage, console.log);
// client.on(PACKETS.sessionHistory, console.log);
// client.on(PACKETS.tyreSets, console.log);
// client.on(PACKETS.motionEx, console.log);

// to start listening:
client.start();

// and when you want to stop:
// client.stop()

// app.listen(port, () => {
//     console.log('App Listen on Port: ', port)
// })
