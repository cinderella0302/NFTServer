# base image
FROM node:16-alpine

# set working directory
WORKDIR /app

# copy source code
COPY . .
# install dependencies
RUN yarn install

# expose port
EXPOSE 3000

# start server
CMD [ "yarn", "start" ]