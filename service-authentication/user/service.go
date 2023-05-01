package user

import (
	"errors"

	"github.com/sing3demons/service-authen/model"
	"github.com/sing3demons/service-authen/utils"
	"golang.org/x/crypto/bcrypt"
)

type userService struct {
	repo *repository
}

func NewUserService(repo *repository) *userService {
	return &userService{repo: repo}
}

func (s *userService) FindAll(filter any) ([]model.User, error) {
	return s.repo.FindAll(filter)
}

func (s *userService) FindById(id string) (*model.User, error) {
	return s.repo.FindById(id)
}

func (s *userService) Register(user Register) (any, error) {
	exist, err := s.repo.FindEmail(user.Email)
	if err != nil {
		return nil, err
	}

	if exist != nil {
		return nil, errors.New("email already exists")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user.Password = string(hash)

	result, err := s.repo.CreateUser(user)
	if err != nil {
		return nil, err
	}

	return result, nil

}

func (s *userService) Login(body UserLogin) (*Token, error) {
	user, err := s.repo.FindEmail(body.Email)
	if err != nil {
		return nil, err
	}

	if user == nil {
		return nil, errors.New("email not found")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password))
	if err != nil {
		return nil, errors.New("wrong password")
	}

	accessToken, err := utils.GenerateToken(user, 1, "secret")
	if err != nil {
		return nil, err
	}

	refreshToken, err := utils.GenerateToken(user, 1, "refresh")
	if err != nil {
		return nil, err
	}

	token := &Token{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}

	return token, nil
}

func (s *userService) UpdateUser(id string, user UpdateUser) error {
	u, err := s.repo.FindById(id)
	if err != nil {
		return err
	}

	if user.Email != "" {
		u.Email = user.Email
	}

	if user.Name != "" {
		u.Name = user.Name
	}

	if user.Password != "" {
		hash, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}

		u.Password = string(hash)
	}
	return s.repo.UpdateUser(id, u)
}

func (s *userService) DeleteUser(id string) error {
	return s.repo.DeleteUser(id)
}
