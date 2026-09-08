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

let loginEmail = "";

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
        await account.createEmailToken(
            Appwrite.ID.unique(),
            email
        );

        loginEmail = email;

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

    verifyOtpBtn.disabled = true;
    showMessage("Verifying OTP...");

    try {
        await account.createSession(
            loginEmail,
            otp
        );

        const allowed = await checkAdminAccess();

        if (!allowed) {
            return;
        }

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
    showMessage("You have been logged out.");
});

(async () => {
    const isAdmin = await checkAdminAccess();

    if (!isAdmin) {
        console.log("🔒 Admin authentication required.");
    }
})();

const carForm = document.getElementById("carForm");

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

        const galleryFiles = Array.from(
            document.getElementById("galleryImages").files
        );

        if (!coverFile) {
            alert("Please select a cover image.");
            return;
        }

        if (galleryFiles.length > 7) {
            alert("Maximum 7 gallery images allowed.");
            return;
        }

        const coverUpload = await storage.createFile(
            BUCKET_ID,
            Appwrite.ID.unique(),
            coverFile
        );

        const galleryImageIds = [];

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

        carForm.reset();

    } catch (error) {
        console.error(error);
        alert(error.message || "Something went wrong.");
    }
});
