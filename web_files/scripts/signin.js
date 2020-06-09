// Dropdown for multiple tracking numbers
const collapsible = document.querySelector('.current_displayed_collapsible');
collapsible.addEventListener("click", event => {
    collapsible.classList.toggle('active');
    const nums = document.querySelector('.additional_track_nums');
    nums.classList.toggle('add_auto_height');
});

// Map settings
let mymap = L.map('map').setView([39.8283, -98.5795], 3);
        
L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=fEH52Z1zwyyCZ7gf1vZA', {
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
}).addTo(mymap);

const Amishtown = L.marker([40.0379, -76.3055]).addTo(mymap);
const circle = L.circle([])