FROM nginx:latest
COPY ./build /skytel-cms-ui
COPY ./nginx.conf /etc/nginx/nginx.conf
RUN chmod 777 -R /skytel-cms-ui
ENTRYPOINT ["nginx", "-g", "daemon off;"]
