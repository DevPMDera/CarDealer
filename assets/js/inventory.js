function createCarCard(car) {

    let imageUrl = "assets/img/no-car.jpg";

    if (car.coverImageId) {
        imageUrl = storage
            .getFileView(BUCKET_ID, car.coverImageId)
            .toString();
    }

    return `
        <div class="col-xl-3 col-lg-4 col-md-6">

            <div class="product-card">

                <img src="${imageUrl}"
                    alt="${car.make}"
                    style="width:100%;height:220px;object-fit:cover;">

                <div class="product-content">

                    <h5>
                        <a href="car-details.html?id=${car.$id}">
                            ${car.make} ${car.model} ${car.year}
                        </a>
                    </h5>

                    <p>${car.location}</p>

                    <strong>₦${Number(car.price).toLocaleString()}</strong>

                    <br><br>

                    <a class="btn btn-primary"
                       href="car-details.html?id=${car.$id}">
                        View Details
                    </a>

                </div>

            </div>

        </div>
    `;
}
