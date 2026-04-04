package repository

import (
	"errors"

	"luxetravel/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AdminRepository interface {
	GetAllUsers() ([]model.User, error)
	GetRoles() ([]model.Role, error)
	UpdateUserRole(userID uuid.UUID, roleID uuid.UUID) error
	AssignManagerToHotel(userID uuid.UUID, hotelID uuid.UUID) error
}

type postgresAdminRepository struct {
	db *gorm.DB
}

func NewPostgresAdminRepository(db *gorm.DB) AdminRepository {
	return &postgresAdminRepository{db: db}
}

func (r *postgresAdminRepository) GetAllUsers() ([]model.User, error) {
	var users []model.User

	err := r.db.Preload("Role").Find(&users).Error
	return users, err
}

func (r *postgresAdminRepository) GetRoles() ([]model.Role, error) {
	var roles []model.Role
	err := r.db.Find(&roles).Error
	return roles, err
}

func (r *postgresAdminRepository) UpdateUserRole(userID uuid.UUID, roleID uuid.UUID) error {
	result := r.db.Model(&model.User{}).Where("id = ?", userID).Update("role_id", roleID)

	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *postgresAdminRepository) AssignManagerToHotel(userID uuid.UUID, hotelID uuid.UUID) error {
	var user model.User
	err := r.db.Joins("Role").First(&user, "users.id = ?", userID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.New("пользователь не найден")
		}
		return err
	}

	if user.Role.Title != "manager" {
		return errors.New("пользователь не является менеджером (текущая роль: " + user.Role.Title + ")")
	}

	var count int64
	r.db.Model(&model.HotelManager{}).
		Where("user_id = ? AND hotel_id = ?", userID, hotelID).
		Count(&count)

	if count > 0 {
		return errors.New("этот менеджер уже управляет данным отелем")
	}

	managerLink := model.HotelManager{
		ID:      uuid.New(),
		UserID:  userID,
		HotelID: hotelID,
	}

	return r.db.Create(&managerLink).Error
}
