package main

import (
	"encoding/json"
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const CODE = "code"
const CLIENT_ID = "0fcccb78740a42dab96c20f4ebb9dbae"
const CLIENT_SECRET = "90a72ac119f14b7994b7ed4bb77373bc" // RESET, AND SWITCH TOS ECURE FORM AFTER.
const EXCHANGE_TOKEN_LINK = "https://accounts.spotify.com/api/token"
const CONTENT_TYPE_FORM_ENCODED = "application/x-www-form-urlencoded"
const GRANT_TYPE = "grant_type"
const AUTHORIZATION_CODE = "authorization_code"
const REDIRECT_URI_PARAM = "redirect_uri"
const REDIRECT_URI = "http://localhost:3000/redirect"
const CONTENT_TYPE_HEADER = "Content-Type"
const AUTHORIZATION_HEADER = "Authorization"
const CLIENT_ID_KEY = "client_id"
const CLIENT_SECRET_KEY = "client_secret"
const ACCESS_TOKEN = "access_token"
const REFRESH_TOKEN = "refresh_token"
const TEMP_ACCESS_SECRET = "my-oauth-secret-secure-123" // will change after swithcin gto env file.
const APPLICATION_JSON = "application/json"
const JWT = "jwt"

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
	fmt.Println("Request Received")


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

func getData(w http.ResponseWriter, r *http.Request){
	body := &JWTBody{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
	} else {
		jwt_token := body.Jwt
		claims := jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(jwt_token, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(TEMP_ACCESS_SECRET), nil
		})
		if err != nil || !token.Valid {
			w.WriteHeader(http.StatusBadRequest)
		} else {
			for key, val := range claims {
				fmt.Println(key)
				fmt.Println(val)
			}
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