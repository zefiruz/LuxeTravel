package repository

import (
	"luxetravel/internal/model"

	"gorm.io/gorm"
)

type CityRepository interface {
	GetAll() ([]model.City, error)
}

type postgresCityRepository struct {
	db *gorm.DB
}

func NewPostgresCityRepository(db *gorm.DB) CityRepository {
	return &postgresCityRepository{db: db}
}

func (r *postgresCityRepository) GetAll() ([]model.City, error) {
	var cities []model.City
	err := r.db.Find(&cities).Error
	return cities, err
}
