// =========================
// Load Inventory
// =========================

async function loadCars() {

    try {

        const response = await databases.listDocuments(
            DATABASE_ID,
            CARS_COLLECTION_ID
        );

        console.log("Cars:", response.documents);

        const inventoryContainer = document.getElementById("inventoryContainer");

        inventoryContainer.innerHTML = "";

        response.documents.forEach(car => {

            inventoryContainer.innerHTML += createCarCard(car);

        });

    } catch (error) {

        console.error(error);

    }

}

function createCarCard(car) {
    const imageUrl = storage.getFileView(
    BUCKET_ID,
    car.coverImageId
);

console.log(imageUrl);

    return `
        <div class="col-xl-3 col-lg-4 col-md-6">

            <div class="product-card">

                <img src="${imageUrl}"
     alt="${car.make}"
     style="width:100%;height:220px;object-fit:cover;">

                <div class="product-content">

                    <h5>${car.make} ${car.model} ${car.year}</h5>

                    <p>${car.location}</p>

                    <strong>$${Number(car.price).toLocaleString()}</strong>

                </div>

            </div>

        </div>
    `;

}

loadCars();
