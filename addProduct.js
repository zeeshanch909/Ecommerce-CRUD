// addProduct.js
// Function to get form values
const formData = getFormValues();
function getFormValues() {
  const title = document.getElementById("title").value;
  const price = document.getElementById("price").value;
  const description = document.getElementById("description").value;
  const image = document.getElementById("image").value;
  const category = document.getElementById("category").value;
  const rate = parseInt(document.getElementById("rate").value);
  const count = parseInt(document.getElementById("count").value);

  // You can add more form values as needed

  return {
    title,
    price,
    description,
    image,
    category,
    rate,
    count,
    // Add more properties as needed
  };
}
console.log(formData);

// Function to save data to local storage
function saveToLocalStorage(formData) {
  fetch("https://fakestoreapi.com/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: formData.title,
      price: formData.price,
      description: formData.description,
      image: formData.image,
      category: formData.category,
      rating: {
        rate: formData.rate,
        count: formData.count,
      },
    }),
  })
    .then((res) => res.json())

    .then((apiResponse) => {
      // Add a unique ID to the response data
      apiResponse.id = Date.now();

      // Manually add the rating property if it is missing in the API response
      if (!apiResponse.rating) {
        apiResponse.rating = {
          rate: formData.rate,
          count: formData.count,
        };
      }

      console.log("api response", apiResponse);

      // // Get existing data from local storage or initialize an empty array
      // function to save form data to local storage

      const existingData =
        JSON.parse(localStorage.getItem("addProducts")) || [];
      console.log(existingData);

      // Add the new data to the array
      existingData.push(apiResponse);

      // chatgpt

      // Save the updated data back to local storage
      localStorage.setItem("addProducts", JSON.stringify(existingData));

      document.getElementById("addForm").reset();
      window.location.href = "./index.html";
    })
    .catch((error) => console.error("Error adding product:", error));
}

// Function to display data from local storage and API
function displayData() {
  const localData = JSON.parse(localStorage.getItem("addProducts")) || [];

  displayCards(localData);

  fetchData().then((apiData) => {
    if (apiData) {
      displayCards(apiData);
    }
  });
}

// Function to handle form submission
function handleSubmit(event) {
  event.preventDefault();

  // Get form values
  const formData = getFormValues();

  // Save data to local storage
  saveToLocalStorage(formData);
  console.log("this is form data", formData);

  // Display data from local storage and API
  // displayData();

  // Optionally, you can clear the form after submission
}

// Add event listener for form submission
document.getElementById("addForm").addEventListener("submit", handleSubmit);

// document.querySelector(".add_btn").addEventListener("click", () => {});
document.querySelector(".cancel_btn").addEventListener("click", () => {
  // window.location.href = "./index.html";
});

document.querySelector(".cancel_btn").addEventListener("click", () => {
  window.location.href = "./index.html";
});
