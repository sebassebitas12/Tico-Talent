document.getElementById("heroSearchBtn")?.addEventListener("click", () => {
  const job = document.getElementById("heroSearchJob").value.trim();
  const location = document.getElementById("heroSearchLocation").value.trim();
  let url = "login.html?rol=solicitante";
  const params = [];
  if (job) params.push("q=" + encodeURIComponent(job));
  if (location) params.push("loc=" + encodeURIComponent(location));
  if (params.length) url += "&" + params.join("&");
  window.location.href = url;
});

document.querySelectorAll(".landing-hero__tag").forEach(tag => {
  tag.addEventListener("click", () => {
    document.getElementById("heroSearchJob").value = tag.textContent;
  });
});

const nav = document.querySelector(".landing-nav");
if (nav) {
  window.addEventListener("scroll", () => {
    nav.classList.toggle("landing-nav--scrolled", window.scrollY > 20);
  });
}