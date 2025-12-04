FROM node:24

#Si no existe la ruta la crea
RUN mkdir -p /usr/src/app 
WORKDIR /usr/src/app

#Copiar package.json y package-lock.json
COPY package*.json ./

#Instalar las dependencias(librerias)
RUN npm install

#Copiar el resto de los archivos
COPY . .

#Exponer el puerto
EXPOSE 3000

#Comando para ejecutar la aplicacion
CMD ["npm", "start"]