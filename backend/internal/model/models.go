package model

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID `json:"id"`
	Login        string    `json:"login"`
	PasswordHash string    `json:"-"`
	Role         string    `json:"role"`
}

type UserInfo struct {
	ID         uuid.UUID `json:"id"`
	UserId     uuid.UUID `json:"user_id"`
	FirstName  string    `json:"first_name"`
	Email      string    `json:"email"`
	Phone      string    `json:"phone"`
	LastName   string    `json:"last_name"`
	MiddleName string    `json:"middle_name"`
}

type Cities struct {
	ID    uuid.UUID `json:"id"`
	Title string    `json:"title"`
}

type Hotels struct {
	ID          uuid.UUID `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	CityId      uuid.UUID `json:"city_id"`
	Email       string    `json:"email"`
	Address     string    `json:"address"`
}

type Rooms struct {
	ID        uuid.UUID `json:"id"`
	HotelId   uuid.UUID `json:"hotel_id"`
	MaxGuests int       `json:"max_guests"`
}

type Bookings struct {
	ID        uuid.UUID `json:"id"`
	RoomId    uuid.UUID `json:"room_id"`
	RouteId   uuid.UUID `json:"route_id"`
	StartDate time.Time `json:"start_date"`
	EndDate   time.Time `json:"end_date"`
}

type Routes struct {
	ID          uuid.UUID `json:"id"`
	UserId      uuid.UUID `json:"user_id"`
	Status      string    `json:"status"`
	GuestsCount int       `json:"guests_count"`
}
