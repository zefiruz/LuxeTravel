package repository

import (
	"luxetravel/internal/model"

	"gorm.io/gorm"
)

type RouteRepository interface {
	Create(route *model.Route) error
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
