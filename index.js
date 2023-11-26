const express = require("express");
const app = express();
const cors = require("cors");
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

let lapData = null;
const lapDataListener = (data) => {
  lapData = data.m_lapData[0].m_currentLapTime;
};

const carTelemetryListener = (data) => {
  let inputdata = {
    speed: data.m_carTelemetryData[0].m_speed,
    throttle: data.m_carTelemetryData[0].m_throttle,
    brake: data.m_carTelemetryData[0].m_brake,
  };
  let outdata = {
    inputdata,
    lapData,
  };
  console.log(outdata);
};

const sessionListener = (data) => {
  console.log(data);
};

const client = new F1TelemetryClient({
  port: 20777,
  forwardAddresses: [{ port: 2004, ip: "192.168.0.102" }],
});
client.on(PACKETS.lapData, lapDataListener);
client.on(PACKETS.carTelemetry, carTelemetryListener);

// client.on(PACKETS.session, sessionListener);
// client.on(PACKETS.event, console.log);
// client.on(PACKETS.motion, motionListener);
// client.on(PACKETS.carSetups, console.log);
// client.on(PACKETS.participants, console.log);
// client.on(PACKETS.carStatus, carStatusListener);
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
