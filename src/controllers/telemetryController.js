const { F1TelemetryClient, constants } = require("@z0mt3c/f1-telemetry-client");
const { saveLapDataToTxt } = require("./utils");
const e = require("cors");

const { PACKETS } = constants;

let currentSessionUID = "";
let currentTrackId = "";
let currentLapTime = null;
let currentLapNum = 1;
let currentSessionType = "";
let currentUserIndex = 0;
let currentLapDistance = 0;

let everyLapData = new Map();

const lapDataListener = async (data) => {
  if (!everyLapData.has(data.m_lapData[currentUserIndex]?.m_currentLapNum)) {
    // console.log(data.m_lapData[currentUserIndex]);
    let insertdata = {
      currentLapInvalid: data.m_lapData[currentUserIndex].m_currentLapInvalid,
      Datas: [],
    };
    everyLapData.set(data.m_lapData[currentUserIndex].m_currentLapNum, insertdata);
    if (data.m_lapData[currentUserIndex].m_currentLapNum != 1 && everyLapData.size > 1) {
      const tempFileName = await saveLapDataToTxt(
        everyLapData.get(data.m_lapData[currentUserIndex].m_currentLapNum - 1),
        currentLapNum,
        currentTrackId,
        currentSessionUID,
        currentSessionType,
        data.m_lapData[currentUserIndex].m_lastLapTimeInMS / 1000
      );
      console.log("Saved", tempFileName);
    }
  } else {
    let tempdata = everyLapData.get(data.m_lapData[currentUserIndex].m_currentLapNum);
    tempdata.currentLapInvalid = data.m_lapData[currentUserIndex].m_currentLapInvalid;
    everyLapData.set(data.m_lapData[currentUserIndex].m_currentLapNum, tempdata);
  }
  currentLapNum = data.m_lapData[currentUserIndex].m_currentLapNum;
  currentLapTime = data.m_lapData[currentUserIndex].m_currentLapTimeInMS / 1000;
  currentLapDistance = data.m_lapData[currentUserIndex].m_lapDistance;
};

const carTelemetryListener = (data) => {
  let inputdata = {
    speed: data.m_carTelemetryData[currentUserIndex].m_speed,
    throttle: data.m_carTelemetryData[currentUserIndex].m_throttle,
    brake: data.m_carTelemetryData[currentUserIndex].m_brake,
    steer: data.m_carTelemetryData[currentUserIndex].m_steer * -1,
    gear: data.m_carTelemetryData[currentUserIndex].m_gear,
    engineRPM: data.m_carTelemetryData[currentUserIndex].m_engineRPM,
    drs: data.m_carTelemetryData[currentUserIndex].m_drs,
    engineTemp: data.m_carTelemetryData[currentUserIndex].m_engineTemperature,
  };
  let outdata = {
    inputdata,
    currentLapTime,
    currentLapDistance,
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
  if (currentSessionUID != data.m_header.m_sessionUID) {
    // When the session changes, reset variables
    resetVariables();
  }
  currentSessionType = data.m_sessionType;
  currentTrackId = data.m_trackId;
  currentSessionUID = data.m_header.m_sessionUID;
  if (currentSessionUID != data.m_header.m_sessionUID) {
    currentLapData = [];
    currentLapNum = 1;
  }
};

const resetVariables = () => {
  currentSessionUID = "";
  currentTrackId = "";
  currentLapTime = null;
  currentLapNum = 1;
  currentSessionType = "";
  currentUserIndex = 0;
  currentLapDistance = 0;
  everyLapData = new Map();
};

const participantsListener = (data) => {
  let myindex;
  // let myindex = data.m_participants.findIndex((e) => e.m_aiControlled == 0 && e.m_name != "" && e.m_raceNumber == 73);
  data.m_participants.forEach((e, i) => {
    if (myindex) return;
    if (e.m_aiControlled == 0) {
      myindex = i;
    }
  });
  currentUserIndex = myindex;
};

const finalClassificationListener = (data) => {
  console.log(data.m_classificationData);
};

const setupTelemetryListener = () => {
  const client = new F1TelemetryClient({
    port: 20777,
  });

  client.on(PACKETS.lapData, lapDataListener);
  client.on(PACKETS.carTelemetry, carTelemetryListener);
  client.on(PACKETS.participants, participantsListener);
  client.on(PACKETS.session, sessionListener);
  client.on(PACKETS.finalClassification, finalClassificationListener);

  client.start();
};

module.exports = {
  setupTelemetryListener,
};
