package main

import (
	"encoding/json"
	"github.com/dgrijalva/jwt-go"
	"github.com/gorilla/mux"
	"github.com/pkg/errors"
	"github.com/rs/cors"
	"github.com/sirupsen/logrus"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

var logger *logrus.Logger

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

func logRequest(r *http.Request)  {
	logger.WithFields(logrus.Fields{"ip":r.RemoteAddr, "method":r.Method, "host":r.Host,
		"url":r.URL}).Info("")
}

func getAuthResponse(rawResponse *http.Response) *AuthResponse {
	decoder := json.NewDecoder(rawResponse.Body)
	authResponse := &AuthResponse{ }
	decoder.Decode(authResponse) // can ignore error cause Spotify API will send it in this format.
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

func getAccessToken(code string) (*AuthResponse, int,  error) {
	data := url.Values{}
	data.Set(GRANT_TYPE, AUTHORIZATION_CODE)
	data.Set(CODE, code)
	data.Set(REDIRECT_URI_PARAM, REDIRECT_URI)
	data.Set(CLIENT_ID_KEY, CLIENT_ID)
	data.Set(CLIENT_SECRET_KEY, CLIENT_SECRET)

	resp, err := http.Post(EXCHANGE_TOKEN_LINK, CONTENT_TYPE_FORM_ENCODED, strings.NewReader(data.Encode()))
	// oinly errror should be network connectivity, send service unavailable.
	if err != nil {
		return nil, 0, err
	} else if resp.StatusCode != http.StatusOK {
		return nil, resp.StatusCode, nil
	}

	return getAuthResponse(resp), resp.StatusCode, nil
}

func sendJwt(code string, w http.ResponseWriter) {
	token, status, err := getAccessToken(code)
	if err != nil {
		w.WriteHeader(http.StatusServiceUnavailable)
	} else if status != http.StatusOK {
		w.WriteHeader(status)
	} else {
		jwtToken := getJwt(token)
		sendJson(w, map[string]string{JWT:jwtToken})
	}
}

func authorize(w http.ResponseWriter, r *http.Request) {
	logRequest(r)
	code, _ := mux.Vars(r)["code"]
	sendJwt(code, w)
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
	logRequest(r)
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

func refresh(w http.ResponseWriter, r *http.Request) {
	logRequest(r)
	claims, err := tryParseJwt(r)
	if err != nil || claims == nil {
		w.WriteHeader(http.StatusBadRequest)
	}

	refresh_token := claims[REFRESH_TOKEN].(string)
	sendJwt(refresh_token,w)
}

func initLogger() {
	customFormatter := new(logrus.TextFormatter)
	customFormatter.TimestampFormat = "2006-01-02 15:04:05"
	logger = logrus.New()
	logger.SetFormatter(&logrus.TextFormatter{})
	logger.SetFormatter(customFormatter)
	path, _ := os.Getwd()
	logFile, err := os.OpenFile(path + "/logs/logs.txt", os.O_APPEND | os.O_CREATE | os.O_WRONLY, 0755)
	if err == nil {
		logger.SetOutput(io.MultiWriter(os.Stderr, logFile))
	} else {
		logger.Error("error trying to initialize log file.")
	}
}

func main() {
	initLogger()
	addr := "127.0.0.1:5000"
	router := mux.NewRouter()
	router.HandleFunc("/auth/{code}", authorize).Methods(http.MethodGet)
	router.HandleFunc("/data", getData).Methods(http.MethodPost)
	router.HandleFunc("/refresh",refresh).Methods(http.MethodPost)
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{http.MethodGet, http.MethodPost},
		AllowCredentials: true,
	})

	corsHandler := c.Handler(router)
	server := &http.Server{Handler: corsHandler, Addr: addr,WriteTimeout: 15*time.Second,
		ReadTimeout: 15*time.Second}
	logger.Info("Starting unwrapped-live server on address " + addr)
	log.Fatal(server.ListenAndServe())

}