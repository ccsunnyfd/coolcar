package auth

import (
	"context"
	"coolcar/shared/auth/token"
	"coolcar/shared/id"
	"fmt"
	"os"
	"strings"

	"github.com/dgrijalva/jwt-go"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

const (
	authorizationHeader = "authorization"
	bearerPrefix = "Bearer "
)

// Interceptor creates a grpc auth interceptor.
func Interceptor(publicKeyFile string) (grpc.UnaryServerInterceptor, error) {
	b, err := os.ReadFile(publicKeyFile)
	if err != nil {
		return nil, fmt.Errorf("cannot read public key: %v", err)
	}
	pubKey, err := jwt.ParseRSAPublicKeyFromPEM(b)
	if err != nil {
		return nil, fmt.Errorf("cannot parse public key: %v", err)
	}
	i := &interceptor{
		verifier: &token.JWTTokenVerifier{
			PublicKey: pubKey,
		},
	}
	return i.HandleReq, nil
}

type tokenVerifier interface {
	Verify(token string) (string, error)
}

type interceptor struct {
	verifier tokenVerifier
}

func (i *interceptor) HandleReq(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp interface{}, err error) {
	tkn, err := tokenFromContext(ctx)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "")
	}
	aid, err := i.verifier.Verify(tkn)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "token not valid: %v", err)
	}

	return handler(ContextWithAccountID(ctx, id.AccountID(aid)), req)
}

func tokenFromContext(c context.Context) (string, error){
	unauthenticated := status.Error(codes.Unauthenticated, "")
	m, ok := metadata.FromIncomingContext(c)
	if !ok {
		return "", unauthenticated
	}

	tkn := ""
	for _, v := range m[authorizationHeader] {
		if strings.HasPrefix(v, bearerPrefix) {
			tkn = v[len(bearerPrefix):]
		}
	}
	if tkn == "" {
		return "", unauthenticated
	}

	return tkn, nil
}

type accountIDKey struct{}

// ContextWithAccountID creates a context with given account id.
func ContextWithAccountID(c context.Context, aid id.AccountID) context.Context {
	return context.WithValue(c, accountIDKey{}, aid)
}

// AccountIDFromContext gets account id from context.
// Returns unauthenticated error if no account id is available.
func AccountIDFromContext(c context.Context) (id.AccountID, error) {
	v := c.Value(accountIDKey{}) 
	aid, ok := v.(id.AccountID)
	if !ok {
		return "", status.Error(codes.Unauthenticated, "")
	}
	return aid, nil
}