const form = document.getElementById("carForm");

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    console.log({

        make: make.value,

        model: model.value,

        year: year.value,

        price: price.value,

        mileage: mileage.value,

        location: location.value,

        transmission: transmission.value,

        fuelType: fuelType.value,

        color: color.value,

        description: description.value,

        coverImage: coverImage.files[0]

    });

});
