package token

import (
	"testing"
	"time"

	"github.com/dgrijalva/jwt-go"
)

const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAlWeK0Absr3t0dtxKOVy+gYVxUVPV0lYUhudPQIpc55g+u1Mm
dABHivg/DOl+770iPFdBVvVcO4IsoeSiq0YCQGWhaCdEDQR60rOVaDBvnI0OwX0W
k/o2qHyjz16N1rfpKn72J35CFk/VqMB3P1dTIsvfX6GFIHH6sgJvTOYFVltmxjBu
6p1otA68+5slvO9KWJBle/tNyuBWh1LJ6MoE4eBoWp0Am/bIP8znrJG7fGT2Ao+f
zVtKtbXaBiXQSWry7Cocn7/LGsJJo9hlT/UTWh3PaplOFYor/IRKz0gfKtzncZjt
Mt6RzoGJUTVznWt1Wu51+sHdMY6RG+axwmS/aQIDAQABAoIBAC+rtQgBXZ30Z0nR
qkE5TXPoTyri9BPD8ZLF1WzDeTdQRZvhwSA8Qped9Ag7rIv0LitQsAF+EmrOc01I
tXquwOMpSmIAPV9l8YavVFnFMqeh/nZQYlbe/HewJVhyVBGR5uzvS714NMAHwyWw
G5xzUYyFvoU19VNP6uzHiBniPwu5auZq/NHEjzD94q4eNGega+Qvw+t6tayOUzBu
TrVH9lcvKKarB0lHxmfnpfhiiQXetw8gcUIOrgZ7pPDQgFq1Ooto6ITwto10q1NP
xFSeyhbIjj6hQTg9R5g0qtIOlZ4Fp9kMVdp23x8utkj+sTEJ2UcrhcDns3+ih88H
5NhAjXECgYEA1zZgedPyUtmTy1ki/duWFsvYh/FpcDxP6fVjY85Ll8fbpKeKnJLy
kwhdgNvvyY37yMlCMPu+AHTdUF9rKDPm7Q8IxsH/MPWxD8ZvJ4xJZEHSoJeX5Gx3
aLVeQ5RLJWzXnGoZL8ucvA96E9vgn4sQiWnggenbj+2Jd59pwP3EJ40CgYEAsbhP
ul1srJ+kfHmnnO55cP+3BPVs9xEUeSuhxLFo0rL+N4CKD3YSFRJwJmINrD4pKYdR
IBgktsrFt0wkejvdKAyDzTTkAEGZ/PWZ0sYLUAalATgb61Z0qsAi96MUfCDTTyJU
/aEUycKhY3c0aInBIRXhyKyBtrFbKG1lmIkcwk0CgYAETvJfff676d8rkv1AV8UJ
b8tF7W9O7+YpqN/0f4zD3Rxoj3IW8Foq12AH1F9YiZ8gxeatVFzZZX2IvmBGzcMx
u7tRP1D8ie6hgjd3czeE6kxtKpu/1uwNDJR2heF7PlKSrw0SB+F7YlPvUdeNWhta
pOP5tdTPbNHzsx1K38mtgQKBgGWvaZ7eeaHDrh+yk97M7BtllNh3fKNY2HgEKQkb
4Tg9RguHtnbmPa5k4Fp13BDjeDXUwOw2JDuahco8/NobioyxrHArhRFId80u0Zax
ziM5yguKiR78VsCkMt2yJ7RmK8GpiSudkQFoJWN9/zSZLTG7DXb+jTF1BQ16mpjO
SvA5AoGAGaYgXVudDzXYqaojswvXZTTDMQgE1xkHvCUJrV+zwvJAiVgoOshjtsRa
3UwpsjYyn6+XkI0o8C0x3mPuF729btXtO9I+04SsUwuMTe+gOnpoIC2HRC2Ixo1t
DsraPBDuJhqV4E6N2Qut77JkIFhRMfDfXBDfpIAGk4BX57bo/o0=
-----END RSA PRIVATE KEY-----`

func TestGenerateToken(t *testing.T) {
	key, err := jwt.ParseRSAPrivateKeyFromPEM([]byte(privateKey))
	if err != nil {
		t.Fatalf("cannot parse private key: %v", err)
	}
	g := NewJWTTokenGen("coolcar/auth", key)
	g.nowFunc = func() time.Time {
		return time.Unix(1516239022, 0)
	}
	tkn, err := g.GenerateToken("1234567890", 2 * time.Hour)
	if err != nil {
		t.Errorf("cannot generate token: %v", err)
	}
	want := `eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MTYyNDYyMjIsImlhdCI6MTUxNjIzOTAyMiwiaXNzIjoiY29vbGNhci9hdXRoIiwic3ViIjoiMTIzNDU2Nzg5MCJ9.McxhzHDXz2GxDcEHJ-6LC2R7dghYtjeJIMPylJDVzXJU6Bb-fUp8UTS889HIvJLE4nNwJkx0ewuKgzPruZ9-w2Cv_KUx459dLbTAzBmHD8QrUKC4VJp3u2B901tFKnee53FIls5kQeETA0Olu9SL0tMCyf0T33apnZcw1kCL17I6YNU440ahotpSUnUvaz0GDa9kjg4njNEgjo6h9akChbeQFYYaFkJXIr24UtxypY3AMxzFsVkqT80B7Noj99RSZ_qfgB_Eb7LIkGs20rAHRebMOTLDfdrchZ0lrs0olcdtk6_GJHOjzk-01QcOlmPmAw2Nq6vX8OciMCjZU6f2eA`
	if tkn != want {
		t.Errorf("wrong token generated. want: %q; \ngot: %q", want, tkn)
	}
}