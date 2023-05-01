package utils

import (
	"time"

	jwt "github.com/golang-jwt/jwt/v5"
	"github.com/sing3demons/service-authen/model"
)

type CustomClaims struct {
	Name string `json:"name"`
	Role string `json:"role"`
	jwt.RegisteredClaims
}

func GenerateToken(user *model.User, expire uint64, secret string) (string, error) {
	claims := &CustomClaims{
		Name: user.Name,
		Role: user.Role, RegisteredClaims: jwt.RegisteredClaims{
			Subject:   user.ID.Hex(),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(expire) * time.Hour)),
		},
	}

	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(secret))
}
