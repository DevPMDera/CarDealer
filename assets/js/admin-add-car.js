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
const vinInput = document.getElementById("vin");
const descriptionInput = document.getElementById("description");

const coverImageInput = document.getElementById("coverImage");
const galleryImagesInput = document.getElementById("galleryImages");

// ==============================
// Add Vehicle
// ==============================

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    try {

        // ==================================
        // COVER IMAGE
        // ==================================

        let coverImageId = null;

        const coverFile = coverImageInput.files[0];

        if (coverFile) {

            const uploadedCover = await storage.createFile(
                BUCKET_ID,
                Appwrite.ID.unique(),
                coverFile
            );

            coverImageId = uploadedCover.$id;

            console.log("✅ Cover image uploaded:", coverImageId);
        }


        // ==================================
        // GALLERY IMAGES
        // ==================================

        const galleryImageIds = [];

        const galleryFiles = Array.from(
            galleryImagesInput.files
        );

        // Maximum 7 gallery images
        if (galleryFiles.length > 7) {

            alert("You can upload a maximum of 7 gallery images.");

            return;
        }


        // Upload gallery images one by one
        for (const file of galleryFiles) {

            const uploadedGalleryImage =
                await storage.createFile(
                    BUCKET_ID,
                    Appwrite.ID.unique(),
                    file
                );

            galleryImageIds.push(
                uploadedGalleryImage.$id
            );

            console.log(
                "✅ Gallery image uploaded:",
                uploadedGalleryImage.$id
            );
        }


        // ==================================
        // CREATE DATABASE DOCUMENT
        // ==================================

        const newCar = await databases.createDocument(
            DATABASE_ID,
            CARS_COLLECTION_ID,
            Appwrite.ID.unique(),
            {

                name:
                    `${makeInput.value} ${modelInput.value} ${yearInput.value}`,

                make:
                    makeInput.value,

                model:
                    modelInput.value,

                year:
                    Number(yearInput.value),

                price:
                    Number(priceInput.value),

                mileage:
                    Number(mileageInput.value),

                transmission:
                    transmissionInput.value,

                fuelType:
                    fuelTypeInput.value,

                vin:
                    vinInput.value.trim(),

                color:
                    colorInput.value,

                location:
                    locationInput.value,

                status:
                    "Available",

                description:
                    descriptionInput.value,

                // Cover image ONLY
                coverImageId:
                    coverImageId,

                // Gallery images ONLY
                galleryImageIds:
                    galleryImageIds,

                featured:
                    false
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
