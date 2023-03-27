const sidebarBtn = document.querySelector('.app__btn')
const inputType = document.querySelector('.form__input--type')
const inputDuration = document.querySelector('.form__input--duration')
const inputDistance = document.querySelector('.form__input--distance')
const inputElevation = document.querySelector('.form__input--elev')
const sendFormBtn = document.querySelector('.form__btn')
const ma = document.querySelector('#map')

class App {
	#map
    #mapZoom = 13
	constructor() {
		this._getCurrentPostion()
	}

	_getCurrentPostion() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				this._loadMap.bind(this),

				function () {
					alert('Could not get your position !')
				}
			)
		}
	}

	_loadMap(postion) {
		console.log(postion)
        const {latitude,longitude} = postion.coords
        
		this.#map = L.map('map').setView([latitude, longitude], this.#mapZoom)

		L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

		// L.marker([51.5, -0.09]).addTo(this.#map).bindPopup('A pretty CSS3 popup.<br> Easily customizable.').openPopup()
	}
}

const app = new App()
