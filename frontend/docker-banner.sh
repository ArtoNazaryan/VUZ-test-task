#!/bin/sh
set -eu

cat <<BANNER
==============================================
 Squad of Champions is ready
 App:      ${PUBLIC_APP_URL:-http://localhost:8080}
 API:      ${PUBLIC_API_URL:-http://localhost:3000/api/v1}
 Swagger:  ${PUBLIC_SWAGGER_URL:-http://localhost:3000/api/docs}
==============================================
BANNER
