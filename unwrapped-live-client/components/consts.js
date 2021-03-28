export const HOME = "http://localhost:3000"
export const JWT_KEY = "unwrapped-live-jwt"
export const API_BASE = "http://localhost:5000"
export const API_AUTH = API_BASE + "/auth"
export const API_GET_DATA = API_BASE + "/data"
export const WRAPPED = "http://localhost:3000/wrapped"
export const POST = "POST"
export const JWT = "jwt"
export const CONTENT_TYPE = "Content-Type"
export const APPLICATION_JSON = "application/json"
export const API_REFRESH = API_BASE + "/refresh"
export const PERSONALIZATION = "personalization"
export const TRACKS = "tracks"
export const ARTISTS = "artists"
export const ALBUM = "album"
export const IMAGES = "images"
export const URL = "url"
export const NAME = "name"
export const PROFILE = "profile"
export const DISPLAY_NAME = "display_name"

export function redirectToHome() {
    window.location.href = HOME
}

