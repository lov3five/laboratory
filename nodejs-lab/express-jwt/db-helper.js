const fs = require('fs');

const updateDatabaseJson = (filePath, objType, newData) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.log(err);
      } else {
        const obj = JSON.parse(data);
        obj[objType].push(newData);
        const json = JSON.stringify(obj);
        fs.writeFile(filePath, json, 'utf8', (err) => {
          if (err) {
            console.log(err);
          }
        });
      }
    });
}

module.exports = updateDatabaseJson;