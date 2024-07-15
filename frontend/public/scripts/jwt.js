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

// function handleLogin({ email, password }) {
//   // Call login method in API
//   // The server handler is responsible for setting user fingerprint cookie during this as well
//   const { jwtToken, refreshToken } = await login({ email, password })
//   setJwtToken(jwtToken)
//   setRefreshToken(refreshToken)

//   // If you like, you may redirect the user now
//   Router.push("/some-url")
// }