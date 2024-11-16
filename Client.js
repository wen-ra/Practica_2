const soap = require('soap');
const url = `http://localhost:3000/directorio?wsdl`;


//Necesario para lectura y escritura
const readline = require('readline');

//rl, como auxiliar de lectura
const rl=readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//Función para obtener los valores de la operación
function getInputs(callback){
    rl.question('Ingrese el nombre: ',(nombre)=>{
        callback(nombre);
    });
};

soap.createClient(url, (err, client)=>{
    if (err) throw err;        
    getInputs((name) => {  
        const args = { nombre: name };    
        
        /*client.Buscar(args, (err, result) => {
            if (err) throw err;
            console.log("Resultado:", result.BuscarResult);
            rl.close();
        });*/

        client.Eliminar(args, (err, result) => {
            if (err) throw err;
            console.log("Resultado:", result.EliminarResult);
            rl.close();
        });

    }); //Gets imput
}); //soap