FROM node:20 AS build
WORKDIR /app

COPY package*.json ./
RUN rm -f package-lock.json && npm install

# Copiamos todo el código (incluyendo el archivo .env que ya tiene el /api)
COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Vite por defecto lee los archivos .env que estén en la raíz del proyecto al compilar
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 443