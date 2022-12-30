package id

// AccountID defines account id object.
type AccountID string

func (a AccountID) String() string {
	return string(a)
}

// TripID defines trip id object.
type TripID string

func (t TripID) String() string {
	return string(t)
}

// IdentityID defines identity id object.
type IdentityID string

func (i IdentityID) String() string {
	return string(i)
}

// CarID defines car id object.
type CarID string

func (c CarID) String() string {
	return string(c)
}