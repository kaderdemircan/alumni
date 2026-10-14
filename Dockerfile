FROM node:20-alpine

WORKDIR /app

# Bağımlılık ve proje tanımlarını kopyala
COPY package*.json ./

# Tüm proje dosyalarını kopyala
COPY . .

# Konteyner çalışma portu
EXPOSE 8080

# Node.js sunucusunu başlat
CMD ["npm", "start"]
