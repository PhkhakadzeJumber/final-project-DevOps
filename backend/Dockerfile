# Stage 1: Build the JAR
FROM maven:3.9.6-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy pom.xml first for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run the JAR
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Patch base OS vulnerabilities
RUN apk update && apk upgrade --no-cache

# Create a safe, non-root system user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy the built JAR from Stage 1
COPY --from=builder /app/target/*.jar app.jar

# Give our new user ownership of the application file
RUN chown appuser:appgroup app.jar

# Tell Docker to run the container as the non-root user
USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]