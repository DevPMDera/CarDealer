// ======================================
// Car Details Page
// ======================================

// Get Car ID
const params = new URLSearchParams(window.location.search);
const carId = params.get("id");

// Redirect if no ID
if (!carId) {
    alert("Vehicle not found.");
    window.location.href = "inventory.html";
}

async function loadCar() {

    try {

        const car = await databases.getDocument(
            DATABASE_ID,
            CARS_COLLECTION_ID,
            carId
        );

        console.log(car);

        // ==========================
        // Vehicle Information
        // ==========================

        document.getElementById("carMake").textContent = car.make || "-";
        document.getElementById("carModel").textContent = car.model || "-";
        document.getElementById("carYear").textContent = car.year || "-";
        document.getElementById("carMileage").textContent =
            Number(car.mileage).toLocaleString() + " km";

        document.getElementById("carVIN").textContent =
            car.vin || "-";

        document.getElementById("carColor").textContent =
            car.color || "-";

        document.getElementById("carFuelType").textContent =
            car.fuelType || "-";

        document.getElementById("carTransmission").textContent =
            car.transmission || "-";

        document.getElementById("carStatus").textContent =
            car.status || "-";

        document.getElementById("carLocation").textContent =
            car.location || "-";

        document.getElementById("carPrice").textContent =
            "₦" + Number(car.price).toLocaleString();

        const title =
            `${car.make} ${car.model} ${car.year}`;

        document.title = title;

        if (document.getElementById("carName")) {
            document.getElementById("carName").textContent = title;
        }

        if (document.getElementById("carDescription")) {
            document.getElementById("carDescription").textContent =
                car.description || "";
        }

// ===================================
// IMAGE GALLERY
// ===================================

const sliderWrapper =
    document.getElementById("galleryContainer");

const thumbnailContainer =
    document.getElementById("myTab5");

sliderWrapper.innerHTML = "";
thumbnailContainer.innerHTML = "";

// Gallery images ONLY
const images = [];

if (
    car.galleryImageIds &&
    car.galleryImageIds.length > 0
) {

    images.push(...car.galleryImageIds);

}

        images.forEach((imageId, index) => {

            const imageUrl = storage
                .getFileView(BUCKET_ID, imageId)
                .toString();

            // Main Slider
sliderWrapper.innerHTML += `
    <div class="swiper-slide">
        <img 
            src="${imageUrl}" 
            alt="Vehicle"
            style="
                width: 100%;
                height: 100%;
                object-fit: contain;
            "
        >
    </div>
`;

            // Thumbnail
            thumbnailContainer.innerHTML += `
                <li class="nav-item" role="presentation">
                    <button
                        class="nav-link ${index === 0 ? "active" : ""}"
                        type="button"
                        data-index="${index}">
                        <img
                            src="${imageUrl}"
                            style="
                                width:120px;
                                height:80px;
                                object-fit:cover;
                                border-radius:8px;
                            ">
                    </button>
                </li>
            `;

        });

// ===================================
// Reinitialize Swiper
// ===================================

const gallerySwiper = new Swiper(".product-img-slider", {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: false,
    observer: true,
    observeParents: true,
    observeSlideChildren: true,
    navigation: {
        nextEl: ".product-stand-prev",
        prevEl: ".product-stand-next"
    },
    on: {
        slideChange: function () {
            const activeIndex = this.activeIndex;
            document.querySelectorAll("#myTab5 .nav-link").forEach((button, index) => {
                button.classList.toggle("active", index === activeIndex);
            });
        }
    }
});

// ===================================
// Thumbnail Click
// ===================================

document.querySelectorAll("#myTab5 .nav-link").forEach((button) => {
    button.addEventListener("click", function (e) {
        e.preventDefault();
        const index = Number(this.getAttribute("data-index"));
        console.log("Thumbnail clicked:", index);
        gallerySwiper.slideTo(index);
    });
});

        // Update Image Count

        const count = document.querySelector(".number-of-img");

        if (count) {

            count.innerHTML = `
                <img src="assets/img/home1/icon/gallery-icon-1.svg" alt="">
                ${images.length}
            `;

        }

    }

    catch (error) {

        console.error(error);

        alert("Unable to load vehicle.");

    }

}

loadCar();
