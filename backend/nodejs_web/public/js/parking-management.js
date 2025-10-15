function addParking() {
  document.querySelector(".addParking-detail").classList.add("show");
}

function closeModal() {
  document.querySelectorAll(".popup").forEach((popup) => {
    popup.classList.remove("show");
  });
}

async function saveParking() {
  const slotNumber = document.getElementById("add_slot").value;

  if (!slotNumber) {
    alert("Vui lòng nhập mã bãi đỗ xe!");
    return;
  }

  try {
    const response = await fetch("/api/parking-slot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slot_number: slotNumber }),
    });

    const data = await response.json();

    if (response.ok) {
      closeModal();
      loadParkingSlots(); // Update the DOM
    } else {
      alert(`Thêm thất bại: ${data.error}`);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Có lỗi xảy ra khi thêm bãi đỗ!");
  }
}

function deleteParking() {
  document.querySelector(".deleteParking-detail").classList.add("show");
  populateDeleteOptions();
}

async function populateDeleteOptions() {
  try {
    const response = await fetch("/api/parking-slot");
    console.log("Response status:", response.status);
    const slots = await response.json();
    console.log("Slots data:", slots);

    const deleteSlotDropdown = document.getElementById("deleteSlot");
    deleteSlotDropdown.innerHTML = "";

    slots.forEach((slot) => {
      const option = document.createElement("option");
      option.value = slot.slot_number;
      option.textContent = slot.slot_number;
      deleteSlotDropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading slots:", error);
    alert("Không thể tải danh sách bãi đỗ!");
  }
}

async function confirmDelete() {
  const slotNumber = document.getElementById("deleteSlot").value;

  if (!slotNumber) {
    alert("Vui lòng chọn bãi đỗ cần xóa!");
    return;
  }

  try {
    const response = await fetch(`/api/parking-slot/${slotNumber}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (response.ok) {
      closeModal();
      loadParkingSlots(); // Update the DOM
    } else {
      alert(`Xóa thất bại: ${data.error}`);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Có lỗi xảy ra khi xóa bãi đỗ!");
  }
}

async function loadParkingSlots() {
  try {
    const response = await fetch("/api/parking-slot");
    console.log("Response status:", response.status);
    const slots = await response.json();
    console.log("Slots data:", slots);

    const parkingSlotsContainer = document.querySelector(".parking_slots");
    parkingSlotsContainer.innerHTML = "";

    slots.forEach((slot) => {
      const slotDiv = document.createElement("div");
      slotDiv.className = `slot ${slot.status_slot ? "notempty" : ""}`;
      slotDiv.id = `slot${slot.slot_number}`;
      slotDiv.innerHTML = `<p>${slot.slot_number} - ${
        slot.status_slot ? "Có xe" : "Trống"
      }</p>`;
      parkingSlotsContainer.appendChild(slotDiv);
    });
  } catch (error) {
    console.error("Error loading parking slots:", error);
  }
}

function modifyParking() {
  document.querySelector(".modifyParking-detail").classList.add("show");
  populateModifyOptions();
}

async function populateModifyOptions() {
  try {
    const response = await fetch("/api/parking-slot");
    console.log("Response status:", response.status);
    const slots = await response.json();
    console.log("Slots data:", slots);

    const modifySlotDropdown = document.getElementById("modify_slot");
    modifySlotDropdown.innerHTML = "";

    slots.forEach((slot) => {
      const option = document.createElement("option");
      option.value = slot.slot_number;
      option.textContent = slot.slot_number;
      modifySlotDropdown.appendChild(option);
    });

    const modifyStatusDropdown = document.getElementById("modify_status_slot");
    modifyStatusDropdown.innerHTML = `
      <option value="true">Có xe</option>
      <option value="false">Trống</option>
    `;

    modifySlotDropdown.addEventListener("change", () => {
      const selectedSlot = slots.find(
        (slot) => slot.slot_number === modifySlotDropdown.value
      );
      modifyStatusDropdown.value = selectedSlot.status_slot.toString();
    });

    // Trigger change event to set initial status
    modifySlotDropdown.dispatchEvent(new Event("change"));
  } catch (error) {
    console.error("Error loading slots:", error);
    alert("Không thể tải danh sách bãi đỗ!");
  }
}

async function saveModifiedParking() {
  const slotNumber = document.getElementById("modify_slot").value;
  const statusSlot = document.getElementById("modify_status_slot").value;

  if (!slotNumber) {
    alert("Vui lòng chọn mã bãi đỗ xe!");
    return;
  }

  try {
    const response = await fetch(`/api/parking-slot/${slotNumber}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status_slot: statusSlot === "true" }),
    });

    const data = await response.json();

    if (response.ok) {
      closeModal();
      loadParkingSlots(); // Update the DOM
    } else {
      alert(`Sửa thất bại: ${data.error}`);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Có lỗi xảy ra khi sửa bãi đỗ!");
  }
}
