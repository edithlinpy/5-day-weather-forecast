const forecastDiv = $("#forecast");
const forcastData = []; // array stores 5 days forcast
let cityName = "";
let geoCoord = {}; // stores the lat & lon
let currentWeatherData = {};

let errorMsg = "";

function getIconURL(icon) {
  return "http://openweathermap.org/img/w/" + icon + ".png";
}

function showWeather(cityName) {

  console.log(currentWeatherData);
  console.log(currentWeatherData.temp);

  // show current weather data
  $("#city-name").text(cityName + " ("+currentWeatherData.date+") ");
  let img = $('<img>');
  img.attr('src', currentWeatherData.iconLink);
  $("#city-name").append(img);
  $("#temp").text("Temperture: "+currentWeatherData.temp);
  $("#wind").text("Wind speed: "+currentWeatherData.windSpeed);
  $("#humidity").text("Humidity: "+currentWeatherData.humidity);
  console.log("hit here");

  forcastData.forEach(cityObj => {
    console.log("showWeather");
    let cityInfo = `City: ${cityName} ${cityObj.date} ${cityObj.temp} ${cityObj.windSpeed} ${cityObj.humidity}<br/>`;
    $("#today").append(cityInfo);
  });

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

    if (response.Error || response[0].lat === undefined || response[0].lon === undefined) {
      errorMsg = "Sorry, city not found (error: 001).";
      return;
    }

    // store the geographical coordinates to the city object
    geoCoord.lat = response[0].lat;
    geoCoord.lon = response[0].lon;

    getCurrentWeatherData();

  });
}

function getWeatherData() {
  // Open Weather Map API query URL
  const owmQueryURL = "https://api.openweathermap.org/data/2.5/forecast?lat="+geoCoord.lat+"&lon="+geoCoord.lon+"&units=metric&appid=e7b6ba243587870fcc4406f2a4ca1ee9";

  $.ajax({
    url: owmQueryURL,
    method: "GET"
  }).then(function(response) { 

    console.log(response);

    if (response.Error || response.list  === undefined) {
      errorMsg = "Sorry, city not found. (error: 002)";
      return;
    }  

    // Only get the forcast data at time "00:00:00"
    let city = {};

    for (let i=7; i<response.list.length; i+=8) {
      console.log("i:"+i);

      city = {}; // init city object
      let list = response.list[i];

      console.log("City name:"+ response.city.name);

      city.date = moment.unix(list.dt).format("DD-MMM-YYYY"); // convert unix timestamp to readable date format
      city.iconLink = getIconURL(list.weather[0].icon);
      city.temp = list.main.temp;
      city.humidity = list.main.humidity;
      city.windSpeed = list.wind.speed;

      forcastData.push(city); // add city object to forcast array

      console.log(forcastData);
    }

    if (errorMsg === "") {
      console.log("before showWeather");
      showWeather(response.city.name);
    } else {
      // show error message
    }

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

    if (response.Error) {
      errorMsg = "Sorry, city not found (error: 003).";
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
      errorMsg = "Please enter a city name to search.";
      return;
    }

    getGeoCoord(cityName);

});
