const cityInput = document.querySelector('.city-input');

const userLocationButton = document.querySelector('.location-btn');
const searchButton = document.querySelector('.search-btn');
const celsiusButton = document.querySelector('.celsius-btn');
const kelvinButton = document.querySelector('.kelvin-btn');

const currentWeatherDiv = document.querySelector('.current-weather');
const weatherCardsDiv = document.querySelector('.weather-cards');
const hourlyWeatherCardsDiv = document.querySelector('.hourly-weather-cards');

const dailyBtn = document.querySelector('.daily-btn');
const hourlyBtn = document.querySelector('.hourly-btn');
const dailyForecast = document.querySelector('.daily-forecast');
const hourlyForecast = document.querySelector('.hourly-forecast');
const forecastTitle = document.querySelector('.forecast-title');

let currentTempUnit = 'celsius';
let currentCityName = ''; 
let currentLat = null;
let currentLon = null;
let currentView = 'daily'; // Track current view

const API_KEY = '7572b5fbf535d95745474fe2a0f77816';

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

const createHourlyWeatherCard = (weatherItem) => {
    const date = new Date(weatherItem.dt * 1000);
    const time = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true
    });
    const dayMonth = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });

    const temperature = convertTemp(weatherItem.main.temp, currentTempUnit);
    let tempUnitSymbol;
    if (currentTempUnit === 'celsius') {
        tempUnitSymbol = '°C';
    } else {
        tempUnitSymbol = '°K';
    }

    return `<li class="hourly-card">
                <h3>${time}</h3>
                <h4>${dayMonth}</h4>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                <h4>Temp: ${temperature}${tempUnitSymbol}</h4>
                <h4>Wind: ${weatherItem.wind.speed.toFixed(1)} M/S</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </li>`
}

const getWeatherDetails = (name, lat, lon) => {
    currentCityName = name;
    currentLat = lat;
    currentLon = lon;

    if (currentView === 'daily') {
        getDailyForecast(name, lat, lon);
    } else {
        getHourlyForecast(name, lat, lon);
    }
}

const getDailyForecast = (name, lat, lon) => {
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
            alert('An error occurred while fetching the weather data. Please try again.');
        });
}

const getHourlyForecast = (name, lat, lon) => {
    const HOURLY_API_URL = `https://pro.openweathermap.org/data/2.5/forecast/hourly?lat=${lat}&lon=${lon}&appid=${API_KEY}&cnt=24&units=metric`;

    fetch(HOURLY_API_URL)
        .then(response => response.json())
        .then(data => {
            cityInput.value = "";
            hourlyWeatherCardsDiv.innerHTML = ""; // clear previous hourly weather
            
            // Update current weather with first hourly data
            if (data.list && data.list.length > 0) {
                const firstHour = data.list[0];
                const date = new Date(firstHour.dt * 1000);
                const formattedDate = date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
                
                const temperature = convertTemp(firstHour.main.temp, currentTempUnit);
                let tempUnitSymbol = currentTempUnit === 'celsius' ? '°C' : '°K';
                
                currentWeatherDiv.innerHTML = `
                    <div class="details">
                        <h2>${name} (${formattedDate})</h2>
                        <h4>Temperature: ${temperature}${tempUnitSymbol}</h4>
                        <h4>Wind: ${firstHour.wind.speed.toFixed(1)} M/S</h4>
                        <h4>Humidity: ${firstHour.main.humidity}%</h4>
                    </div>  
                    <div class="icon">
                        <img src="https://openweathermap.org/img/wn/${firstHour.weather[0].icon}@2x.png" alt="weather-icon">
                        <h4>${firstHour.weather[0].description}</h4>
                    </div>`;
            }

            console.log(data.list); // show 24 hours forecast in console
            data.list.forEach((weatherItem) => {
                hourlyWeatherCardsDiv.insertAdjacentHTML('beforeend', createHourlyWeatherCard(weatherItem));
            });
        })
        .catch(() => {
            alert('An error occurred while fetching the hourly weather data. Please try again.');
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

const switchView = (view) => {
    currentView = view;
    
    // Update button states
    dailyBtn.classList.remove('active');
    hourlyBtn.classList.remove('active');
    
    if (view === 'daily') {
        dailyBtn.classList.add('active');
        dailyForecast.style.display = 'block';
        hourlyForecast.style.display = 'none';
        forecastTitle.textContent = '7-Day Forecast';
    } else {
        hourlyBtn.classList.add('active');
        dailyForecast.style.display = 'none';
        hourlyForecast.style.display = 'block';
        forecastTitle.textContent = '24-Hour Forecast';
    }
    
    // Refresh data if we have location info
    if (currentCityName && currentLat !== null && currentLon !== null) {
        getWeatherDetails(currentCityName, currentLat, currentLon);
    }
}

// Event listeners
celsiusButton.addEventListener('click', () => {
    currentTempUnit = 'celsius';
    updateTempUnitButtons();
});

kelvinButton.addEventListener('click', () => {
    currentTempUnit = 'kelvin';
    updateTempUnitButtons();
});

dailyBtn.addEventListener('click', () => {
    switchView('daily');
});

hourlyBtn.addEventListener('click', () => {
    switchView('hourly');
});

userLocationButton.addEventListener('click', getUserCoordinates);
searchButton.addEventListener('click', getCityCoordinates);