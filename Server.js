const soap = require('soap');
const express= require('express');

const fs = require('fs');
const path = require("path");
const { compact } = require('lodash');
const { parseArgs } = require('util');
const app = express();
const PORT = 3000;                                      //Puerto para usarse

/*Lectura de CSV*/
function leerCSV(){
    const{readFileSync} = require('fs');
    const{parse} = require('csv-parse/sync');
        
    const fileContent = readFileSync('./directorio.csv', 'utf-8');
    const csvContent = parse(fileContent, {
        columns: true       //Lo convierto en un objeto de js
    }); 
    
    return csvContent
}

function buscar(fileCSV) {
    const name = "Jose Lopez";
    const contacto = fileCSV.find(row => row.nombre === name);
    return contacto || `No se encontró ningún registro con el nombre: ${name}`;
}

function eliminar(nombre, fileCSV){
    const { convertArrayToCSV } = require('convert-array-to-csv');
    const fs = require ("fs");

    const index = fileCSV.findIndex(row => row.nombre === nombre);
    let msg;

    if(index !== -1){
        fileCSV.splice(index, 1);

        const csvFromArrayOfObjects = convertArrayToCSV(fileCSV);
        fs.writeFile("./directorio.csv", csvFromArrayOfObjects, err => {
            if(err){
                console.log(18, err);
            }
        });
        msg = `Se ha eliminado ${nombre} correctamente`;
    } else {
        msg = `No se encontró ningún registro con el nombre: ${nombre}`;
    }

    return msg;
}
/* */
const service =  {                                      //Creacion de un servicio
    DirectorioService: {                                //Serivicio a utilizar
        DirectorioPort: {                               //Puerto del servicio que se utiliza
            Buscar: function(args, callback){              //Uso de funcionalidad del servicio
                const name = args.nombre;
                
                const fileCSV = leerCSV();                  //Leemos CSV
                const contacto = fileCSV.find(row => row.nombre === name);

                console.log(contacto);
                const result= contacto || `No se encontró ningún registro con el nombre: ${name}`;
                callback(null, {BuscarResult: result});    //Regresa null si esta vacio, en caso contrario el resultado del servicio
            },
            Eliminar: function(args, callback){              //Uso de funcionalidad del servicio
                const { convertArrayToCSV } = require('convert-array-to-csv');
                const fs = require ("fs");
            
                const name = args.nombre;
                const fileCSV = leerCSV();  

                const index = fileCSV.findIndex(row => row.nombre === name);
                console.log(index);
                let msg;
                if(index !== -1){
                    fileCSV.splice(index, 1);
            
                    const csvFromArrayOfObjects = convertArrayToCSV(fileCSV);
                    fs.writeFile("./directorio.csv", csvFromArrayOfObjects, err => {
                        if(err){
                            console.log(18, err);
                        }
                    });
                    msg = `Se ha eliminado ${name} correctamente`;
                } else {
                    msg = `No se encontró ningún registro con el nombre: ${name}`;
                }   
                const result= msg;         
                callback(null, {EliminarResult: result});    //Regresa null si esta vacio, en caso contrario el resultado del servicio
            }
        }
    }
};

const wsdlPath = path.join(__dirname, 'requirements.wsdl')
const wsdl= fs.readFileSync(wsdlPath, 'utf8');

app.listen(PORT, ()=>{
    soap.listen(app, '/directorio', service, wsdl);
    console.log('Servicio SOAP corriendo en http://localhost:3000/directorio');
});