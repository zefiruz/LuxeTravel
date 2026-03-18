package repository

import (
	"errors"
	"luxetravel/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PostgresUserRepository struct {
	db *gorm.DB
}

func NewPostgresUserRepository(db *gorm.DB) *PostgresUserRepository {
	return &PostgresUserRepository{db: db}
}

func (r *PostgresUserRepository) Create(u model.User) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&u).Error; err != nil {
			return err
		}

		userInfo := model.UserInfo{
			ID:     uuid.New(),
			UserId: u.ID,
		}

		if err := tx.Create(&userInfo).Error; err != nil {
			return err
		}

		return nil
	})
}

func (r *PostgresUserRepository) GetByLogin(login string) (model.User, error){
	var user model.User
	err := r.db.Where("login = ?", login).First(&user).Error //SELECT * FROM users WHERE login = 'твой_логин' LIMIT 1;

	if err != nil{
		if errors.Is(err, gorm.ErrRecordNotFound){
			return model.User{}, errors.New("пользователь не найден")
		}
		return model.User{}, err
	}
	return user, nil
}

func (r *PostgresUserRepository) GetByID(id uuid.UUID) (model.User, error) {
	var user model.User
	err := r.db.First(&user, "id = ?", id).Error
	return user, err
}