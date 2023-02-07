const todayEl = $("#today");
const forecastEl = $("#forecast");
let forcastData = []; // array stores 5 days forcast
let cityName = "";
let geoCoord = {}; // stores the lat & lon
let currentWeatherData = {};

// show error message modal
function showErrorMsg(errorCode, errorMsg) {
  // hide the weather information sections
  todayEl.css("display", "none");
  forecastEl.css("display", "none");

  $("#error-code").text("Error: "+errorCode);
  $("#error-msg").text(errorMsg);
  $(".modal").modal({show:true});
  console.log(errorMsg);
  // alert(errorMsg);

}

// return an icon URL for img tag
function getIconURL(icon) {
  return "http://openweathermap.org/img/w/" + icon + ".png";
}

// show weather information in "today" and "forcast" sections 
function showWeather() {
  // show current weather data
  $("#city-name").text(cityName + " ("+currentWeatherData.date+") ");
  let img = $('<img>');
  img.attr('src', currentWeatherData.iconLink);
  $("#city-name").append(img);
  $("#temp").text("Temperture: "+currentWeatherData.temp);
  $("#wind").text("Wind speed: "+currentWeatherData.windSpeed);
  $("#humidity").text("Humidity: "+currentWeatherData.humidity);
  todayEl.css("display", "block");

  // show 5-day forecast data
  forcastData.forEach((cityObj, i) => {
    $("#card-date"+i).text(cityObj.date);

    img = $('<img>');
    img.attr('src', cityObj.iconLink);
    $("#card-icon"+i).empty();
    $("#card-icon"+i).append(img);    
    $("#card-temp"+i).text(cityObj.temp);
    $("#card-wind"+i).text(cityObj.windSpeed);
    $("#card-humidity"+i).text(cityObj.humidity);
  });

  forecastEl.css("display", "block");

}


function getGeoCoord(cityName) {

  // geographical coordinates API query URL
  const gcQueryURL = "http://api.openweathermap.org/geo/1.0/direct?q="+cityName+"&appid=e7b6ba243587870fcc4406f2a4ca1ee9";

  // get geographical coordinates of the city
  $.ajax({
    url: gcQueryURL,
    method: "GET"
  }).then(function(response) { 

    // console.log(JSON.stringify(response));
    // console.log("status: "+response.Status); 

    if (response == "" || response[0].lat == undefined || response[0].lon == undefined) {
      showErrorMsg("002", "Sorry, city not found.");
      return;
    }

    // store the geographical coordinates to the city object
    geoCoord.lat = response[0].lat;
    geoCoord.lon = response[0].lon;

    getCurrentWeatherData();

  })
}

// get 5-day forecast data from api.openweathermap.org
function getWeatherData() {
  // Open Weather Map API query URL
  const owmQueryURL = "https://api.openweathermap.org/data/2.5/forecast?lat="+geoCoord.lat+"&lon="+geoCoord.lon+"&units=metric&appid=e7b6ba243587870fcc4406f2a4ca1ee9";

  $.ajax({
    url: owmQueryURL,
    method: "GET"
  }).then(function(response) { 

    // console.log(response);

    if (response == "" || response.list  === undefined) {
      showErrorMsg("003", "Sorry, city not found.");
      return;
    }  

    // Only get the forcast data at time "00:00:00"
    let city = {};

    for (let i=7; i<response.list.length; i+=8) {

      city = {}; // init city object
      let list = response.list[i];

      // console.log("City name:"+ response.city.name);

      city.date = moment.unix(list.dt).format("DD-MMM-YYYY"); // convert unix timestamp to readable date format
      city.iconLink = getIconURL(list.weather[0].icon);
      city.temp = list.main.temp;
      city.humidity = list.main.humidity;
      city.windSpeed = list.wind.speed;

      forcastData.push(city); // add city object to forcast array

      // console.log(forcastData);
    }

    showWeather();

  });
}

function getCurrentWeatherData() {

  // geographical coordinates API query URL
  const gcQueryURL = "https://api.openweathermap.org/data/2.5/weather?lat="+geoCoord.lat+"&lon="+geoCoord.lon+"&units=metric&appid=e7b6ba243587870fcc4406f2a4ca1ee9";

  // get geographical coordinates of the city
  $.ajax({
    url: gcQueryURL,
    method: "GET"
  }).then(function(response) { 

    // console.log(JSON.stringify(response));

    if (response == "") {
      showErrorMsg("003","Sorry, city not found.");
      return;
    }

    // store current weather to currentWeatherData object
    currentWeatherData.date = moment.unix(response.dt).format("DD-MMM-YYYY"); // convert unix timestamp to readable date format
    currentWeatherData.iconLink = getIconURL(response.weather[0].icon);
    currentWeatherData.temp = response.main.temp;
    currentWeatherData.humidity = response.main.humidity;
    currentWeatherData.windSpeed = response.wind.speed;
    console.log("date:"+currentWeatherData.date);

    getWeatherData();

  });

}

// handling the search city action
$("#search-button").on("click", function(event) {
  // Preventing the submit button from trying to submit the form
  event.preventDefault();

    // Here we grab the text from the input box
    cityName = $("#search-input").val().trim();

    if (cityName === "") {
      showErrorMsg("001","Please enter a city name to search.");
      return;
    }

    forcastData = []; // init forcastData array
    getGeoCoord(cityName);

});
