const cityInput = document.querySelector('.city-input');

const userLocationButton = document.querySelector('.location-btn');
const searchButton = document.querySelector('.search-btn');
const celsiusButton = document.querySelector('.celsius-btn');
const kelvinButton = document.querySelector('.kelvin-btn');

const currentWeatherDiv = document.querySelector('.current-weather');
const weatherCardsDiv = document.querySelector('.weather-cards');

const API_KEY = '7572b5fbf535d95745474fe2a0f77816';

let currentTempUnit = 'celsius';
let currentCityName = ''; 
let currentLat = null;
let currentLon = null;

const convertTemp = (temp, unit) => {
    if (unit == 'kelvin'){
        return (temp + 273.15).toFixed(2);
    } else {
      return temp.toFixed(2);
    }
}

const createWeatherCard = (cityName, weatherItem, index) => {
    // Convert the dt data to dt_txt format for a more readable date
    const date = new Date(weatherItem.dt * 1000);
    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const temperature = convertTemp(weatherItem.temp.day, currentTempUnit);
    let tempUnitSymbol;
    if (currentTempUnit === 'celsius') {
        tempUnitSymbol = '°C';
    } else {
        tempUnitSymbol = '°K';
    }

    if(index === 0) { //for todays weather
        return `<div class="details">
                        <h2>${cityName} (${formattedDate})</h2>
                        <h4>Temperature: ${temperature}${tempUnitSymbol}</h4>
                        <h4>Wind: ${weatherItem.speed} M/S</h4>
                        <h4>Humidity: ${weatherItem.humidity}%</h4>
                  </div>  
                  <div class="icon">
                        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                        <h4>${weatherItem.weather[0].description}</h4>
                  </div>`;

    } else { //forecast cards for next 7 days
        return `<li class="card">
                    <h3>${formattedDate}</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                    <h4>Temperature: ${temperature}${tempUnitSymbol}</h4>
                    <h4>Wind: ${weatherItem.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.humidity}%</h4>
                </li>`
    }
    
}

const getWeatherDetails = (name, lat, lon) => {

    currentCityName = name;
    currentLat = lat;
    currentLon = lon;

    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=8&appid=${API_KEY}&units=metric`;

    fetch(WEATHER_API_URL)
        .then(response => response.json())
        .then(data => {

            cityInput.value = "";
            currentWeatherDiv.innerHTML = ""; //clear previous weather
            weatherCardsDiv.innerHTML = ""; 

            console.log(data.list); //show 7 days forecast for city in console
            const sevenDayForecast = data.list
            sevenDayForecast.forEach((weatherItem, index) => {
                if(index === 0) {
                    currentWeatherDiv.insertAdjacentHTML('beforeend', createWeatherCard(name, weatherItem, index));
                } else { 
                    weatherCardsDiv.insertAdjacentHTML('beforeend', createWeatherCard(name, weatherItem, index));
                }
            });
        })
        .catch(() => {
            alert('An error occurred while fetching the coordinates. Please try again.');
        });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if(!cityName)
      return;

    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL)
        .then(response => response.json())
        .then(data => {
            console.log(data); //find where the city name, lat, and lon are in the api response

            if(!data.length)
              return alert(`No coordinates found for ${cityName}`);

            const name = data[0].name;
            const lat = data[0].lat;
            const lon = data[0].lon;
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            alert('An error occurred while fetching the coordinates. Please try again.');
        });

}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const REVERSE_GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(REVERSE_GEOCODING_API_URL)
                .then(response => response.json())
                .then(data => {
                    console.log(data); 
                    if(!data.length)
                        return alert(`No coordinates found for this location`);

                    const name = data[0].name;
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(() => {
                    alert('An error occurred while fetching the coordinates. Please try again.');
                });
        },
        error => {
            if(error.code === error.PERMISSION_DENIED) {
                alert('Unable to retrieve your location. Please allow location access and try again.');
            }
        }
    );
};

const updateTempUnitButtons = () => {
    celsiusButton.classList.remove('active');
    kelvinButton.classList.remove('active');
  
    if (currentTempUnit === 'celsius') {
        celsiusButton.classList.add('active');
    } else {
        kelvinButton.classList.add('active');
    }

    if (currentCityName && currentLat !== null && currentLon !== null) {
        getWeatherDetails(currentCityName, currentLat, currentLon);
    }
}

celsiusButton.addEventListener('click', () => {
    currentTempUnit = 'celsius';
    updateTempUnitButtons();
});

kelvinButton.addEventListener('click', () => {
    currentTempUnit = 'kelvin';
    updateTempUnitButtons();
});

userLocationButton.addEventListener('click', getUserCoordinates);
searchButton.addEventListener('click', getCityCoordinates);