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

        const params = new URLSearchParams(window.location.search);
        const urlBrand = params.get("brand");
        const brandFilter = document.getElementById("brandFilter");

        if (urlBrand && brandFilter) {
            const matchingOption = [...brandFilter.options].find(option =>
                option.value.toLowerCase() === urlBrand.toLowerCase()
            );
            if (matchingOption) {
                brandFilter.value = matchingOption.value;
            }
        }

        let cars = response.documents;
        const modelFilter = document.getElementById("modelFilter");

if (modelFilter) {
    const models = [...new Set(response.documents
        .filter(car => !urlBrand || (car.make && car.make.trim().toLowerCase() === urlBrand.trim().toLowerCase()))
        .map(car => car.model)
        .filter(Boolean)
    )];

    modelFilter.innerHTML = `<option value="">All Models</option>`;

    models.forEach(model => {
        modelFilter.innerHTML += `<option value="${model}">${model}</option>`;
    });
}

        if (urlBrand) {
            cars = cars.filter(car =>
                car.make &&
                car.make.trim().toLowerCase() === urlBrand.trim().toLowerCase()
            );
        }

        inventoryContainer.innerHTML = "";

        if (cars.length === 0) {
            inventoryContainer.innerHTML = `
                <div class="col-12 text-center">
                    <h3>No vehicles found.</h3>
                    ${urlBrand ? `<p>No ${urlBrand} vehicles are currently available.</p>` : ""}
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



document.querySelector(".product-search-area form").addEventListener("submit", function(event) {
    event.preventDefault();

    const brand = document.getElementById("brandFilter").value;

    if (brand) {
        window.location.href = `inventory.html?brand=${encodeURIComponent(brand)}`;
    } else {
        window.location.href = "inventory.html";
    }
});
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
