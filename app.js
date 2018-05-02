const es = new (require('./writeES'))();

es.exec({},(err, res)=>{
    console.log("ES Index Updated");
    process.exit();
});