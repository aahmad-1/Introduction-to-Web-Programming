const cityInput = document.querySelector('.city-input');
const latInput = document.querySelector('.lat-input');
const lonInput = document.querySelector('.lon-input');

const userLocationButton = document.querySelector('.location-btn');
const searchButton = document.querySelector('.search-btn');
const coordinatesButton = document.querySelector('.coordinates-btn');

const celsiusButton = document.querySelector('.celsius-btn');
const fahrenheitButton = document.querySelector('.fahrenheit-btn');
const kelvinButton = document.querySelector('.kelvin-btn');

const forecastTitle = document.querySelector('.forecast-title');
const favoritesButton = document.querySelector('.favorites-btn');
const dailyButton = document.querySelector('.daily-btn');
const hourlyButton = document.querySelector('.hourly-btn');

const changeBackgroundButton = document.querySelector('.change-background-btn');

const currentWeatherDiv = document.querySelector('.current-weather');
const dailyWeatherCardsDiv = document.querySelector('.weather-cards');
const hourlyWeatherCardsDiv = document.querySelector('.hourly-weather-cards');
const dailyForecastDiv = document.querySelector('.daily-forecast');
const hourlyForecastDiv = document.querySelector('.hourly-forecast');
const favoritesListDiv = document.querySelector('.favorites-list');
const favoriteLocationsList = document.querySelector('.favorite-locations');

let currentTempUnit = 'celsius';
let currentCityName = ''; 
let currentLat = null;
let currentLon = null;
let currentWeatherView = 'hourly';
let favoriteLocations = [];
let isWeatherBackground = false;
let currentWeatherData = null;

const API_KEY = '7572b5fbf535d95745474fe2a0f77816';

const convertTemp = (temp, unit) => {
    if (unit == 'kelvin'){
        return (temp + 273.15).toFixed(2);
    } else if (unit == 'fahrenheit') {
        return ((temp * 9/5) + 32).toFixed(2);
    } else {
      return temp.toFixed(2);
    }
}

const changeBackground = (weatherData) => {
    const weatherConditionIcon = weatherData.weather[0].icon;
    const bodyElement = document.body;

    let backgroundImage = '';

    if (weatherConditionIcon === '01d') {
        backgroundImage = 'backgrounds/clear_sky_day.jpg';
    } else if (weatherConditionIcon === '01n') {
        backgroundImage = 'backgrounds/clear_sky_night.jpg';
    } else if (weatherConditionIcon == '02d') {
        backgroundImage = 'backgrounds/few_clouds_day.jpg';
    } else if (weatherConditionIcon == '02n') {
        backgroundImage = 'backgrounds/few_clouds_night.jpg';
    } else if (weatherConditionIcon == '03d') {
        backgroundImage = 'backgrounds/scattered_clouds_day.jpg';
    } else if (weatherConditionIcon == '03n') {
        backgroundImage = 'backgrounds/scattered_clouds_night.jpg';
    } else if (weatherConditionIcon == '04d') {
        backgroundImage = 'backgrounds/broken_clouds_day.jpg';
    } else if (weatherConditionIcon == '04n') {
        backgroundImage = 'backgrounds/broken_clouds_night.jpg';
    } else if (weatherConditionIcon == '09d' || weatherConditionIcon == '09n') {
        backgroundImage = 'backgrounds/shower_rain.jpg';
    } else if (weatherConditionIcon == '10d') {
        backgroundImage = 'backgrounds/rain_day.jpg';
    } else if (weatherConditionIcon == '10n') { 
        backgroundImage = 'backgrounds/rain_night.jpg';
    } else if (weatherConditionIcon == '11d' || weatherConditionIcon == '11n') {
        backgroundImage = 'backgrounds/thunderstorm.jpg';
    } else if (weatherConditionIcon == '13d') {
        backgroundImage = 'backgrounds/snow_day.jpg';
    } else if (weatherConditionIcon == '13n') {
        backgroundImage = 'backgrounds/snow_night.jpg';
    } else if (weatherConditionIcon == '50d' || weatherConditionIcon == '50n') {
        backgroundImage = 'backgrounds/mist.jpg';         
    } else {
        return;
    }

    if (backgroundImage) {
        bodyElement.style.backgroundImage = `url(${backgroundImage})`;
        bodyElement.style.backgroundSize = 'cover';
        bodyElement.style.backgroundPosition = 'center';
        isWeatherBackground = true;
        updateChangeBackgroundButton();
    }
}

const changeBackgroundToDefault = () => {
    const bodyElement = document.body;
    bodyElement.style.backgroundImage = '';
    bodyElement.style.backgroundColor = '#E3F2FD';
    isWeatherBackground = false;
    updateChangeBackgroundButton();
}

const updateChangeBackgroundButton = () => {
    if (isWeatherBackground) {
        changeBackgroundButton.textContent = 'Change background to default';
    } else {
        changeBackgroundButton.textContent = 'Change background to reflect weather';
    }
}

const toggleBackground = () => {
    if (isWeatherBackground) {
        changeBackgroundToDefault();
    } else {
        if (currentWeatherData) {
            changeBackground(currentWeatherData);
        }
    }
}

const isLocationFavorited = (locationName) => {
    for (let i = 0; i < favoriteLocations.length; i++) {
        if (favoriteLocations[i] === locationName) {
            return true;
        }
    }
    return false;
}

const toggleFavoriteLocation = (locationName) => {
    if (isLocationFavorited(locationName)) {
        favoriteLocations = favoriteLocations.filter(name => name !== locationName);
    } else {
        favoriteLocations.push(locationName);
    }
    updateFavoriteIcon(locationName);
    updateFavoritesList();
}

const updateFavoriteIcon = (locationName) => {
    const favoriteIcon = document.querySelector('.favorite-icon');
    if (favoriteIcon) {
        if (isLocationFavorited(locationName)) {
            favoriteIcon.src = 'assets/favorite.png';
        } else {
            favoriteIcon.src = 'assets/unfavorite.png';
        }
    }
}

const updateFavoritesList = () => {
    favoriteLocationsList.innerHTML = '';
    
    if (favoriteLocations.length === 0) {
        alert('No locations have been favorited.');
        return;
    }
    
    favoriteLocations.forEach(locationName => {
        const listItem = document.createElement('li');
        listItem.className = 'favorite-item';
        listItem.innerHTML = `
            <span class="location-name">${locationName}</span>
            <button class="check-weather-btn" onclick="checkWeatherFromFavoritesList('${locationName}')">Check Weather</button>
        `;
        favoriteLocationsList.appendChild(listItem);
    });
}

const checkWeatherFromFavoritesList = (locationName) => {
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${locationName}&limit=1&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL)
        .then(response => response.json())
        .then(data => {
            if(!data.length) {
                alert(`No coordinates found for ${locationName}`);
                return;
            }

            const name = data[0].name;
            const lat = data[0].lat;
            const lon = data[0].lon;
            
            currentWeatherView = 'hourly';
            updateWeatherViewButtons();
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            alert('An error occurred while fetching the coordinates. Please try again.');
        });
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
    } else if (currentTempUnit === 'fahrenheit') {
        tempUnitSymbol = '°F';
    } else {
        tempUnitSymbol = '°K';
    }

    let favoriteIcon;

    if (isLocationFavorited(cityName)) {
        favoriteIcon = 'assets/favorite.png';
    } else {
        favoriteIcon = 'assets/unfavorite.png';
    }

    return `<div class="details">
                <h2>${cityName} (${formattedDate})
                    <img src="${favoriteIcon}" class="favorite-icon" onclick="toggleFavoriteLocation('${cityName}')">
                </h2>
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
    } else if (currentTempUnit === 'fahrenheit') {
        tempUnitSymbol = '°F';
    } else {
        tempUnitSymbol = '°K';
    }

    if(index === 0) {   //index 0 is for todays weather. 
        return '';      // However, we already have it in the current weather card using the "Current Weather Data" api. 
                        // I noticed the "Current Weather Data" api gives a more accurate data for the current day
                        // compared to the current day of the "Daily Forecast 16 day" api . 
        
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
    } else if (currentTempUnit === 'fahrenheit') {
        tempUnitSymbol = '°F';
    } else {
        tempUnitSymbol = '°K';
    }

    return `<li class="hourly-card">
                <h4>${time}</h4>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                <h5 class="weather-description">${weatherItem.weather[0].description}</h5> <h4>${temperature}${tempUnitSymbol}</h4>
                <p>Wind: ${weatherItem.wind.speed} M/S</p>
                <p>Humidity: ${weatherItem.main.humidity}%</p>
            </li>`
}


const getWeatherDetails = (name, lat, lon) => {

    currentCityName = name;
    currentLat = lat;
    currentLon = lon;

    const CURRENT_WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;    
    const DAILY_WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=8&appid=${API_KEY}&units=metric`;
    const HOURLY_WEATHER_API_URL = `https://pro.openweathermap.org/data/2.5/forecast/hourly?lat=${lat}&lon=${lon}&appid=${API_KEY}&cnt=24&units=metric`;

        cityInput.value = "";
        currentWeatherDiv.innerHTML = ""; 
        dailyWeatherCardsDiv.innerHTML = "";
        hourlyWeatherCardsDiv.innerHTML = "";

    fetch(CURRENT_WEATHER_API_URL)
        .then(response => response.json())
        .then(currentData => {
            console.log(currentData); //show current weather for city in console
            currentWeatherData = currentData;
            currentWeatherDiv.insertAdjacentHTML('beforeend', createCurrentWeatherCard(name, currentData));
            if (isWeatherBackground) {
                changeBackground(currentData);
            }
        })
        .catch(() => {
            alert('An error occurred while fetching the current forecast data. Please try again.');
        });


    fetch(DAILY_WEATHER_API_URL)
        .then(response => response.json())
        .then(dailyData => {
            //console.log(dailyData); //show 7 days forecast for location in console
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
            console.log(hourlyData); //show hourly forecast for location in console
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

const getLocationByCoordinates = () => {
    const lat = parseFloat(latInput.value.trim());
    const lon = parseFloat(lonInput.value.trim());

    if(!lat || !lon) {
        alert('Please enter valid latitude and longitude values.');
        return;
    }

    if (lat < -90 || lat > 90) {
        alert('Latitude must be between -90 and 90 degrees.');
        return;
    }

    if (lon < -180 || lon > 180) {
        alert('Longitude must be between -180 and 180 degrees.');
        return;
    }

    const REVERSE_GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
    
    fetch(REVERSE_GEOCODING_API_URL)
        .then(response => response.json())
        .then(data => {
            //console.log(data); //find where their city name is stored
            let name;
            if(!data.length) {
                name = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
            } else {
                name = data[0].name;
            }
            
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            alert('An error occurred while fetching the location data. Please try again.');
        });

}

const getUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            //console.log(position); //show user location in console and find where the lat and lon are stored
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const REVERSE_GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(REVERSE_GEOCODING_API_URL)
                .then(response => response.json())
                .then(data => {
                    //console.log(data); //find where their city name is stored
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
    fahrenheitButton.classList.remove('active');
    kelvinButton.classList.remove('active');
  
    if (currentTempUnit === 'celsius') {
        celsiusButton.classList.add('active');
    } else if (currentTempUnit === 'fahrenheit') {
        fahrenheitButton.classList.add('active');
    } else {
        kelvinButton.classList.add('active');
    }

    if (currentCityName && currentLat !== null && currentLon !== null) {
        getWeatherDetails(currentCityName, currentLat, currentLon);
    }
}

const updateWeatherViewButtons = () => {
    favoritesButton.classList.remove('active');
    dailyButton.classList.remove('active');
    hourlyButton.classList.remove('active');

    if (currentWeatherView === 'favorites') {
        favoritesButton.classList.add('active');
        dailyForecastDiv.style.display = 'none';
        hourlyForecastDiv.style.display = 'none';
        favoritesListDiv.style.display = 'block';
        forecastTitle.textContent = 'Favorite Locations';
        updateFavoritesList();
    } else if (currentWeatherView === 'daily') {
        dailyButton.classList.add('active');
        dailyForecastDiv.style.display = 'block';
        hourlyForecastDiv.style.display = 'none';
        favoritesListDiv.style.display = 'none';
        forecastTitle.textContent = '7-Day Forecast';
    } else {
        hourlyButton.classList.add('active');
        dailyForecastDiv.style.display = 'none';
        hourlyForecastDiv.style.display = 'block';
        favoritesListDiv.style.display = 'none';
        forecastTitle.textContent = '24-Hour Forecast';
    }
}

celsiusButton.addEventListener('click', () => {
    currentTempUnit = 'celsius';
    updateTempUnitButtons();
});

fahrenheitButton.addEventListener('click', () => {
    currentTempUnit = 'fahrenheit';
    updateTempUnitButtons();
});

kelvinButton.addEventListener('click', () => {
    currentTempUnit = 'kelvin';
    updateTempUnitButtons();
});

favoritesButton.addEventListener('click', () => {
    currentWeatherView = 'favorites';
    updateWeatherViewButtons();
});

dailyButton.addEventListener('click', () => {
    currentWeatherView = 'daily';
    updateWeatherViewButtons();
});

hourlyButton.addEventListener('click', () => {
    currentWeatherView = 'hourly';
    updateWeatherViewButtons();
});

changeBackgroundButton.addEventListener('click', toggleBackground);

userLocationButton.addEventListener('click', getUserLocation);
searchButton.addEventListener('click', getCityCoordinates);
coordinatesButton.addEventListener('click', getLocationByCoordinates);

updateWeatherViewButtons();
updateChangeBackgroundButton();