const fs = require('fs');
const path = require('path');

const { resources, localeLabels } = require('./data');
const { getLocaleFilesInDirectory, loadLocaleFile } = require('./utils');
const { validateLocale } = require('./check-locale');

const parentDir = __dirname.includes('scripts') ? path.resolve(__dirname, '../../') : __dirname;
const localeDirectories = resources.map(res => res.name);

function generateMdTable(resourceLocaleStatus) {
    const allLocales = new Set();

    resources.forEach(res => {
        if (resourceLocaleStatus[res.name]) {
            Object.keys(resourceLocaleStatus[res.name])
            .forEach(locale => allLocales.add(locale));
        }
    });

    const sortedLocales = Array.from(allLocales).sort();

    const header = `| Locale ${resources.map(({ name, package }) => `| [${name}](https://maximus-scripts.tebex.io/package/${package})`).join(' ')} |`;
    const separator = `|${'--------------|'.repeat(resources.length + 1)}`;

    let tableRows = sortedLocales.map(locale => {
        let row = `| ${localeLabels[locale]} `;

        resources.forEach(res => {
            const status = resourceLocaleStatus[res.name]?.[locale];
            const icon = status === true ? '✅' : status === false ? '❌' : '';
            row += `| ${icon} `;
        });
        return row + '|';
    });

    return [header, separator, ...tableRows].join('\n');
}

function updateReadMeFile(resourceLocaleStatus) {
    const newTableContent = generateMdTable(resourceLocaleStatus);

    const filePath = path.join(parentDir, 'README.md');
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const startComment = '<!-- start_recap -->';
    const endComment = '<!-- end_recap -->';

    const startIndex = fileContent.indexOf(startComment) + startComment.length;
    const endIndex = fileContent.indexOf(endComment);

    if (startIndex === -1 || endIndex === -1) {
        console.error('Markdown comments not found in the file.');
        return;
    }

    const before = fileContent.substring(0, startIndex);
    const after = fileContent.substring(endIndex);

    const newContent = `${before}\n${newTableContent}\n${after}`;
    fs.writeFileSync(filePath, newContent, 'utf8');
}

const resourceLocaleStatus = {};

for (const resource of localeDirectories) {
    const resourceDirectory = path.join(parentDir, resource);
    const files = getLocaleFilesInDirectory(resourceDirectory).filter(file => file !== 'en.json');

    const templateFile = loadLocaleFile(path.join(resourceDirectory, 'en.json'));

    resourceLocaleStatus[resource] = {
        'en': true,
    };

    for (const file of files) {
        const localeKey = file.split('.')[0];
        const locale = loadLocaleFile(path.join(resourceDirectory, file));
        const { status } = validateLocale(templateFile, locale);

        resourceLocaleStatus[resource][localeKey] = status;
    }
}

updateReadMeFile(resourceLocaleStatus);
