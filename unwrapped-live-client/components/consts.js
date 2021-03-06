export const HOME = "http://localhost:3000"
export const REDIRECT = HOME + "/redirect"
export const JWT_KEY = "unwrapped-live-jwt"
export const API_BASE = "https://api.unwrapped.live"
export const API_AUTH = API_BASE + "/auth"
export const API_GET_DATA = API_BASE + "/data"
export const WRAPPED = HOME + "/wrapped"
export const POST = "POST"
export const JWT = "jwt"
export const CONTENT_TYPE = "Content-Type"
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

