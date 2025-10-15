console.log("auth.js loaded");

document
  .getElementById("login-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.querySelector("input[name='username']").value;
    const password = document.querySelector("input[name='password']").value;

    fetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        if (response.ok) {
          window.location.href = "/views";
        } else {
          alert("Invalid credentials");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
