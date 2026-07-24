// ==============================
// Form Elements
// ==============================

const form = document.getElementById("carForm");

const makeInput = document.getElementById("make");
const modelInput = document.getElementById("model");
const yearInput = document.getElementById("year");
const priceInput = document.getElementById("price");
const mileageInput = document.getElementById("mileage");
const transmissionInput = document.getElementById("transmission");
const fuelTypeInput = document.getElementById("fuelType");
const colorInput = document.getElementById("color");
const locationInput = document.getElementById("location");
const descriptionInput = document.getElementById("description");
const coverImageInput = document.getElementById("coverImage");

// ==============================
// Add Vehicle
// ==============================

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    try {

        let coverImageId = null;

        const file = coverImageInput.files[0];

        // Upload cover image
        if (file) {

            const uploadedFile = await storage.createFile(
                BUCKET_ID,
                Appwrite.ID.unique(),
                file
            );

            coverImageId = uploadedFile.$id;

            console.log("✅ Image Uploaded");
            console.log(uploadedFile);

        }

        // Create database document

        const newCar = await databases.createDocument(
            DATABASE_ID,
            CARS_COLLECTION_ID,
            Appwrite.ID.unique(),
            {
                name: `${makeInput.value} ${modelInput.value} ${yearInput.value}`,

                make: makeInput.value,

                model: modelInput.value,

                year: Number(yearInput.value),

                price: Number(priceInput.value),

                mileage: Number(mileageInput.value),

                transmission: transmissionInput.value,

                fuelType: fuelTypeInput.value,

                vin: vin.value.trim(),

                color: colorInput.value,

                location: locationInput.value,

                status: "Available",

                description: descriptionInput.value,

                coverImageId: coverImageId,

                galleryImageIds: coverImageId
                    ? [coverImageId]
                    : [],

                featured: false
            }
        );

        console.log("✅ Vehicle Added");
        console.log(newCar);

        alert("Vehicle added successfully!");

        form.reset();

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

});
