let city = {
  name: "London",
  date: "", //list.dt
  icon: "", //list.weather.icon
  temperature: "", //list.main.temp
  humidity: "", //list.main.humidity
  windSpeed: "" //list.wind.speed
};
let forcastData = []; // array stores 5 days forcast
let errorMsg = "";

 function getIconURL(icon) {
    return "http://openweathermap.org/img/w/" + icon + ".png";
  }

function getWeather(cityName) {

  // geographical coordinates API query URL
  const gcQueryURL = "http://api.openweathermap.org/geo/1.0/direct?q="+cityName+"&appid=e7b6ba243587870fcc4406f2a4ca1ee9";

  // get geographical coordinates of the city
  $.ajax({
    url: gcQueryURL,
    method: "GET"
  }).then(function(response) { 
    console.log("response:");
    console.log(response[0]);
    console.log(response[0].lat);
    console.log(response[0].lon);


    // console.log(JSON.stringify(response));

    if (response.Error || response[0].lat === undefined || response[0].lon === undefined) {
      errorMsg = "Sorry, city not found (error: 001).";
      return;
    }

    // store the geographical coordinates to the city object
    let lat = response[0].lat;
    let lon = response[0].lon;

    // Open Weather Map API query URL
    const owmQueryURL = "https://api.openweathermap.org/data/2.5/forecast?lat="+lat+"&lon="+lon+"&units=metric&appid=e7b6ba243587870fcc4406f2a4ca1ee9";

    $.ajax({
      url: owmQueryURL,
      method: "GET"
    }).then(function(owmResponse) { 
      console.log("owmResponse:");
      console.log(owmResponse);

      if (owmResponse.Error || owmResponse.list  === undefined) {
        errorMsg = "Sorry, city not found. (error: 002)";
        return;
      }  

      // Only get the forcast data at time "00:00:00"
      for (let i=0; i<owmResponse.list.length; i+=8) {
        let list = owmResponse.list[i];

        city.date = moment.unix(list.dt).format("DD-MMM-YYYY"); // convert unix timestamp to readable date format
        city.icon = getIconURL(list.weather.icon);
        city.temperature = list.main.temp;
        city.humidity = list.main.humidity;
        city.windSpeed = list.wind.speed;

        console.log("city:");
        console.log(city);        
        forcastData.push(city); // add city object to forcast array
      }

    });
  });
}

getWeather(city.name);
