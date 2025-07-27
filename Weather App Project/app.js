const cityInput = document.querySelector('.city-input');

const userLocationButton = document.querySelector('.location-btn');
const searchButton = document.querySelector('.search-btn');

const celsiusButton = document.querySelector('.celsius-btn');
const kelvinButton = document.querySelector('.kelvin-btn');

const forecastTitle = document.querySelector('.forecast-title');
const dailyButton = document.querySelector('.daily-btn');
const hourlyButton = document.querySelector('.hourly-btn');

const currentWeatherDiv = document.querySelector('.current-weather');
const dailyWeatherCardsDiv = document.querySelector('.weather-cards');
const hourlyWeatherCardsDiv = document.querySelector('.hourly-weather-cards');
const dailyForecastDiv = document.querySelector('.daily-forecast');
const hourlyForecastDiv = document.querySelector('.hourly-forecast');

let currentTempUnit = 'celsius';
let currentCityName = ''; 
let currentLat = null;
let currentLon = null;
let currentWeatherView = 'daily';

const API_KEY = '7572b5fbf535d95745474fe2a0f77816';

const convertTemp = (temp, unit) => {
    if (unit == 'kelvin'){
        return (temp + 273.15).toFixed(2);
    } else {
      return temp.toFixed(2);
    }
}

const createCurrentWeatherCard = (cityName, weatherItem) => {
    // Convert the dt data to dt_txt format for a more readable date
    const date = new Date(weatherItem.dt * 1000);
    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const temperature = convertTemp(weatherItem.main.temp, currentTempUnit)
    let tempUnitSymbol;
    if (currentTempUnit === 'celsius') {
        tempUnitSymbol = '°C';
    } else {
        tempUnitSymbol = '°K';
    }

    return `<div class="details">
                <h2>${cityName} (${formattedDate})</h2>
                <h4>Temperature: ${temperature}${tempUnitSymbol}</h4>
                <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </div>  
            <div class="icon">
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                <h4>${weatherItem.weather[0].description}</h4>
            </div>`;    

}

const createDailyWeatherCard = (weatherItem, index) => {
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

    if(index === 0) {   //index 0 is for todays weather. 
        return '';      // However, we already have it in the current weather card using the "Current Weather Data" api. 
                        // I noticed the "Current Weather Data" api gives a more accurate data for the current day
                        // compared to the current day of the "Daily Forecast 16 day" api.
        
    } else { //forecast cards for next 7 days after today
        return `<li class="card">
                    <h3>${formattedDate}</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                    <h4>Temperature: ${temperature}${tempUnitSymbol}</h4>
                    <h4>Wind: ${weatherItem.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.humidity}%</h4>
                </li>`
    }
    
}

const createHourlyWeatherCard = (weatherItem) => {
    const time = weatherItem.dt_txt.split(' ')[1];

    const temperature = convertTemp(weatherItem.main.temp, currentTempUnit);
    let tempUnitSymbol;
    if (currentTempUnit === 'celsius') {
        tempUnitSymbol = '°C';
    } else {
        tempUnitSymbol = '°K';
    }

    return `<li class="hourly-card">
                <h4>${time}</h4>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                <h4>${temperature}${tempUnitSymbol}</h4>
                <p>Wind: ${weatherItem.wind.speed} M/S</p>
                <p>Humidity: ${weatherItem.main.humidity}%</p>
            </li>`
}


const getWeatherDetails = (name, lat, lon) => {

    currentCityName = name;
    currentLat = lat;
    currentLon = lon;

    const DAILY_WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=8&appid=${API_KEY}&units=metric`;
    const CURRENT_WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const HOURLY_WEATHER_API_URL = `https://pro.openweathermap.org/data/2.5/forecast/hourly?lat=${lat}&lon=${lon}&appid=${API_KEY}&cnt=24&units=metric`;

        cityInput.value = "";
        currentWeatherDiv.innerHTML = ""; 
        dailyWeatherCardsDiv.innerHTML = "";
        hourlyWeatherCardsDiv.innerHTML = "";

    fetch(CURRENT_WEATHER_API_URL)
        .then(response => response.json())
        .then(currentData => {
            //console.log(currentData); //show current weather for city in console
            currentWeatherDiv.insertAdjacentHTML('beforeend', createCurrentWeatherCard(name, currentData));
        })
        .catch(() => {
            alert('An error occurred while fetching the current forecast data. Please try again.');
        });


    fetch(DAILY_WEATHER_API_URL)
        .then(response => response.json())
        .then(dailyData => {
            console.log(dailyData); //show 7 days forecast for location in console
            const sevenDayForecast = dailyData.list
            sevenDayForecast.forEach((dailyData, index) => {
                dailyWeatherCardsDiv.insertAdjacentHTML('beforeend', createDailyWeatherCard(dailyData, index));

            });
        })
        .catch(() => {
            alert('An error occurred while fetching the daily forecast data. Please try again.');
        });

    fetch(HOURLY_WEATHER_API_URL)
        .then(response => response.json())
        .then(hourlyData => {
            //console.log(hourlyData); //show hourly forecast for location in console
            const hourlyForecast = hourlyData.list;
            hourlyForecast.forEach((hourlyData) => {
                hourlyWeatherCardsDiv.insertAdjacentHTML('beforeend', createHourlyWeatherCard(hourlyData));
            });
        })
        .catch(() => {
            alert('An error occurred while fetching the hourly forecast data. Please try again.');
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
            //console.log(data); //find where the city name, lat, and lon are in the api response

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

const getUserLocation = () => {
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

const updateWeatherViewButtons = () => {
    dailyButton.classList.remove('active');
    hourlyButton.classList.remove('active');

    if (currentWeatherView === 'daily') {
        dailyButton.classList.add('active');
        dailyForecastDiv.style.display = 'block';
        hourlyForecastDiv.style.display = 'none';
        forecastTitle.textContent = '7-Day Forecast';
    } else {
        hourlyButton.classList.add('active');
        dailyForecastDiv.style.display = 'none';
        hourlyForecastDiv.style.display = 'block';
        forecastTitle.textContent = '24-Hour Forecast';
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

dailyButton.addEventListener('click', () => {
    currentWeatherView = 'daily';
    updateWeatherViewButtons();
});

hourlyButton.addEventListener('click', () => {
    currentWeatherView = 'hourly';
    updateWeatherViewButtons();
});

userLocationButton.addEventListener('click', getUserLocation);
searchButton.addEventListener('click', getCityCoordinates);

updateWeatherViewButtons();