const form = document.getElementById("carForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    try {

        // Get the selected image
        const file = document.getElementById("coverImage").files[0];

        let coverImageId = null;

        // Upload image if one was selected
        if (file) {

            const uploadedFile = await storage.createFile(
                BUCKET_ID,
                Appwrite.ID.unique(),
                file
            );

            coverImageId = uploadedFile.$id;
            await databases.createDocument(
    DATABASE_ID,
    CARS_COLLECTION_ID,
    Appwrite.ID.unique(),
    {
        name: `${make.value} ${model.value} ${year.value}`,
        make: make.value,
        model: model.value,
        year: Number(year.value),
        price: Number(price.value),
        mileage: Number(mileage.value),
        transmission: transmission.value,
        fuelType: fuelType.value,
        color: color.value,
        location: location.value,
        status: "Available",
        description: description.value,

        coverImageId: coverImageId,

        galleryImageIds: [],

        featured: false
    }
);

alert("Vehicle added successfully!");

            console.log("✅ Image uploaded!");
            console.log(uploadedFile);

        }

    } catch (error) {

        console.error(error);

    }

});
