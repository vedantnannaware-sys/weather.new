
// ============================
// ELEMENTS
// ============================
const form = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const weatherVideo = document.getElementById("weather-video");

const cityName = document.getElementById("cityName");
const temp = document.getElementById("temp");
const feels_like = document.getElementById("feels_like");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const weather = document.getElementById("weather");

function setWeatherVideo(file) {

  if (weatherVideo.src.includes(file)) return;

  weatherVideo.style.opacity = "0";

  setTimeout(() => {

    weatherVideo.src = file;
    weatherVideo.load();
    weatherVideo.play().catch(()=>{});

    weatherVideo.style.opacity = "1";

  }, 400);

}

// ============================
// WEATHER FUNCTION
// ============================
async function getWeather(city){

  const apiKey = "5cfbed810b6d4fd398e155443261801";
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=6&aqi=yes`;

  try{

    const response = await fetch(url);

    if(!response.ok){
      throw new Error("City not found");
    }

    const data = await response.json();

    const lat = data.location.lat;
const lon = data.location.lon;

mapFrame.src = `https://www.google.com/maps?q=${lat},${lon}&output=embed`;

const dailyContainer = document.getElementById("daily");
dailyContainer.innerHTML = "";

const days = data.forecast.forecastday;

for(let i = 0; i < days.length; i++){

  const d = days[i];
  const date = new Date(d.date);

  const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

  dailyContainer.innerHTML += `
    <div class="daily-row">
      <span>${dayName}</span>
      <span>${Math.round(d.day.mintemp_c)}° / ${Math.round(d.day.maxtemp_c)}°</span>
    </div>
  `;
  // 🌅 SUNRISE / SUNSET
document.getElementById("sunrise").innerText =
  data.forecast.forecastday[0].astro.sunrise;

document.getElementById("sunset").innerText =
  data.forecast.forecastday[0].astro.sunset;
}

    // ========================
// HOURLY FORECAST (FIXED)
// ========================

const hourlyContainer = document.getElementById("hourly");
hourlyContainer.innerHTML = "";

// current local hour of city
const currentHour = new Date(data.location.localtime).getHours();

const hours = data.forecast.forecastday[0].hour;

for (let i = currentHour; i < currentHour + 8; i++) {

  const h = hours[i % 24]; // safe loop

  const time = new Date(h.time).getHours();

  // simple icon logic
  let icon = "☀️";
  const text = h.condition.text.toLowerCase();

  if (text.includes("rain")) icon = "🌧️";
  else if (text.includes("cloud")) icon = "☁️";
  else if (text.includes("snow")) icon = "❄️";
  else if (time >= 18 || time <= 6) icon = "🌙";

  hourlyContainer.innerHTML += `
    <div class="hour">
      <p>${time}:00</p>
      <span>${icon}</span>
      <p>${Math.round(h.temp_c)}°</p>
    </div>
  `;
}
// AIR QUALITY
const pm25 = data.current.air_quality.pm2_5;

let aqi = 0;
let airText = "";

if (pm25 <= 12) {
  aqi = 50;
  airText = "Good";
}
else if (pm25 <= 35.4) {
  aqi = 100;
  airText = "Moderate";
}
else if (pm25 <= 55.4) {
  aqi = 150;
  airText = "Unhealthy";
}
else if (pm25 <= 150.4) {
  aqi = 200;
  airText = "Very Unhealthy";
}
else {
  aqi = 300;
  airText = "Hazardous";
}

document.getElementById("air-value").innerText = aqi;
document.getElementById("air-text").innerText = airText;
    // ========================
    // MAIN WEATHER
    // ========================
    cityName.innerText = data.location.name;
    temp.innerText = Math.round(data.current.temp_c);
    feels_like.innerText = Math.round(data.current.feelslike_c);
    humidity.innerText = data.current.humidity;
    wind.innerText = Math.round(data.current.wind_kph);
    weather.innerText = data.current.condition.text;

    // ========================
    // VIDEO LOGIC
    // ========================
    const condition = data.current.condition.text.toLowerCase();
    const hour = new Date(data.location.localtime).getHours();

    if(hour >= 18 || hour <= 6){
      setWeatherVideo("night.mp4");
    }
    else if(condition.includes("rain") || condition.includes("drizzle")){
      setWeatherVideo("rain.mp4");
    }
    else if(condition.includes("snow") || condition.includes("drizzle") || condition.includes("Moderate or Heavy snow showers")){
      setWeatherVideo("snow.mp4");
    }
    else if(
      condition.includes("cloud") ||
      condition.includes("overcast") ||
      condition.includes("mist") ||
      condition.includes("fog") ||
      condition.includes("haze")
    ){
      setWeatherVideo("cloudy.mp4");
    }
    else{
      setWeatherVideo("sunny.mp4");
    }

  }
  catch(error){
    console.error(error);
    alert("City not found");
  }

}

// ============================
// SEARCH EVENT
// ============================
form.addEventListener("submit", function(e){

  e.preventDefault();

  const city = cityInput.value.trim();

  if(city === "") return;

  getWeather(city);

  cityInput.value = "";
});

// ============================
// DEFAULT LOAD
// ============================
getWeather("Delhi");