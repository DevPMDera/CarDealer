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
        const swiperElement = document.querySelector(".product-img-slider");

        swiperElement.swiper.slideTo(index);

        document.querySelectorAll("#myTab5 .nav-link").forEach((btn) => {
            btn.classList.remove("active");
        });

        this.classList.add("active");
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



const reserveCarBtn = document.getElementById("reserveCarBtn");
const reservationModal = document.getElementById("reservationModal");
const closeReservation = document.getElementById("closeReservation");

if (reserveCarBtn && reservationModal) {
    reserveCarBtn.addEventListener("click", () => {
        reservationModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    });
}

if (closeReservation && reservationModal) {
    closeReservation.addEventListener("click", async () => {
        if (activePaymentReference && !paymentExpired) {
            try {
                await fetch(PAYMENT_FUNCTION_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        action: "release",
                        carId,
                        reference: activePaymentReference
                    })
                });
            } catch (error) {
                console.error("Failed to release payment hold:", error);
            }

            stopPaymentTimer();
            activePaymentPopup = null;
            activePaymentReference = null;

            if (paymentCountdown) {
                paymentCountdown.style.display = "none";
            }

            if (paymentTimer) {
                paymentTimer.textContent = "05:00";
            }
        }

        reservationModal.style.display = "none";
        document.body.style.overflow = "";
    });
}

if (reservationModal) {
    reservationModal.addEventListener("click", (event) => {
        if (event.target === reservationModal) {
            reservationModal.style.display = "none";
            document.body.style.overflow = "";
        }
    });
}


const continuePaymentBtn = document.getElementById("continuePaymentBtn");
const reservationMessage = document.getElementById("reservationMessage");

// ======================================
// Appwrite Realtime Car Updates
// ======================================
async function subscribeToCarUpdates() {
    try {
        const realtime = new Appwrite.Realtime(client);

        const subscription = await realtime.subscribe(
            `tablesdb.${DATABASE_ID}.tables.${CARS_COLLECTION_ID}.rows.${carId}`,
            async (response) => {
                console.log(
                    "🔄 Car update received:",
                    response.events,
                    response.payload
                );

                const updatedCar = response.payload;

           if (
    updatedCar &&
    updatedCar.status &&
    updatedCar.status === "Reserved"
) {
    console.log(
        "🚫 Vehicle is no longer available:",
        updatedCar.status
    );

    const statusElement =
        document.getElementById("carStatus");

    if (statusElement) {
        statusElement.textContent = updatedCar.status;
    }

    if (reserveCarBtn) {
        reserveCarBtn.disabled = true;
        reserveCarBtn.textContent = "Vehicle Reserved";
    }

    if (continuePaymentBtn) {
        continuePaymentBtn.disabled = true;
        continuePaymentBtn.textContent = "Vehicle Reserved";
    }

    if (reservationModal) {
        reservationModal.style.display = "none";
        document.body.style.overflow = "";
    }

    stopPaymentTimer();

    setTimeout(() => {
        window.location.href = "inventory.html";
    }, 500);

    return;
}

                await loadCar();
            }
        );

        console.log("✅ Live car-details updates enabled");

        window.carDetailsRealtimeSubscription = subscription;

    } catch (error) {
        console.error(
            "❌ Failed to enable car-details Realtime:",
            error
        );
    }
}

subscribeToCarUpdates();


const PAYMENT_FUNCTION_URL = "https://car-dealer-payment.appwrite.network/";

const paymentCountdown = document.getElementById("paymentCountdown");
const paymentTimer = document.getElementById("paymentTimer");

let paymentTimerInterval = null;
let paymentExpired = false;
let activePaymentPopup = null;
let activePaymentReference = null;

window.addEventListener("pagehide", () => {
    if (!activePaymentReference || paymentExpired) {
        return;
    }

    stopPaymentTimer();

    if (paymentCountdown) {
        paymentCountdown.style.display = "none";
    }

    fetch(PAYMENT_FUNCTION_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        keepalive: true,
        body: JSON.stringify({
            action: "release",
            carId,
            reference: activePaymentReference
        })
    }).catch(error => {
        console.error("Failed to release payment hold on page exit:", error);
    });
});

function stopPaymentTimer() {
    if (paymentTimerInterval) {
        clearInterval(paymentTimerInterval);
        paymentTimerInterval = null;
    }
}

function startPaymentTimer(expiresAt) {
    stopPaymentTimer();
    paymentExpired = false;

    const expiryTime = new Date(expiresAt).getTime();

    if (!Number.isFinite(expiryTime)) {
        console.error("Invalid payment expiry:", expiresAt);
        return;
    }

    if (paymentCountdown) {
        paymentCountdown.style.display = "block";
    }

    const updateTimer = async () => {
        const remaining = Math.max(
            0,
            Math.ceil((expiryTime - Date.now()) / 1000)
        );

        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;

        if (paymentTimer) {
            paymentTimer.textContent =
                `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        }

        if (remaining <= 0) {
    stopPaymentTimer();
    paymentExpired = true;

    if (paymentCountdown) {
        paymentCountdown.style.display = "none";
    }

    reservationMessage.textContent =
        "Payment window expired. Releasing the vehicle...";

    if (activePaymentPopup && typeof activePaymentPopup.cancelTransaction === "function") {
        try {
            activePaymentPopup.cancelTransaction(activePaymentReference);
        } catch (error) {
            console.error("Unable to close Paystack:", error);
        }
    }

    activePaymentPopup = null;

    try {
        const expireResponse = await fetch(PAYMENT_FUNCTION_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "expire",
                carId,
                reference: activePaymentReference
            })
        });

        const expireData = await expireResponse.json();

        if (!expireResponse.ok) {
            throw new Error(
                expireData.error || "Unable to release the vehicle."
            );
        }

        reservationMessage.textContent =
            "Your 5-minute payment window has expired. The vehicle is available again.";

        if (continuePaymentBtn) {
            continuePaymentBtn.disabled = false;
            continuePaymentBtn.textContent = "Continue to Payment";
        }

        activePaymentReference = null;

    } catch (error) {
        console.error("Payment expiry error:", error);

        reservationMessage.textContent =
            "The payment window expired, but we could not confirm the release. Please refresh the page.";
    }
}
    };

    updateTimer();
    paymentTimerInterval = setInterval(updateTimer, 1000);
}

if (continuePaymentBtn) {
    continuePaymentBtn.addEventListener("click", async () => {
        const customerName = document.getElementById("customerName").value.trim();
        const customerEmail = document.getElementById("customerEmail").value.trim();
        const customerPhone = document.getElementById("customerPhone").value.trim();

        if (!customerName || !customerEmail || !customerPhone) {
            reservationMessage.textContent = "Please fill in all fields.";
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
            reservationMessage.textContent = "Please enter a valid email address.";
            return;
        }

        if (customerPhone.length < 7) {
            reservationMessage.textContent = "Please enter a valid phone number.";
            return;
        }

        continuePaymentBtn.disabled = true;
        continuePaymentBtn.textContent = "Preparing Payment...";
        reservationMessage.textContent = "Checking vehicle availability...";

        try {
            const car = await databases.getDocument(
                DATABASE_ID,
                CARS_COLLECTION_ID,
                carId
            );

            if (car.status !== "Available") {
                reservationMessage.textContent = "Sorry, this vehicle has already been reserved.";
                continuePaymentBtn.disabled = false;
                continuePaymentBtn.textContent = "Continue to Payment";
                return;
            }

            reservationMessage.textContent = "Preparing secure payment...";

            const initializeResponse = await fetch(PAYMENT_FUNCTION_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    action: "initialize",
                    carId,
                    customerName,
                    customerEmail,
                    customerPhone
                })
            });

            const initializeData = await initializeResponse.json();

            if (!initializeResponse.ok || !initializeData.success) {
                throw new Error(
                    initializeData.error || "Unable to initialize payment."
                );
            }

     if (!initializeData.access_code) {
    throw new Error("Payment access code was not returned.");
}

if (!initializeData.expiresAt) {
    throw new Error("Payment expiry time was not returned.");
}

activePaymentReference = initializeData.reference;

startPaymentTimer(initializeData.expiresAt);

reservationMessage.textContent =
    "Payment must be completed within 5 minutes.";

const popup = new PaystackPop();
activePaymentPopup = popup;

            popup.resumeTransaction(initializeData.access_code, {
               onSuccess: async (transaction) => {
    stopPaymentTimer();
    activePaymentPopup = null;

    if (paymentExpired) {
        reservationMessage.textContent =
            "The payment window has expired. Your payment cannot reserve this vehicle.";
        return;
    }

    reservationMessage.textContent =
        "Payment received. Confirming reservation...";

                    try {
                        const verifyResponse = await fetch(PAYMENT_FUNCTION_URL, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                action: "verify",
                                reference: transaction.reference
                            })
                        });

                        const verifyData = await verifyResponse.json();

                        if (!verifyResponse.ok || !verifyData.success) {
                            throw new Error(
                                verifyData.error || "Payment verification failed."
                            );
                        }

                       reservationMessage.textContent =
    "Reservation confirmed! Check your email for confirmation.";

continuePaymentBtn.textContent = "Reservation Confirmed";
continuePaymentBtn.disabled = true;

activePaymentReference = null;

setTimeout(() => {
    window.location.href = "inventory.html";
}, 1000);

                    } catch (error) {
                        console.error("Payment verification error:", error);

                        reservationMessage.textContent =
                            "Payment was received, but confirmation is still processing. Please contact the dealer.";

                        continuePaymentBtn.disabled = false;
                        continuePaymentBtn.textContent = "Try Again";
                    }
                },

               onCancel: async () => {
    stopPaymentTimer();
paymentExpired = false;
activePaymentPopup = null;
activePaymentReference = null;

if (paymentCountdown) {
    paymentCountdown.style.display = "none";
}

if (paymentTimer) {
    paymentTimer.textContent = "05:00";
}
                   
    try {
        await fetch(PAYMENT_FUNCTION_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "release",
                carId,
                reference: initializeData.reference
            })
        });
    } catch (releaseError) {
        console.error("Failed to release payment hold:", releaseError);
    }

    reservationMessage.textContent =
        "Payment cancelled. The vehicle is available again.";

    continuePaymentBtn.disabled = false;
    continuePaymentBtn.textContent = "Continue to Payment";
},

               onError: async (error) => {
   stopPaymentTimer();
paymentExpired = false;
activePaymentPopup = null;
activePaymentReference = null;

if (paymentCountdown) {
    paymentCountdown.style.display = "none";
}

if (paymentTimer) {
    paymentTimer.textContent = "05:00";
}

    console.error("Paystack error:", error);

    try {
        await fetch(PAYMENT_FUNCTION_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "release",
                carId,
                reference: initializeData.reference
            })
        });
    } catch (releaseError) {
        console.error("Failed to release payment hold:", releaseError);
    }

    reservationMessage.textContent =
        "Unable to open payment. The vehicle has been released. Please try again.";

    continuePaymentBtn.disabled = false;
    continuePaymentBtn.textContent = "Continue to Payment";
},
            });

        } catch (error) {
            console.error("Reservation payment error:", error);

            reservationMessage.textContent =
                error.message || "Unable to start payment. Please try again.";

            continuePaymentBtn.disabled = false;
            continuePaymentBtn.textContent = "Continue to Payment";
        }
    });
}
