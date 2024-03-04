// Function to fetch data from the API
async function fetchData() {
  try {
    const response = await fetch("https://fakestoreapi.com/products");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

// Function to create and display cards
function displayCards(items) {
  const itemContainer = document.getElementById("itemContainer");
  // Fetch updatedProducts and deletedProducts from local storage
  const updatedProducts = JSON.parse(localStorage.getItem("updatedProducts")) || [];
  const deletedProducts = JSON.parse(localStorage.getItem("deletedProducts")) || [];
  // Filter out deleted items
  items = items.filter((item) => !deletedProducts.some((deleted) => deleted.id === item.id));
  updatedProducts.forEach((updatedItem) => {
    const existingIndex = items.findIndex((item) => item.id === updatedItem.id);

    if (existingIndex !== -1) {
      items[existingIndex] = updatedItem;
    } else {
      items.push(updatedItem);
    }
  });
  itemContainer.innerHTML = '';
  items.forEach((item) => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
            <h2>${item.id}</h2>
            <h3>${item.title}</h3>
            <p>Price: $${item.price}</p>
            <p>${item.description}</p>
            <p>${item.category}</p>
            <img src="${item.image}" alt="img" id="img-cart">
            <p>Rating : ${item.rating ? item.rating.rate : "N/A"}</p>
            <p>Product Sold: ${item.rating ? item.rating.count : "N/A"}</p>
            
            <button class="openEditForm" onClick='editProduct(${item.id})'>Edit</button>
            <button id="dltbtn" onClick="trashProduct(${item.id})">Delete</button>         
        `;

    itemContainer.appendChild(card);
  });
}

let editProductId;
const editProduct = async (productId) => {
  document.querySelector(".editContainer").style.display = "block";
  document.querySelector("#deleteProduct").style.display = "none";
  let product;
  if (productId >= 1 && productId <= 20) {
    const res = await fetch(`https://fakestoreapi.com/products/${productId}`);
    if (!res.ok) {
      throw new Error(`failed to fetch product data for ID ${productId}`);
    }
    const resProduct = await res.json();
    const apiProducts = JSON.parse(localStorage.getItem("Products"));
    const apiProduct = apiProducts.find((product) => product.id === productId);
    product = apiProduct || resProduct;
  } else {
    const localProducts = JSON.parse(localStorage.getItem("addProducts"));
    product = localProducts.find((product) => product.id === productId);
    if (!product) {
      throw new Error(
        `product with ID ${productId}not found in the local storage addProducts data`
      );
    }
  }
  document.getElementById("title").value = product.title;
  document.getElementById("price").value = product.price;
  document.getElementById("description").value = product.description;
  document.getElementById("category").value = product.category;
  document.getElementById("image").value = product.image;
  document.getElementById("rate").value = product.rating.rate;
  document.getElementById("count").value = product.rating.count;

  console.log("id of product", productId);
  console.log(product.rating.rate);
  console.log(product.rating.count);

  editProductId = productId;
};
document.addEventListener("DOMContentLoaded", () => {
  const cancelButton = document.getElementById("cancel_Button");
  cancelButton.addEventListener("click", (event) => {
    event.preventDefault();
    document.querySelector(".editContainer").style.display = "none";
  });
});

const updateProduct = async (event) => {
  event.preventDefault(); // Prevent form submission default behavior
  const updatedTitle = document.getElementById("title").value;
  const updatedPrice = document.getElementById("price").value;
  const updatedDescription = document.getElementById("description").value;
  const updatedCategory = document.getElementById("category").value;
  const updatedImage = document.getElementById("image").value;
  const updatedRate = parseFloat(document.getElementById("rate").value);
  const updatedCount = parseInt(document.getElementById("count").value);
  console.log("The edit product id is ", editProductId);
  console.log("Updated Rate: ", updatedRate);
  console.log("Updated Count", updatedCount);
  if (editProductId >= 1 && editProductId <= 20) {
    try {
      const response = await fetch(
        `https://fakestoreapi.com/products/${editProductId}`
      );
      const data = await response.json();

      // Check if the rating object exists in the response
      const updatedRating = data.rating
        ? { rate: updatedRate, count: updatedCount }
        : null;
      console.log("Updated Rating: ", updatedRating);
      const requestBody = {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDescription,
        category: updatedCategory,
        image: updatedImage,
        rating: updatedRating,
      };

      fetch(`https://fakestoreapi.com/products/${editProductId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Updated data", data);

          const updatedProducts =
            JSON.parse(localStorage.getItem("Products")) || [];

          const existingIndex = updatedProducts.findIndex(
            (product) => product.id === data.id
          );

          if (existingIndex !== -1) {
            updatedProducts[existingIndex] = data;
          } else {
            updatedProducts.push(data);
          }

          localStorage.setItem(
            "Products",
            JSON.stringify(updatedProducts)
          );
          // Fetch all products including updated ones and display them
          const allProducts = updatedProducts.concat(
            JSON.parse(localStorage.getItem("addProducts")) || []
          );
          displayCards(allProducts);
        });
    } catch (error) {
      console.error("Error updating product:", error);
    }
  } else {
    console.log("Hello World");
    const editLocalProducts =
      JSON.parse(localStorage.getItem("addProducts")) || [];

    const targetProductIndex = editLocalProducts.findIndex(
      (product) => product.id === editProductId
    );

    if (targetProductIndex !== -1) {
      // Assuming each product has a rating property
      editLocalProducts[targetProductIndex].rating = {
        rate: updatedRate,
        count: updatedCount,
      };

      const localBody = {
        id: editProductId,
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDescription,
        category: updatedCategory,
        image: updatedImage,
        rating: editLocalProducts[targetProductIndex].rating, // Include updated rating in the local body
      };

      console.log("Local data", localBody);

      // Replace the existing local product with the updated one in addProducts array
      editLocalProducts[targetProductIndex] = localBody;
      localStorage.setItem("addProducts", JSON.stringify(editLocalProducts)); // Update addProducts array in local storage

      // Fetch all products including updated ones and display them
      const apiProducts = JSON.parse(localStorage.getItem("Products")) || [];
      const allProducts = [...apiProducts, ...editLocalProducts];
      displayCards(allProducts);
    }
  }

};

document.addEventListener("DOMContentLoaded", () => {
  const cancelButton = document.getElementById("saveData");
  cancelButton.addEventListener("click", (event) => {
    event.preventDefault();
    document.querySelector(".editContainer").style.display = "none";
  });
});

let trashProductId;
const trashProduct = async (productId) => {
  let product;
  if (productId >= 1 && productId <= 20) {
    const res = await fetch(`https://fakestoreapi.com/products/${productId}`);
    if (!res.ok) {
      throw new Error(`failed to fetch product data for ID ${productId}`);
    }
    const resProduct = await res.json();

    const apiProducts = JSON.parse(localStorage.getItem("Products"));
    const apiProduct = apiProducts.find((product) => product.id === productId);

    product = apiProduct || resProduct;
  } else {
    const localProducts = JSON.parse(localStorage.getItem("addProducts"));

    product = localProducts.find((product) => product.id === productId);

    if (!product) {
      throw new Error(
        `product with ID ${productId}not found in the local storage addProducts data`
      );
    }
  }
  console.log("deleted id", productId);
  document.getElementById('productName').innerHTML = "Title: " + product.title;

  trashProductId = productId;
  // console.log(trashProductId)
};



const confirmDeleteProduct = async () => {
  if (trashProductId >= 1 && trashProductId <= 20) {
    fetch(`https://fakestoreapi.com/products/${trashProductId}`, {
      method: "DELETE",
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        console.log("deleted product ID", trashProductId);

        const deletedProducts =
          JSON.parse(localStorage.getItem("deletedProducts")) || [];

        const existingIndex = deletedProducts.findIndex(
          (product) => product.id === data.id
        );

        if (existingIndex !== -1) {
          deletedProducts[existingIndex] = data;
        } else {
          deletedProducts.push(data);
        }
        localStorage.setItem(
          "deletedProducts",
          JSON.stringify(deletedProducts)
        );
        // Filter out deleted items from the overall list of products
        const apiProducts = JSON.parse(localStorage.getItem("Products")) || [];
        const localProducts = JSON.parse(localStorage.getItem("addProducts")) || [];
        const allProducts = [...apiProducts, ...localProducts];

        const filteredProducts = allProducts.filter(
          (product) => !deletedProducts.some((deleted) => deleted.id === product.id)
        );

        displayCards(filteredProducts);
      });
  } else {
    console.log("local Products ");
    const localProducts = JSON.parse(localStorage.getItem("addProducts")) || [];
    const deletedProducts = JSON.parse(localStorage.getItem("deletedProducts")) || [];
    const deleteProduct = localProducts.find(product => product.id === trashProductId);

    if (deleteProduct) {
      deletedProducts.push(deleteProduct);
      localStorage.setItem("deletedProducts", JSON.stringify(deletedProducts));

      // Filter out deleted items from the overall list of products
      const apiProducts = JSON.parse(localStorage.getItem("Products")) || [];
      const allProducts = [...apiProducts, ...localProducts];

      const filteredProducts = allProducts.filter(
        (product) => !deletedProducts.some((deleted) => deleted.id === product.id)
      );
      displayCards(filteredProducts); // Refresh the displayed cards without deleted items
      console.log("localProducts:", localProducts);
      console.log("deletedProducts:", deletedProducts);
      console.log("filteredProducts:", filteredProducts);
    } else {
      console.error("user not found in local storage:", trashProductId)

    }
  }
}

function saveToLocalStorage(data) {
  localStorage.setItem("Products", JSON.stringify(data));
}
function deleteProduct(productId) {
  const products = JSON.parse(localStorage.getItem("Products")) || [];
  const updatedProducts = products.filter(
    (product) => product.id !== productId
  );
  saveToLocalStorage(updatedProducts);
  displayCards(updatedProducts);
}

// Fetch data and display cards when the page loads
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const data = await fetchData();
    const localProducts = JSON.parse(localStorage.getItem("addProducts")) || [];
    const mergedProducts = [...data, ...localProducts];
    if (mergedProducts) {
      displayCards(mergedProducts);
      saveToLocalStorage(data);
    }
  } catch (error) {
    console.error("Error during DOMContentLoaded:", error);
  }

  const deleteProductModal = document.getElementById("deleteProduct");
  document.body.addEventListener("click", (event) => {
    if (event.target.id === "dltbtn") {
      deleteProductModal.style.display = "block";
      document.querySelector(".editContainer").style.display = "none";
    } else if (event.target.id === "cancelDeleteBtn") {
      deleteProductModal.style.display = "none";
    } else if (event.target.id === "confirmDeleteBtn") {
      deleteProductModal.style.display = "none";
      document.querySelector(".editContainer").style.display = "none";
    }
  });
});

