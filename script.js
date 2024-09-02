let currentSlide = 0;

function changeSlide(n) {
    let slides = document.getElementsByClassName("carousel-item");
    slides[currentSlide].classList.remove("active");
    currentSlide = (currentSlide + n + slides.length) % slides.length;
    slides[currentSlide].classList.add("active");
}

document.addEventListener("DOMContentLoaded", function() {
    let slides = document.getElementsByClassName("carousel-item");
    slides[0].classList.add("active");
});
