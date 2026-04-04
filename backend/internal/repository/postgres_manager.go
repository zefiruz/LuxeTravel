package repository

import (
	"luxetravel/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ManagerRepository interface {
	GetBookings(managerID uuid.UUID) ([]model.Booking, error)
	UpdateBookingStatus(managerID uuid.UUID, bookingID uuid.UUID, statusID uuid.UUID) error
	GetBookingByID(managerID, bookingID uuid.UUID) (*model.Booking, error)
	CreateRoomType(managerID uuid.UUID, roomType *model.RoomType) error
	GetBookingStatusByTitle(title string) (uuid.UUID, error)
}

type postgresManagerRepository struct {
	db *gorm.DB
}

func NewPostgresManagerRepository(db *gorm.DB) ManagerRepository {
	return &postgresManagerRepository{db: db}
}

func (r *postgresManagerRepository) GetBookings(managerID uuid.UUID) ([]model.Booking, error) {
	var bookings []model.Booking

	err := r.db.
		Joins("JOIN room_types ON room_types.id = bookings.room_type_id").
		Joins("JOIN hotel_managers ON hotel_managers.hotel_id = room_types.hotel_id").
		Where("hotel_managers.user_id = ?", managerID).
		Preload("RoomType").
		Preload("RoomType.Hotel").
		Preload("RoomType.Hotel.City").
		Preload("Status").
		Find(&bookings).Error

	return bookings, err
}

func (r *postgresManagerRepository) UpdateBookingStatus(managerID uuid.UUID, bookingID uuid.UUID, statusID uuid.UUID) error {
	var count int64
	err := r.db.Table("bookings").
		Joins("JOIN room_types ON room_types.id = bookings.room_type_id").
		Joins("JOIN hotel_managers ON hotel_managers.hotel_id = room_types.hotel_id").
		Where("bookings.id = ? AND hotel_managers.user_id = ?", bookingID, managerID).
		Count(&count).Error
	if err != nil {
		return err
	}
	if count == 0 {
		return gorm.ErrRecordNotFound
	}

	return r.db.Model(&model.Booking{}).Where("id = ?", bookingID).Update("status_id", statusID).Error
}

func (r *postgresManagerRepository) GetBookingByID(managerID, bookingID uuid.UUID) (*model.Booking, error) {
	var booking model.Booking

	err := r.db.
		Joins("JOIN room_types ON room_types.id = bookings.room_type_id").
		Joins("JOIN hotel_managers ON hotel_managers.hotel_id = room_types.hotel_id").
		Where("bookings.id = ? AND hotel_managers.user_id = ?", bookingID, managerID).
		Preload("RoomType").
		Preload("RoomType.Hotel").
		Preload("RoomType.Hotel.City").
		Preload("Status").
		First(&booking).Error

	return &booking, err
}

func (r *postgresManagerRepository) CreateRoomType(managerID uuid.UUID, rt *model.RoomType) error {
	var count int64
	r.db.Table("hotel_managers").
		Where("hotel_id = ? AND user_id = ?", rt.HotelID, managerID).
		Count(&count)

	if count == 0 {
		return gorm.ErrRecordNotFound
	}

	return r.db.Create(rt).Error
}

func (r *postgresManagerRepository) GetBookingStatusByTitle(title string) (uuid.UUID, error) {
	var status model.BookingStatus
	err := r.db.Where("title = ?", title).First(&status).Error
	if err != nil {
		return uuid.Nil, err
	}
	return status.ID, nil
}
