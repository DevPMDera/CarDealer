// ======================================
// Car Details Page
// ======================================

// Get car ID from URL
const params = new URLSearchParams(window.location.search);
const carId = params.get("id");

// Check if ID exists
if (!carId) {
    alert("Vehicle not found.");
    window.location.href = "inventory.html";
}

// Load vehicle
async function loadCar() {

    try {

        const car = await databases.getDocument(
            DATABASE_ID,
            CARS_COLLECTION_ID,
            carId
        );

        console.log(car);

        // ===========================
        // Basic Details
        // ===========================

        document.getElementById("carMake").textContent = car.make || "-";
        document.getElementById("carModel").textContent = car.model || "-";
        document.getElementById("carYear").textContent = car.year || "-";
        document.getElementById("carMileage").textContent =
            Number(car.mileage).toLocaleString() + " km";
        document.getElementById("carVIN").textContent = car.vin || "-";
        document.getElementById("carColor").textContent = car.color || "-";
        document.getElementById("carFuelType").textContent = car.fuelType || "-";
        document.getElementById("carTransmission").textContent =
            car.transmission || "-";
        document.getElementById("carStatus").textContent = car.status || "-";
        document.getElementById("carLocation").textContent =
            car.location || "-";

        document.getElementById("carPrice").textContent =
            "₦" + Number(car.price).toLocaleString();

        // ===========================
        // Page Title
        // ===========================

        const title = `${car.make} ${car.model} ${car.year}`;

        if (document.getElementById("carName")) {
            document.getElementById("carName").textContent = title;
        }

        document.title = title;

        // ===========================
        // Description
        // ===========================

        if (document.getElementById("carDescription")) {
            document.getElementById("carDescription").textContent =
                car.description || "";
        }

        // ===========================
        // Main Image
        // ===========================

        if (car.coverImageId) {

            const imageUrl = storage
                .getFileView(BUCKET_ID, car.coverImageId)
                .toString();

            const mainImage = document.getElementById("mainCarImage");

            if (mainImage) {
                mainImage.src = imageUrl;
            }

        }

        // ===========================
        // Gallery
        // ===========================

        const galleryContainer = document.getElementById("galleryContainer");

        if (
            galleryContainer &&
            car.galleryImageIds &&
            car.galleryImageIds.length > 0
        ) {

            galleryContainer.innerHTML = "";

            car.galleryImageIds.forEach((imageId) => {

                const imageUrl = storage
                    .getFileView(BUCKET_ID, imageId)
                    .toString();

                galleryContainer.innerHTML += `
                    <div class="swiper-slide">
                        <img src="${imageUrl}" alt="Vehicle">
                    </div>
                `;

            });

        }

    } catch (error) {

        console.error(error);

        alert("Unable to load vehicle.");

    }

}

loadCar();
