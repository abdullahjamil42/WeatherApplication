const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion");
const deleteChatButton = document.querySelector("#delete-chat-button");
let userMessage = null;
let isResponseGenerating = false;
const API_KEY = "AIzaSyB54azXsy3PoDiyaXFq7HRyV8RAyv8juXM";  
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

const loadDataFromLocalstorage = () => {
  const savedChats = localStorage.getItem("saved-chats");
  //delete chat
  chatContainer.innerHTML = savedChats || '';
  document.body.classList.toggle("hide-header", savedChats);
  
  chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to  bottom
}

const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
}

// Show typing effect by displaying words one by one
const showTypingEffect = (text, textElement, incomingMessageDiv) => {
  const words = text.split(' ');
  let currentWordIndex = 0;
  
  const typingInterval = setInterval(() => {
     textElement.innerText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];
    incomingMessageDiv.querySelector(".icon").classList.add("hide");
    
     if (currentWordIndex === words.length) {
      clearInterval(typingInterval);
      isResponseGenerating = false;
      incomingMessageDiv.querySelector(".icon").classList.remove("hide");
      localStorage.setItem("saved-chats", chatContainer.innerHTML);  
    }
    chatContainer.scrollTo(0, chatContainer.scrollHeight); 
  }, 75);
}

 const generateAPIResponse = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector(".text"); // Getting text element
  
  try {
     const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        contents: [{ 
          role: "user", 
          parts: [{ text: userMessage }] 
        }] 
      }),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);
    
     const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
    showTypingEffect(apiResponse, textElement, incomingMessageDiv); // Show typing effect
  } catch (error) { // Handle error
    isResponseGenerating = false;
    textElement.innerText = error.message;
    textElement.parentElement.closest(".message").classList.add("error");
  } finally {
    incomingMessageDiv.classList.remove("loading");
  }
}

 const showLoadingAnimation = () => {
  const html = `<div class="message-content">
    <div class = "grid grid-cols-6"> 
      <img class="avatar h-10 col-span-1" src="./resources/gemini.png" alt="Gemini avatar">
      <p class="text overflow-auto text-white col-span-5 bg-gray-400 rounded-xl p-3"></p>
    </div>
    <div class="loading-indicator">
      <div class="loading-bar"></div>
      <div class="loading-bar"></div>
      <div class="loading-bar"></div>
    </div>
  </div>
  <span onClick="copyMessage(this)" class="m-3 icon material-symbols-rounded">content_copy</span>`;
  
  const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
  chatContainer.appendChild(incomingMessageDiv);
  
  chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
  generateAPIResponse(incomingMessageDiv);
}

 const copyMessage = (copyButton) => {
  const messageText = copyButton.parentElement.querySelector(".text").innerText;
  
  navigator.clipboard.writeText(messageText);
  copyButton.innerText = "done";  
  setTimeout(() => copyButton.innerText = "content_copy", 1000);
}

 
const showResponse = (response) => {
  const html = `<div class="message-content">
    <div class = "grid grid-cols-6"> 
      <img class="avatar h-10 col-span-1" src="./resources/gemini.png" alt="Gemini avatar">
      <p class="text overflow-auto text-white col-span-5 bg-gray-400 rounded-xl p-3"></p>
    </div>
  </div>`;
  
  const incomingMessageDiv = createMessageElement(html, "incoming");
  incomingMessageDiv.querySelector(".text").innerText = response;
  chatContainer.appendChild(incomingMessageDiv);
  
  chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
  localStorage.setItem("saved-chats", chatContainer.innerHTML); // Save chats to local storage
}

 const handleOutgoingChat = () => {
  userMessage = typingForm.querySelector(".typing-input").value.trim(); // Get user input
  
  if (!userMessage || isResponseGenerating) return;   
  const html = `<div class="message-content m-4">
    <div class="grid grid-cols-6 justify-between "> 
      <p class="text overflow-auto text-white col-span-5 bg-blue-400 rounded-xl p-3"></p>
      <img class="avatar justify-between w-full rounded-full ml-4" src="./resources/pfp1.jpg" alt="User avatar">
    </div>
  </div>`;
  
  
  const outgoingMessageDiv = createMessageElement(html, "outgoing");
  outgoingMessageDiv.querySelector(".text").innerText = userMessage;
  chatContainer.appendChild(outgoingMessageDiv);
  
  typingForm.reset();  
  document.body.classList.add("hide-header");
  chatContainer.scrollTo(0, chatContainer.scrollHeight);  
  
 
 
  const lowerInput = userMessage.toLowerCase();
  if (lowerInput.includes("highest")) 
  {
    const highestTemperature = weatherData.reduce((max, entry) => {
      return Math.max(max, entry.main.temp);
  }, -Infinity); 
  
  showResponse(`Highest Temperature: ${highestTemperature} °C`);
  } 
  else if (lowerInput.includes("lowest temperature")) 
  {
    const minTemp = Math.min(...weatherData.map(data => data.main.temp_min));
    const response = `The lowest temperature this week is ${minTemp}°C.`;
    showResponse(response);
  }
  else if (lowerInput.includes("average temperature")) 
  {
    const avgTemp = weatherData.reduce((sum, data) => sum + data.main.temp, 0) / weatherData.length;
    const response = `The average temperature this week is ${avgTemp.toFixed(2)}°C.`;
    showResponse(response);
  }
  else if (lowerInput.includes("sort")) 
  {
    const response = `Do you want to sort data in ascending order or in descending order.`;
    showResponse(response);
  }
  
  else if (lowerInput.includes("ascending")) 
  {
    weatherData.sort((a, b) => a.main.temp - b.main.temp);
    displayWeatherData(weatherData); 
    const response = `Sorted by temperature in ascending order.`;
    showResponse(response);
  }
  
  else if (lowerInput.includes("descending")) 
  {
    weatherData.sort((a, b) => b.main.temp - a.main.temp); 
    displayWeatherData(weatherData);  
    const response = `Sorted by temperature in descending temperature.`;
    showResponse(response);
  }
  else if (lowerInput.includes("reset")) 
  {
    weatherData = "";
    weatherData = [...unsortedWeatherData];
    displayWeatherData(weatherData);  
    const response = `Sorted reversed.`;
    showResponse(response);
  }
  else if (lowerInput.includes("no rain")) 
  {
    weatherData = weatherData.filter(entry => 
    !entry.weather[0].description.includes('rain')
    );
    
    displayWeatherData(weatherData);  
    const response = `Rainy days excluded.`;
    showResponse(response);
  }
  
  else
  {
     showLoadingAnimation(); 
  }
}


 

 deleteChatButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all the chats?")) {
    localStorage.removeItem("saved-chats");
    loadDataFromLocalstorage();
  }
});

// Set userMessage and handle outgoing chat when a suggestion is clicked
suggestions.forEach(suggestion => {
  suggestion.addEventListener("click", () => {
    userMessage = suggestion.querySelector(".text").innerText;
    handleOutgoingChat();
  });
});

// Prevent default form submission and handle outgoing chat
typingForm.addEventListener("submit", (e) => {
  e.preventDefault(); 
  handleOutgoingChat();
});


let fahrenheit = false;
let currentTempCelsius;
let currentMaxTempCelsius;
let currentMinTempCelsius;
let currentFeelsLikeCelsius;
const apiKey = 'e64edb040ff3cc7fa8794c5696885649';
const geminiAPIkey ='AIzaSyB54azXsy3PoDiyaXFq7HRyV8RAyv8juXM';
let weatherData = [];
let currentPage = 1; 
const rowsPerPage = 10;
let unsortedWeatherData = [];


const receivedData = localStorage.getItem('sharedData'); 
fetchWeatherDataDefault(receivedData)

document.getElementById('send-message').addEventListener('click', sendMessage);
document.getElementById('City-name').innerText = receivedData || alert('No data received');

function fetchWeatherData() {
  const cityname = document.getElementById('Search').value;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityname}&appid=${apiKey}&units=metric`;
  
  $.ajax({
    url: url,
    method: 'GET',
    success: function(data) {
      const weatherInfo = `Current weather in ${data.name}: ${data.weather[0].description}, ${data.main.temp}°C.`;
      displayMessage(weatherInfo, 'bot');
    },
    error: function(xhr, status, error) {
      console.error('Error fetching weather data:', error);
      displayMessage('Could not fetch weather data. Please try again later.', 'bot');
    }
  });
}
function fetchWeatherDataDefault(receivedData) {
  if (receivedData) {
    $.ajax({
      url: `https://api.openweathermap.org/data/2.5/forecast?q=${receivedData}&appid=${apiKey}&units=metric`,
      method: 'GET',
      success: function(data) {
        $('#City-name').text(receivedData);
        weatherData = data.list; // Store the list of weather data
        unsortedWeatherData =  data.list;
        
        setBlurredBackground(data.list[0].weather[0].main);
        
        displayWeatherData(weatherData);
      },
      error: function() {
        // alert('Failed to retrieve weather data.');
      }
    });
  }
}

function displayWeatherData(weatherDataArray) {
  const tbody = document.getElementById('weather-table-body');
  tbody.innerHTML = '';  
  
  const startIndex = (currentPage - 1) * rowsPerPage;  
  const endIndex = Math.min(startIndex + rowsPerPage, weatherDataArray.length);  

  for (let i = startIndex; i < endIndex; i++) {
    const weather = weatherDataArray[i];
    const date = new Date(weather.dt * 1000).toLocaleString();  
    const temp = (weather.main.temp);
    const humidity = weather.main.humidity;
    const windSpeed = Math.round(weather.wind.speed);
    const description = weather.weather[0].description.charAt(0).toUpperCase() + weather.weather[0].description.slice(1);  
    
    const row = `
    <tr>
      <td class="w-18 text-sm py-2 px-1">${i + 1}</td>
      <td class="text-sm py-2 px-1">${date}</td>
      <td class="text-sm py-2 px-1">${temp}°C</td>
      <td class="text-sm py-2 px-1">${humidity}%</td>
      <td class="text-sm py-2 px-1">${windSpeed} km/h</td>
      <td class="text-sm pl-2 py-2 px-1 no-wrap">${description}</td>
    </tr>
    `;
    tbody.innerHTML += row; // Add the row to the table body
  }
  
  document.getElementById('page-info').textContent = `Page ${currentPage} of ${Math.ceil(weatherDataArray.length / rowsPerPage)}`;
  
  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = currentPage >= Math.ceil(weatherDataArray.length / rowsPerPage);
}


function changePage(direction) {
  currentPage += direction;
  displayWeatherData(weatherData);  
}

function setBlurredBackground(weather) {
  const weatherBackgrounds = {
    "Rain": "./resources/rainy-weather.gif",
    "Snow": "./resources/snowy-weather.gif",
    "Clear": "./resources/sunny-weather.gif",
    "Clouds": "./resources/cloudy-weather.gif",
    "Drizzle": "./resources/drizzle-weather.gif",
    "Mist": "./resources/Mist.gif",
    "Thunderstorm": "./resources/thunderstorm-weather.gif",
    "Fog": "./resources/fog-weather.gif",
    "Smoke": "./resources/smoke.gif",
    "Haze": "./resources/Haze.gif"
  };
  const backgroundImage = weatherBackgrounds[weather] || './resources/background.jpg';
  document.getElementById('blurred-background').style.backgroundImage = `url('${backgroundImage}')`;
  document.getElementById('left-blurred-background').style.backgroundImage = `url('${backgroundImage}')`;
  document.getElementById('main-blurred-background').style.backgroundImage = `url('${backgroundImage}')`;

}




function fetchWeatherDataByCity() {
  const cityname = document.getElementById('Search').value;
  if (cityname) {
    $.ajax({
      url: `https://api.openweathermap.org/data/2.5/forecast?q=${cityname}&appid=${apiKey}&units=metric`,
      method: 'GET',
      success: function(data) {
        $('#City-name').text(cityname.toUpperCase());
        weatherData = data.list;  
        unsortedWeatherData = data.list;
        setBlurredBackground(data.list[0].weather[0].main);  
        displayWeatherData(weatherData);  
        displayCharts(data);  
      },
      error: function() {
        alert('Failed to retrieve weather data.'); 
      }
    });
  } else {
    alert("Please enter a city name");
  }
}


window.onload = fetchWeatherDataDefault;


loadDataFromLocalstorage();
