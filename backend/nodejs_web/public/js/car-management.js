// ...existing code...

function displayLocalTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString();
  document.getElementById("local-time").innerText = timeString;
}

setInterval(displayLocalTime, 1000);

function formatDate(date) {
  const options = { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  };
  return new Date(date).toLocaleDateString('vi-VN', options).replace(',', '');
}

// ...existing code...
