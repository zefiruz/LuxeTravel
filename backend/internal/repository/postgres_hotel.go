package repository

import (
	"luxetravel/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type HotelRepository interface {
	GetByCityID(cityID uuid.UUID) ([]model.Hotel, error)
}

type postgresHotelRepository struct {
	db *gorm.DB
}

func NewPostgresHotelRepository(db *gorm.DB) HotelRepository {
	return &postgresHotelRepository{db: db}
}

func (r *postgresHotelRepository) GetByCityID(cityID uuid.UUID) ([]model.Hotel, error) {
	var hotels []model.Hotel
	err := r.db.Where("city_id = ?", cityID).Preload("Rooms").Find(&hotels).Error
	return hotels, err
}
