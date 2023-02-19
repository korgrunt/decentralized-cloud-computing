# Utilise une image de base avec une distribution Linux minimale
FROM alpine:latest

# Installe les paquets nécessaires pour exécuter l'application dans le conteneur
RUN apk add --no-cache mon-application

# Définit un utilisateur non privilégié pour le conteneur
USER nobody

# Expose un port pour l'application dans le conteneur
EXPOSE 8080

# Utilise des volumes anonymes pour le système de fichiers racine du conteneur
VOLUME /app/data

# Limite les privilèges du conteneur
CMD ["--cap-drop", "ALL", "--security-opt", "no-new-privileges:true", "mon-application"]