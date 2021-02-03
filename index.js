
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const Discord = require('discord.js');
const config = require('./config.json')


const prefix = "!";

import { fromBuffer } from "pdf2pic";
import fs from "fs";
import http from "http";

const client = new Discord.Client();
client.login(config.BOT_TOKEN);


const options = {
  density: 100,
  saveFilename: "edt",
  savePath: "./images",
  format: "png",
  height: 800,
  width: 1200

};

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return [d.getUTCFullYear(), weekNo];
}

function isNormalInteger(str) {
    var n = Math.floor(Number(str));
    return n !== Infinity && String(n) === str && n >= 0;
}



client.on("message", (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();

    if (command === "edt") {
        var weekNumber = getWeekNumber(new Date());
        var pageNumber = 0;
        console.log(args)
        if (args.length != 1) {
            pageNumber = weekNumber[1]-5+1;
            console.log("Set week to" + weekNumber[1])
        } else {
            if (!isNormalInteger(args[0])) {
                message.reply("Un numéro de semaine stp !");
                return;
            }
            if (args[0] > 24 || args[0] < 6) {
                message.reply("Cette semaine n'est pas dans ce semestre !")
                return;
            }
            pageNumber = args[0]-5;
            weekNumber = args[0];
        }
        const file = fs.createWriteStream('edt.pdf')

        http.get(config.PDF_URL, response => {
            response.pipe(file)
            file.once('finish', () => {
                console.log("finished piping file")
                fs.readFile('edt.pdf', function(err, data) {
                    if(err) {
                        console.log(err);
                        return;
                    }
                    console.log("reading pdf")
                
                    fromBuffer(data, options).bulk(pageNumber, false).then((resolve) => {
                        var imgPath = "./images/edt."+pageNumber+".png"
                        message.reply("Et voilà, l'emploi du temps de la semaine "+ (weekNumber[1]+1) +  " de " + weekNumber[0]+ " ! Bon courage !", {files : [imgPath]})
                    })
                });  
            })
        })
    } else {
        message.reply("Déso, moi pas comprendre cette commande :(")
    }
})