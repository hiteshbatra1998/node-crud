const Enum = require('enum')
const express = require ('express')
const app =express();
const bodyParser=require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(express.json())
app.listen(5000 , '');

let data =[ {id:1, name :'cat1' , color:'black' , sound :'s1' , breed : 'B1' , age:'5' , dob : '03/05/2015' },
            {id:2, name :'cat2' , color:'blue' , sound :'s1' , breed : 'B1' , age:'5' , dob : '03/05/2015' },
            {id:3, name :'cat3' , color:'black' , sound :'s3' , breed : 'B2' , age:'5' , dob : '03/05/2015' },
            {id:4, name :'cat4' , color:'orange' , sound :'s3' , breed : 'B1' , age:'7' , dob : '03/05/2015' }       
        ]
var gid=100;
const breed = new Enum ([ "B1" , "B2","B3","B4","B5" ]);


// get data of all cats
app.get( '/' , (req,res)=>{
    res.json(data)
} )


// create new data
app.post( '/create' , urlencodedParser, (req,res)=>{
    if(req.body.name === "" || req.body.color==="" || req.body.sound==="" || req.body.age==="" || req.body.dob==="" || req.body.breed==="" || breed.get(req.body.breed) === undefined  ){
        let err;
        if( req.body.name === "" ) err=err+"Name is empty"
        if( req.body.color === "" ) err=err+"Color is empty"
        if( req.body.sound === "" ) err=err+"Sound is empty"
        if( req.body.age === "" ) err=err+"age is empty"
        if( req.body.dob === "" ) err=err+"DOB is empty"
        if( req.body.breed === "" ) err=err+"Breed is empty"
        if( breed.get(req.body.breed) === undefined ) err=err+"Select breed from B1,B2, B3, B4, B5"
        console.log(err)
        throw new err;
    }
    var t ={ id: gid++ , name : req.body.name , color:req.body.color , sound : req.body.sound , breed:req.body.breed ,age:req.body.age , dob:req.body.dob };
    data.push(t);
    res.json(data)
})


// get cat by unique id
app.get('/id' , urlencodedParser,(req,res)=>{
    var t , flag=0;
    for( var i=0;i<data.length;i++ ){
        if( +req.body.id === data[i].id ){
            t=data[i];
            flag=1;
            break;
        }
    }
    if( flag==0 ){
        throw new "Cat is not found by this id"
    }
    else{
        res.json(t)
    }
})


// update by its id
app.patch( '/updateid' , urlencodedParser , (req,res)=>{
    var flag =0;
    for( var i=0;i<data.length;i++ ){
        if( +req.body.id === data[i].id ){
            for( let key in req.body ){
                if( key !== "id" ){
                    if( key === "breed" && breed.get(req.body.breed) === undefined){
                        throw new "Breed is not in B1-B5"
                    }
                    data[i][key] = req.body[key]
                } 
            }
            flag=1;
            break;
        }
    }
    if(flag==0) throw new "id not existed";
    res.json(data)
} )


//delete cat by its id
app.delete( '/delete' , urlencodedParser , (req,res)=>{
    data=data.filter( (item)=>{
        return item['id']!==+req.body.id
    } )
    res.json(data)
})


// search by parameters
app.get( '/search' , urlencodedParser,(req,res)=>{
    var response = new Set();
    console.log(req.body);
    for( let i=0;i<data.length;i++ ){
        for( let key in req.body ){
            for( var q=0;q<req.body[key].length;q++  ){
                if( data[i][key] === req.body[key][q] ){
                    response.add(data[i])
                }
            }
        }
    }
    res.json( { ans:[...response] } )
} )

//get list of color breed and sound of cats we have 
app.get('/getAll' ,urlencodedParser , (req,res)=>{
    let color= new Set();
    let breed= new Set();
    let sound= new Set();
    for(var i=0;i<data.length;i++){
        color.add( data[i]['color'] )
        breed.add( data[i]['breed'] )
        sound.add( data[i]['sound'] )
    }   
    res.json( { colors:[...color] , breeds:[...breed] , sounds:[...sound] })
} )


// get paginated result 
app.get( '/paginated' , urlencodedParser,(req,res)=>{
    const page = +req.body.page;
    const limit= +req.body.limit;
    console.log(page , limit)
    const results={};
    const startIndex = (page-1)*limit;
    const endIdex=page*limit;
    console.log( startIndex ,endIdex )
    if( startIndex > 0 ){
        results.previous={
            page:page-1,
            limit:limit
        }
    }
    if(endIdex < data.length  ){
        results.next ={
            page:page+1,
            limit:limit
        }
    }
    results.result=data.slice( startIndex,endIdex );
    console.log(results)
    res.json(results)
} )