const themeButton = document.getElementById("themeButton");


// =========================
// TEMA
// =========================

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark");

    themeButton.textContent = "☀";
}


themeButton.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    themeButton.textContent = isDark ? "☀" : "☾";

    localStorage.setItem(
        "theme",
        isDark ? "dark" : "light"
    );

});


// =========================
// HEADER AO ROLAR
// =========================

const header = document.querySelector(".header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {

        header.style.boxShadow =
            "0 5px 25px rgba(0, 0, 0, 0.08)";

    } else {

        header.style.boxShadow = "none";

    }

});


// =========================
// ANIMAÇÃO DOS PROJETOS
// =========================

const projects = document.querySelectorAll(".project");

const observer = new IntersectionObserver(
    (entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                entry.target.style.opacity = "1";

                entry.target.style.transform =
                    "translateY(0)";

            }

        });

    },
    {
        threshold: 0.15
    }
);


projects.forEach((project) => {

    project.style.opacity = "0";

    project.style.transform = "translateY(30px)";

    project.style.transition =
        "opacity 0.6s ease, transform 0.6s ease";

    observer.observe(project);

});