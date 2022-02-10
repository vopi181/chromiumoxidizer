#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import os from 'os';
import drivelist from 'drivelist';
import figlet from 'figlet';
import { program } from 'commander';


/*
 function that takes a file name as argument and returns a boolean if a file is part of chrome, chromium, electron, or CEF
*/
function isChrome(fileName) {
    var fileName = fileName.toLowerCase();
    // should cover most cases of V8 (according to  my limited research of looking at a view apps' folders)
    if (fileName.includes("snapshot_blob.bin")) {
        return true;
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


program.name('ChromiumOxidizer')
    .description("Walks directories and finds chrome instances (based off 'snapshot_blob.bin')\n*By Default, searches every mountpoint directory*")
    .option('-d, --dir <directory>', 'Directory to start searching for chrome instances.');



async function logo() {
    return new Promise((resolve, reject) => {
        figlet("ChromiumOxidizer",  function (err, data) {
            resolve(chalk.bgBlue(data));
        });
    })
}

async function main() {

    program.parse(process.argv);
    const options = program.opts();

    await logo().then(async (data) => {
        console.log(data);
    });

    var count = 0;


    if (!options.dir) {

        const drives = await drivelist.list()
        var mounts = [];
        for (const drive of drives) {
            try {
                mounts.push(drive.mountpoints[0].path)
            } catch (error) {

            }

        }
        console.log(chalk.green(`[+] Mounted Drives: ${mounts}`));
        for (const mount of mounts) {
            console.log(chalk.green("Scanning: " + mount));
            for await (const p of walk(mount)) {
                if (isChrome(p)) {
                    console.log(chalk.green(`[${count + 1}] `) + chalk.yellowBright(p));
                    count++;
                }
            }
        }
    } else {


        console.log(chalk.green(`[+] Scanning: ${options.dir}`));
        for await (const p of walk(options.dir)) {

            if (isChrome(p)) {
                console.log(chalk.green(`[${count + 1}] `) + chalk.yellowBright(p));
                count++;
            }
        }
    }
    console.log(chalk.redBright("DETECTED " + count + " CHROME INSTANCES AT A MINIMUM"));
}


main()