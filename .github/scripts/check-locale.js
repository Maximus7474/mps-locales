/**
 * @param {object} refObject 
 * @param {object} objectToCheck 
 * @param {string | undefined} parentKey 
 * @param {string[] | undefined} missingKeys 
 * @returns {string[]}
 */
function checkEntries(refObject, objectToCheck, parentKey = '', missingKeys = []) {
    const refObjectKeys = Object.keys(refObject);
    const objectKeys = Object.keys(objectToCheck);

    for (const key of refObjectKeys) {
        if (!objectKeys.includes(key)) {
            missingKeys.push(`${parentKey}${key}`);
        } else if (
            typeof refObject[key] === 'object'
            && refObject[key] !== null
            && typeof objectToCheck[key] === 'object'
            && objectToCheck[key] !== null
        ) {
            checkEntries(
                refObject[key],
                objectToCheck[key],
                `${parentKey}${key}.`,
                missingKeys
            );
        }
    }

    return missingKeys;
}

/**
 * @param {object} template base locale json object to use as reference
 * @param {object} file json object to compare to the template 
 * 
 * @returns {{status: true} | {status: false; data: string[]}}
 */
function validateLocale(template, file) {
    const missingKeys = checkEntries(template, file);

    if (missingKeys.length === 0) {
        return { status: true };
    } else {
        return { status: false, data: missingKeys };
    }
}

module.exports = { validateLocale }
