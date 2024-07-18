// Short duration JWT token (5-10 min)
export function getJwtToken() {
    return localStorage.getItem("jwtToken")
}

export function setJwtToken(token) {
    localStorage.setItem("jwtToken", token)
}

// Longer duration refresh token (30-60 min)
export function getRefreshToken() {
    return localStorage.getItem("refreshToken")
}

export function setRefreshToken(token) {
    localStorage.setItem("refreshToken", token)
}

export function validate_update_token() {
	const jwt_access_token = getJwtToken()
	const jwt_refresh_token = getRefreshToken()
	if (!getJwtToken() || !getRefreshToken()) {
		window.location.href = 'http://localhost:8080/login';
	}

	window.onload = async () => {
		const response_verify = await fetch('http://localhost:8000/api/token/verify', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({'token' : `${jwt_access_token}`})
		})
		if (response_verify.ok) {
			return true;
		}
		else if (response_verify.status == 401) {
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
				return true;
			}
			else {
				console.log("access token invalid, refresh token not working, wallahi its over bijoever")
				return false;
			}
		}
	};
}