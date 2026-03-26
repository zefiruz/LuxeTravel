package repository

import (
	"luxetravel/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRepository interface {
	Create(user model.User) error
	CreateWithInfo(user model.User, info model.UserInfo) error
	GetByEmail(email string) (*model.User, error)
	GetInfoByUserID(userID uuid.UUID) (*model.UserInfo, error)
	UpdateInfo(info model.UserInfo) error
	GetRoleByTitle(title string) (uuid.UUID, error)
}

type postgresUserRepository struct {
	db *gorm.DB
}

func NewPostgresUserRepository(db *gorm.DB) *postgresUserRepository {
	return &postgresUserRepository{db: db}
}

func (r *postgresUserRepository) Create(u model.User) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&u).Error; err != nil {
			return err
		}

		userInfo := model.UserInfo{
			ID:     uuid.New(),
			UserID: u.ID,
		}

		if err := tx.Create(&userInfo).Error; err != nil {
			return err
		}

		return nil
	})
}

func (r *postgresUserRepository) GetByID(id uuid.UUID) (model.User, error) {
	var user model.User
	err := r.db.First(&user, "id = ?", id).Error
	return user, err
}

func (r *postgresUserRepository) CreateWithInfo(user model.User, info model.UserInfo) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&user).Error; err != nil {
			return err
		}

		info.UserID = user.ID

		if err := tx.Create(&info).Error; err != nil {
			return err
		}

		return nil
	})
}

func (r *postgresUserRepository) GetByEmail(email string) (*model.User, error) {
	var user model.User

	err := r.db.Preload("Role").Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *postgresUserRepository) GetInfoByUserID(userID uuid.UUID) (*model.UserInfo, error) {
	var info model.UserInfo

	err := r.db.Where("user_id = ?", userID).First(&info).Error

	return &info, err
}

func (r *postgresUserRepository) UpdateInfo(info model.UserInfo) error {
	return r.db.Model(&model.UserInfo{}).
		Where("user_id = ?", info.UserID).
		Updates(info).Error
}

func (r *postgresUserRepository) GetRoleByTitle(title string) (uuid.UUID, error) {
	var role model.Role
	err := r.db.Where("title = ?", title).First(&role).Error
	if err != nil {
		return uuid.Nil, err
	}
	return role.ID, nil
}
