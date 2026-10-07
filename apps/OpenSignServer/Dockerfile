# OpenSignServer (Parse Server) image for Fly.io
# Build context = apps/OpenSignServer
FROM node:22.14.0

# LibreOffice is used for DOCX -> PDF conversion in some signing flows
RUN apt-get update \
  && apt-get install -y --no-install-recommends libreoffice \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Install deps first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# App source
COPY . .

# The Fly volume is mounted at ./files and shadows the baked-in email templates.
# Keep a seed copy outside the mount and restore any missing templates at startup
# (non-clobbering, so uploaded documents on the volume are never overwritten).
RUN cp -a /usr/src/app/files /usr/src/app/files_seed

EXPOSE 8080
CMD ["sh", "-c", "cp -an /usr/src/app/files_seed/. /usr/src/app/files/ 2>/dev/null; exec npm start"]
