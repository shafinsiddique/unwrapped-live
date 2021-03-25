package main

type AuthResponse struct {
	AccessToken string
	TokenType string
	Scope string
	ExpiresIn int
	RefreshToken string
}