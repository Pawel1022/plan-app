const sidebar = document.querySelector('.app__sidebar')
const inputType = document.querySelector('.form__input--type')
const inputDuration = document.querySelector('.form__input--duration')
const inputDistance = document.querySelector('.form__input--distance')
const inputElevation = document.querySelector('.form__input--elev')
const inputCadence = document.querySelector('.form__input--cadence')
const sendFormBtn = document.querySelector('.form__btn')
const list = document.querySelector('.workouts__list')
const handlerBtn = document.querySelector('.app__btn')

class App {
	#map
	#mapZoom = 13
	#mapEvent
	#workouts = []
	constructor() {
		this._getCurrentPostion()
		inputType.addEventListener('change', this._changeInputField)
		sendFormBtn.addEventListener('click', this._addNewWorkout.bind(this))
		handlerBtn.addEventListener('click', this._showSideBar.bind(this))
		list.addEventListener('click', this._findWorkout.bind(this))
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
		const { latitude, longitude } = postion.coords

		this.#map = L.map('map', { zoomControl: false }).setView([latitude, longitude], this.#mapZoom)

		new L.Control.Zoom({ position: 'topright' }).addTo(this.#map)

		L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(this.#map)

		this.#map.on('click', this._showSideBar.bind(this))
	}

	_showSideBar(mapE) {
		sidebar.classList.toggle('app__sidebar--hidden')
		handlerBtn.classList.toggle('app__btn--active')

		if (!mapE) return
		this.#mapEvent = mapE
		inputDuration.focus()
	}

	_hideSideBar() {
		sidebar.classList.add('app__sidebar--hidden')
		inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = ''
		handlerBtn.classList.remove('app__btn--active')
	}

	_changeInputField() {
		if (inputType.value === 'Skiing' || inputType.value === 'Cycling') {
			inputElevation.closest('.form__row').classList.add('form__row--active')
			inputCadence.closest('.form__row').classList.remove('form__row--active')
		}

		if (inputType.value === 'Running' || inputType.value === 'Walking') {
			inputElevation.closest('.form__row').classList.remove('form__row--active')
			inputCadence.closest('.form__row').classList.add('form__row--active')
		}
	}

	_renderPopupMarker(workout) {
		L.marker(workout.coords)
			.addTo(this.#map)
			.bindPopup(
				L.popup({
					maxWidth: 200,
					minWidth: 100,
					autoClose: false,
					closeOnClick: false,
					className: `app__popup`,
				})
			)
			.openPopup()
			.setPopupContent(`${workout.desc}`)
	}

	_renderWorkoutEl(workout) {
		const html = `<li data-id="${
			workout.id
		}" class="workout workouts__item workouts__item--${workout.type.toLowerCase()}">
		<h2 class="workouts__title">${workout.desc}</h2>

		<div class="workouts__details">
			<span class="workouts__icon">🏃</span>
			<span class="workouts__value">${workout.distance}</span>
			<span class="workouts__unit">KM</span>
		</div>
		<div class="workouts__details">
			<span class="workouts__icon">⏱️</span>
			<span class="workouts__value">${workout.duration}</span>
			<span class="workouts__unit">MIN</span>
		</div>
		
		${
			workout.type === 'Running' || workout.type === 'Walking'
				? `<div class="workouts__details">
		<span class="workouts__icon">⚡️</span>
		<span class="workouts__value">${workout.pace}</span>
		<span class="workouts__unit">MIN/KM</span>
	</div>
	<div class="workouts__details">
		<span class="workouts__icon">👣</span>
		<span class="workouts__value">${workout.cadence.toFixed(1)}</span>
		<span class="workouts__unit">SPM</span>
	</div>`
				: `<div class="workouts__details">
				<span class="workouts__icon">⚡️</span>
				<span class="workouts__value">${workout.speed.toFixed(1)}</span>
				<span class="workouts__unit">MIN/KM</span>
			</div>
			<div class="workouts__details">
				<span class="workouts__icon">🏔️</span>
				<span class="workouts__value">${workout.elevationGain}</span>
				<span class="workouts__unit">M</span>
			</div>`
		}

	</li>`

		list.insertAdjacentHTML('beforeend', html)
		this._storeWorkouts(workout)
	}

	_addNewWorkout(e) {
		e.preventDefault()

		const inputIsFinate = (...inputs) => {
			inputs.every(inp => isFinite(inp))
		}

		const allPositive = (...inputs) => inputs.every(inp => inp > 0)

		const checking = () => {
			if (inputType.value === 'Cycling' || inputType.value === 'Skiing') {
				const elevation = +inputElevation.value

				if (!inputIsFinate(duration, distance, elevation) && !allPositive(duration, distance))
					return alert('Inputs must be correct!')
				else return elevation
			}

			if (inputType.value === 'Running' || inputType.value === 'Walking') {
				const cadence = +inputCadence.value

				if (!inputIsFinate(duration, distance, cadence) && !allPositive(duration, distance, cadence))
					return alert('Inputs must be correct!')
				else return cadence
			}
		}

		const adding = el => {
			this.#workouts.push(el)
			console.log(this.#workouts)
		}

		let workout
		const duration = +inputDuration.value
		const distance = +inputDistance.value
		const alt = checking()

		if (!alt) return

		const { lat, lng } = this.#mapEvent.latlng
		const coords = [lat, lng]

		if (inputType.value === 'Running') {
			workout = new Running(coords, duration, distance, alt)
			adding(workout)
		}
		if (inputType.value === 'Walking') {
			workout = new Walking(coords, duration, distance, alt)
			adding(workout)
		}
		if (inputType.value === 'Skiing') {
			workout = new Skiing(coords, duration, distance, alt)
			adding(workout)
		}
		if (inputType.value === 'Cycling') {
			workout = new Cycling(coords, duration, distance, alt)
			adding(workout)
		}

		// hidde form and clear inputs
		this._hideSideBar()

		// renderMarker and Popup
		this._renderPopupMarker(workout)

		// render workout on list

		this._renderWorkoutEl(workout)
	}

	_findWorkout(e) {
		const workoutEl = e.target.closest('li')

		if (!workoutEl) return

		const workout = this.#workouts.find(el => el.id === workoutEl.dataset.id)

		this.#map.setView(workout.coords, this.#mapZoom, {
			animate: true,
			pan: {
				duration: 1,
			},
		})

		this._hideSideBar()
	}

	_storeWorkouts(workout){
		localStorage.setItem('workout',JSON.stringify(workout))
	}

	
}

class Workout {
	date = new Date()
	id = Date.now() + ''.slice(-10)
	constructor(coords, duration, distance) {
		this.coords = coords
		this.duration = duration
		this.distance = distance
	}

	calcPace() {
		this.pace = this.duration / this.distance
		return this.pace
	}

	calcSpeed() {
		this.speed = this.distance / (this.duration / 60)
		return this.speed
	}

	setDescription() {
		const months = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December',
		]
		this.desc = `${this.icon} ${this.type} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
		return this.desc
	}
}

class Walking extends Workout {
	type = 'Walking'
	icon = '🚶‍♂️'
	constructor(coords, duration, distance, cadence) {
		super(coords, duration, distance)
		this.cadence = cadence
		this.calcPace()
		this.setDescription()
	}
}

class Running extends Workout {
	type = 'Running'
	icon = '🏃‍♂️'
	constructor(coords, duration, distance, cadence) {
		super(coords, duration, distance)
		this.cadence = cadence
		this.calcPace()
		this.setDescription()
	}
}

class Skiing extends Workout {
	type = 'Skiing'
	icon = '⛷️'
	constructor(coords, duration, distance, elevationGain) {
		super(coords, duration, distance)
		this.elevationGain = elevationGain
		this.calcSpeed()
		this.setDescription()
	}
}
class Cycling extends Workout {
	type = 'Cycling'
	icon = '🚴‍♀️'
	constructor(coords, duration, distance, elevationGain) {
		super(coords, duration, distance)
		this.elevationGain = elevationGain
		this.calcSpeed()
		this.setDescription()
	}
}

const app = new App()
