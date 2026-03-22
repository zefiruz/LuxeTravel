package repository

import (
	"luxetravel/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRepository interface {
	Create(user model.User) error
	CreateWithInfo(user model.User, info model.UserInfo) error
	GetByEmail(email string) (model.User, error)
}

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

func (r *PostgresUserRepository) GetByID(id uuid.UUID) (model.User, error) {
	var user model.User
	err := r.db.First(&user, "id = ?", id).Error
	return user, err
}

func (r *PostgresUserRepository) CreateWithInfo(user model.User, info model.UserInfo) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&user).Error; err != nil {
			return err
		}

		info.UserId = user.ID

		if err := tx.Create(&info).Error; err != nil {
			return err
		}

		return nil
	})
}

func (r *PostgresUserRepository) GetByEmail(email string) (model.User, error) {
	var user model.User

	err := r.db.Table("users").
		Select("users.*").
		Joins("JOIN user_infos ON users.id = user_infos.user_id").
		Where("user_infos.email = ?", email).
		First(&user).Error

	return user, err
}
