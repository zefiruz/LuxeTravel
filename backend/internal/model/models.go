package model

import (
	"time"

	"github.com/google/uuid"
)

// --- Справочники (Dictionary Tables) ---

type Role struct {
	ID    uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Title string    `gorm:"not null" json:"title"`
}

type RouteStatus struct {
	ID    uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Title string    `gorm:"not null" json:"title"`
}

type BookingStatus struct {
	ID    uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Title string    `gorm:"not null" json:"title"`
}

type City struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Title       string    `gorm:"size:50;not null" json:"title"`
	Description string    `gorm:"type:text" json:"description"`
	ImageURL    string    `json:"image_url"`
	Hotels      []Hotel   `gorm:"foreignKey:CityID" json:"hotels,omitempty"`
}

// --- Основные сущности ---

type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	PasswordHash string    `gorm:"type:text;not null" json:"-"`
	RoleID       uuid.UUID `gorm:"type:uuid" json:"role_id"`
	Role         Role      `gorm:"foreignKey:RoleID" json:"role"`
	Email        string    `gorm:"size:100;uniqueIndex;not null" json:"email"`
	UserInfo     UserInfo  `gorm:"foreignKey:UserID" json:"info"`
}

type UserInfo struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserID     uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	FirstName  string    `gorm:"size:30" json:"first_name"`
	LastName   string    `gorm:"size:30" json:"last_name"`
	MiddleName string    `gorm:"size:30" json:"middle_name"`
	Phone      string    `gorm:"size:20" json:"phone"`
}

type Hotel struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	Title       string     `gorm:"size:255;not null" json:"title"`
	Description string     `gorm:"type:text" json:"description"`
	ImageURL    string     `gorm:"column:image_url" json:"img_link"`
	CityID      uuid.UUID  `gorm:"type:uuid;not null" json:"city_id"`
	City        City       `gorm:"foreignKey:CityID" json:"city"`
	Email       string     `gorm:"size:100" json:"email"`
	Address     string     `gorm:"size:100" json:"address"`
	Rooms       []RoomType `gorm:"foreignKey:HotelID" json:"rooms"`
}

type RoomType struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	HotelID       uuid.UUID `gorm:"type:uuid;not null" json:"hotel_id"`
	Hotel         Hotel     `gorm:"foreignKey:HotelID" json:"hotel"`
	Title         string    `json:"title"`
	MaxGuests     int       `json:"max_guests"`
	PricePerNight int       `json:"price_per_night"`
}

type Route struct {
	ID          uuid.UUID   `gorm:"type:uuid;primaryKey" json:"id"`
	UserID      uuid.UUID   `gorm:"type:uuid;not null" json:"user_id"`
	User        User        `gorm:"foreignKey:UserID" json:"user"`
	StatusID    uuid.UUID   `gorm:"type:uuid" json:"status_id"`
	Status      RouteStatus `gorm:"foreignKey:StatusID" json:"status"`
	Prompt      string      `gorm:"column:prompt" json:"trip_idea"`
	GuestsCount int         `gorm:"column:guests_count" json:"travelers_count"`
	StartDate   time.Time   `json:"start_date"`
	EndDate     time.Time   `json:"end_date"`
	CreatedAt   time.Time   `json:"created_at"`
	Bookings    []Booking   `gorm:"foreignKey:RouteID" json:"bookings"`
}

type Booking struct {
	ID         uuid.UUID     `gorm:"type:uuid;primaryKey" json:"id"`
	RoomTypeID uuid.UUID     `gorm:"type:uuid;not null" json:"room_id"`
	RouteID    uuid.UUID     `gorm:"type:uuid;not null" json:"route_id"`
	StatusID   uuid.UUID     `gorm:"type:uuid" json:"status_id"`
	Status     BookingStatus `gorm:"foreignKey:StatusID" json:"status"`
	RoomType   RoomType      `gorm:"foreignKey:RoomTypeID" json:"room_type"`
	Route      Route         `gorm:"foreignKey:RouteID" json:"route"`
	StartDate  time.Time     `json:"start_date"`
	EndDate    time.Time     `json:"end_date"`
	CreatedAt  time.Time     `json:"created_at"`
	UpdatedAt  time.Time     `json:"updated_at"`
}

type HotelManager struct {
	ID      uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserID  uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	HotelID uuid.UUID `gorm:"type:uuid;not null" json:"hotel_id"`
}
