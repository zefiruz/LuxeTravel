package repository

import (
	"luxetravel/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type HotelRepository interface {
	GetByCityID(cityID uuid.UUID) ([]model.Hotel, error)
	Create(hotel *model.Hotel) error
	CreateRoomType(rt *model.RoomType) error
}

type postgresHotelRepository struct {
	db *gorm.DB
}

func NewPostgresHotelRepository(db *gorm.DB) HotelRepository {
	return &postgresHotelRepository{db: db}
}

func (r *postgresHotelRepository) Create(hotel *model.Hotel) error {
    return r.db.Create(hotel).Error
}

func (r *postgresHotelRepository) CreateRoomType(rt *model.RoomType) error {
    return r.db.Create(rt).Error
}

func (r *postgresHotelRepository) GetByCityID(cityID uuid.UUID) ([]model.Hotel, error) {
	var hotels []model.Hotel
	err := r.db.Where("city_id = ?", cityID).Preload("Rooms").Find(&hotels).Error
	return hotels, err
}
