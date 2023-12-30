const fs = require("fs");
const { F1TelemetryClient, constants } = require("@z0mt3c/f1-telemetry-client");
const path = require("path");
const { saveLapDataToTxt } = require("./utils");

const { PACKETS } = constants;

let currentSessionUID = "";
let currentTrackId = "";
let currentLapTime = null;
let currentLapNum = 1;
let currentSessionType = "";

let everyLapData = new Map();

const lapDataListener = async (data) => {
  if (!everyLapData.has(data.m_lapData[0].m_currentLapNum)) {
    let insertdata = {
      currentLapInvalid: data.m_lapData[0].m_currentLapInvalid,
      Datas: [],
    };
    everyLapData.set(data.m_lapData[0].m_currentLapNum, insertdata);
    if (data.m_lapData[0].m_currentLapNum != 1 && everyLapData.size > 1) {
      const tempFileName = await saveLapDataToTxt(
        everyLapData.get(data.m_lapData[0].m_currentLapNum - 1),
        currentLapNum,
        currentTrackId,
        currentSessionUID,
        currentSessionType
      );
      console.log("Saved", tempFileName);
    }
  } else {
    let tempdata = everyLapData.get(data.m_lapData[0].m_currentLapNum);
    tempdata.currentLapInvalid = data.m_lapData[0].m_currentLapInvalid;
    everyLapData.set(data.m_lapData[0].m_currentLapNum, tempdata);
  }
  currentLapNum = data.m_lapData[0].m_currentLapNum;
  currentLapTime = data.m_lapData[0].m_currentLapTimeInMS / 1000;
};

const carTelemetryListener = (data) => {
  let inputdata = {
    speed: data.m_carTelemetryData[0].m_speed,
    throttle: data.m_carTelemetryData[0].m_throttle,
    brake: data.m_carTelemetryData[0].m_brake,
    steer: data.m_carTelemetryData[0].m_steer * -1,
    gear: data.m_carTelemetryData[0].m_gear,
    engineRPM: data.m_carTelemetryData[0].m_engineRPM,
    drs: data.m_carTelemetryData[0].m_drs,
  };
  let outdata = {
    inputdata,
    currentLapTime,
  };

  if (everyLapData.has(currentLapNum)) {
    let tempdata = everyLapData.get(currentLapNum);
    tempdata.Datas.push(outdata);
    everyLapData.set(currentLapNum, tempdata);
  } else {
    console.log("Lap not exist");
  }
};

const sessionListener = (data) => {
  currentSessionType = data.m_sessionType;
  currentTrackId = data.m_trackId;
  currentSessionUID = data.m_header.m_sessionUID;
  if (currentSessionUID != data.m_header.m_sessionUID) {
    currentLapData = [];
    currentLapNum = 1;
  }
};

// const participantsListener = (data) => {
//   let me = data.m_participants.find((e) => e.m_aiControlled == 0 && e.m_yourTelemetry == 0 && e.m_name != "").m_name;
//   currentUserName = me;
// };

const finalClassificationListener = (data) => {
  console.log(data.m_classificationData);
};

const setupTelemetryListener = () => {
  const client = new F1TelemetryClient({
    port: 20777,
  });

  client.on(PACKETS.lapData, lapDataListener);
  client.on(PACKETS.carTelemetry, carTelemetryListener);
  // client.on(PACKETS.participants, participantsListener);
  client.on(PACKETS.session, sessionListener);
  client.on(PACKETS.finalClassification, finalClassificationListener);

  client.start();
};

module.exports = {
  setupTelemetryListener,
};
