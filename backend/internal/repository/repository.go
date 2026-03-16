package repository

import "luxetravel/internal/model"

type UserRepository interface {
	Create(user model.User) error
	GetByLogin(login string) (model.User, error)
}
