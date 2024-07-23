import { redirect } from "./router.js"

let ALLOWED_PATH = [
	'/', 
	'/ftlogin'
]

export function getJwtToken() {
    return localStorage.getItem("jwtToken")
}

export function setJwtToken(token) {
    localStorage.setItem("jwtToken", token)
}

export function getRefreshToken() {
    return localStorage.getItem("refreshToken")
}

export function setRefreshToken(token) {
    localStorage.setItem("refreshToken", token)
}

export function check_token_exists() {
	let path = window.location.pathname
	// if its login, just let them thru
	if (ALLOWED_PATH.includes(path)) {
		return true
	}

	if (!getJwtToken() && !getRefreshToken()) {
		redirect('/')
		return false
	}
	return true
}

export async function fetchMod(url, request) {
	const jwt_access_token = getJwtToken()
	const jwt_refresh_token = getRefreshToken()

	// if no access and refresh token, user hasnt login
	if (!getJwtToken() && !getRefreshToken()) {
		window.location.href = 'http://localhost:8080/login';
	}

	// verify access token in localStorage
	const response_verify = await fetch('http://localhost:8000/api/token/verify', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({'token' : `${jwt_access_token}`})
	})

	// access token in locallStorage invalid/expired, request new one and sets the new one in localStorage
	if (response_verify.status == 401) {
		console.log("access token invalid/expired, requesting new one using refresh token...")
		const response_refresh = await fetch('http://localhost:8000/api/token/refresh', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({'refresh' : `${jwt_refresh_token}`})
		})
		if (response_refresh.ok) {
			const result = await response_refresh.json();
			setJwtToken(result.access)
			console.log("access token refreshed using refresh token")

		}
	else {
			console.log("access token invalid, refresh token not working, wallahi its over bijoever")
			redirect('/')
			return {}
		}
	};

	// adds access token to header and calls fetch
	if (!request) {
		request = {headers: {}}
	}
	request.headers['Authorization'] = `Bearer ${getJwtToken()}`
	const response = await fetch(url, request)
	return response;
}