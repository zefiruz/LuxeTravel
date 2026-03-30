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
	Update(hotel model.Hotel) error
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

// internal/repository/hotel.go

func (r *postgresHotelRepository) Update(hotel model.Hotel) error {
    // Updates(hotel) обновит только непустые поля из структуры
    result := r.db.Model(&hotel).Where("id = ?", hotel.ID).Updates(hotel)
    
    if result.Error != nil {
        return result.Error
    }
    if result.RowsAffected == 0 {
        return gorm.ErrRecordNotFound
    }
    return nil
}
