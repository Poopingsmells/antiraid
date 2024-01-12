function renderChart(data, labels) {
  const ctx = document.getElementById("myChart").getContext("2d");
  const myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "# Servers",
          data: data,
        },
      ],
    },
  });
}

$("#renderBtn").click(function () {
  data = [1, 5, 10, 20, 30, 40, 50, 63, 70, 80];
  labels = "# Of servers";
  renderChart(data, labels);
});
