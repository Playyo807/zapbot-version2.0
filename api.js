export default async function fetchDataFromSchedulingURL(url, id = -1) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const ptDays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  let choosenDayIndex = -1;
  let dataArray = [];
  let idVals = [];
  if (id == "-1") {
    days.map((val, index) => {
      fetch(url + `/scheduling${val}`, {
        headers: { "Content-Type": "application/json" }
      })
        .then(res => {
          if (!res.ok) throw new Error("Could not fetch from this resource");
          return res.json();
        })
        .then(data => {
          for (let i in data) {
            dataArray[i] = data[i];
          }
        })
    })
  } else {
    days.map((val, index) => {
      fetch(url + `/scheduling${val}`, {
        headers: { "Content-Type": "application/json" }
      })
        .then(res => {
          if (!res.ok) throw new Error("Could not fetch from this resource");
          return res.json();
        })
        .then(data => {
          for (let i in data) {
            dataArray[i] = data[i];
          }
          for (let item of dataArray) {
            if (item.id == id) {
              choosenDayIndex = ptDays[index];
              console.log("found: " + id)
              console.log("it contains:\n ");
              let i = 0;
              const vals_ = Object.values(item);
              for (let key in item) {
                console.log(key + ": " + vals_[i]);
                i++
              }
              idVals = vals_
            }
          }
        })
    })
  }
  await new Promise(resolve => setTimeout(resolve, 1500));
  return [idVals, choosenDayIndex];
}

const idVals = fetchDataFromSchedulingURL("https://apirepo-e1u4.onrender.com", "7a54")
idVals.then((d) => {
  console.log(d);
})
