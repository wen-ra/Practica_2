//Constantes a utilizar
const soap = require('soap');
const express = require('express');
const fs = require('fs');
const path = require("path");
const csvParse = require('csv-parse/sync');
const csvStringify = require('csv-stringify/sync');
const app = express();
const PORT = '3000';
const IP = '192.168.100.13';

// Leer el archivo CSV
function leerCSV() {
    try {
        const fileContent = fs.readFileSync('./directorio.csv', 'utf-8');
        return csvParse.parse(fileContent, { columns: true });
    } catch (err) {
        console.error("Error al leer el CSV:", err);
        return [];
    }
}

// Escribir en el archivo CSV
function escribirCSV(data) {
    try {
        const csvContent = csvStringify.stringify(data, { header: true });
        fs.writeFileSync('./directorio.csv', csvContent);
    } catch (err) {
        console.error("Error al escribir el CSV:", err);
    }
}

// Servicio SOAP
const service = {
    DirectorioService: {
        DirectorioPort: {
            //Servicio para añadir a directorio.csv, se lee el directorio y al final se agrega el nuevo contacto.
            Añadir: function (args, callback) {
                //Se leen los contactos
                const fileCSV = leerCSV();
                //Se crea el nuevo contacto
                const nuevoContacto = {
                    nombre: args.nombre,
                    telefono: args.telefono,
                    celular: args.celular,
                    correo: args.correo,
                };
                //Se agrega el contacto nuevo
                fileCSV.push(nuevoContacto);
                //Se escribe el archivo CSV con los contactos
                escribirCSV(fileCSV);
                //Regresa mensaje de exito
                callback(null, { AñadirResult: `Se añadió el contacto: ${args.nombre}` });
            },
            //Servicio para Editar datos de un contacto
            Editar: function(args, callback){
                const fileCSV = leerCSV();
                const contacto = fileCSV.find(row => row.nombre === args.nombre);

                switch(args.seleccion){
                    case 1:
                        contacto.nombre = args.newElemento;
                        break;
                    case 2:
                        contacto.telefono = args.newElemento;
                        break;
                    case 3:
                        contacto.celular = args.newElemento;
                        break;
                    case 4:
                        contacto.correo = args.newElemento;
                        break;  
                }
                escribirCSV(fileCSV);
                callback(null, { EditarResult: `Se editó el contacto: ${JSON.stringify(contacto)}` });
            },
            //Servicio para buscar los datos del contacto por nombre
            Buscar: function (args, callback) {
                const fileCSV = leerCSV();
                const contacto = fileCSV.find(row => row.nombre === args.nombre);

                if (contacto) {
                    callback(null, { BuscarResult: JSON.stringify(contacto) });
                } else {
                    callback(null, { BuscarResult: `No se encontró ningún registro con el nombre: ${args.nombre}` });
                }
            },
            //Servicio para eliminar el contacto por nombre
            Eliminar: function (args, callback) {
                const fileCSV = leerCSV();
                const index = fileCSV.findIndex(row => row.nombre === args.nombre);
                if (index !== -1) {
                    const eliminado = fileCSV.splice(index, 1);
                    escribirCSV(fileCSV);
                    callback(null, { EliminarResult: `Se eliminó el contacto: ${eliminado[0].nombre}` });
                } else {
                    callback(null, { EliminarResult: `No se encontró ningún registro con el nombre: ${args.nombre}` });
                }
            },
            //Servicio que ordena por orden alfabetico los contactos, por nombre
            OrdenarAlfabetico: function (args, callback) {
                try {
                    const data = leerCSV();            
                    // Ordenar por nombre
                    data.sort((a, b) => a.nombre.localeCompare(b.nombre));
                    // Escribir los datos ordenados
                    escribirCSV(data);
                    callback(null, { OrdenarAlfabeticoResult: 'El directorio ha sido ordenado alfabéticamente.' });
                } catch (err) {
                    callback(err);
                }
            },
            //Servicio que ordena por orden alfabetico los contactos, por dominio de correo electronico
            OrdenarAlfabeticoCorreo: function (args, callback) {
                try {
                    let data = leerCSV();
                    // Ordenar por el dominio del campo "correo"
                    data.sort((a, b) => {
                        // Extraer los dominios de los correos electrónicos
                        const dominioA = a.correo ? a.correo.split('@')[1] || "" : "";
                        const dominioB = b.correo ? b.correo.split('@')[1] || "" : "";
                        // Comparar considerando valores nulos o faltantes
                        return dominioA.localeCompare(dominioB);
                    });
                    // Escribir los datos ordenados
                    escribirCSV(data);
                    callback(null, { OrdenarAlfabeticoCorreoResult: 'El directorio ha sido ordenado por el dominio del correo alfabéticamente.' });
                } catch (err) {
                    callback(err);
                }
            }
        }
    }
};

const wsdlPath = path.join(__dirname, 'requirements.wsdl');
const wsdl = fs.readFileSync(wsdlPath, 'utf8');

app.listen(PORT, () => {
    soap.listen(app, '/directorio', service, wsdl);
    console.log(`Servicio SOAP corriendo en http://${IP}:${PORT}/directorio`);
});