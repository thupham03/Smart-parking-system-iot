function filterTable() {
  const input = document.getElementById("searchInput");
  const filter = input.value.toUpperCase();
  const table = document.getElementById("logsTable");
  const tr = table.getElementsByTagName("tr");
  let found = false;

  for (let i = 1; i < tr.length; i++) {
    const td = tr[i].getElementsByTagName("td")[1];
    if (td) {
      const txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
        found = true;
      } else {
        tr[i].style.display = "none";
      }
    }
  }

  const noDataMessage = document.getElementById("noDataMessage");
  if (!found) {
    noDataMessage.style.display = "block";
  } else {
    noDataMessage.style.display = "none";
  }

  paginateTable();
}

function paginateTable() {
  const table = document.getElementById("logsTable");
  const rows = Array.from(table.getElementsByTagName("tr")).filter(
    (row) => row.style.display !== "none"
  );
  const rowsPerPage = 10;
  const pagination = document.getElementById("pagination");
  const pageCount = Math.ceil((rows.length - 1) / rowsPerPage);

  pagination.innerHTML = "";
  for (let i = 1; i <= pageCount; i++) {
    const pageButton = document.createElement("button");
    pageButton.innerText = i;
    if (i === 1) {
      pageButton.classList.add("active");
    }
    pageButton.addEventListener("click", () => {
      showPage(i, rows, rowsPerPage);
      const buttons = pagination.getElementsByTagName("button");
      for (let button of buttons) {
        button.classList.remove("active");
      }
      pageButton.classList.add("active");
    });
    pagination.appendChild(pageButton);
  }

  showPage(1, rows, rowsPerPage);
}

function showPage(page, rows, rowsPerPage) {
  for (let i = 1; i < rows.length; i++) {
    rows[i].style.display = "none";
  }

  const start = (page - 1) * rowsPerPage + 1;
  const end = start + rowsPerPage;
  for (let i = start; i < end && i < rows.length; i++) {
    rows[i].style.display = "";
  }
}
function fetchLogs() {
  fetch("/api/logs")
    .then((response) => response.json())
    .then((data) => {
      const tableBody = document.querySelector("#logsTable tbody");
      tableBody.innerHTML = "";

      data.logs.forEach((log, index) => {
        const date = new Date(log.timestamp);
        const localTimestamp = `${date
          .getDate()
          .toString()
          .padStart(2, "0")}/${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}/${date.getFullYear()} ${date
          .getHours()
          .toString()
          .padStart(2, "0")}:${date
          .getMinutes()
          .toString()
          .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;

        const eventText = log.event === "in" ? "Xe vào" : "Xe ra";
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${log.plate_number}</td>
          <td>${localTimestamp}</td>
          <td>${eventText}</td>
        `;
        tableBody.appendChild(row);
      });

      filterTable();
    })
    .catch((error) => console.error("Error fetching logs:", error));
}

document.addEventListener("DOMContentLoaded", () => {
  fetchLogs();
  setInterval(fetchLogs, 5000);
});

document.addEventListener("DOMContentLoaded", () => {
  const pagination = document.getElementById("pagination");
  pagination.addEventListener("click", (event) => {
    if (event.target.tagName === "BUTTON") {
      const buttons = pagination.getElementsByTagName("button");
      for (let button of buttons) {
        button.classList.remove("active");
      }
      event.target.classList.add("active");
    }
  });
});
