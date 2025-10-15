document.addEventListener("DOMContentLoaded", function () {
  const carCtx = document.getElementById("carChart").getContext("2d");
  const parkingCtx = document.getElementById("parkingChart").getContext("2d");

  let carChart = new Chart(carCtx, {
    type: "line",
    data: {
      labels: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"],
      datasets: [
        {
          label: "Lượt xe vào",
          data: [],
          borderColor: "#36A2EB",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          fill: false,
        },
        {
          label: "Lượt xe ra",
          data: [],
          borderColor: "#FF6384",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  let parkingChart = new Chart(parkingCtx, {
    type: "doughnut",
    data: {
      labels: ["Chỗ trống", "Chỗ đã đậu"],
      datasets: [
        {
          data: [],
          backgroundColor: ["#36A2EB", "#FF6384"],
        },
      ],
    },
    options: {
      responsive: true,
    },
  });

  function fetchData(range) {
    fetch(`/analytics/data?range=${range}`)
      .then((response) => response.json())
      .then((data) => {
        document.getElementById("total-cars-change").innerText = data.totalCarsChange;
        document.getElementById("total-cars").innerText = data.totalCars;
        document.getElementById("car-entries-exits").innerText = `${data.carEntries}/${data.carExits}`;

        // Update carChart with real data
        carChart.data.datasets[0].data = data.carEntries; // Replace with real data
        carChart.data.datasets[1].data = data.carExits; // Replace with real data
        carChart.update();

        // Update parkingChart with real data
        parkingChart.data.datasets[0].data = [data.availableSpots, data.totalCars - data.availableSpots];
        parkingChart.update();
      })
      .catch((error) => console.error("Error fetching data:", error));
  }

  document.getElementById("daily-btn").addEventListener("click", function () {
    setActiveButton(this);
    fetchData("daily");
  });

  document.getElementById("weekly-btn").addEventListener("click", function () {
    setActiveButton(this);
    fetchData("weekly");
  });

  document.getElementById("monthly-btn").addEventListener("click", function () {
    setActiveButton(this);
    fetchData("monthly");
  });

  function setActiveButton(activeButton) {
    document.querySelectorAll(".date-filters button").forEach((button) => {
      button.classList.remove("active");
    });
    activeButton.classList.add("active");
  }

  // Fetch initial data for daily range
  fetchData("daily");
});
