FROM openjdk:17-jdk-slim

WORKDIR /app

COPY build/libs/*.jar my_project-0.0.1-SNAPSHOT.jar

ENTRYPOINT ["java", "-jar", "my_project-0.0.1-SNAPSHOT.jar"]
