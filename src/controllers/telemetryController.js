const fs = require("fs");
const { F1TelemetryClient, constants } = require("@z0mt3c/f1-telemetry-client");
const path = require("path");
const { filterArray, getTrackById, getDateForFileName, getSessionTypeFromId, saveLapDataToTxt } = require("./utils");

const { PACKETS } = constants;

let currentSessionUID = "";
let currentUserName = "";
let currentTrackId = "";
let currentLapData = [];
let currentLapTime = null;
let currentLapNum = 1;
let currentLapInvalid = 0;
let listenInputs = 0;
let ignoreRerq = false;
let currentSessionType = "";

const lapDataListener = async (data) => {
  if (data.m_lapData[0].m_pitStatus == 0 && data.m_lapData[0].m_lapDistance > 0) {
    listenInputs = 1;
    if (currentLapNum + 1 == data.m_lapData[0].m_currentLapNum) {
      if (!ignoreRerq) {
        ignoreRerq = true;
        const tempFileName = await saveLapDataToTxt(
          currentLapData,
          currentLapNum,
          currentTrackId,
          currentSessionUID,
          currentSessionType
        );
        console.log("Saved", tempFileName);
        currentLapData = [];
        ignoreRerq = false;
      } else {
        console.log("Ignoreddata", data.m_lapData[0].m_currentLapNum);
      }
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
      steer: data.m_carTelemetryData[0].m_steer * -1,
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
