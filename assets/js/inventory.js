// ======================================
// Load Cars From Appwrite
// ======================================

async function loadCars() {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            CARS_COLLECTION_ID
        );

        console.log("Cars:", response.documents);

        const inventoryContainer = document.getElementById("inventoryContainer");

        if (!inventoryContainer) {
            console.error("inventoryContainer not found.");
            return;
        }

        // Get brand from URL
        const params = new URLSearchParams(window.location.search);
        const selectedBrand = params.get("brand");

        console.log("Selected brand:", selectedBrand);

        // Filter cars if a brand was selected
        let cars = response.documents;

        if (selectedBrand) {
            cars = cars.filter(car =>
                car.make &&
                car.make.trim().toLowerCase() === selectedBrand.trim().toLowerCase()
            );
        }

        inventoryContainer.innerHTML = "";

        if (cars.length === 0) {
            inventoryContainer.innerHTML = `
                <div class="col-12 text-center">
                    <h3>No vehicles found.</h3>
                    ${selectedBrand ? `<p>No ${selectedBrand} vehicles are currently available.</p>` : ""}
                </div>
            `;
            return;
        }

        cars.forEach(car => {
            inventoryContainer.innerHTML += createCarCard(car);
        });

    } catch (error) {
        console.error("Error loading cars:", error);
    }
}


// ======================================
// Create Car Card
// ======================================

function createCarCard(car) {

    let imageUrl = "assets/img/no-car.jpg";

    if (car.coverImageId) {

        imageUrl = storage
            .getFileView(BUCKET_ID, car.coverImageId)
            .toString();

    }

    return `

<div class="col-xl-3 col-lg-4 col-md-6">

    <div class="product-card">

        <div class="product-img">

            <img
                src="${imageUrl}"
                alt="${car.make}"
                style="width:100%;height:220px;object-fit:cover;">

        </div>

        <div class="product-content">

            <h5>

                <a href="car-details.html?id=${car.$id}">
                    ${car.make} ${car.model} ${car.year}
                </a>

            </h5>

            <div class="price-location">

                <div class="price">

                    <strong>
                        ₦${Number(car.price).toLocaleString()}
                    </strong>

                </div>

                <div class="location">

                    <i class="bi bi-geo-alt"></i>

                    ${car.location}

                </div>

            </div>

            <div class="content-btm">

                <a
                    class="view-btn2"
                    href="car-details.html?id=${car.$id}">

                    View Details

                </a>

            </div>

        </div>

    </div>

</div>

`;

}



// ======================================
// Load Page
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    loadCars();

});
