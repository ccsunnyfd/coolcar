package token

import (
	"testing"
	"time"

	"github.com/dgrijalva/jwt-go"
)

const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBITANBgkqhkiG9w0BAQEFAAOCAQ4AMIIBCQKCAQBlDAq9/ab1W5/+N6C5hTk6
EBysJfHbgtwiC6qfTu81lmN+ILCKG2b2qg9C0XKAXxwUlTXBkX/649ZigYp8dNfF
8GmU8S4C5byEvkitE58Tmi+bQDjzaswRjT7swaCO3H3SviW0MyfXPSCJNqLixNJL
zOUqqZIVU46TcmtBLiMD2dns0WXFu0i6chmS2C2EGD/OgBTmp4s0jrN2juUQrpZ1
PNReMMQ0zQ3unLM6YC4VvQ36Nc9Q3rtL/yaiPOnY76LRgRyy7ofxedj7TVnnPPUl
x9fiH0wI+Yk+6iNqnJwt6tF1cvvJ8Keyqo8PgSV8FlpXot5WYxYwolUZ1yH09tUf
AgMBAAE=
-----END PUBLIC KEY-----`

func TestVerify(t *testing.T) {
	pubKey, err := jwt.ParseRSAPublicKeyFromPEM([]byte(publicKey))
	if err != nil {
		t.Fatalf("cannot parse public key: %v", err)
	}

	v := &JWTTokenVerifier{
		PublicKey: pubKey,
	}

	cases := []struct {
		name string
		tkn string
		now time.Time
		want string
		wantErr bool
	}{
		{
			name: "valid_token",
			tkn: `eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MTYyNDYyMjIsImlhdCI6MTUxNjIzOTAyMiwiaXNzIjoiY29vbGNhci9hdXRoIiwic3ViIjoiMTIzNDU2Nzg5MCJ9.PLbcyhbUbwyw0TZLlUbTwVds25xVcVToBBM7m3IWFJKt8x4lfVHeiW-kJCJjd0b_QuQs7bmAAiGJKjp-LgGiXY5dUZ13NaNZdfTJfd-rh6JnaQrCQuzgI0wShDTVhRKtgUlJwPLUsp6e0lfKQVblZN_hijT07D3VU7buIJNGpkrVK-oX90dtrMsUFDYeR05TP1Rd8ITMr4EPgUc12mBy0XFjz3eB7D9IflJuMLyjKiHN_JLAbf1wu2xt-dRcdTYSH0gCad_6-o4GXNPD-8CwpbNTbP-_aGfzxDVwfTPvtk-ar-dX9C_27r_IaEDHpwVIOmFHcaSbxfC25WQSlP22tA`,
			now: time.Unix(1516239122, 0),
			want: "1234567890",
			wantErr: false,
		},
		{
			name: "valid_expired",
			tkn: `eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MTYyNDYyMjIsImlhdCI6MTUxNjIzOTAyMiwiaXNzIjoiY29vbGNhci9hdXRoIiwic3ViIjoiMTIzNDU2Nzg5MCJ9.PLbcyhbUbwyw0TZLlUbTwVds25xVcVToBBM7m3IWFJKt8x4lfVHeiW-kJCJjd0b_QuQs7bmAAiGJKjp-LgGiXY5dUZ13NaNZdfTJfd-rh6JnaQrCQuzgI0wShDTVhRKtgUlJwPLUsp6e0lfKQVblZN_hijT07D3VU7buIJNGpkrVK-oX90dtrMsUFDYeR05TP1Rd8ITMr4EPgUc12mBy0XFjz3eB7D9IflJuMLyjKiHN_JLAbf1wu2xt-dRcdTYSH0gCad_6-o4GXNPD-8CwpbNTbP-_aGfzxDVwfTPvtk-ar-dX9C_27r_IaEDHpwVIOmFHcaSbxfC25WQSlP22tA`,
			now: time.Unix(1517239122, 0),
			wantErr: true,
		},
		{
			name: "bad_token",
			tkn: `bad_token`,
			now: time.Unix(1516239122, 0),
			wantErr: true,
		},
		{
			name: "wrong_signature",
			tkn: `eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MTYyNDYyMjIsImlhdCI6MTUxNjIzOTAyMiwiaXNzIjoiY29vbGNhci9hdXRoIiwic3ViIjoiMTIzNDU2Nzg5MSJ9.PLbcyhbUbwyw0TZLlUbTwVds25xVcVToBBM7m3IWFJKt8x4lfVHeiW-kJCJjd0b_QuQs7bmAAiGJKjp-LgGiXY5dUZ13NaNZdfTJfd-rh6JnaQrCQuzgI0wShDTVhRKtgUlJwPLUsp6e0lfKQVblZN_hijT07D3VU7buIJNGpkrVK-oX90dtrMsUFDYeR05TP1Rd8ITMr4EPgUc12mBy0XFjz3eB7D9IflJuMLyjKiHN_JLAbf1wu2xt-dRcdTYSH0gCad_6-o4GXNPD-8CwpbNTbP-_aGfzxDVwfTPvtk-ar-dX9C_27r_IaEDHpwVIOmFHcaSbxfC25WQSlP22tA`,
			now: time.Unix(1516239122, 0),
			wantErr: true,
		},
	}

	for _, cc := range cases {
		t.Run(cc.name, func(t *testing.T) {
			jwt.TimeFunc = func() time.Time {
				return cc.now
			}
			accountID, err := v.Verify(cc.tkn)
			if !cc.wantErr &&  err != nil {
				t.Errorf("verification failed: %v", err)
			}

			if cc.wantErr && err == nil {
				t.Errorf("want error; got no error")
			}

			if accountID != cc.want {
				t.Errorf("wrong account id. want: %q; got: %q", cc.want, accountID)

			}
		})
	}
}