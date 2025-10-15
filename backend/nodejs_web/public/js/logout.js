document
  .getElementById("logout-link")
  .addEventListener("click", function (event) {
    event.preventDefault();
    console.log("logout clicked");
    fetch("/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          window.location.href = "/auth/login";
        } else {
          alert("Error logging out");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
