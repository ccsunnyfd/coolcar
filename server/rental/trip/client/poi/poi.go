package poi

import (
	"context"
	rentalpb "coolcar/rental/api/gen/v1"
)

type Manager struct{}

func (p *Manager) Resolve(context.Context, *rentalpb.Location) (string, error) {
	return "天坛", nil
}
