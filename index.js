let bookingCount = 0;
const bookedSeats = new Set();

function updateBookingCount() {
  const countDisplay = document.getElementById("bookingCount");
  countDisplay.textContent = ` ${bookingCount}`;
}

function handleFormSubmit(event) {
  event.preventDefault();
  const username = event.target.username.value;
  const seat = event.target.seat.value;

  // Check if the seat number is already booked
  if (bookedSeats.has(seat)) {
    alert(`Seat number ${seat} is already booked. Please choose a different seat.`);
    return;
  }

  const userDetails = { username, seat };

  axios
    .post(
      "https://crudcrud.com/api/9409746b89b44305845f6aba3ad66956/movie",
      userDetails
    )
    .then((response) => {
      displayUserOnScreen(response.data);
      bookingCount++; // Increment booking count when new booking is added
      bookedSeats.add(seat); // Add the new seat to the set of booked seats
      updateBookingCount(); // Update the display of the booking count
    })
    .catch((error) => console.log(error));

  // Clear the input fields
  document.getElementById("username").value = "";
  document.getElementById("seat").value = "";
}

window.addEventListener("DOMContentLoaded", () => {
  // Fetch existing bookings from crudcrud.com and display them
  axios
    .get("https://crudcrud.com/api/9409746b89b44305845f6aba3ad66956/movie")
    .then((response) => {
      bookingCount = response.data.length; // Set initial booking count
      updateBookingCount(); // Update the display with initial count

      response.data.forEach((user) => {
        bookedSeats.add(user.seat); // Add each seat number to the set of booked seats
        displayUserOnScreen(user);
      });
    })
    .catch((error) => console.log(error));
});

function displayUserOnScreen(userDetails) {
  const userItem = document.createElement("li");
  userItem.appendChild(
    document.createTextNode(
      `${userDetails.username} - Seat No: ${userDetails.seat} `
    )
  );

  const deleteBtn = document.createElement("button");
  deleteBtn.appendChild(document.createTextNode("Delete"));
  userItem.appendChild(deleteBtn);

  const editBtn = document.createElement("button");
  editBtn.appendChild(document.createTextNode("Edit"));
  userItem.appendChild(editBtn);

  const userList = document.querySelector("ul#bookingList");
  userList.appendChild(userItem);

  // Delete user from the screen and crudcrud.com
  deleteBtn.addEventListener("click", function () {
    userList.removeChild(userItem);
    axios
      .delete(
        `https://crudcrud.com/api/9409746b89b44305845f6aba3ad66956/movie/${userDetails._id}`
      )
      .then(() => {
        bookingCount--; // Decrement booking count on deletion
        bookedSeats.delete(userDetails.seat); // Remove seat from booked seats
        updateBookingCount(); // Update the display of the booking count
      })
      .catch((error) => console.log(error));
  });

  // Edit user functionality
  editBtn.addEventListener("click", function () {
    userList.removeChild(userItem);

    document.getElementById("username").value = userDetails.username;
    document.getElementById("seat").value = userDetails.seat;

    // Delete the user from crudcrud.com to allow re-adding with updated info
    axios
      .delete(
        `https://crudcrud.com/api/9409746b89b44305845f6aba3ad66956/movie/${userDetails._id}`
      )
      .then(() => {
        bookingCount--; // Adjust booking count when editing
        bookedSeats.delete(userDetails.seat); // Remove seat from booked seats
        updateBookingCount();
      })
      .catch((error) => console.log(error));
  });
}

// Find booking by seat number and display results as a list
document.getElementById("findButton").addEventListener("click", function () {
  const seatNo = document.getElementById("findSeat").value;
  const findResultsList = document.getElementById("findResultsList");

  // Clear previous results
  findResultsList.innerHTML = "";

  axios
    .get("https://crudcrud.com/api/9409746b89b44305845f6aba3ad66956/movie")
    .then((response) => {
      const matchingBookings = response.data.filter((user) => user.seat === seatNo);

      if (matchingBookings.length > 0) {
        matchingBookings.forEach((user) => {
          const resultItem = document.createElement("li");
          resultItem.textContent = `Username: ${user.username}, Seat No: ${user.seat}`;
          findResultsList.appendChild(resultItem);
        });
      } else {
        const noResultItem = document.createElement("li");
        noResultItem.textContent = `No booking found for Seat No: ${seatNo}`;
        findResultsList.appendChild(noResultItem);
      }
    })
    .catch((error) => console.log(error));

  // Clear the find seat input field
  document.getElementById("findSeat").value = "";
});
