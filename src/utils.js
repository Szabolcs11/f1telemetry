function sortSessions(sessions) {
  const getDate = (file) => {
    const match = file.match(/(\d{2})-(\d{1,2})-(\d{1,2})/);
    if (match) {
      const [, year, month, day] = match.map(Number);
      return new Date(year, month - 1, day);
    }
    return null;
  };

  const getNumberEnd = (file) => {
    const match = file.match(/_(\d+)$/);
    return match ? Number(match[1]) : null;
  };

  sessions.sort((a, b) => {
    const dateA = getDate(a);
    const dateB = getDate(b);
    const numberEndA = getNumberEnd(a);
    const numberEndB = getNumberEnd(b);

    if (dateA && dateB) {
      const dateComparison = dateB - dateA;
      if (dateComparison !== 0) {
        return dateComparison;
      }
      if (numberEndA && numberEndB) {
        return numberEndB - numberEndA;
      }
    }
    return 0;
  });

  return sessions;
}

function sortByLapNumber(files) {
  return files.sort((a, b) => {
    const lapNumberA = parseInt(a.split("_")[0], 10);
    const lapNumberB = parseInt(b.split("_")[0], 10);
    return lapNumberB - lapNumberA;
  });
}

module.exports = { sortSessions, sortByLapNumber };
