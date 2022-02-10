
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import os from 'os';
import drivelist from 'drivelist';
import figlet from 'figlet';



/*
 function that takes a file name as argument and returns a boolean if a file is part of chrome, chromium, electron, or CEF
*/
function isChrome(fileName) {
    var fileName = fileName.toLowerCase();
    if (fileName.includes("chrome.exe")) {
        return true;
    } else if (fileName.includes("chromium.exe")) {
        return true;
    } else if (fileName.includes("snapshot_blob.bin")) {
        return true;
        // } else if (fileName.includes("chrome_elf.dll")) {
        //     return true;
    } else {
        return false;
    }
}



async function* walk(dir) {
    try {

        for await (const d of await fs.promises.opendir(dir)) {
            const entry = path.join(dir, d.name);
            if (d.isDirectory()) yield* await walk(entry);
            else if (d.isFile()) yield entry;
            continue;

        }
    } catch (error) {

    }
}
async function main() {

    figlet("ChromiumOxidizer", function (err, data) {
        console.log(chalk.bgBlue(data));
    })




    var count = 0;
    const drives = await drivelist.list()
    var mounts = [];
    for (const drive of drives) {
        try {
            mounts.push(drive.mountpoints[0].path)
        } catch (error) {

        }

    }
    for (const mount of mounts) {
        console.log(chalk.green("Scanning: " + mount));
        for await (const p of walk(mount)) {
            if (isChrome(p)) {
                console.log(chalk.green(`[${count + 1}] `) + chalk.yellowBright(p));
                count++;
            }
        }
    }
    console.log(chalk.redBright("DETECTED " + count + " CHROME INSTANCES AT A MINIMUM"));
}


main()