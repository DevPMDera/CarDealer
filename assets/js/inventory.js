/** async function loadCars() {

    try {

        const response = await databases.listDocuments(
            DATABASE_ID,
            CARS_COLLECTION_ID
        );

        console.log(response.documents);

    } catch (error) {

        console.error(error);

    }

}

loadCars(); **/


const container = document.getElementById("inventoryContainer");

console.log(container);
