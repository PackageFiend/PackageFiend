// Dropdown for multiple tracking numbers
const collapsible = document.querySelector('.collapsible_header');
collapsible.addEventListener("click", event => {
  if (data.length <= 1) return;
  collapsible.classList.toggle('active');
  const nums = document.querySelector('.collapsible_list');
  nums.classList.toggle('add_auto_height');
});

$(document).ready(() => {
    
    $('.sign_in_button').click(() => {
        window.location = "http://localhost:8080/signin.html";
    });
// Test stuff
    $('.logo').click(() => {
        console.log(data);
    });
    
    /* Travel Bar slider animation */
    $('.travel_time_bar').hover(() => {
      $('.bar_road_time').css("min-width", "375px");
      $('.bar_idle_time').css("min-width", "375px");
      $('.bar_info').css("visibility", "visible");
    }, () => {
      $('.bar_road_time').css("min-width", "20px");
      $('.bar_idle_time').css("min-width", "20px");
      $('.bar_info').css("visibility", "hidden");
    });


  // Log out
  $('.logout_button').click(() => {
    delete localStorage.pkgfnd_name;
    delete localStorage.pkgfnd_token;

    $('.sign_in_box').empty();
  });

});

// Map settings
let mymap = L.map('map').setView([39.8283, -98.5795], 3);

const tlayer = L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=fEH52Z1zwyyCZ7gf1vZA', {
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
});

tlayer.addTo(mymap);

//const Amishtown = L.marker([40.0379, -76.3055]).addTo(mymap);
//const circle = L.circle([])

