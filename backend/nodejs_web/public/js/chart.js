document.addEventListener("DOMContentLoaded", async function () {
  const response = await fetch("/chart/data");
  const chartData = await response.json();

  const ctx = document.getElementById("entryExitChart").getContext("2d");
  const entryExitChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [
        "Thứ 2",
        "Thứ 3",
        "Thứ 4",
        "Thứ 5",
        "Thứ 6",
        "Thứ 7",
        "Chủ nhật",
      ],
      datasets: [
        {
          label: "Lượt xe vào",
          data: chartData.entries,
          borderColor: "#36A2EB",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          fill: false,
        },
        {
          label: "Lượt xe ra",
          data: chartData.exits,
          borderColor: "#FF6384",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
});

console.log("✅ JS loaded successfully!");
