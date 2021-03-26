package main

import (
	"encoding/json"
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"github.com/gorilla/mux"
	"github.com/pkg/errors"
	"github.com/rs/cors"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const (
	CODE = "code"
	CLIENT_ID = "0fcccb78740a42dab96c20f4ebb9dbae"
	CLIENT_SECRET = "90a72ac119f14b7994b7ed4bb77373bc" // RESET, AND SWITCH TOS ECURE FORM AFTER.
	EXCHANGE_TOKEN_LINK = "https://accounts.spotify.com/api/token"
	CONTENT_TYPE_FORM_ENCODED = "application/x-www-form-urlencoded"
	GRANT_TYPE = "grant_type"
	AUTHORIZATION_CODE = "authorization_code"
	REDIRECT_URI_PARAM = "redirect_uri"
	REDIRECT_URI = "http://localhost:3000/redirect"
	CONTENT_TYPE_HEADER = "Content-Type"
	CLIENT_ID_KEY = "client_id"
	CLIENT_SECRET_KEY = "client_secret"
	ACCESS_TOKEN = "access_token"
	REFRESH_TOKEN = "refresh_token"
	TEMP_ACCESS_SECRET = "my-oauth-secret-secure-123" // will change after swithcin gto env file.
	APPLICATION_JSON = "application/json"
	JWT = "jwt"
	SPOTIFY_API_BASE = "https://api.spotify.com/v1"
	PROFILE = "profile"
	PERSONALIZATION = "personalization"
	TRACKS = "tracks"
	ARTISTS = "artists"
	RESPONSE_LIMIT = "5"
)

func getAuthResponse(rawResponse *http.Response) *AuthResponse {
	decoder := json.NewDecoder(rawResponse.Body)
	authResponse := &AuthResponse{ }
	decoder.Decode(authResponse)
	return authResponse
}

func getJwt(authResponse *AuthResponse) string {
	jwtClaims := jwt.MapClaims{}
	jwtClaims[ACCESS_TOKEN] = authResponse.AccessToken
	jwtClaims[REFRESH_TOKEN] = authResponse.RefreshToken
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwtClaims)
	tokenStr, _ := token.SignedString([]byte(TEMP_ACCESS_SECRET))
	return tokenStr
}

func sendJson(w http.ResponseWriter, data interface{}) {
	jsonData, _ := json.Marshal(data)
	w.Header().Set(CONTENT_TYPE_HEADER, APPLICATION_JSON)
	w.Write(jsonData)

}

func authorize(w http.ResponseWriter, r *http.Request) {
	code, _:= mux.Vars(r)["code"]
	data := url.Values{}
	data.Set(GRANT_TYPE, AUTHORIZATION_CODE)
	data.Set(CODE, code)
	data.Set(REDIRECT_URI_PARAM, REDIRECT_URI)
	data.Set(CLIENT_ID_KEY, CLIENT_ID)
	data.Set(CLIENT_SECRET_KEY, CLIENT_SECRET)
	resp, _ := http.Post(EXCHANGE_TOKEN_LINK, CONTENT_TYPE_FORM_ENCODED, strings.NewReader(data.Encode()))
	if resp.StatusCode == 200 {
		response_obj := getAuthResponse(resp)
		fmt.Println(response_obj.AccessToken)
		fmt.Println(response_obj.RefreshToken)
		jwtToken :=  getJwt(response_obj)
		sendJson(w, map[string]string{JWT:jwtToken})
	} else {
		w.WriteHeader(resp.StatusCode)
	}
}

func tryParseJwt(r *http.Request) (jwt.MapClaims, error) {
	body := &JWTBody{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		return nil, err
	} else if body.Jwt == "" {
		return nil, errors.New("missing required field 'jwt'")
	}else {
			jwt_token := body.Jwt
			claims := jwt.MapClaims{}
			token, err := jwt.ParseWithClaims(jwt_token, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(TEMP_ACCESS_SECRET), nil
		})
			if err != nil || !token.Valid {
			return nil, err
		} else {
			return claims, nil
		}
		}
}


func tryGetDataFromSpotify(url string, token string) (map[string]interface{},int,  error) {
	client := &http.Client{}
	req, _ := http.NewRequest(http.MethodGet, url, nil)
	req.Header.Add("Authorization","Bearer " + token)
	resp, err := client.Do(req) // only possible error should be networkl connectivity problems, send a internal
	// server error to client.
	if err != nil {
		return nil, 0, err
	}

	var response_map map[string]interface{}
	_ = json.NewDecoder(resp.Body).Decode(&response_map) // can ignore error as spotify will send valid json.

	return response_map, resp.StatusCode, nil
}

func getData(w http.ResponseWriter, r *http.Request) {
	claims, err := tryParseJwt(r)
	if err != nil || claims == nil {
		w.WriteHeader(http.StatusBadRequest)
	} else{
		accessToken := claims[ACCESS_TOKEN].(string)
		profile, stat1, err1 := tryGetDataFromSpotify(SPOTIFY_API_BASE + "/me", accessToken)
		artists, stat2, err2 := tryGetDataFromSpotify(SPOTIFY_API_BASE + "/me/top/artists?limit="+RESPONSE_LIMIT,
			accessToken)
		tracks, stat3, err3 := tryGetDataFromSpotify(SPOTIFY_API_BASE + "/me/top/tracks?limit="+RESPONSE_LIMIT,
			accessToken)

		if err1 != nil || err2 != nil || err3 != nil {
			w.WriteHeader(http.StatusInternalServerError)
		} else if stat1 != http.StatusOK  {
			w.WriteHeader(stat1)
		} else if stat2 != http.StatusOK {
			w.WriteHeader(stat2)
		} else if stat3 != http.StatusOK {
			w.WriteHeader(stat3)
		} else {
			tracksList := tracks["items"]
			artistsList := artists["items"]
			data := map[string]map[string]interface{}{PROFILE:profile,
				PERSONALIZATION:{TRACKS:tracksList, ARTISTS:artistsList}}
			sendJson(w, data)
		}
	}
}

func main() {
	router := mux.NewRouter()
	router.HandleFunc("/auth/{code}", authorize).Methods(http.MethodGet)
	router.HandleFunc("/data", getData).Methods(http.MethodPost)

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{http.MethodGet, http.MethodPost},
		AllowCredentials: true,
	})

	corsHandler := c.Handler(router)
	server := &http.Server{Handler: corsHandler, Addr: "127.0.0.1:5000",WriteTimeout: 15*time.Second,
		ReadTimeout: 15*time.Second}
	fmt.Println("unwrapped.live server running on port 5000.")
	log.Fatal(server.ListenAndServe())
}