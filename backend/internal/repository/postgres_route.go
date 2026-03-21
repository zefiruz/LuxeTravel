package repository

import (
	"luxetravel/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RouteRepository interface {
	Create(route *model.Route) error
	GetById(id uuid.UUID) (*model.Route, error)
	Update(route *model.Route) error
	Delete(id uuid.UUID) error
	GetAllById(userID uuid.UUID) ([]model.Route, error)
}

type postgresRouteRepository struct {
	db *gorm.DB
}

func NewPostgresRouteRepository(db *gorm.DB) RouteRepository {
	return &postgresRouteRepository{db: db}
}

func (r *postgresRouteRepository) Create(route *model.Route) error {
	return r.db.Create(route).Error
}

func (r *postgresRouteRepository) GetById(id uuid.UUID) (*model.Route, error) {
	var route model.Route
	err := r.db.Preload("Bookings").First(&route, "id = ?", id).Error
	return &route, err
}

func (r *postgresRouteRepository) Update(route *model.Route) error {
	return r.db.Save(route).Error
}

func (r *postgresRouteRepository) Delete(id uuid.UUID) error {
    return r.db.Delete(&model.Route{}, "id = ?", id).Error
}

func (r *postgresRouteRepository) GetAllById(userID uuid.UUID) ([]model.Route, error) {
    var routes []model.Route
    // Используем Preload, чтобы сразу видеть города в списке
    err := r.db.Where("user_id = ?", userID).Find(&routes).Error
    return routes, err
}
