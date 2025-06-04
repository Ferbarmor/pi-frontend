<p align="center">
  <img src="Logo.png" alt="Foto Rally" width="200" style="border-radius: 100px;">
</p>
<h1 align="center">Manual de Instalación</h1>
A continuación, se describen los pasos necesarios para instalar el frontend, desarrollado con Angular, de la aplicación web www.snaptap.es (rally fotográfico) en un entorno de producción en AWS y en un entorno de desarrollo utilizando un servidor local como XAMPP.

## **Instalación del Frontend (Angular en AWS S3 + CloudFront)**
- **Paso 1**: Clonar proyecto y build 
````
git clone `code repositorio por https o por SSH` 
cd <carpeta del repo>
npm install
ng build 
````
Esto generará los archivos en dist/.

- **Paso 2**: Configurar S3
  - Crear un bucket S3 con hosting de sitio web estático.

  - Subir los archivos del directorio dist/ al bucket.

  - Establecer [políticas de acceso público y permisos para el bucket](https://docs.aws.amazon.com/es_es/AmazonS3/latest/userguide/creating-buckets-s3.html).
    - En la pestaña permisos-> política de buckets, tiene que haber un json parecido a este:
  
  
      {
        "Version": "2012-10-17",
        "Statement": [
            {
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::pifb-frontend/*"
            }
          ]
      }

- **Paso 3**: Configurar CloudFront (Si vas a usar un dominio)
  - Crear una distribución en CloudFront.

  - En “Origin domain”, seleccionar el bucket S3.

  - En comportamientos, redirigir todos los errores 403 y 404 a index.html.

  - Asociar un dominio personalizado (opcional) y habilitar HTTPS con certificado SSL (usando AWS Certificate Manager).

- **Paso 4**: API Endpoint en Angular
  
Modificar el entorno de producción en Angular (src/environments/environment.prod.ts):
````
export const environment = {
  production: true,
  API_URL: "http://<IP_DEL_BACKEND>/api",
  BASE_URL: "http://<IP_DEL_BACKEND>"
};
````
Accede a la app desde la URL pública de CloudFront.

Los participantes pueden registrarse, subir fotos y votar.

Los administradores gestionan todo desde el backend.

## **Instalación en XAMPP**

  - **Paso 1** (pero poner en desarrollo con ng serve)
  - Crear una entrada en el archivo hosts para establecer la equivalencia del dominio local:
  ````
  127.0.0.1   localserv.laravel
  ````

## Licencia

Este proyecto está licenciado bajo los términos de la [Licencia MIT](./LICENSE.md).
