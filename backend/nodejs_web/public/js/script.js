const allSideMenu = document.querySelectorAll("#sidebar .side-menu.top li a");

allSideMenu.forEach((item) => {
  const li = item.parentElement;

  item.addEventListener("click", function () {
    allSideMenu.forEach((i) => {
      i.parentElement.classList.remove("active");
    });
    li.classList.add("active");
  });
});

const searchButton = document.querySelector(
  "#content nav form .form-input button"
);
const searchButtonIcon = document.querySelector(
  "#content nav form .form-input button .bx"
);
const searchForm = document.querySelector("#content nav form");

searchButton.addEventListener("click", function (e) {
  if (window.innerWidth < 576) {
    e.preventDefault();
    searchForm.classList.toggle("show");
    if (searchForm.classList.contains("show")) {
      searchButtonIcon.classList.replace("bx-search", "bx-x");
    } else {
      searchButtonIcon.classList.replace("bx-x", "bx-search");
    }
  }
});

if (window.innerWidth < 768) {
  sidebar.classList.add("hide");
} else if (window.innerWidth > 576) {
  searchButtonIcon.classList.replace("bx-x", "bx-search");
  searchForm.classList.remove("show");
}

window.addEventListener("resize", function () {
  if (this.innerWidth > 576) {
    searchButtonIcon.classList.replace("bx-x", "bx-search");
    searchForm.classList.remove("show");
  }
});

const switchMode = document.getElementById("switch-mode");

switchMode.addEventListener("change", function () {
  if (this.checked) {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
});

// ------
// Hàm để đóng tất cả các popup hiện có
function closeAllPopups() {
  document.querySelectorAll(".popup").forEach(function (popup) {
    popup.style.display = "none";
  });
}

function showCameraPopup() {
  closeAllPopups();
  document.getElementById("cameraPopupModal").style.display = "block";
}

function closeCameraPopup() {
  document.getElementById("cameraPopupModal").style.display = "none";
}

// function addParking() {
//   closeAllPopups();
//   document.querySelector(".addParking-detail").style.display = "block";
// }

// function modifyParking() {
//   closeAllPopups();
//   document.querySelector(".modifyParking-detail").style.display = "block";
// }

// function deleteParking() {
//   closeAllPopups();
//   document.querySelector(".deleteParking-detail").style.display = "block";
// }

// function closeModal() {
//   closeAllPopups();
// }

// function addUser() {
//   closeAllPopups();
//   document.querySelector(".addUser-detail").style.display = "block";
// }

// function modifyUser() {
//   closeAllPopups();
//   document.querySelector(".modifyUser-detail").style.display = "block";
// }

// function deleteUser() {
//   closeAllPopups();
//   document.querySelector(".deleteUser-detail").style.display = "block";
// }

// function closePopup() {
//   closeAllPopups();
// }

// -----
const carCtx = document.getElementById("carChart").getContext("2d");
const carChart = new Chart(carCtx, {
  type: "bar",
  data: {
    labels: ["6 AM", "8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM"],
    datasets: [
      {
        label: "Lượt xe vào",
        data: [5, 10, 15, 12, 8, 6, 4],
        backgroundColor: "rgba(54, 162, 235, 0.7)",
      },
      {
        label: "Lượt xe ra",
        data: [3, 7, 12, 10, 5, 4, 2],
        backgroundColor: "rgba(255, 99, 132, 0.7)",
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

// Parking space pie chart
const parkingCtx = document.getElementById("parkingChart").getContext("2d");
const parkingChart = new Chart(parkingCtx, {
  type: "doughnut",
  data: {
    labels: ["Chỗ trống", "Chỗ đã đậu"],
    datasets: [
      {
        data: [30, 90],
        backgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  },
  options: {
    responsive: true,
  },
});

// Toggle date filters
document.getElementById("daily-btn").addEventListener("click", function () {
  updateStats("daily");
  setActiveButton(this);
});

document.getElementById("weekly-btn").addEventListener("click", function () {
  updateStats("weekly");
  setActiveButton(this);
});

document.getElementById("monthly-btn").addEventListener("click", function () {
  updateStats("monthly");
  setActiveButton(this);
});

function updateStats(period) {
  // Implement logic to update statistics for the selected period
  console.log(`Updating stats for: ${period}`);
}

function setActiveButton(activeButton) {
  document.querySelectorAll(".date-filters button").forEach((button) => {
    button.classList.remove("active");
  });
  activeButton.classList.add("active");
}
