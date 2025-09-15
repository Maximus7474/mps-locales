const fs = require('fs');
const path = require('path');

const { loadLocaleFile } = require('./utils');
const { validateLocale } = require('./check-locale');
const { resources } = require('./data');

const parentDir = __dirname.includes('scripts') ? path.resolve(__dirname, '../../') : __dirname;

const args = process.argv.slice(2);
const changedFiles = args.filter(file => file.endsWith('.json'));

if (changedFiles.length < 1) throw new Error('No changed files found !');

const invalidLocales = [];
const validLocales = [];

for (const file of changedFiles) {
    const localePath = path.dirname(file);
    const localeName = path.basename(file);
    const resourceName = path.basename(localePath);

    const exists = resources.find(({ name }) => name === resourceName);

    if (!exists) continue;

    const templateFilePath = path.join(parentDir, resourceName, 'en.json');
    const templateData = loadLocaleFile(templateFilePath);
    const localeData = loadLocaleFile(file);

    const data = validateLocale(templateData, localeData);

    if (data.status) {
        console.log(`(${resourceName}) ${localeName} is up to date with the template.`);
        validLocales.push(`(${resourceName}) ${localeName}`);
        continue;
    }

    invalidLocales.push(`(${resourceName}) ${localeName}`);

    console.error(`(${resourceName}) ${localeName} is missing keys, please add the following:`);
    console.error(data.data.map(e => `- ${e}`).join('\n'));
}

if (invalidLocales.length > 0) {
    console.error('Please update the locales listed above that are missing translations.');
    process.exitCode = 1;
} else {
    console.log(`Pull request is valid, all ${changedFiles.length} changed files followed the templates.`);
}
