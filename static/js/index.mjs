import Codes from './statecodes.mjs';
//import cityData from './jsondata.mjs'; <--was thinking of using this one for a more realistic listing that would get only the most populous city of the given name, but since it includes longitude and latitude I supposed it would defeat the purpose of the exercise
import cityList from './usaCities.mjs';

const key = '0be1783605b341b7ca76fddbe38b9216';

const KtoF =k=> (k-273.15)*(9/5)+32;

pageLoader();

function pageLoader(){
    const butts = document.getElementsByClassName('btn')
    for (let butt of butts){
        butt.addEventListener('click',changeDiv)
    }
    const searchForm = document.querySelector('#find-city-form');
    searchForm.addEventListener('submit',e=>findCity(e));
    const clinks = document.getElementsByClassName('city-link')
    for (let clink of clinks){
        clink.addEventListener('click',geolocateCity(clink.name.split('_')[0],clink.name.split('_')[1]))
    }
}

function changeDiv(e){
    const switchOff = document.getElementsByClassName('is-visible');
    for(let div of switchOff){
        div.classList.replace('is-visible','is-invisible');
    }
    let switchOnTarget = e.target.name;
    const switchOn = document.getElementById(switchOnTarget);
    switchOn.classList.replace('is-invisible','is-visible');
    e.target.classList.add('active')
}

function findCity(event){
    event.preventDefault();
    const cityName = event.target.elements[0].value
    const namePattern = new RegExp(cityName.toLowerCase());
    const cityMatches = cityList.filter(x=>(namePattern.test(x.city.toLowerCase())))
    const cityStates = cityMatches.map(c=>c.state)
    if (cityStates.length > 1){
        document.getElementById('other-cities').innerHTML = ''
        let otherCities = document.createElement('ul')
        document.getElementById('other-cities').appendChild(otherCities)
        for(let i=cityStates.length-1;i>0;i--){
            let otherCity = document.createElement('li')
            otherCity.innerHTML = `Did you mean <a href="#" class="city-link" name="${cityMatches[i].city}_${cityStates[i]}">${cityMatches[i].city}, ${cityStates[i]}</a>?`
            otherCities.appendChild(otherCity)
        }
    }
    geolocateCity(cityName,cityStates[0])
}

function geolocateCity(city,state){
    const stateCode = Codes[state]
    const geocodeurl = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${stateCode},+1&limit=1&appid=${key}`
    fetch(geocodeurl)
    .then(response=>response.json())
    .then(data => getWeather(data[0].lat,data[0].lon))
    .catch(err => console.error(err))
}


function getWeather(lat,lon){
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}`
    fetch(url)
    .then(response=>response.json())
    .then(data => displayWeather(data))
    .catch(err => console.error(err))
}

function displayWeather(data){
    document.getElementById('icon-display').innerHTML=''
    const nametag = document.createElement('div')
    document.getElementById('icon-display').appendChild(nametag)
    nametag.innerText = data.name
    document.getElementById('icon-display').appendChild(nametag)
    const iconbox = document.createElement('div')
    document.getElementById('icon-display').appendChild(iconbox)
    const weathericon = document.createElement('img')
    weathericon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
    iconbox.appendChild(weathericon)
    const conditiontag = document.createElement('div')
    document.getElementById('icon-display').appendChild(conditiontag)
    conditiontag.innerText = data.weather[0].main
    document.getElementById('icon-display').appendChild(conditiontag)
    const temptags = {'temp': 'Now','temp_max': 'High','temp_min':'Low'}
    for(let feature of ['temp','temp_max','temp_min']){
        document.getElementById(feature).innerHTML=''
        const featuretag = document.createElement('div')
        document.getElementById(feature).appendChild(featuretag)
        featuretag.innerText = `${temptags[feature]}: ${KtoF(data.main[feature]).toFixed(2)}`
    }
    document.getElementById('humidity').innerHTML=''
    const humtag = document.createElement('div')
    document.getElementById('humidity').appendChild(humtag)
    humtag.innerText = `Humidity: ${data.main.humidity}`
    
}
