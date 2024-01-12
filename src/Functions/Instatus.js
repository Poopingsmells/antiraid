const fetch = require("node-fetch");
class InStatus {
  constructor(client) {
    this.client = client;
  }
  GetPages() {
    fetch(`https://api.instatus.com/v1/pages`, {
      method: "GET",
      headers: {
        Authorization: "Bearer INSTATUS_KEY",
        "Content-Type": "application/json",
      },
    }).then(async (res) => console.log(await res.json()));
  }
  GetMetrics() {
    fetch(`https://api.instatus.com/v1/PAGE_ID/metrics`, {
      method: "GET",
      headers: {
        Authorization: "Bearer INSTATUS_KEY",
        "Content-Type": "application/json",
      },
    }).then(async (res) => {
      res = await res.json();
      console.log(res.map((x) => x.data.map((s) => s)));
    });
  }
  UpdateMetric() {
    let datatopush = [];
    datatopush.push(this.client.ws.ping);
    fetch(
      `https://api.instatus.com/v1/PAGE_ID/metrics/METRIC_ID`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer INSTATUS_KEY",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timestamp: Date.now(),
          value: this.client.ws.ping,
        }),
      },
    ).then(async (res) => console.log(await res.json()));
  }
}
module.exports = InStatus;
