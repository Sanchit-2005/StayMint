// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false,
    );
  });
})();

function showMessage(data) {
  Swal.fire({
    icon: data.success ? "success" : "error",
    title: data.success ? "Success" : "Error",
    text: data.message,
  });
}



const checkInInput = document.getElementById("checkInDate");
const checkOutInput = document.getElementById("checkOutDate");

// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split("T")[0];

// Check-in can only be today or a future date
checkInInput.min = today;


checkInInput.addEventListener("change", function () {
  const checkInDate = checkInInput.value;

  checkOutInput.min = checkInDate;

  // Clear checkout if it was before the new check-in
  if (checkOutInput.value && checkOutInput.value < checkInDate) {
    checkOutInput.value = "";
  }
});