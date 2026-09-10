let editingCarId = null;
const PAYMENT_FUNCTION_URL = "https://car-dealer-payment.appwrite.network/";
const account = new Appwrite.Account(client);
const teams = new Appwrite.Teams(client);
const ADMIN_TEAM_ID = "6a9fd895001ca97364d4";
const adminLogin = document.getElementById("adminLogin");
const adminPanel = document.getElementById("adminPanel");
const emailStep = document.getElementById("emailStep");
const otpStep = document.getElementById("otpStep");
const adminEmail = document.getElementById("adminEmail");
const adminOtp = document.getElementById("adminOtp");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const backToEmailBtn = document.getElementById("backToEmailBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginMessage = document.getElementById("loginMessage");
const carForm = document.getElementById("carForm");
const vehicleTableBody = document.getElementById("vehicleTableBody");
const vehicleSearch = document.getElementById("vehicleSearch");
const vehicleStatusFilter = document.getElementById("vehicleStatusFilter");
const formTitle = document.querySelector("#adminPanel h2");
const submitButton = document.querySelector("#carForm button[type='submit']");
let loginEmail = "";
let loginUserId = "";
let allVehicles = [];

function showMessage(message, error = false) {
    loginMessage.textContent = message;
    loginMessage.style.color = error ? "#dc3545" : "#198754";
}

async function checkAdminAccess() {
    try {
        const user = await account.get();
        const result = await teams.list();
        const isAdmin = result.teams.some(team => team.$id === ADMIN_TEAM_ID);
        if (!isAdmin) {
            await account.deleteSession("current");
            adminLogin.style.display = "block";
            adminPanel.style.display = "none";
            showMessage("Access denied. You are not a Car Dealer administrator.", true);
            return false;
        }
        adminLogin.style.display = "none";
        adminPanel.style.display = "block";
        await loadVehicles();
        console.log("✅ Admin authenticated:", user.email);
        return true;
    } catch (error) {
        adminLogin.style.display = "block";
        adminPanel.style.display = "none";
        return false;
    }
}

sendOtpBtn.addEventListener("click", async () => {
    const email = adminEmail.value.trim();
    if (!email) {
        showMessage("Please enter your email address.", true);
        return;
    }
    sendOtpBtn.disabled = true;
    showMessage("Sending OTP...");
    try {
        const token = await account.createEmailToken(Appwrite.ID.unique(), email);
        loginEmail = email;
        loginUserId = token.userId;
        emailStep.style.display = "none";
        otpStep.style.display = "block";
        showMessage("OTP sent. Check your email.");
    } catch (error) {
        console.error(error);
        showMessage(error.message || "Unable to send OTP.", true);
    } finally {
        sendOtpBtn.disabled = false;
    }
});

verifyOtpBtn.addEventListener("click", async () => {
    const otp = adminOtp.value.trim();
    if (!otp || otp.length !== 6) {
        showMessage("Enter the 6-digit OTP.", true);
        return;
    }
    if (!loginUserId) {
        showMessage("Please request a new OTP.", true);
        return;
    }
    verifyOtpBtn.disabled = true;
    showMessage("Verifying OTP...");
    try {
        await account.createSession(loginUserId, otp);
        const allowed = await checkAdminAccess();
        if (!allowed) return;
        showMessage("Login successful.");
    } catch (error) {
        console.error(error);
        showMessage(error.message || "Invalid OTP.", true);
    } finally {
        verifyOtpBtn.disabled = false;
    }
});

backToEmailBtn.addEventListener("click", () => {
    otpStep.style.display = "none";
    emailStep.style.display = "block";
    adminOtp.value = "";
    showMessage("");
});

logoutBtn.addEventListener("click", async () => {
    try {
        await account.deleteSession("current");
    } catch (error) {
        console.error(error);
    }
    adminPanel.style.display = "none";
    adminLogin.style.display = "block";
    emailStep.style.display = "block";
    otpStep.style.display = "none";
    adminEmail.value = "";
    adminOtp.value = "";
    loginEmail = "";
    loginUserId = "";
    editingCarId = null;
    showMessage("You have been logged out.");
});

carForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        const isAdmin = await checkAdminAccess();
        if (!isAdmin) {
            alert("Access denied.");
            return;
        }
        const make = document.getElementById("make").value.trim();
        const model = document.getElementById("model").value.trim();
        const year = Number(document.getElementById("year").value);
        const price = Number(document.getElementById("price").value);
        const mileage = Number(document.getElementById("mileage").value || 0);
        const transmission = document.getElementById("transmission").value.trim();
        const fuelType = document.getElementById("fuelType").value.trim();
        const color = document.getElementById("color").value.trim();
        const location = document.getElementById("location").value.trim();
        const vin = document.getElementById("vin").value.trim();
        const description = document.getElementById("description").value.trim();
        const coverFile = document.getElementById("coverImage").files[0];
        const galleryFiles = Array.from(document.getElementById("galleryImages").files);

        if (!editingCarId && !coverFile) {
            alert("Please select a cover image.");
            return;
        }
        if (galleryFiles.length > 7) {
            alert("Maximum 7 gallery images allowed.");
            return;
        }

        let coverImageId;
        let galleryImageIds;

        if (editingCarId) {
            const existingCar = allVehicles.find(vehicle => vehicle.$id === editingCarId);
            if (!existingCar) {
                throw new Error("Vehicle being edited was not found.");
            }

            coverImageId = existingCar.coverImageId || null;
            galleryImageIds = existingCar.galleryImageIds || [];

            if (coverFile) {
                const coverUpload = await storage.createFile(
                    BUCKET_ID,
                    Appwrite.ID.unique(),
                    coverFile
                );
                coverImageId = coverUpload.$id;
            }

            if (galleryFiles.length > 0) {
                galleryImageIds = [];
                for (const file of galleryFiles) {
                    const upload = await storage.createFile(
                        BUCKET_ID,
                        Appwrite.ID.unique(),
                        file
                    );
                    galleryImageIds.push(upload.$id);
                }
            }

            await databases.updateDocument(
                DATABASE_ID,
                CARS_COLLECTION_ID,
                editingCarId,
                {
                    name: `${year} ${make} ${model}`,
                    make,
                    model,
                    year,
                    price,
                    mileage,
                    transmission,
                    fuelType,
                    color,
                    location,
                    vin,
                    description,
                    status: existingCar.status || "Available",
                    featured: existingCar.featured || false,
                    coverImageId,
                    galleryImageIds
                }
            );

            alert("Vehicle updated successfully!");
        } else {
            const coverUpload = await storage.createFile(
                BUCKET_ID,
                Appwrite.ID.unique(),
                coverFile
            );

            galleryImageIds = [];

            for (const file of galleryFiles) {
                const upload = await storage.createFile(
                    BUCKET_ID,
                    Appwrite.ID.unique(),
                    file
                );
                galleryImageIds.push(upload.$id);
            }

            await databases.createDocument(
                DATABASE_ID,
                CARS_COLLECTION_ID,
                Appwrite.ID.unique(),
                {
                    name: `${year} ${make} ${model}`,
                    make,
                    model,
                    year,
                    price,
                    mileage,
                    transmission,
                    fuelType,
                    color,
                    location,
                    vin,
                    description,
                    status: "Available",
                    featured: false,
                    coverImageId: coverUpload.$id,
                    galleryImageIds
                }
            );

            alert("Vehicle added successfully!");
        }

        editingCarId = null;
        carForm.reset();

        if (formTitle) {
            formTitle.textContent = "Add Vehicle";
        }

        if (submitButton) {
            submitButton.textContent = "Add Vehicle";
        }

        await loadVehicles();
    } catch (error) {
        console.error(error);
        alert(error.message || "Something went wrong.");
    }
});

async function loadVehicles() {
    if (!vehicleTableBody) return;

    vehicleTableBody.innerHTML = `<tr><td colspan="9" class="table-message">Loading vehicles...</td></tr>`;

    try {
        const result = await databases.listDocuments(
            DATABASE_ID,
            CARS_COLLECTION_ID
        );

        allVehicles = result.documents || [];
        renderVehicleTable();
    } catch (error) {
        console.error("Failed to load vehicles:", error);
        vehicleTableBody.innerHTML = `<tr><td colspan="9" class="table-message">Unable to load vehicles.</td></tr>`;
    }
}

function renderVehicleTable() {
    const searchTerm = vehicleSearch.value.trim().toLowerCase();
    const selectedStatus = vehicleStatusFilter.value;

    const filteredVehicles = allVehicles.filter(car => {
        const vehicleName = `${car.year || ""} ${car.make || ""} ${car.model || ""}`.toLowerCase();
        const matchesSearch =
            !searchTerm ||
            vehicleName.includes(searchTerm) ||
            String(car.vin || "").toLowerCase().includes(searchTerm) ||
            String(car.location || "").toLowerCase().includes(searchTerm);

        const matchesStatus =
            selectedStatus === "all" ||
            car.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    if (!filteredVehicles.length) {
        vehicleTableBody.innerHTML = `<tr><td colspan="9" class="table-message">No vehicles found.</td></tr>`;
        return;
    }

    vehicleTableBody.innerHTML = filteredVehicles.map(car => {
        const statusClass =
            car.status === "Available"
                ? "status-available"
                : car.status === "Reserved"
                    ? "status-reserved"
                    : car.status === "Payment Pending"
                        ? "status-pending"
                        : "status-other";

        return `
            <tr>
                <td class="vehicle-name">${car.year || ""} ${car.make || ""} ${car.model || ""}</td>
                <td>${car.year || "—"}</td>
                <td>₦${Number(car.price || 0).toLocaleString()}</td>
                <td>${Number(car.mileage || 0).toLocaleString()} km</td>
                <td>${car.fuelType || "—"}</td>
                <td>${car.location || "—"}</td>
                <td><span class="status-badge ${statusClass}">${car.status || "Unknown"}</span></td>
                <td>${car.featured ? "Yes" : "No"}</td>
                <td class="vehicle-actions">
    ${car.status !== "Reserved" ? `
        <button type="button" class="edit-vehicle-btn" data-car-id="${car.$id}">Edit</button>
        <button type="button" class="reset-vehicle-btn" data-car-id="${car.$id}">Reset</button>
    ` : ""}
    <button type="button" class="delete-vehicle-btn" data-car-id="${car.$id}">Delete</button>
</td>
            </tr>
        `;
    }).join("");
}

vehicleSearch.addEventListener("input", renderVehicleTable);
vehicleStatusFilter.addEventListener("change", renderVehicleTable);

function editVehicle(carId) {
    const car = allVehicles.find(vehicle => vehicle.$id === carId);

    if (!car) {
        console.error("Vehicle not found:", carId);
        return;
    }

    document.getElementById("make").value = car.make || "";
    document.getElementById("model").value = car.model || "";
    document.getElementById("year").value = car.year || "";
    document.getElementById("price").value = car.price || "";
    document.getElementById("mileage").value = car.mileage || "";
    document.getElementById("transmission").value = car.transmission || "";
    document.getElementById("fuelType").value = car.fuelType || "";
    document.getElementById("color").value = car.color || "";
    document.getElementById("location").value = car.location || "";
    document.getElementById("vin").value = car.vin || "";
    document.getElementById("description").value = car.description || "";

    editingCarId = carId;

    if (formTitle) {
        formTitle.textContent = "Edit Vehicle";
    }

    if (submitButton) {
        submitButton.textContent = "Update Vehicle";
    }

    carForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

async function deleteVehicle(carId) {
    const car = allVehicles.find(vehicle => vehicle.$id === carId);

    if (!car) {
        alert("Vehicle not found.");
        return;
    }

    const vehicleName = `${car.year || ""} ${car.make || ""} ${car.model || ""}`.trim();

    const confirmed = confirm(
        `Are you sure you want to permanently delete ${vehicleName}?\n\nThis will also delete its stored images.`
    );

    if (!confirmed) {
        return;
    }

    try {
        const isAdmin = await checkAdminAccess();

        if (!isAdmin) {
            alert("Access denied.");
            return;
        }

        const imageIds = [];

        if (car.coverImageId) {
            imageIds.push(car.coverImageId);
        }

        if (Array.isArray(car.galleryImageIds)) {
            imageIds.push(...car.galleryImageIds);
        }

        for (const fileId of imageIds) {
            try {
                await storage.deleteFile(
                    BUCKET_ID,
                    fileId
                );
            } catch (error) {
                console.error(
                    "Failed to delete image:",
                    fileId,
                    error
                );
            }
        }

        await databases.deleteDocument(
            DATABASE_ID,
            CARS_COLLECTION_ID,
            carId
        );

        alert("Vehicle deleted successfully.");

        await loadVehicles();

    } catch (error) {
        console.error("Failed to delete vehicle:", error);

        alert(
            error.message ||
            "Unable to delete vehicle."
        );
    }
}

async function resetVehicle(carId) {
    const car = allVehicles.find(vehicle => vehicle.$id === carId);
    if (!car) {
        alert("Vehicle not found.");
        return;
    }

    const vehicleName = `${car.year || ""} ${car.make || ""} ${car.model || ""}`.trim();

    if (car.status === "Available") {
        alert(`${vehicleName} is already Available.`);
        return;
    }

    const confirmed = confirm(
        `Reset ${vehicleName} to Available?\n\nThis will release any active payment hold.`
    );
    if (!confirmed) return;

    try {
        const isAdmin = await checkAdminAccess();
        if (!isAdmin) {
            alert("Access denied.");
            return;
        }

        const jwtResult = await account.createJWT();

        const response = await fetch(PAYMENT_FUNCTION_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Appwrite-User-JWT": jwtResult.jwt
            },
            body: JSON.stringify({
                action: "admin-reset",
                carId
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to reset vehicle.");
        }

        alert("Vehicle reset to Available successfully.");
        await loadVehicles();
    } catch (error) {
        console.error("Failed to reset vehicle:", error);
        alert(error.message || "Unable to reset vehicle.");
    }
}

vehicleTableBody.addEventListener("click", async event => {
    const editButton = event.target.closest(".edit-vehicle-btn");
    const resetButton = event.target.closest(".reset-vehicle-btn");
    const deleteButton = event.target.closest(".delete-vehicle-btn");

    if (editButton) {
        editVehicle(editButton.dataset.carId);
        return;
    }

    if (resetButton) {
        await resetVehicle(resetButton.dataset.carId);
        return;
    }

    if (deleteButton) {
        await deleteVehicle(deleteButton.dataset.carId);
    }
});

(async () => {
    const isAdmin = await checkAdminAccess();

    if (!isAdmin) {
        console.log("🔒 Admin authentication required.");
    }
})();
