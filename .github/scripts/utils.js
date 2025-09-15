const fs = require('fs');
const path = require('path');

/**
 * @param {string} directoryPath 
 * @returns {string[]}
 */
function getLocaleFilesInDirectory(directoryPath) {
    try {
        const files = fs.readdirSync(directoryPath);

        const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');

        return jsonFiles;
    } catch (err) {
        console.error(`Error reading directory: ${err}`);
        return [];
    }
}

/**
 * @param {string} filePath 
 * @returns {object}
 */
function loadLocaleFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonObject = JSON.parse(data);
        return jsonObject;
    } catch (error) {
        console.error(`Error reading or parsing JSON file at ${filePath}:`, error);
        return null;
    }
}

module.exports = { getLocaleFilesInDirectory, loadLocaleFile }
