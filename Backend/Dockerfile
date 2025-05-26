FROM node:23-alpine

#Create a app directory

WORKDIR /app

#Install all app dependencies
COPY package*.json ./

#Run npm install 
RUN npm install

#Bundle app source
COPY . .

EXPOSE 3000

CMD [ "npm" , "run", "dev" ]