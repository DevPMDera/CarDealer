// ======================================
// Newly Listed Cars - Appwrite
// ======================================

async function loadNewlyListedCars() {
    try {
        const slider = document.querySelector("#newly-listed-cars .recent-launch-car-slider");
        const wrapper = slider?.querySelector(".swiper-wrapper");

        if (!slider || !wrapper) {
            console.error("Newly Listed Cars slider not found.");
            return;
        }

        const response = await databases.listDocuments(
            DATABASE_ID,
            CARS_COLLECTION_ID,
            [
                Appwrite.Query.equal("status", "Available"),
                Appwrite.Query.orderDesc("$createdAt"),
                Appwrite.Query.limit(8)
            ]
        );

        const cars = response.documents;

        console.log("Newly Listed Cars:", cars);

        // Destroy the existing static Swiper
        if (slider.swiper) {
            slider.swiper.destroy(true, true);
        }

        wrapper.innerHTML = "";

        if (cars.length === 0) {
            wrapper.innerHTML = `
                <div class="swiper-slide">
                    <div class="text-center p-4">
                        <h5>No cars listed yet.</h5>
                    </div>
                </div>
            `;
        } else {
            cars.forEach(car => {
                let imageUrl = "assets/img/no-car.jpg";

                if (car.coverImageId) {
                    imageUrl = storage
                        .getFileView(BUCKET_ID, car.coverImageId)
                        .toString();
                }

                wrapper.innerHTML += `
                    <div class="swiper-slide">
                        <div class="product-card2">
                            <div class="product-img">
                                <a href="car-details.html?id=${car.$id}" class="fav">
                                    <svg width="14" height="13" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7.00012 2.40453L6.37273 1.75966C4.90006 0.245917 2.19972 0.76829 1.22495 2.67141C0.767306 3.56653 0.664053 4.8589 1.4997 6.50827C2.30473 8.09639 3.97953 9.99864 7.00012 12.0706C10.0207 9.99864 11.6946 8.09639 12.5005 6.50827C13.3362 4.85803 13.2338 3.56653 12.7753 2.67141C11.8005 0.76829 9.10019 0.245042 7.62752 1.75879L7.00012 2.40453Z"/>
                                    </svg>
                                </a>

                                <img
                                    src="${imageUrl}"
                                    alt="${car.make || "Car"} ${car.model || ""}"
                                >
                            </div>

                            <div class="product-content">
                                <div class="details-btn">
                                    <a href="car-details.html?id=${car.$id}">
                                        <i class="bi bi-arrow-right-short"></i>
                                    </a>
                                </div>

                                <div class="price">
                                    <strong>₦${Number(car.price || 0).toLocaleString()}</strong>
                                </div>

                                <h6>
                                    <a href="car-details.html?id=${car.$id}">
                                        ${car.make || ""} ${car.model || ""}-${car.year || ""}
                                    </a>
                                </h6>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        // Re-create the Swiper
        new Swiper(slider, {
            slidesPerView: 1,
            speed: 1500,
            spaceBetween: 25,
            centerSlides: true,
            loop: cars.length > 4,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false
            },
            navigation: {
                nextEl: "#newly-listed-cars .next-5",
                prevEl: "#newly-listed-cars .prev-5"
            },
            breakpoints: {
                280: {
                    slidesPerView: 1
                },
                386: {
                    slidesPerView: 1
                },
                576: {
                    slidesPerView: 2,
                    spaceBetween: 15
                },
                768: {
                    slidesPerView: 3,
                    spaceBetween: 15
                },
                992: {
                    slidesPerView: 3,
                    spaceBetween: 15
                },
                1200: {
                    slidesPerView: 4,
                    spaceBetween: 15
                },
                1400: {
                    slidesPerView: 4
                }
            }
        });

    } catch (error) {
        console.error("Error loading newly listed cars:", error);
    }
}


// ======================================
// Load Page
// ======================================

document.addEventListener("DOMContentLoaded", () => {
    loadNewlyListedCars();
});
