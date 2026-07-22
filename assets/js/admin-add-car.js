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

            console.log("✅ Image uploaded!");
            console.log(uploadedFile);

        }

    } catch (error) {

        console.error(error);

    }

});
