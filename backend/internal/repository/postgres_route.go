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
	GetAll() ([]model.Route, error)
	UpdateStatus(routeID uuid.UUID, statusID uuid.UUID) error
	CreateBooking(booking *model.Booking) error
	GetAvailableCityNames() ([]string, error)
	GetStatusByTitle(title string) (uuid.UUID, error)
	GetBookingStatusByTitle(title string) (uuid.UUID, error)
}

type postgresRouteRepository struct {
	db *gorm.DB
}

func NewPostgresRouteRepository(db *gorm.DB) RouteRepository {
	return &postgresRouteRepository{db: db}
}

func (r *postgresRouteRepository) Create(route *model.Route) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Сначала создаём маршрут без Bookings
		bookings := route.Bookings
		route.Bookings = nil
		if err := tx.Create(route).Error; err != nil {
			return err
		}

		// Проставляем RouteID и создаём бронирования
		for i := range bookings {
			bookings[i].RouteID = route.ID
		}
		if len(bookings) > 0 {
			if err := tx.Create(&bookings).Error; err != nil {
				return err
			}
		}

		route.Bookings = bookings
		return nil
	})
}

func (r *postgresRouteRepository) CreateBooking(booking *model.Booking) error {
	return r.db.Create(booking).Error
}

func (r *postgresRouteRepository) GetById(id uuid.UUID) (*model.Route, error) {
	var route model.Route
	err := r.db.
		Preload("Status").
		Preload("Bookings.Status").
		First(&route, "id = ?", id).Error
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
	err := r.db.
		Where("user_id = ?", userID).
		Preload("Status").
		Preload("Bookings.Status").
		Preload("Bookings.RoomType.Hotel.City").
		Find(&routes).Error
	return routes, err
}

func (r *postgresRouteRepository) GetAll() ([]model.Route, error) {
	var routes []model.Route
	err := r.db.
		Preload("Status").
		Preload("Bookings.Status").
		Preload("Bookings.RoomType.Hotel.City").
		Preload("User").
		Find(&routes).Error
	return routes, err
}

func (r *postgresRouteRepository) UpdateStatus(routeID uuid.UUID, statusID uuid.UUID) error {
	result := r.db.Model(&model.Route{}).Where("id = ?", routeID).Update("status_id", statusID)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *postgresRouteRepository) GetAvailableCityNames() ([]string, error) {
	var names []string
	err := r.db.Model(&model.City{}).Pluck("title", &names).Error
	return names, err
}

func (r *postgresRouteRepository) GetStatusByTitle(title string) (uuid.UUID, error) {
	var status model.RouteStatus
	err := r.db.Where("title = ?", title).First(&status).Error
	if err != nil {
		return uuid.Nil, err
	}
	return status.ID, nil
}

func (r *postgresRouteRepository) GetBookingStatusByTitle(title string) (uuid.UUID, error) {
	var status model.BookingStatus
	err := r.db.Where("title = ?", title).First(&status).Error
	if err != nil {
		return uuid.Nil, err
	}
	return status.ID, nil
}
