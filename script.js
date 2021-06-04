// Constantes
const clienId = ''
const redirectURI = 'http://localhost:5500/javascript-spotify/'
let accessToken = null
let userId = null

// Sélecteurs
const addbuttons = document.querySelectorAll('#result-section button')
const ulPlaylist = document.querySelector('#playlist-section ul')
const connectBtn = document.getElementById('connect-spotify')
const searchBtn = document.getElementById('search-button')
const searchInput = document.getElementById('search')
const ulResult = document.querySelector('#result-section ul')
const saveBtn = document.getElementById('save')

// Ajout d'une musique
const addToPlaylist = (button) => {
	const li = document.createElement('li')
	li.setAttribute("data-uri", button.dataset.id)
	const liText = document.createTextNode(`${button.dataset.song} - ${button.dataset.artist}`)
	li.append(liText)
	const deleteButton = document.createElement('button')
	// Suppression d'une musique
	deleteButton.addEventListener('click', () => {
		li.remove()
	})
	const btnText = document.createTextNode('Supprimer')
	deleteButton.append(btnText)
	li.append(deleteButton)
	ulPlaylist.append(li)
}
// Connexion à spotify
connectBtn.addEventListener('click', () => {
	window.location = `https://accounts.spotify.com/authorize?client_id=${clienId}&response_type=token&redirect_uri=${redirectURI}&scope=playlist-modify-public`
})

// Création de la fonction qui me permet de récupérer l'accesToken

const getAccessToken = () => {
	const accessTokenMatch = window.location.hash.match(/(?<=access_token=)([^&]*)/)
	console.log(accessTokenMatch)
	if (accessTokenMatch) {
		accessToken = accessTokenMatch[0]
	}
}

getAccessToken()

const getUserId = async () => {
	const response = await fetch('https://api.spotify.com/v1/me', {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			Accept: 'application/json',
			'Content-Type': 'application/json',
		}
	})
	const data = await response.json()
	userId = data.id
	return data.id
}

const searchSong = () => {
	const searchedMusic = searchInput.value
	const options = {
		method: "GET",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${accessToken}`,
		},
	}
	console.log(accessToken)
	fetch(`https://api.spotify.com/v1/search?q=${searchedMusic}&type=track`, options)
		.then(response => response.json())
		.then(data => {
			console.log(data)
			data.tracks.items.forEach(song => createResultLI(song))
		})
}

const createResultLI = (songInfo) => {
	const newLi = document.createElement('li')
	const newBtn = document.createElement('button')
	const liText = document.createTextNode(`${songInfo.name} - ${songInfo.artists[0].name}`)
	newBtn.setAttribute('data-id', songInfo.id)
	newBtn.setAttribute('data-song', songInfo.name)
	newBtn.setAttribute('data-artist', songInfo.artists[0].name)
	newBtn.textContent = 'Ajouter'
	newBtn.addEventListener('click', () => addToPlaylist(newBtn))
	newLi.append(liText)
	newLi.append(newBtn)
	ulResult.append(newLi)
}

const getURIs = () => {
	const listLi = document.querySelectorAll('#playlist-section ul li')
	const uris = []
	listLi.forEach(li => {
		uris.push(`spotify:track:${li.dataset.uri}`)
	})
	return uris
}

searchBtn.addEventListener('click', searchSong)

saveBtn.addEventListener('click', async () => {
	if (userId === null) {
		await getUserId()
	}
	const options = {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${accessToken}`,
		},
		body: JSON.stringify({
			"name": "New Playlist",
			"description": "New playlist description",
			"public": true
		})
	}
	const createPlaylistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, options)
	const createPlaylistData = await createPlaylistResponse.json()
	const playlistId = createPlaylistData.id

	const optionsItemsPlaylist = {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${accessToken}`,
		},
		body: JSON.stringify({
			uris: getURIs()
		})
	}

	const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, optionsItemsPlaylist)
	const data = await res.json()
	console.log(data)
})
