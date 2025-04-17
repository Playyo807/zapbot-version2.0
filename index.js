import pkg2 from 'qrcode-terminal';
const { generate } = pkg2;
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, NoAuth } = pkg;
import fetchDataFromSchedulingURL from "./api.js";
const client = new Client({ puppeteer:{
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
}, authStrategy: new NoAuth() });
const clients = new Map();

const welcomeMessage1 = "Sou o assitente virtual da *Dantas Barbearia* no WhatsApp🤖";
const welcomeMessage2 = "Antes de seguir com o seu atendimento, preciso que escolha uma das opções abaixo:\n\n";
const options = "1 - *Agendar um horário*\n2 - *Conversar com o barbeiro*\n3 - *Instagram*";
const opt1Message = "Para agendar um horário na *Dantas Barbearia*, basta acessar o nosso site na área de agendamento👇\n\nhttps://barberapptsx.pages.dev/agendamento\n\nPara cancelar essa _interação_ digite *Cancelar*";
const opt2Message = "*Pronto!* Aqui está o número que você pediu:\n\n*Silvino Dantas:* 88988891419\n\nPara cancelar essa _interação_ digite *Cancelar*";
const opt3Message = "*É pra já!* Aqui está nosso *Instagram*:\n\nhttps://www.instagram.com/dantas_barbearia/\n\nPara cancelar essa _interação_ digite *Cancelar*";
const noValidNumberMsg = "Me desculpe, mas por favor digite um número *valido*. Caso queria cancelar esse _interação_, basta digitar *cancelar*";
const cancelationConfirm = "Pronto, essa _interação_ foi *cancelada!*"

const delay = ms => new Promise(res => setTimeout(res, ms));

client.on("qr", (qr) => {
  
  pkg2.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready");
  let lastNumberArr = [];
  let canSendMsg = true;
  setInterval(async () => {
    fetch("https://apirepo-e1u4.onrender.com/numbersList", {
      headers: { "Content-Type": "application/json" }
    })
      .then(res => {
        if (!res.ok) throw new Error("Could not fetch form this resource");
        return res.json();
      })
      .then(async data => {
        let nCheck = true;
        let reqId = -1;
        data.map((val, index) => {
          if (lastNumberArr[index]) {
            if (val.id != lastNumberArr[index].id) {
              nCheck = false;
              console.log("false: " + lastNumberArr[index].id + ", " + val.id);
              reqId = val.reqId;
            }
          } else {
            nCheck = false;
            console.log(".");
            reqId = val.reqId;
          }
        })
        lastNumberArr = data;
        console.log(nCheck);
        if (nCheck == false && canSendMsg == true) {
          canSendMsg = false;
          const iL = ["Nome", "Sobrenome", "Telefone", "Barbeiro", "Horário", "Pedido"];
          let data = fetchDataFromSchedulingURL("https://apirepo-e1u4.onrender.com", reqId);
          data.then(async d => {
            let message = "Olá, estou para confirmar seu agendamento na Dantas Barbearia!\nAqui algumas informações importantes:\n ";
            for (let i in d[0]) {
              if (i < 6) {
                message += `\n${iL[i]}: ${d[0][i]}`;
              }
            }
            message += `\nDia: ${d[1]}`;
            message += "\n\n_Mensagem automática, não responda!_"
            let number = "55" + lastNumberArr.at(-1).number;
            number += "@c.us";
            const numberID = await client.getNumberId(number);
            client.sendMessage(numberID._serialized, message).then(response => {
              if (response.id.fromMe) {
                console.log("Mensagem enviada");
              }
            }).catch(err => {
              console.error("Failed to send message: " + err);
            })
            setTimeout(() => {
              canSendMsg = true;
            }, 2000);
          })
        }
      })
  }, 60000);
});

client.on('message', async (message) => {
  const chat = await message.getChat();
  const contact = await message.getContact();
  const name = await contact.pushname || contact.name;

  if (!clients.has(contact.id._serialized)) {
    console.log(contact);
    clients.set(contact.id._serialized, { botCanSendMsg1: true });
    console.log("Firing exist")
  }

  delay(500);

  console.log(clients.get(contact.id._serialized).botCanSendMsg1)

  if (clients.get(contact.id._serialized).botCanSendMsg1) {
    clients.set(contact.id._serialized, { botCanSendMsg1: false });
    chat.sendStateTyping();
    await delay(1000);
    message.reply(`Olá *_${name}_*! ` + welcomeMessage1);
    await delay(1000);
    client.sendMessage(message.from, welcomeMessage2 + options);
    chat.clearState();
  } else if (message.body.trim() == "1" && !clients.get(contact.id._serialized).botCanSendMsg1) {
    chat.sendStateTyping();
    await delay(1000);
    client.sendMessage(message.from, opt1Message);
    chat.clearState();
  } else if (message.body.trim() == "2" && !clients.get(contact.id._serialized).botCanSendMsg1) {
    chat.sendStateTyping();
    await delay(1000);
    client.sendMessage(message.from, opt2Message);
    chat.clearState();
  } else if (message.body.trim() == "3" && !clients.get(contact.id._serialized).botCanSendMsg1) {
    chat.sendStateTyping();
    await delay(1000);
    client.sendMessage(message.from, opt3Message);
    chat.clearState();
  } else if (!clients.get(contact.id._serialized).botCanSendMsg1 && message.body.trim().toLowerCase() !== "cancelar") {
    chat.sendStateTyping();
    await delay(1000);
    client.sendMessage(message.from, noValidNumberMsg);
    chat.clearState();
  } else if (!clients.get(contact.id._serialized).botCanSendMsg1 && message.body.trim().toLowerCase() === "cancelar") {
    chat.sendStateTyping();
    await delay(1000);
    client.sendMessage(message.from, cancelationConfirm);
    chat.clearState();
    clients.set(contact.id._serialized, { botCanSendMsg1: true });
    clients.delete(contact.id._serialized);
    return;
  }

});

client.initialize();