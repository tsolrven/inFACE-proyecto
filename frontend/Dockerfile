FROM node:20 AS build
WORKDIR /app

# VITE_API_URL se necesita AQUÍ (en el build), no al ejecutar el contenedor,
# porque Vite incrusta la variable dentro del JS ya compilado
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN rm -f package-lock.json && npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# sin esto, recargar la página en cualquier ruta que no sea "/" (ej. /perfil) da 404
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 443