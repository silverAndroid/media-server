FROM openjdk:8-jre-alpine

COPY ./build/libs/media-server.jar /root/media-server.jar

WORKDIR /root

CMD ["java", "-server", "-Xms4g", "-Xmx4g", "-XX:+UseG1GC", "-XX:MaxGCPauseMillis=100", "-XX:+UseStringDeduplication", "-jar", "media-server.jar"]