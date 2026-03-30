package repository

import (
	"luxetravel/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CityRepository interface {
	GetAll() ([]model.City, error)
	GetById(id uuid.UUID) (*model.City, error)
	GetByName(name string) (*model.City, error)
	Create(city *model.City) error
	UpdateCityInfo(info model.City) error
}

type postgresCityRepository struct {
	db *gorm.DB
}

func NewPostgresCityRepository(db *gorm.DB) CityRepository {
	return &postgresCityRepository{db: db}
}

func (r *postgresCityRepository) Create(city *model.City) error {
	return r.db.Create(city).Error
}

func (r *postgresCityRepository) GetAll() ([]model.City, error) {
	var cities []model.City
	err := r.db.Find(&cities).Error
	return cities, err
}

func (r *postgresCityRepository) GetById(id uuid.UUID) (*model.City, error) {
	var city model.City
	if err := r.db.First(&city, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &city, nil
}

func (r *postgresCityRepository) GetByName(name string) (*model.City, error) {
	var city model.City
	err := r.db.Where("title ILIKE ?", name).First(&city).Error
	if err != nil {
		return nil, err
	}
	return &city, nil
}

func (r *postgresCityRepository) UpdateCityInfo(info model.City) error {
	result := r.db.Model(&info).Updates(info)

	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
