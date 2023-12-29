const path = require("path");
const fs = require("fs");

function filterArray(arr) {
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    if (i === 0 || arr[i].currentLapTime > arr[i - 1].currentLapTime) {
      result.push(arr[i]);
    } else {
      result = [arr[i]];
    }
  }
  return result;
}

function saveLapDataToTxt(tempLapData, lapNum, currentTrackId, currentSessionUID, currentSessionType) {
  let result = filterArray(tempLapData);
  if (!result.length) {
    return;
  }
  const dataString = result.map((e) => JSON.stringify(e)).join("\n");

  const currentTrack = getTrackById(currentTrackId);
  const lapTime = Math.round(result[result.length - 1].currentLapTime * 1000) / 1000;
  let fileName = lapNum + "_" + lapTime + ".txt";
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
  console.log(foldersCounter);
  if (foldersCounter > 0) {
    folderPath = `${folderPath}_${foldersCounter}`;
    if (!fs.existsSync(folderPath)) {
      console.log("if if");
      folderPath = path.join(__dirname, `./../../files/sessions/${folderName}_${foldersCounter + 1}`);
      fileName = lapNum + "_" + lapTime + ".txt";
      fs.mkdirSync(folderPath, { recursive: true });
    } else {
      console.log("if else");
    }
  } else {
    if (!fs.existsSync(folderPath)) {
      console.log("else if");
      folderPath = `${folderPath}_1`;
      fs.mkdirSync(folderPath, { recursive: true });
    } else {
      console.log("else else");
    }
  }

  const filePath = path.join(folderPath, fileName);
  fs.appendFile(filePath, dataString, (err) => {
    if (err) throw err;
  });
  return filePath;
}

// if (!fs.existsSync(folderPath)) {
//   folderPath = `${folderPath}_1`;
//   fs.mkdirSync(folderPath, { recursive: true });
// } else {
// }

function foldersExists(folderNameWithoutId) {
  const folderPath = path.join(__dirname, `./../../files/sessions/`);
  const matchingFolders = fs.readdirSync(folderPath).filter((folder) => folder.startsWith(folderNameWithoutId));
  console.log(matchingFolders.length);
  return matchingFolders.length;
}

function getTrackById(id) {
  switch (id) {
    case 0:
      return "Melbourne";
    case 1:
      return "Paul_Ricard";
    case 2:
      return "Shanghai";
    case 3:
      return "Sakhir_(Bahrain)";
    case 4:
      return "Catalunya";
    case 5:
      return "Monaco";
    case 6:
      return "Montreal";
    case 7:
      return "Silverstone";
    case 8:
      return "Hockenheim";
    case 9:
      return "Hungaroring";
    case 10:
      return "Spa";
    case 11:
      return "Monza";
    case 12:
      return "Singapore";
    case 13:
      return "Suzuka";
    case 14:
      return "Abu_Dhabi";
    case 15:
      return "Texas";
    case 16:
      return "Brazil";
    case 17:
      return "Austria";
    case 18:
      return "Sochi";
    case 19:
      return "Mexico";
    case 20:
      return "Baku_(Azerbaijan)";
    case 21:
      return "Sakhir_Short";
    case 22:
      return "Silverstone_Short";
    case 23:
      return "Texas_Short";
    case 24:
      return "Suzuka_Short";
    default:
      return "Unknown";
  }
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
    case 5:
      return "Q";
    case 6:
      return "Q";
    case 7:
      return "Q";
    case 8:
      return "Q";
    case 9:
      return "Q";
    case 10:
      return "R";
    case 12:
      return "TT";
    default:
      return "unknown";
  }
}

module.exports = {
  filterArray,
  saveLapDataToTxt,
  getTrackById,
  getDateForFileName,
  getSessionTypeFromId,
};
