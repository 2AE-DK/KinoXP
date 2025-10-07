# Dockerfile in Frontend folder
FROM nginx:alpine

# Replace default Nginx config (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy your frontend files to Nginx root
COPY . /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
