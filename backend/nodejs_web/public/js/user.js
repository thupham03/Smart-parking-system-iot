let deleteUserId = null;

function addUser() {
  document.querySelector(".addUser-detail").style.display = "block";
}

function modifyUser(id) {
  fetch(`/auth/getUser/${id}`)
    .then((response) => response.json())
    .then((data) => {
      document.querySelector("#modifyUser_id").value = data._id;
      document.querySelector("#modifyUser_name").value = data.username;
      document.querySelector("#modifyUser_pwd").value = data.password;
      document.querySelector("#modifyUser_role").value = data.role;
      document.querySelector(".modifyUser-detail").style.display = "block";
    });
}

function deleteUser(id) {
  deleteUserId = id;
  document.querySelector(".deleteUser-detail").style.display = "block";
}

function confirmDeleteUser() {
  fetch("/auth/deleteUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: deleteUserId }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        location.reload();
      } else {
        alert(data.error);
      }
    });
}

function saveUser() {
  const username = document.querySelector("#addUser_name").value;
  const password = document.querySelector("#addUser_pwd").value;
  const role = document.querySelector("#addUser_role").value;

  fetch("/auth/addUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password, role }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        location.reload();
      } else {
        alert(data.error);
      }
    });
}

function updateUser() {
  const id = document.querySelector("#modifyUser_id").value;
  const username = document.querySelector("#modifyUser_name").value;
  const password = document.querySelector("#modifyUser_pwd").value;
  const role = document.querySelector("#modifyUser_role").value;

  fetch("/auth/modifyUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, username, password, role }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        location.reload();
      } else {
        alert(data.error);
      }
    });
}

function closePopup() {
  document.querySelector(".addUser-detail").style.display = "none";
  document.querySelector(".modifyUser-detail").style.display = "none";
  document.querySelector(".deleteUser-detail").style.display = "none";
}
