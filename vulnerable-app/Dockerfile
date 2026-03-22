FROM php:8.1-apache

# Install mysqli extension
RUN docker-php-ext-install mysqli

# Enable Apache modules
RUN a2enmod rewrite

# Copy application files
COPY index.php /var/www/html/

# Create uploads directory
RUN mkdir -p /var/www/html/uploads && chmod 777 /var/www/html/uploads

# Set permissions
RUN chown -R www-data:www-data /var/www/html

# Expose port 80
EXPOSE 80

CMD ["apache2-foreground"]
