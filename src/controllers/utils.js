const path = require("path");
const fs = require("fs");

function filterArray(arr) {
  let result = [];
  for (let i = 0; i < arr.Datas.length; i++) {
    if (i === 0 || arr.Datas[i].currentLapTime > arr.Datas[i - 1].currentLapTime) {
      result.push(arr.Datas[i]);
    } else {
      result = [arr.Datas[i]];
    }
  }
  return result;
}

function saveLapDataToTxt(tempLapData, lapNum, currentTrackId, currentSessionUID, currentSessionType, currentLapTime) {
  let result = filterArray(tempLapData);
  if (!result.length) {
    return;
  }
  const dataString = result.map((e) => JSON.stringify(e)).join("\n");
  const currentTrack = getTrackNameById(currentTrackId);
  let fileName = lapNum + "_" + currentLapTime + ".txt";
  const folderName =
    getSessionTypeFromId(currentSessionType) +
    "_" +
    currentTrack +
    "_" +
    getDateForFileName() +
    "_" +
    currentSessionUID;
  const folderNameWithoutSession =
    getSessionTypeFromId(currentSessionType) + "_" + currentTrack + "_" + getDateForFileName();
  let folderPath = path.join(__dirname, `./../../files/sessions/${folderName}`);

  const foldersCounter = foldersExists(folderNameWithoutSession);
  if (foldersCounter > 0) {
    folderPath = `${folderPath}_${foldersCounter}`;
    if (!fs.existsSync(folderPath)) {
      folderPath = path.join(__dirname, `./../../files/sessions/${folderName}_${foldersCounter + 1}`);
      fileName = lapNum + "_" + currentLapTime + ".txt";
      fs.mkdirSync(folderPath, { recursive: true });
    }
  } else {
    if (!fs.existsSync(folderPath)) {
      folderPath = `${folderPath}_1`;
      fs.mkdirSync(folderPath, { recursive: true });
    }
  }

  const filePath = path.join(folderPath, fileName);
  fs.appendFile(filePath, dataString, (err) => {
    if (err) throw err;
  });
  return filePath;
}

function foldersExists(folderNameWithoutId) {
  const folderPath = path.join(__dirname, `./../../files/sessions/`);
  const matchingFolders = fs.readdirSync(folderPath).filter((folder) => folder.startsWith(folderNameWithoutId));
  return matchingFolders.length;
}

function getTrackNameById(trackNumber) {
  let trackName;
  switch (trackNumber) {
    case 0:
      trackName = "Melbourne";
      break;
    case 1:
      trackName = "Paul_Ricard";
      break;
    case 2:
      trackName = "Shanghai";
      break;
    case 3:
      trackName = "Bahrain";
      break;
    case 4:
      trackName = "Catalunya";
      break;
    case 5:
      trackName = "Monaco";
      break;
    case 6:
      trackName = "Montreal";
      break;
    case 7:
      trackName = "Silverstone";
      break;
    case 8:
      trackName = "Hockenheim";
      break;
    case 9:
      trackName = "Hungaroring";
      break;
    case 10:
      trackName = "Spa";
      break;
    case 11:
      trackName = "Monza";
      break;
    case 12:
      trackName = "Singapore";
      break;
    case 13:
      trackName = "Suzuka";
      break;
    case 14:
      trackName = "Abu_Dhabi";
      break;
    case 15:
      trackName = "Texas";
      break;
    case 16:
      trackName = "Brazil";
      break;
    case 17:
      trackName = "Austria";
      break;
    case 18:
      trackName = "Sochi";
      break;
    case 19:
      trackName = "Mexico";
      break;
    case 20:
      trackName = "Baku_(Azerbaijan)";
      break;
    case 21:
      trackName = "Sakhir_Short";
      break;
    case 22:
      trackName = "Silverstone_Short";
      break;
    case 23:
      trackName = "Texas_Short";
      break;
    case 24:
      trackName = "Suzuka_Short";
      break;
    case 25:
      trackName = "Hanoi";
      break;
    case 26:
      trackName = "Zandvoort";
      break;
    case 27:
      trackName = "Imola";
      break;
    case 28:
      trackName = "Portimão";
      break;
    case 29:
      trackName = "Jeddah";
      break;
    case 30:
      trackName = "Miami";
      break;
    case 31:
      trackName = "Las_Vegas";
      break;
    case 32:
      trackName = "Losail";
      break;
    default:
      trackName = "Unknown";
      break;
  }
  return trackName;
}

// Return a date format like: YY_MM_DD
function getDateForFileName() {
  const date = new Date();
  const year = date.getFullYear() - 2000;
  const month = date.getMonth() + 1; // 0-11
  const day = date.getDate();
  return `${year}-${month}-${day}`;
}

function getSessionTypeFromId(id) {
  switch (id) {
    case 0:
      return "Unknown";
    case 5:
      return "Q1";
    case 6:
      return "Q2";
    case 7:
      return "Q3";
    case 8:
      return "SQ";
    case 9:
      return "OSQ";
    case 10:
      return "R";
    case 11:
      return "R2";
    case 12:
      return "R3";
    case 13:
      return "TT";
    default:
      return "Invalid";
  }
}

module.exports = {
  filterArray,
  saveLapDataToTxt,
  getTrackNameById,
  getDateForFileName,
  getSessionTypeFromId,
};
