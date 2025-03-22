const prompt = require("prompt-sync")({ sigint: true });

const variablesNumbers = new Map();
const duplicatesCache = new Map();
const numbersList = [];

for (let i = 0; i < 5; i++) {
  numbersList.push("55" + prompt("Digite um número de telefone: ") + "@c.us");
  if (!variablesNumbers.has(numbersList[i])) {
    variablesNumbers.set(numbersList[i], { canBotSendMsg1: false });
  }
}

for (let i in numbersList) {
  if (!duplicatesCache.has(numbersList[i])) {
    duplicatesCache.set(numbersList[i], 1);
    console.log(numbersList[i] + ": ");
    console.log(variablesNumbers.get(numbersList[i]).canBotSendMsg1);
  }
}