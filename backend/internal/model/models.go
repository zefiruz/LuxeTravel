package model

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey"`
	Login        string    `gorm:"uniqueIndex;not null"`
	PasswordHash string    `gorm:"not null"`
	Role         string    `gorm:"default:client"`
}

type UserInfo struct {
    ID         uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
    UserId     uuid.UUID `gorm:"type:uuid;not null" json:"userId"`
    FirstName  string    `gorm:"size:100" json:"firstName"`
    LastName   string    `gorm:"size:100" json:"lastName"`
    MiddleName string    `gorm:"size:100" json:"middleName"`
    Email      string    `gorm:"uniqueIndex;size:255" json:"email"`
    Phone      string    `gorm:"size:20" json:"phone"`
}

type City struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Title       string    `gorm:"uniqueIndex;not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	ImageURL    string    `json:"image_url"`
	Hotels      []Hotel   `gorm:"foreignKey:CityId" json:"hotels,omitempty"`
}

type Hotel struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey"`
	Title       string    `gorm:"not null"`
	Description string    `gorm:"type:text"`
	CityId      uuid.UUID `gorm:"type:uuid;not null"`
	Email       string
	Address     string
	Rooms       []Room `gorm:"foreignKey:HotelId"`
	ImageURL    string `json:"image_url"`
}

type Room struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	HotelId   uuid.UUID `gorm:"type:uuid;not null"`
	MaxGuests int       `gorm:"not null"`
}

type Route struct {
	ID             uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	UserID         uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	StartDate      time.Time `json:"start_date"`
	EndDate        time.Time `json:"end_date"`
	TravelersCount int       `json:"travelers_count"`
	Mode           string    `json:"mode"`
	Cities         []string  `gorm:"serializer:json" json:"cities"`
	TripIdea       string    `json:"trip_idea"`
	CreatedAt      time.Time `json:"created_at"`
	Bookings       []Booking `gorm:"foreignKey:RouteID" json:"bookings"`
}

type Booking struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	RoomId    uuid.UUID `gorm:"type:uuid;not null"`
	RouteId   uuid.UUID `gorm:"type:uuid;not null"`
	StartDate time.Time `gorm:"not null"`
	EndDate   time.Time `gorm:"not null"`
}
